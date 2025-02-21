import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. get the token from the cookie : When you’re sending cookies in the response, they get stored in the user’s browser and sent back to the server with each subsequent request to the same domain. That’s how req.cookies gets populated! Let me explain how it all works.
    // To access req.cookies, you need to use the cookie-parser middleware. It reads the cookies attached to the incoming request object.
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(
        401,
        "Unauthorized request , please login to access this resource"
      );
    }
    // if token is present then verify the token using jwt , jwt provided direct method that is verify
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // adding user to the request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
  // now that the middleware is created we need to use it in the routes where we want to verify the user
});
