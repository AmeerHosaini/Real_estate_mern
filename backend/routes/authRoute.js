import express from "express";
const router = express.Router();
import loginLimiter from "../middlewares/loginLimiter.js";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";

router.route("/login").post(loginLimiter, login);
router.route("/register").post(register);
router.route("/refresh").get(refresh);
router.route("/logout").post(logout);

export default router;
