import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
// import { uploadonCloudinary } from "../utils/cloudinary.js";
import {
  uploadonCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  /*
  Using req.query in Express.js allows you to access the query parameters sent in the URL of an HTTP request. Query parameters are typically used to filter, sort, and paginate data in a flexible and dynamic way.

-> Why Use req.query
@ Filtering: You can filter the results based on specific criteria. For example, you might want to get videos that match a certain search term in their title or description.

Sorting: You can sort the results based on different fields, such as creation date, title, or any other field in your data model.

@ Pagination: You can paginate the results to avoid loading too much data at once. This is especially useful for large datasets.

-> How req.query is Helpful in Getting All Videos
In the getAllVideos function, req.query is used to extract various query parameters that control how the videos are fetched:
@ page: The page number for pagination (default is 1).
@ limit: The number of videos per page (default is 10).
@ query: A search query to filter videos by title or description.
@ sortBy: The field to sort by (default is createdAt).
@ sortType: The sort order, either asc for ascending or desc for descending (default is desc).
@ userId: An optional user ID to filter videos by a specific user.
------------------
In this example:

page=2: Fetch the second page of results.
limit=5: Limit the results to 5 videos per page.
query=test: Filter videos that contain the term "test" in their title or description.
sortBy=title: Sort the results by the title field.
sortType=asc: Sort the results in ascending order.
userId=12345: Filter videos by the user with ID 12345.

Result of console.log(req.query)
{
  page: '2',
  limit: '5',
  query: 'test',
  sortBy: 'title',
  sortType: 'asc',
  userId: '12345'
}
  */
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // 1 BUILD THE QUERY/FILTER OBJECT
  /*
  Query Object:
  @ Create a dynamic filter object based on query parameters
  @ If the query parameter is provided in the request, the code adds a $or condition to the filter object.
  @ The $or condition specifies that either the title or description field should match the query string.
  @ The $regex operator is used to perform a regular expression search, and the $options: "i" makes the search case-insensitive.
  */
  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  // If the userId is valid, the filter object is updated to include a condition that the owner field should match the provided userId.
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    filter.owner = userId;
  }

  // Only show published videos
  filter.isPublished = true;

  // 2 DETERMINE THE SORT ORDER
  /*
  Without explicit sorting, the order of the results can be arbitrary and may vary between queries, even if the underlying data hasn't changed. This is due to the way databases store and retrieve data, which can be influenced by factors like indexing, data insertion order, and internal optimizations.
  if you want to display the most recent videos first, you need to sort by the createdAt field in descending order.
  */
  // prepare sorting object
  const sortOrder = {};
  if (sortBy && sortType) {
    sortOrder[sortBy] = sortType.toLowerCase() === "desc" ? -1 : 1;
  } else {
    sortOrder.createdAt = -1;
  }

  const videoAggregate = await Video.aggregate([
    {
      $match: filter,
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
              fullname: 1,
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
    {
      $sort: sortOrder,
    },
  ]);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const videos = await Video.aggregatePaginate(videoAggregate, options);
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  // check if file video exists
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file is required");
  }
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  // upload on cloudinary
  const videoFile = await uploadonCloudinary(videoLocalPath);
  if (!videoFile) {
    throw new ApiError(500, "error while uploading video");
  }
  // upload thumbnail
  const thumbnail = await uploadonCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "error while uploading thumbnail");
  }

  // create video document in database
  const video = await Video.create({
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    title,
    description,
    duration: videoFile.duration,
    owner: req.user?._id,
    isPublished: true,
  });
  // Get the created video with owner details
  /* 
1. Why fetch again?
When we create the video with Video.create(), the owner field only contains the user's ID
We want to send back the video data WITH the owner's details (username, fullName, avatar)
The client needs this information to display who uploaded the video
*/
  const videoUploaded = await Video.findById(video._id).populate(
    "owner",
    "username fullName avatar"
  );

  if (!videoUploaded) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, videoUploaded, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  /* 1.  Input Validation
  Extract videoId from params
  Validate if videoId is provided
  Check if videoId is a valid MongoDB ObjectId
*/
  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  /* 2. Video Retrieval
Find video by ID in database
Populate owner details (username, avatar, etc.) : without populating the owner will only provide the id.
Check if video exists
Check if video is published (unless the requester is the owner)
*/
  const video = await Video.findById(videoId).populate(
    "owner",
    "username fullName avatar"
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if video is published or user is the owner
  /*
why this check is necessary:
Privacy Control
A creator might want to keep a video private/unpublished
Only the creator should be able to see their unpublished videos
Other users shouldn't have access to unpublished content

Think of YouTube's "Private" or "Unlisted" videos
Only the creator can see their private videos

If we skip this check:
Anyone could access unpublished videos
There would be no way to have private videos
Creator's privacy would be compromised
*/
  if (
    !video.isPublished &&
    (!req.user?._id || video.owner._id.toString() !== req.user._id.toString())
  ) {
    throw new ApiError(403, "This video is not published");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  // find video to update
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  // 1. Check if new thumbnail is provided
  // thumbnail update
  let thumbnailUpdate = {};
  if (req.file) {
    const thumbnailLocalPath = req.file.path;

    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail file is missing");
    }

    // Upload new thumbnail
    const newthumbnail = await uploadonCloudinary(thumbnailLocalPath);
    if (!newthumbnail) {
      throw new ApiError(500, "Error while uploading thumbnail");
    }

    // Delete old thumbnail from Cloudinary
    if (video.thumbnail?.public_id) {
      await deleteFromCloudinary(video.thumbnail.public_id);
    }

    // thumbnail update
    thumbnailUpdate = {
      thumbnail: {
        url: newthumbnail.url,
        public_id: newthumbnail.public_id,
      },
    };
  }

  // update video
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title?.trim() || video.title, // keep the existent title if title is not given
        description: description?.trim() || video.description,
        ...thumbnailUpdate,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  // 1. Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // 2. Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // 3. Check ownership - only owner can delete
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized - You can only delete your own videos"
    );
  }
  // 4. Delete video and thumbnail from Cloudinary
  if (video.videoFile?.public_id) {
    await deleteFromCloudinary(video.videoFile.public_id, "video");
  }

  if (video.thumbnail?.public_id) {
    await deleteFromCloudinary(video.thumbnail.public_id);
  }
  // 5. Delete video document from database
  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // 1. Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // 2. Find the video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  // 3. Check ownership
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized - You can only toggle your own videos"
    );
  }

  // 4. Toggle the publish status
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished, // Toggle the current status
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        `Video ${
          updatedVideo.isPublished ? "published" : "unpublished"
        } successfully`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
