import { Router } from "express";

import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { validateRegistration } from "../middleware/validation.js";

const router = Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", loginUser);

export default router;
