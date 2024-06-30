import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    video: {
      type: String, //Cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, //Cloudinary URL
      required: true,
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
    },
  },
  { timestamps: true }
);

// Import the mongoose-aggregate-paginate-v2 plugin
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');



export const Video = mongoose.model("Video", videoSchema);
