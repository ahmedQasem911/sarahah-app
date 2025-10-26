import { Router } from "express";
import {
  confirmEmail,
  deleteUser,
  refreshTokenService,
  requestPasswordReset,
  resetPassword,
  signInUser,
  signOutUser,
  signUpUser,
  updateUser,
} from "./Services/users.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
const router = Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);
router.put("/update", authenticationMiddleware, updateUser);
router.delete("/delete", authenticationMiddleware, deleteUser);
router.put("/confirm-otp", confirmEmail);
router.post("/signout", authenticationMiddleware, signOutUser);
router.post("/refresh-token", refreshTokenService);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
