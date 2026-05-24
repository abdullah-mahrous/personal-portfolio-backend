const Note = require("../models/Note");
const Comment = require("../models/Comment");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const responseFormatter = require("../utils/responseFormatter");
const { validateNote } = require("../utils/validators");
const cloudinaryService = require("../services/cloudinaryService");

exports.getAllNotes = asyncHandler(async (req, res, next) => {
  const notes = await Note.find()
    .populate({
      path: "comments",
      select: "name content creationDate commentId",
    })
    .sort({ creationDate: -1 });

  res
    .status(200)
    .json(responseFormatter.success(notes, "Notes retrieved successfully"));
});

exports.getNoteById = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id).populate({
    path: "comments",
    select: "name content creationDate commentId",
  });

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  res
    .status(200)
    .json(responseFormatter.success(note, "Note retrieved successfully"));
});

exports.createNote = asyncHandler(async (req, res, next) => {
  const { error, value } = validateNote(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { title, content, readTime } = value;

  let imgURL = null;
  let imgId = null;

  // Upload image if provided
  if (req.file) {
    const uploadResult = await cloudinaryService.uploadImage(req.file.path);
    imgURL = uploadResult.url;
    imgId = uploadResult.publicId;
  }

  const note = new Note({
    title,
    content,
    readTime,
    imgURL,
    imgId,
  });

  await note.save();

  res
    .status(201)
    .json(responseFormatter.success(note, "Note created successfully", 201));
});

exports.updateNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  // Only update fields that are in the request
  const allowedFields = ["title", "content", "readTime"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      note[field] = req.body[field];
    }
  });

  // Handle image update: if new image provided, delete old one and upload new one
  if (req.file) {
    // Delete old image from Cloudinary
    if (note.imgId) {
      await cloudinaryService.deleteImage(note.imgId);
    }

    // Upload new image
    const uploadResult = await cloudinaryService.uploadImage(req.file.path);
    note.imgURL = uploadResult.url;
    note.imgId = uploadResult.publicId;
  }

  await note.save();

  res
    .status(200)
    .json(responseFormatter.success(note, "Note updated successfully"));
});

exports.deleteNote = asyncHandler(async (req, res, next) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return next(new AppError("Note not found", 404));
  }

  // Delete image from Cloudinary
  if (note.imgId) {
    await cloudinaryService.deleteImage(note.imgId);
  }

  // Delete all comments associated with this note
  await Comment.deleteMany({ noteId: note._id });

  // Delete the note
  await Note.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json(responseFormatter.success(null, "Note deleted successfully"));
});
