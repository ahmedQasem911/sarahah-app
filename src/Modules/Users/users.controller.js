import { Router } from "express";
import {
  deleteUser,
  signInUser,
  signUpUser,
  updateUser,
} from "./Services/users.service.js";
const router = Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);
router.put("/update/:userId", updateUser);
router.delete("/delete/:userId", deleteUser);

export default router;
