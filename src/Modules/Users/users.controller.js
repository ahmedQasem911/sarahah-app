import { Router } from "express";
import { signUpUser, updateUser } from "./Services/users.service.js";
const router = Router();

router.post("/signup", signUpUser);
router.put("/update/:userId", updateUser);

export default router;
