import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// @desc - get users
// @route - /user
// @method - GET
// @access - public
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

// @desc - update user
// @route - /user/:id
// @method - PATCH
// @access - Private
const updateUser = asyncHandler(async (req, res) => {
  const { userId, username, email, password, avatar } = req.body;

  if (req.id !== userId) {
    return res.status(401).json({ message: "Unathorized!" });
  }

  if (!username || !email || !avatar) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(404).json({ message: "User does not exist!" });
  }

  const duplicateUsername = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateUsername && duplicateUsername?._id.toString() !== userId) {
    return res.status(409).json({ message: "Duplicate username" });
  }

  const duplicateEmail = await User.findOne({ email }).exec();

  if (duplicateEmail && duplicateEmail?._id.toString() !== userId) {
    return res.status(409).json({ message: "Duplicate Email!" });
  }

  user.username = username;
  user.email = email;
  user.avatar = avatar;

  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();
  res.status(200).json({ message: `${updatedUser.username} updated!` });
});

// @desc - delete user
// @route - /user/:id
// @method - DELETE
// @access - Private
const deleteUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { userId } = req.body;
  console.log(userId);

  if (req.id !== userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(userId).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // this will hold the deleted user's information
  const result = await user.deleteOne();

  const reply = `Username: ${result.username} with ID ${result._id} deleted`;

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return res.status(200).json(reply);
});

// @desc - get user profile
// @route - /user/:id
// @method - GET
// @access - Private
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean();

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  res.status(200).json(user);
});

export { getUsers, updateUser, deleteUser, getUserProfile };
