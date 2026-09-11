import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'dealhub_admin_session';
const SECRET = process.env.JWT_SECRET || 'insecure-dev-secret-change-me';

export function signSession(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function requireAdmin(req) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    return null;
  }
  return session;
}

export { COOKIE_NAME };
