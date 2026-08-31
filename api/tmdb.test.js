// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';

vi.mock('node:https', () => ({
  default: { get: vi.fn() },
}));

import https from 'node:https';
import handler from './tmdb.js';

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
    },
  };
}

function mockUpstreamResponse(statusCode, bodyObj) {
  https.get.mockImplementationOnce((_url, _opts, callback) => {
    const upstreamRes = new EventEmitter();
    upstreamRes.statusCode = statusCode;
    upstreamRes.setEncoding = () => {};
    const req = new EventEmitter();
    req.setTimeout = vi.fn();
    req.destroy = vi.fn();
    callback(upstreamRes);
    upstreamRes.emit('data', JSON.stringify(bodyObj));
    upstreamRes.emit('end');
    return req;
  });
}

function mockUpstreamNetworkError(err) {
  https.get.mockImplementationOnce(() => {
    const req = new EventEmitter();
    req.setTimeout = vi.fn();
    req.destroy = vi.fn();
    queueMicrotask(() => req.emit('error', err));
    return req;
  });
}

describe('GET /api/tmdb', () => {
  const originalKey = process.env.TMDB_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.TMDB_KEY = originalKey;
  });

  it('rejects non-GET methods', async () => {
    const res = createRes();
    await handler({ method: 'POST', query: {} }, res);
    expect(res.statusCode).toBe(405);
  });

  it('returns a clear config error when TMDB_KEY is missing', async () => {
    delete process.env.TMDB_KEY;
    const res = createRes();
    await handler({ method: 'GET', query: { endpoint: '/trending/movie/week' } }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/TMDB_KEY/);
  });

  it('rejects a request with no endpoint', async () => {
    process.env.TMDB_KEY = 'test-key';
    const res = createRes();
    await handler({ method: 'GET', query: {} }, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects an endpoint outside the allowlist (no open relay)', async () => {
    process.env.TMDB_KEY = 'test-key';
    const res = createRes();
    await handler({ method: 'GET', query: { endpoint: '/account/delete-everything' } }, res);
    expect(res.statusCode).toBe(400);
    expect(https.get).not.toHaveBeenCalled();
  });

  it('proxies an allowed endpoint and returns TMDB data without exposing the key to the caller', async () => {
    process.env.TMDB_KEY = 'test-key';
    mockUpstreamResponse(200, { results: [{ id: 1, title: 'Test Movie' }] });

    const res = createRes();
    await handler({ method: 'GET', query: { endpoint: '/trending/movie/week' } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(JSON.stringify(res.body)).not.toContain('test-key');
    expect(https.get.mock.calls[0][0]).toContain('api_key=test-key');
  });

  it('surfaces a TMDB-side failure as a handled error response, not a crash', async () => {
    process.env.TMDB_KEY = 'test-key';
    mockUpstreamResponse(401, { status_message: 'Invalid API key' });

    const res = createRes();
    await handler({ method: 'GET', query: { endpoint: '/trending/movie/week' } }, res);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('retries once after a transient network error and succeeds', async () => {
    process.env.TMDB_KEY = 'test-key';
    mockUpstreamNetworkError(new Error('read ECONNRESET'));
    mockUpstreamResponse(200, { results: [] });

    const res = createRes();
    await handler({ method: 'GET', query: { endpoint: '/trending/movie/week' } }, res);

    expect(https.get).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(200);
  });

  it('handles two consecutive network failures gracefully (e.g. connection reset)', async () => {
    process.env.TMDB_KEY = 'test-key';
    mockUpstreamNetworkError(new Error('read ECONNRESET'));
    mockUpstreamNetworkError(new Error('read ECONNRESET'));

    const res = createRes();
    await handler({ method: 'GET', query: { endpoint: '/trending/movie/week' } }, res);
    expect(https.get).toHaveBeenCalledTimes(2);
    expect(res.statusCode).toBe(502);
    expect(res.body.success).toBe(false);
  });
});
