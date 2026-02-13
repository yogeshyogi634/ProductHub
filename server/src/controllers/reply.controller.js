import prisma from "../utils/prisma.js";
import { success, error } from "../utils/response.js";
import { hasPermission } from "../utils/roleAssignment.js";

/**
 * POST /api/replies
 * Reply to a feedback message
 * Body: { message, feedbackId }
 * Note: Replies always show the author's name (no anonymous option)
 */
async function createReply(req, res, next) {
  try {
    const { message, feedbackId } = req.body;

    // Check permissions
    if (!hasPermission(req.user.role, "CREATE_REPLY")) {
      return error(
        res,
        "Access denied. Only management can reply to feedback. Contact your administrator for elevated permissions.",
        403
      );
    }

    if (!message || !message.trim()) {
      return error(res, "Message is required.", 400);
    }
    if (!feedbackId) {
      return error(res, "Feedback ID is required.", 400);
    }

    // Verify feedback exists
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        replies: true,
      },
    });
    if (!feedback) {
      return error(res, "Feedback not found.", 404);
    }

    // Check if feedback already has a reply
    if (feedback.replies.length > 0) {
      return error(res, "This feedback already has a reply. Only one reply per feedback is allowed.", 400);
    }

    const reply = await prisma.reply.create({
      data: {
        message: message.trim(),
        feedbackId,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return success(
      res,
      {
        id: reply.id,
        message: reply.message,
        createdAt: reply.createdAt,
        author: {
          name: reply.author.name || reply.author.email.split("@")[0],
        },
        isOwner: true,
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/replies/:id
 * Delete own reply
 */
async function deleteReply(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.reply.findUnique({ where: { id } });
    if (!existing) {
      return error(res, "Reply not found.", 404);
    }
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only delete your own replies.", 403);
    }

    await prisma.reply.delete({ where: { id } });

    return success(res, { message: "Reply deleted." });
  } catch (err) {
    next(err);
  }
}

export { createReply, deleteReply };
