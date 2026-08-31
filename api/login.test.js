// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db.js', () => ({ query: vi.fn() }));
vi.mock('./_session.js', () => ({
  signSession: vi.fn(() => 'fake-token'),
  setSessionCookie: vi.fn(),
}));
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));

import { query } from './db.js';
import bcrypt from 'bcryptjs';
import handler from './login.js';

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader() {},
  };
}

const dbUser = { id: 1, uname: 'jane', email: 'jane@example.com', phone: '15551234567', password: 'hashed-password' };

describe('POST /api/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects non-POST methods', async () => {
    const res = createRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects a request missing credentials', async () => {
    const res = createRes();
    await handler({ method: 'POST', body: {} }, res);
    expect(res.statusCode).toBe(400);
  });

  it('returns a generic 401 when no account matches', async () => {
    query.mockResolvedValueOnce([[]]);
    const res = createRes();
    await handler({ method: 'POST', body: { identifier: 'nobody@example.com', password: 'whatever1' } }, res);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns the same generic 401 when the password is wrong (no hint about which failed)', async () => {
    query.mockResolvedValueOnce([[dbUser]]);
    bcrypt.compare.mockResolvedValueOnce(false);
    const res = createRes();
    await handler({ method: 'POST', body: { identifier: 'jane@example.com', password: 'wrongpass' } }, res);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('logs in on valid credentials and never leaks the password hash', async () => {
    query.mockResolvedValueOnce([[dbUser]]);
    bcrypt.compare.mockResolvedValueOnce(true);
    const res = createRes();
    await handler({ method: 'POST', body: { identifier: 'jane@example.com', password: 'correctpass' } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual({ id: 1, uname: 'jane', email: 'jane@example.com', phone: '15551234567' });
    expect(res.body.user.password).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('hashed-password');
  });

  it('handles a database failure gracefully instead of crashing', async () => {
    query.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));
    const res = createRes();
    await handler({ method: 'POST', body: { identifier: 'jane@example.com', password: 'whatever1' } }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
