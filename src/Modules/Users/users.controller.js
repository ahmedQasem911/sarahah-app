import { Router } from "express";
import { signUpUser } from "./Services/users.service.js";
const router = Router();

router.post("/signup", signUpUser);

export default router;
