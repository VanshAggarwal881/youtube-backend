import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const generateTokens = async (userid) => {
  try {
    // find user first by the userid
    const user = await User.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    /* 
    1️⃣ Client enters the application (logs in):
    1 The user enters their email and password.
    2 The backend verifies the credentials.
    3 If correct, the backend generates an Access Token and a Refresh Token and sends them to the client (frontend).

    2️⃣ Client stores the tokens:
    1 The frontend (React, mobile app, etc.) stores the Access Token (usually in memory or local storage).
    2 The frontend (React, mobile app, etc.) stores the Access Token (usually in memory or local storage).
    3 The Refresh Token is stored securely (like HTTP-only cookies).

    3️⃣ How Does the Backend Verify the Refresh Token?
    1 The backend checks: ✅ The Refresh Token is not expired.
    2 ✅ The Refresh Token is stored in the database or a secure HTTP-only cookie.
    3 ✅ The Refresh Token has not been revoked (e.g., if the user logged out).

    4 If all checks pass, the backend issues a new Access Token.
     
    */
    // 1. store the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // validateBeforeSave: false : because we don't want to validate the user again and again (don't ask for password as saving something in the database kicks in all the fields like password )

    // return the tokens
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "ok with status code 200",
  // });
  /*
  1. get user details from frontend
  2. validation - if all the fields are filled or not
  3. check if user already exists - by username or email
  4. check for images , check for avatar
  5. upload them to cloudianry , check avatar
  6. create user object - create entry in db : data is sent in mongodb and in mongodb objects are made and also uploaded.
  7. remove password and refersh token fields from response . : After creating the user object the response is received as it is and we don't want to send encrypted password and refresh token.
  8. check for user creation - send response if the user is regitered and send error if not  
  
  */

  // 1. get user details from frontend
  // req.body for data extraction if received in the form of json and form
  const { username, email, fullname, password } = req.body;
  // console.log("email : ", email);

  // 2. validation - if all the fields are filled or not
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required*");
  }

  // 3. check if user already exists - by username or email
  // import User from model as the User can directly talk to database as it is made with the help of mongoose.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "username or email already exists");
  }

  // 4. check for images , check for avatar
  // req.files : this can be received with the help of middleware
  console.log("req.files", req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // avatar[0] : need first property : first property gives an object which helps in giving the path multer has taken/uploaded... as it is written in muleter.middleware.js to save the destination and provide the original name // avatarLocalPath : because on server , not on cloudinary

  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // 4.2 check for avatar
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required is a required field");
  }

  // Debug logs to check if files exist before uploading

  // 5. upload them to cloudianry , check avatar
  // prewritten cloudinary code is available
  // console.log("avatarlocalpath", avatarLocalPath);
  const avatar = await uploadonCloudinary(avatarLocalPath);
  const coverImage = await uploadonCloudinary(coverImageLocalPath);

  // 5.2 check for avatar
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }
  // 6. create user object - create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // 7. remove password and refersh token fields from response .
  const createduser = await User.findById(user._id).select(
    // weird syntax : remove from selection by -
    "-password -refreshToken"
  );

  // 8. check for user creation - send response if the user is regitered and send error if not
  if (!createduser) {
    throw new ApiError(500, "Something went wrong while registeration");
  }

  // 8.2 return response
  return res
    .status(201)
    .json(new ApiResponse(200, createduser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /*
  1. get email or username and password from frontend
  2. validate the fields
  3. find user by email or password
  4. check for password match
  5. generate access and refresh token
  6. send cookie
  7. return response
  */

  // 1. get email and password from frontend
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  // 2. validate the fields
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // 3. find user by email or password
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 4. check for password match
  // if user exists check for password match , When you create a Mongoose model using mongoose.model("User", userSchema), all instances of User inherit the methods you defined inside .methods.
  // Instance Methods: These methods (like checkPassword) are only available on instances of the User model, meaning you must first fetch a user from the database before calling them.
  //Not available on Model itself: You can't call User.checkPassword(), but you can call userInstance.checkPassword(), where userInstance is a document retrieved from MongoDB.

  const isPasswordCorrect = await user.checkPassword(password); // password gained from req.body
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  // 5. generate access and refresh token : making a seaparate function for this above
  const { accessToken, refreshToken } = await generateTokens(user._id);

  // optional step
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 6. send cookie
  const cookieOptions = {
    httpOnly: true, // prevent client side(frontend) js from accessing the cookie only server side can access it
    secure: true, // only send the cookie over https
  };
  // 7. return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
  // there might be cases where the user wants to store the token in the local storage or session storage so we can return the tokens in the response
});

const logoutUser = asyncHandler(async (req, res) => {
  // now that the middle ware is added we can use the user from the request object
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  // 2. clear the cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessaToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  if (!decoded) {
    throw new ApiError(401, "Unauthorized request");
  }
  // user contains encoded form of token and decoded form contains all the data like id . With the help of id we can find the user in the database which also has the refresh token.
  const user = await User.findById(decoded?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }
  // if both the tokens are same then only the user can be authenticated
  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token expired or used");
  }

  const { accessToken, newrefreshToken } = await generateTokens(user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, newrefreshToken },
        "Access token refreshed successfully"
      )
    );
});

// controller for changing current user password
const changePassword = asyncHandler(async (req, res) => {
  // 1. get the old password and new password from the frontend
  const { oldPassword, newPassword } = req.body;
  // find the user by id
  const user = await User.findById(req.user._id);
  // check if the old password is correct
  const isOldPasswordCorrect = await user.checkPassword(oldPassword);
  if (!isOldPasswordCorrect) {
    throw new ApiError(401, "Current password is incorrect");
  }

  // 2. update the password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password updated successfully"));
});

// get current user details
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        req.user,
        "Current user details fetched successfully"
      )
    );
});

// update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  if (!fullname && !email) {
    throw new ApiError(400, "Fullname and email are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true } // new : true : because we want to return the updated user
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// update avatar
const updateAvatar = asyncHandler(async (req, res) => {
  // 1. get the avatar from the frontend as when the user uploads the avatar it is stored in the req.file
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  // 2. upload the avatar to the cloudinary
  const avatar = await uploadonCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Something went wrong while uploading avatar");
  }
  // 3. update the avatar in the database
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// update cover image

const updateCoverImage = asyncHandler(async (req, res) => {
  // 1. get the cover image from the frontend
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }
  // 2. upload the cover image to the cloudinary
  const coverImage = await uploadonCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Something went wrong while uploading cover image");
  }
  // 3. update the cover image in the database
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

// get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  // get username from the params
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  // aggregation pipeline
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        fullname: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "Channel profile fetched successfully")
    );
});

// get user watch history
const getUserWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id), // getting mongo id from the user id as req.user?._id is string
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
