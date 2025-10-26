import { Router } from "express";
import { getMessages, sendMessage } from "./Services/messages.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
const router = Router();

router.post("/send/:receiverID", sendMessage);
router.get("/", authenticationMiddleware,getMessages);

export default router;
