import Listing from "../models/Listing.js";
import asyncHandler from "express-async-handler";

// @desc  create listing
// @route /listing
// @method POST
// @access Private
const createListing = asyncHandler(async (req, res) => {
  const listing = await Listing.create(req.body);
  return res.status(201).json(listing);
});

// @desc  Delete user listing
// @route /listing/:id
// @method DELETE
// @access Private
const deleteUserListing = asyncHandler(async (req, res) => {
  // get it from the body if needed
  const { id } = req.body;

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found!" });
  }

  if (req.id !== listing.userRef.toString()) {
    return res
      .status(401)
      .json({ message: "You can delete your own listing!" });
  }

  await Listing.findByIdAndDelete(id);
  res.status(200).json("Listing deleted successfully");
});

// @desc  Update user listing
// @route /listing/:id
// @method PATCH
// @access Private
const updateUserListing = asyncHandler(async (req, res) => {
  const { id } = req.body;

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found!" });
  }

  if (req.id !== listing.userRef.toString()) {
    return res
      .status(401)
      .json({ message: "You can update your own listing!" });
  }

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.status(200).json(updatedListing);
});

// @desc  Get listing
// @route /listing/:id
// @method GET
// @access Private
const getListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found!" });
  }

  res.status(200).json(listing);
});

// @desc  Get user listing
// @route /listing/:id
// @method GET
// @access Private
const getUsersListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.id !== id) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const listings = await Listing.find({ userRef: id });

  if (!listings) {
    return res.status(404).json({ message: "There are no listings!" });
  }

  res.status(200).json(listings);
});

// @desc  Get listings
// @route /listing
// @method GET
// @access Public
const getListings = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 9;
  const startIndex = parseInt(req.query.startIndex) || 0;
  const searchTerm = req.query.searchTerm || "";
  const sort = req.query.sort || "createdAt";
  const order = req.query.order || "desc";

  let { offer, furnished, parking, listingType } = req.query;

  // see the listings with or wothout offer
  if (offer === undefined || offer === "false") {
    offer = { $in: [false, true] };
  }

  if (furnished === undefined || furnished === "false") {
    furnished = { $in: [false, true] };
  }

  if (parking === undefined || parking === "false") {
    parking = { $in: [false, true] };
  }

  // if listing type is not in the url, or the rent and sale is selected, show the entire result with rent and sale
  if (listingType === undefined || listingType === "all") {
    listingType = { $in: ["sale", "rent"] };
  }

  const listings = await Listing.find({
    name: { $regex: searchTerm, $options: "i" },
    offer,
    furnished,
    parking,
    listingType,
  })
    .sort({ [sort]: order })
    .limit(limit)
    .skip(startIndex);

  res.status(200).json(listings);
});
export {
  createListing,
  deleteUserListing,
  updateUserListing,
  getListing,
  getUsersListing,
  getListings,
};
