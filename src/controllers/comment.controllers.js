import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  // aggregation pipeline for getting all comments for a video
  const comments = await Comment.aggregate([
    {
      // use of match to filter comments by video id
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
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
    {
      // need of addfields : to get the first element from the owner array
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);
  // count the total number of comments for a video , countdocuments is used to count the number of documents in the collection.
  // The result, totalComments, will be the total number of comments for the given video. This value can then be used to provide pagination information to the client, such as the total number of pages available.
  // Return Value: The method returns a promise that resolves to the count of documents matching the query criteria.
  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(200, "Comments fetched successfully", {
      comments,
      totalComments,
      page,
      limit,
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  // 1. Get videoId from params and content from body
  const { videoId } = req.params;
  const { content } = req.body;

  // 2. Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // 3. Validate content
  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  // 4. Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 5. Create the comment
  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: req.user._id,
  });
  /*
// At this point, comment looks like:
{
    content: "Great video!",
    video: "507f1f77bcf86cd799439011",  // just the ID
    owner: "507f191e810c19729de860ea"   // just the ID
}
 */
  // 6. Get the created comment with owner details
  const createdComment = await Comment.findById(comment._id).populate(
    "owner",
    "username fullName avatar"
  );
  /* Now -> Example Response:
{
    _id: "comment123",
    content: "Great video!",
    video: "video456",         // Video ID being commented on
    owner: {                   // Commenter's details
        username: "john_doe",  // Commenter's username
        fullName: "John Doe",  // Commenter's full name
        avatar: "url/to/avatar" // Commenter's avatar
    },
    createdAt: "2024-01-20T..."
}
    // without populating
    Performance Issues
      Multiple API calls for each comment
      Slower page load
      More server load
*/

  if (!createdComment) {
    throw new ApiError(500, "Something went wrong while creating comment");
  }

  // 7. Return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  // 1. Get commentId and content
  const { commentId } = req.params;
  const { content } = req.body;

  // 2. Validate inputs
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  // not using findbyid and findbyidandupdate as there is no need to find twice times and then update use findoneandupdate so that in one method we are checking ownership and updating also
  const updatedComment = await Comment.findOneAndUpdate(
    {
      // 1. These conditions MUST match first
      _id: commentId,
      owner: req.user?._id, // ownership check
    },
    // 2. This update only runs if conditions match
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
    }
  ).populate("owner", "username fullName avatar");
  // 4. Check if update was successful
  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  // 1. Validate commentId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  // 2. Find and delete comment in one operation
  const deletedComment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user?._id, // Ensure owner is deleting their own comment
    /*
      don't need to specify the content to delete a comment
      To delete, we just need the receipt number (ID) and proof of ownership
      Like deleting an email - you don't need to know what's in it, just which one to delete
      */
  });

  // 3. Check if comment was found and deleted
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
