import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'cv_session';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function isProd() {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured on the server');
  }
  return secret;
}

export function signSession(user) {
  return jwt.sign(
    { sub: user.id, uname: user.uname, email: user.email },
    getSecret(),
    { expiresIn: TOKEN_TTL_SECONDS }
  );
}

export function verifySession(token) {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${TOKEN_TTL_SECONDS}`,
  ];
  if (isProd()) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res) {
  const parts = [`${COOKIE_NAME}=`, 'HttpOnly', 'Path=/', 'SameSite=Lax', 'Max-Age=0'];
  if (isProd()) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function getSessionFromRequest(req) {
  const header = req.headers?.cookie;
  if (!header) return null;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.slice(COOKIE_NAME.length + 1);
  if (!token) return null;
  return verifySession(token);
}
