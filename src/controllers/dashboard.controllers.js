import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;

  // 1. Get total subscribers count
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  // 2. Get video statistics using aggregation
  const videoStats = await Video.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: "$likesCount" },
      },
    },
  ]);

  // 3. Combine results
  const stats = {
    totalSubscribers,
    ...(videoStats[0] || {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
    }),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all videos with basic filtering
  const videos = await Video.find({ owner: userId })
    .sort({ createdAt: -1 })
    .select("title description thumbnail views duration isPublished createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos: videos.length,
      },
      "Channel videos fetched"
    )
  );
});

export { getChannelStats, getChannelVideos };
