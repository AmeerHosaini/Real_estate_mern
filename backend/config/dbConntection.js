import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

const connectDB = asyncHandler(async (uri) => {
  await mongoose.connect(uri);
});

export default connectDB;
