import mongoose from "mongoose";

const subscriberSchema = new Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamp: true }
);

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
