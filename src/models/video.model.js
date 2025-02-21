import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// MAP is used to write aggregate queries and used as a plugin in the model.
// const videoSchema = new Schema(
//   {
//     videoFile: {
//       type: String,
//       required: true,
//     },
//     thumbnail: {
//       type: String,
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     duration: {
//       type: Number,
//       required: true,
//     },
//     Views: {
//       type: Number,
//       default: 0,
//     },
//     isPublished: {
//       type: Boolean,
//       default: true,
//     },
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

const videoSchema = new Schema(
  {
    videoFile: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      // Changed from "Views" to lowercase for consistency
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// writing aggregate queries
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
