import User from '../modules/users/user.model.js';
import { verifyToken } from '../modules/users/tokenService.js';

/**
 * Extract and verify user from the Authorization header.
 * Used as the Apollo Server context function.
 *
 * @param {Object} req - Express request object
 * @returns {Object} Context with user (or null if unauthenticated)
 */
export const getAuthContext = async ({ req }) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) return { user: null };

  const decoded = verifyToken(token);
  if (!decoded) return { user: null };

  try {
    const user = await User.findById(decoded.id).select('-passwordHash');
    return { user: user || null };
  } catch {
    return { user: null };
  }
};

/**
 * Guard helper — throws if no authenticated user in context.
 */
export const requireAuth = (context) => {
  if (!context.user) {
    throw new Error('Authentication required. Please log in.');
  }
  return context.user;
};
