import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Playlist name is required");
  }
  // create
  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim(),
    owner: userId,
  });
  // Return response
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
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

  // 3. Aggregation pipeline for playlists with video details
  const playlists = await Playlist.aggregate([
    {
      $match: {
        // match playlist by owner , // Returns multiple playlists
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        // lookup videos
        from: "videos",
        localField: "videos", // Array of video IDs in playlist
        foreignField: "_id", // Match video documents by _id
        as: "videos", // Store result in videos array
        pipeline: [
          {
            $project: {
              // Only include these fields
              title: 1,
              thumbnail: 1,
              duration: 1,
              views: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner", // Playlist's owner ID
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              // second project .. owner lookup
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      // Controls the overall output structure of the playlist document
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        videos: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );

  /* RESPONSE STRUCTURE
    {
    "statusCode": 200,
    "data": [
        {
            "_id": "playlist123",
            "name": "Favorites",
            "description": "My favorite videos",
            "owner": {
                "username": "johndoe",
                "avatar": "url/to/avatar.jpg"
            },
            "videos": [
                {
                    "title": "Awesome Video",
                    "thumbnail": "url/to/thumbnail.jpg",
                    "duration": 356,
                    "views": 1500
                }
            ],
            
            "createdAt": "2024-01-20T10:00:00Z",
            "updatedAt": "2024-01-20T10:00:00Z"
        }
    ],
    "message": "User playlists fetched successfully"
} */
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        // returns single playlist
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
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
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnail: 1,
              duration: 1,
              views: 1,
              owner: 1,
              createdAt: 1,
            },
          },
        ],
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
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        videos: 1,
      },
    },
  ]);

  // 3. Check if playlist exists
  if (!playlist.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist[0], "Playlist details fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid playlist or video id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  if (!playlist.owner.equals(userId)) {
    throw new ApiError(403, "unauthorized to modify this playlist");
  }

  // 4. Check if video already exists in playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(409, "Video already in playlist");
  }

  // add video
  playlist.videos.push(videoId);
  await playlist.save({});

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }
  const newPlaylist = await Playlist.findByIdAndDelete(playlistId, {
    $pull: { videos: videoId },
    new: true,
  });
  if (!newPlaylist) {
    throw new ApiError(500, "failed to remove video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  await Playlist.findByIdAndDelete(playlistId);
  return res.status(200).json(new ApiResponse(200, "Playlist deleted"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  // userId for ownership check
  const userId = req.user?._id;
  //TODO: update playlist
  // 1. Validate input
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!name?.trim()) {
    throw new ApiError(400, "Name is required");
  }

  // 2. Update with ownership check
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: userId,
    },
    {
      $set: {
        name: name.trim(),
        description: description?.trim(),
      },
    },
    {
      new: true, // Return updated document
    }
  );

  // 3. Check if update succeeded
  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found or unauthorized to update");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
