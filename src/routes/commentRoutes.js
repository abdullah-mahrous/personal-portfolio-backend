const express = require("express");
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/notes/{noteId}/comments:
 *   post:
 *     summary: Add a comment to a note (public)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, content]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               content:
 *                 type: string
 *                 example: Great note!
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Note not found
 */
router.post("/:noteId/comments", commentController.addComment);

/**
 * @swagger
 * /api/notes/{noteId}/comments:
 *   get:
 *     summary: Get all comments for a note (public)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 *       404:
 *         description: Note not found
 */
router.get("/:noteId/comments", commentController.getCommentsByNoteId);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment (admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete("/:commentId", authMiddleware, commentController.deleteComment);

module.exports = router;
