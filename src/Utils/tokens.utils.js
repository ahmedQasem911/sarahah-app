import jwt from "jsonwebtoken";

// ==================== JWT Token Management ====================

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in the token (e.g., userId, email)
 * @param {string} secretKey - Secret key for signing the token
 * @param {Object} options - JWT options (e.g., expiresIn, issuer)
 * @returns {string} - Signed JWT token
 */
export const generateToken = (payload, secretKey, options) => {
  return jwt.sign(payload, secretKey, options);
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secretKey - Secret key used to sign the token
 * @returns {Object} - Decoded token payload if valid
 * @throws {JsonWebTokenError} - If token is invalid or expired
 */
export const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};
