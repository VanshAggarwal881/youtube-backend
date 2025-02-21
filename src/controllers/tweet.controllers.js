import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const userId = req.user?._id;
  if (!content) {
    throw new ApiError(400, "no content to tweet");
  }
  const tweet = await Tweet.create({
    content: content.trim(),
    owner: userId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  // 1. Validate user ID
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // 2. Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Without pagination
  const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "owner",
      select: "username avatar",
    });

  return res.status(200).json(
    new ApiResponse(
      200,

      {
        tweets,
        totalTweets: tweets.length,
      },

      "User tweets fetched successfully"
    )
  );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  // 1. Validate input
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const cleanContent = content?.trim();
  if (!cleanContent) {
    throw new ApiError(400, "Content is required");
  }

  // 2. Update tweet with ownership check
  const tweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: userId,
    },
    {
      $set: {
        content: cleanContent,
        updatedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or unauthorized to update");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  // 1. Validate tweet ID
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // 2. Delete with ownership check
  await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
