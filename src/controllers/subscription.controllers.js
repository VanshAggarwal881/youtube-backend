import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;
  // TODO: toggle subscription

  // 1. Validate channel ID
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  // 2. Check if channel exists and is not the user themselves
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  let subscription;
  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });
  if (existingSubscription) {
    // unsubscribe
    await Subscription.findByIdAndDelete(existingSubscription._id);

    // since the channel is unsubscribed , the subscribers should be decremented as well as the no. of channels
    await User.findByIdAndUpdate(userId, {
      $inc: { channelsSubscribedToCount: -1 },
    });
    await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: -1 } });
  } else {
    // Subscribe
    subscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    // Increment counts
    await User.findByIdAndUpdate(userId, {
      $inc: { channelsSubscribedToCount: 1 },
    });
    await User.findByIdAndUpdate(channelId, { $inc: { subscribersCount: 1 } });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed: !existingSubscription },
        existingSubscription
          ? "Unsubscribed successfully"
          : "Subscribed successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate({
      path: "subscriber",
      select: "username avatar fullname",
    })
    .select("-createdAt -updatedAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribers: subscribers.map((sub) => sub.subscriber),
        totalSubscribers: subscribers.length,
      },
      "Subscribers fetched successfully"
    )
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const user = await User.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate({
      path: "channel",
      select: "username avatar fullname subscribersCount",
    })
    .select("-createdAt -updatedAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        channels: subscriptions.map((sub) => sub.channel),
        totalChannels: subscriptions.length,
      },
      "Subscribed channels fetched successfully"
    )
  );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
