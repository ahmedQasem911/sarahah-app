/**
 * Authorization middleware to check user role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const authorizationMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // ========== 1. Check if User is Authenticated ==========
      if (!req.loggedInUser) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      // ========== 2. Extract User Role ==========
      const { role } = req.loggedInUser;

      // Check if role exists
      if (!role) {
        return res.status(403).json({
          message: "Access denied. No role assigned.",
        });
      }

      // ========== 3. Check if User Role is Allowed ==========
      if (allowedRoles.includes(role)) {
        return next();
      }

      // ========== 4. Deny Access ==========
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    } catch (error) {
      console.error("Authorization Middleware Error:", error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};
