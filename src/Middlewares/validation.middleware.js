// ==================== Validation Middleware ====================

/**
 * Middleware to validate request data using Joi schemas
 * Validates body, params, query, and headers against provided schemas
 * @param {Object} schema - Object containing Joi schemas for different request parts
 * @param {Object} schema.body - Joi schema for request body
 * @param {Object} schema.params - Joi schema for request params
 * @param {Object} schema.query - Joi schema for query parameters
 * @param {Object} schema.headers - Joi schema for request headers
 * @returns {Function} Express middleware function
 */

// Request keys to validate
const requestKeys = ["body", "params", "query", "headers"];

export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    // ========== 1. Collect Validation Errors ==========
    let validationErrors = [];

    // ========== 2. Validate Each Request Part ==========
    for (const key of requestKeys) {
      // Check if schema exists for this request part
      if (schema[key]) {
        // Validate with Joi (abortEarly: false to get all errors)
        const { error } = schema[key].validate(req[key], { abortEarly: false });

        if (error) {
          // Add all error details to the array
          validationErrors.push(...error.details);
        }
      }
    }

    // ========== 3. Check if Validation Failed ==========
    if (validationErrors.length) {
      // Format errors for better readability
      const formattedErrors = validationErrors.map((error) => ({
        field: error.path.join("."), // Field name (e.g., "email", "body.firstName")
        message: error.message, // Error message
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }

    // ========== 4. Continue to Next Middleware ==========
    next();
  };
};
