import express from "express";
const router = express.Router();
import {
  createListing,
  updateUserListing,
  deleteUserListing,
  getListing,
  getUsersListing,
  getListings,
} from "../controllers/listingController.js";
import protect from "../middlewares/protect.js";

router.route("/get").get(getListings);
router.route("/").post(protect, createListing);
router
  .route("/")
  .delete(protect, deleteUserListing)
  .patch(protect, updateUserListing)
  .get(protect, getUsersListing)
  .get(protect, getListing);

export default router;
