const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const commentSchema = new mongoose.Schema(
  {
    commentId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: [true, "Note ID is required"],
    },
    name: {
      type: String,
      required: [true, "Commenter name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    creationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index for querying comments by note
commentSchema.index({ noteId: 1, creationDate: -1 });
commentSchema.index({ commentId: 1 });

module.exports = mongoose.model("Comment", commentSchema);
