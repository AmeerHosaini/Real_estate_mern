import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import createToken from "../utils/createToken.js";
import jwt from "jsonwebtoken";

// @desc Register a user
// @route /auth
// @method POST
// @access Public
const register = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields required!" });
  }

  const duplicateUsername = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateUsername) {
    return res.status(409).json({ message: "User already exists!" });
  }

  const duplicateEmail = await User.findOne({ email }).exec();

  if (duplicateEmail) {
    return res.status(409).json({ message: "User already exists!" });
  }

  const user = await User.create({ email, username, password });

  if (user) {
    return res
      .status(201)
      .json({ message: `${username} registered successfully!` });
  } else {
    return res.status(400).json({ message: "Invalid user data received!" });
  }
});

// @desc Login
// @route /auth
// @method POST
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) {
    return res.status(404).json({ message: "User not found!" });
  }

  const matchPassword = await foundUser.comparePassword(password);

  if (!matchPassword) {
    return res.status(401).json({ message: "Password mismatch!" });
  }

  const user = {
    userInfo: {
      id: foundUser._id,
      username: foundUser.username,
      avatar: foundUser.avatar,
    },
  };

  const accessToken = createToken.accessToken(user);
  const refreshToken = createToken.refreshToken({
    username: foundUser.username,
  });

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
});

// @desc refresh
// @route /auth/refresh
// @method GET
// @access Public
const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN,
    asyncHandler(async (error, decoded) => {
      if (error) {
        return res.status(403).json({ message: "Forbidden!" });
      }
      const foundUser = await User.findOne({ username: decoded.username });
      if (!foundUser) {
        return res.status(401).json({ message: "Unauthorized!" });
      }
      const user = {
        userInfo: {
          id: foundUser._id,
          username: foundUser.username,
          avatar: foundUser.avatar,
        },
      };
      const accessToken = createToken.accessToken(user);
      return res.json({ accessToken });
    })
  );
});

// @desc logour
// @route /auth/logout
// @method POST
// @access Public
const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Logged out!" });
});

export { register, login, refresh, logout };
