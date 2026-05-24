const Comment = require("../models/Comment");
const Note = require("../models/Note");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const responseFormatter = require("../utils/responseFormatter");
const { validateComment } = require("../utils/validators");

exports.addComment = asyncHandler(async (req, res, next) => {
  const { error, value } = validateComment(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { noteId } = req.params;
  const { name, content } = value;

  // Check if note exists
  const note = await Note.findById(noteId);
  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  // Create comment
  const comment = new Comment({
    noteId,
    name,
    content,
  });

  await comment.save();

  // Add comment to note's comments array
  note.comments.push(comment._id);
  await note.save();

  res
    .status(201)
    .json(
      responseFormatter.success(comment, "Comment added successfully", 201),
    );
});

exports.getCommentsByNoteId = asyncHandler(async (req, res, next) => {
  const { noteId } = req.params;

  // Check if note exists
  const note = await Note.findById(noteId);
  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  const comments = await Comment.find({ noteId }).sort({ creationDate: -1 });

  res
    .status(200)
    .json(
      responseFormatter.success(comments, "Comments retrieved successfully"),
    );
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findOne({ commentId });

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  // Remove comment from note
  await Note.findByIdAndUpdate(comment.noteId, {
    $pull: { comments: comment._id },
  });

  // Delete comment
  await Comment.deleteOne({ commentId });

  res
    .status(200)
    .json(responseFormatter.success(null, "Comment deleted successfully"));
});
