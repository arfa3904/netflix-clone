const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

export function isValidPhone(value) {
  return typeof value === 'string' && PHONE_RE.test(value.trim());
}

export function isValidPassword(value) {
  return typeof value === 'string' && value.trim().length >= 8;
}

export function isValidUsername(value) {
  return typeof value === 'string' && value.trim().length >= 3 && value.trim().length <= 100;
}

export function toSafeUser(user) {
  if (!user) return null;
  return { id: user.id, uname: user.uname, email: user.email, phone: user.phone };
}
