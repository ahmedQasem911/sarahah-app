import BlacklistedTokens from "../DB/Models/blacklisted-tokens.model.js";
import User from "../DB/Models/users.model.js";
import { verifyToken } from "../Utils/tokens.utils.js";

// ==================== Authentication Middleware ====================

/**
 * Middleware to authenticate users using JWT access tokens
 * Validates token, checks blacklist, and attaches user data to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticationMiddleware = async (req, res, next) => {
  try {
    // ========== 1. Extract Access Token ==========
    const { accesstoken } = req.headers;

    // Check if access token is provided
    if (!accesstoken) {
      return res.status(400).json({
        message: "Access token is required",
      });
    }

    // ========== 2. Verify and Decode Token ==========
    const decodedUserData = verifyToken(
      accesstoken,
      process.env.JWT_SECRET_ACCESS_KEY
    );

    // ========== 3. Validate Token Structure ==========
    // Check if token contains JWT ID (jti) for blacklist tracking
    if (!decodedUserData.jti) {
      return res.status(401).json({
        message: "Invalid token format: missing JWT ID",
      });
    }

    // ========== 4. Check Token Blacklist ==========
    // Verify token hasn't been revoked/blacklisted
    const blacklistedToken = await BlacklistedTokens.findOne({
      tokenID: decodedUserData.jti,
    });

    if (blacklistedToken) {
      return res.status(401).json({
        message: "Token has been revoked",
      });
    }

    // ========== 5. Verify User Exists ==========
    const user = await User.findById(decodedUserData._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ========== 6. Attach User to Request and decoded token data ==========
    req.loggedInUser = user;
    req.decodedToken = decodedUserData;

    // ========== 7. Continue to Next Middleware ==========
    next();
  } catch (error) {
    // ========== Error Handling ==========

    // Handle JWT-specific errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
      });
    }

    // Handle unexpected errors
    console.error("Authentication Middleware Error:", error);
    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};
