import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();

import connectDB from "./config/dbConntection.js";
import mongoose from "mongoose";
import cors from "cors";
import corsOptions from "./config/corsOptions.js";
import cookieParser from "cookie-parser";
import { logger, logEvents } from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// routes
import rootRoute from "./routes/root.js";
import authRoute from "./routes/authRoute.js";
import listingRoute from "./routes/listingRoute.js";
import userRoute from "./routes/userRoute.js";

const PORT = process.env.PORT || 3500;

// database connection
connectDB(process.env.MONGO_URI);

// logger middleware
app.use(logger);

// cors middleware
app.use(cors(corsOptions));

// process JSON
app.use(express.json());

// cookie parser
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));

// Root Route
app.use("/", rootRoute);

// Auth Route
app.use("/auth", authRoute);

// Listing Route
app.use("/listing", listingRoute);

// User Route
app.use("/user", userRoute);

// 404 route
app.all("*", (req, res) => {
  res.status(404);
  // look at the request header and determine what response to send
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// error handler
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connection established");
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
});

mongoose.connection.on("error", (error) => {
  console.log(error);
  logEvents(
    `${error.no}: ${error.code}\t${error.syscall}\t${error.hostname}`,
    "mongoErrLog.log"
  );
});
