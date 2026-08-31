// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db.js', () => ({ query: vi.fn() }));
vi.mock('./_session.js', () => ({
  signSession: vi.fn(() => 'fake-token'),
  setSessionCookie: vi.fn(),
}));
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn(async () => 'hashed-password') },
}));

import { query } from './db.js';
import { setSessionCookie } from './_session.js';
import handler from './register.js';

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

const validBody = {
  uname: 'jane',
  email: 'Jane@Example.com',
  phone: '15551234567',
  password: 'longenough1',
};

describe('POST /api/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects non-POST methods', async () => {
    const res = createRes();
    await handler({ method: 'GET' }, res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects a request missing required fields', async () => {
    const res = createRes();
    await handler({ method: 'POST', body: { uname: 'jane' } }, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects an invalid email', async () => {
    const res = createRes();
    await handler({ method: 'POST', body: { ...validBody, email: 'not-an-email' } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  it('rejects an invalid phone number', async () => {
    const res = createRes();
    await handler({ method: 'POST', body: { ...validBody, phone: 'abc' } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/phone/i);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const res = createRes();
    await handler({ method: 'POST', body: { ...validBody, password: 'short' } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  it('rejects registration when the email or phone is already taken', async () => {
    query.mockResolvedValueOnce([[{ id: 1 }]]);
    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);
    expect(res.statusCode).toBe(409);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('creates the user with a hashed password and never returns it', async () => {
    query
      .mockResolvedValueOnce([[]]) // existence check: no match
      .mockResolvedValueOnce([{ insertId: 42 }]); // insert result

    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual({ id: 42, uname: 'jane', email: 'jane@example.com', phone: '15551234567' });
    expect(res.body.user.password).toBeUndefined();

    const insertParams = query.mock.calls[1][1];
    expect(insertParams).toContain('hashed-password');
    expect(insertParams).not.toContain('longenough1');

    expect(setSessionCookie).toHaveBeenCalledTimes(1);
  });

  it('handles a database failure gracefully instead of crashing', async () => {
    query.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));
    const res = createRes();
    await handler({ method: 'POST', body: validBody }, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
