import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user.
 * @param {Object} user - The user document from MongoDB
 * @returns {string} Signed JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token string
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
