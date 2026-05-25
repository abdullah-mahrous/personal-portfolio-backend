const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const xss = require("xss");

const noteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      set: (v) => xss(v ? v.trim() : v),
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      set: (v) => xss(v ? v.trim() : v),
    },
    readTime: {
      type: Number,
      required: [true, "Read time is required"],
      min: [1, "Read time must be at least 1 minute"],
    },
    imgURL: {
      type: String,
      default: null,
    },
    imgId: {
      type: String,
      default: null,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    creationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index for common queries
noteSchema.index({ creationDate: -1 });
noteSchema.index({ id: 1 });

module.exports = mongoose.model("Note", noteSchema);
