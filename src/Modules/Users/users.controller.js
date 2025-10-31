import { Router } from "express";
import {
  confirmEmail,
  deleteUser,
  getAllUsers,
  refreshTokenService,
  requestPasswordReset,
  resetPassword,
  signInUser,
  signOutUser,
  signUpUser,
  updateUser,
} from "./Services/users.service.js";
import {
  SignUpSchema,
  SignInSchema,
  UpdateUserSchema,
  ConfirmEmailSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
  SignOutSchema,
} from "../../Validators/Schemas/user.schema.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { validationMiddleware } from "../../Middlewares/validation.middleware.js";
import { USER_ROLE } from "../../Common/Enums/role.enum.js";

const router = Router();

// ==================== Public Routes ====================
// Routes accessible without authentication

router.post("/signup", validationMiddleware(SignUpSchema), signUpUser);
router.post("/signin", validationMiddleware(SignInSchema), signInUser);
router.put(
  "/confirm-otp",
  validationMiddleware(ConfirmEmailSchema),
  confirmEmail
);
router.post(
  "/forgot-password",
  validationMiddleware(ForgotPasswordSchema),
  requestPasswordReset
);
router.post(
  "/reset-password",
  validationMiddleware(ResetPasswordSchema),
  resetPassword
);

// ==================== Protected Routes ====================
// Routes requiring authentication

router.post(
  "/signout",
  validationMiddleware(SignOutSchema),
  authenticationMiddleware,
  signOutUser
);

router.post(
  "/refresh-token",
  validationMiddleware(RefreshTokenSchema),
  refreshTokenService
);

router.put(
  "/update",
  authenticationMiddleware,
  validationMiddleware(UpdateUserSchema),
  updateUser
);

router.delete("/delete", authenticationMiddleware, deleteUser);

// ==================== Admin Routes ====================
// Routes requiring admin role

router.get(
  "/list-users",
  authenticationMiddleware,
  authorizationMiddleware([USER_ROLE.ADMIN]),
  getAllUsers
);

export default router;
