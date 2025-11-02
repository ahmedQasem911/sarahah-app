import Joi from "joi";
import { GENDER } from "../../Common/Enums/gender.enum.js";
import { USER_ROLE } from "../../Common/Enums/role.enum.js";

// ==================== User Validation Schemas ====================

/**
 * Sign Up Validation Schema
 * Validates user registration data
 */
export const SignUpSchema = {
  body: Joi.object({
    // ========== Personal Information ==========
    firstName: Joi.string()
      .min(2)
      .max(20)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/) // Only letters and spaces
      .required()
      .messages({
        "string.empty": "First name is required",
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name must be at most 20 characters",
        "string.pattern.base": "First name must contain only letters",
        "any.required": "First name is required",
      }),

    lastName: Joi.string()
      .min(2)
      .max(20)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/) // Only letters and spaces
      .required()
      .messages({
        "string.empty": "Last name is required",
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name must be at most 20 characters",
        "string.pattern.base": "Last name must contain only letters",
        "any.required": "Last name is required",
      }),

    age: Joi.number()
      .integer() // Must be whole number
      .min(18)
      .max(100)
      .required()
      .messages({
        "number.base": "Age must be a number",
        "number.integer": "Age must be a whole number",
        "number.min": "You must be at least 18 years old",
        "number.max": "Age must be at most 100 years",
        "any.required": "Age is required",
      }),

    gender: Joi.string()
      .valid(...Object.values(GENDER))
      .default(GENDER.MALE)
      .messages({
        "any.only": `Gender must be one of: ${Object.values(GENDER).join(
          ", "
        )}`,
      }),

    // ========== Account Information ==========
    email: Joi.string()
      .email({ tlds: { allow: false } }) // Allow all TLDs
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),

    password: Joi.string()
      .min(8)
      .max(50)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/
      ) // Lowercase, uppercase, number, and a special character from the set @$!%*?&
      .required()
      .messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must be at most 50 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character from the set @$!%*?&",
        "any.required": "Password is required",
      }),

    phoneNumber: Joi.string()
      .pattern(/^(01)[0-2,5]{1}[0-9]{8}$/) // Egyptian phone format
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base":
          "Phone number must be a valid Egyptian number (e.g., 01012345678)",
        "any.required": "Phone number is required",
      }),

    // ========== Optional Role ==========
    role: Joi.string()
      .valid(...Object.values(USER_ROLE))
      .default(USER_ROLE.USER)
      .messages({
        "any.only": `Role must be one of: ${Object.values(USER_ROLE).join(
          ", "
        )}`,
      }),
  }),
};

/**
 * Sign In Validation Schema
 * Validates user login credentials
 */
export const SignInSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),

    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  }),
};

/**
 * Update User Validation Schema
 * Validates user profile update data (all fields optional)
 */
export const UpdateUserSchema = {
  body: Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(20)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        "string.min": "First name must be at least 2 characters",
        "string.max": "First name must be at most 20 characters",
        "string.pattern.base": "First name must contain only letters",
      }),

    lastName: Joi.string()
      .min(2)
      .max(20)
      .trim()
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        "string.min": "Last name must be at least 2 characters",
        "string.max": "Last name must be at most 20 characters",
        "string.pattern.base": "Last name must contain only letters",
      }),

    age: Joi.number().integer().min(18).max(100).messages({
      "number.base": "Age must be a number",
      "number.integer": "Age must be a whole number",
      "number.min": "You must be at least 18 years old",
      "number.max": "Age must be at most 100 years",
    }),

    gender: Joi.string()
      .valid(...Object.values(GENDER))
      .messages({
        "any.only": `Gender must be one of: ${Object.values(GENDER).join(
          ", "
        )}`,
      }),

    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .lowercase()
      .messages({
        "string.email": "Please provide a valid email address",
      }),

    phoneNumber: Joi.string()
      .pattern(/^(01)[0-2,5]{1}[0-9]{8}$/)
      .messages({
        "string.pattern.base":
          "Phone number must be a valid Egyptian number (e.g., 01012345678)",
      }),
  })
    .min(1) // At least one field must be provided
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

/**
 * Confirm Email Validation Schema
 * Validates email confirmation with OTP
 */
export const ConfirmEmailSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),

    otp: Joi.string()
      .length(5)
      .pattern(/^[a-h1-8]{5}$/) // Match your OTP format
      .required()
      .messages({
        "string.empty": "OTP is required",
        "string.length": "OTP must be exactly 5 characters",
        "string.pattern.base": "Invalid OTP format",
        "any.required": "OTP is required",
      }),
  }),
};

/**
 * Forgot Password Validation Schema
 * Validates password reset request
 */
export const ForgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
  }),
};

/**
 * Reset Password Validation Schema
 * Validates password reset with OTP and new password
 */
export const ResetPasswordSchema = {
  body: Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .trim()
      .lowercase()
      .required()
      .messages({
        "string.empty": "Email is required",
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),

    otp: Joi.string()
      .length(5)
      .pattern(/^[a-h1-8]{5}$/)
      .required()
      .messages({
        "string.empty": "OTP is required",
        "string.length": "OTP must be exactly 5 characters",
        "string.pattern.base": "Invalid OTP format",
        "any.required": "OTP is required",
      }),

    newPassword: Joi.string()
      .min(8)
      .max(50)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        "string.empty": "New password is required",
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must be at most 50 characters long",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        "any.required": "New password is required",
      }),
  }),
};

/**
 * Refresh Token Validation Schema
 * Validates refresh token in headers
 */
export const RefreshTokenSchema = {
  headers: Joi.object({
    refreshtoken: Joi.string().required().messages({
      "string.empty": "Refresh token is required",
      "any.required": "Refresh token is required",
    }),
  }).unknown(true), // Allow other headers
};

/**
 * Sign Out Validation Schema
 * Validates access token in headers
 */
export const SignOutSchema = {
  headers: Joi.object({
    accesstoken: Joi.string().required().messages({
      "string.empty": "Access token is required",
      "any.required": "Access token is required",
    }),
  }).unknown(true), // Allow other headers
};
