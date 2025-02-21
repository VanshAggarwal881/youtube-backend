import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  // 1. Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // 2. Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 3. find the existing like
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  }); // can search by any field , returns first match or null thats why using in if-else

  // 4. Toggle Like
  if (existingLike) {
    // remove the like --- Unlike
    await Like.findByIdAndDelete(existingLike._id);
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }
  /*
  why to check for comment the fact is that if a comment is not there then the user will not like or dislike any comment
  Race Condition
1. User loads page with Comment A (ID: 123)
Admin deletes Comment A
3. User clicks "Like" on Comment A before page refreshes
4. Request reaches server with valid comment ID 123 (now deleted)
Without existence check: ❌ Creates like for non-existent comment
  */
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment like toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  // 1. Validate tweetId format
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // 2. Check tweet existence
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  // 3. Check existing like
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  // 4. Toggle like
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
  } else {
    await Like.create({ tweet: tweetId, likedBy: req.user?._id });
  }

  // 5. Return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet like toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  // Aggregation pipeline to fetch liked videos with owner details
  const likedVideos = await Like.aggregate([
    /*
    this pipeline is taking all the likes by the current user on videos, joining those with the actual video data, and within each video, joining with the user who owns the video. The result is an array of video documents that the current user has liked, each including the owner's details.
    1. Find all "likes" where:
   - Liked by current user (userId)
   - Are video likes (video field exists)

    2. For each like, get full video details:
   - Video information
   - Video's owner details (username + avatar)

    3. Return final structure:
   - Array of video documents
   - Each video contains its owner's public info
    */
    // Step 1: Filter likes by the current user for videos
    {
      $match: {
        likedBy: userId,
        video: { $exists: true },
      },
    },
    // Step 2: Join with the videos collection
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          // Step 2a: Join with users to get owner details
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          // Step 2b: Convert owner array to object
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
    // Step 3: Unwind the video array to access each video document : Converts the video array into individual documents.
    {
      $unwind: "$video",
    },
    // Step 4: Replace root to promote video to the top level : Promotes the video details to the top level of the document, removing unnecessary nesting.
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
