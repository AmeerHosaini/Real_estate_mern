import express from "express";
const router = express.Router();
import {
  updateUser,
  getUserProfile,
  deleteUser,
  getUsers,
} from "../controllers/userController.js";
import protect from "../middlewares/protect.js";

router.route("/").get(getUsers);

router
  .route("/")
  .patch(protect, updateUser)
  .get(protect, getUserProfile)
  .delete(protect, deleteUser);

export default router;
