import prisma from "../utils/prisma.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/feedback?productId=xxx
 * Get all feedback for a product with nested replies
 * Anonymous feedback has author info stripped
 */
async function getFeedback(req, res, next) {
  try {
    const { productId } = req.query;

    if (!productId) {
      return error(res, "Product ID is required.", 400);
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    // Sanitize: strip author from anonymous feedback
    const sanitized = feedbacks.map((fb) => ({
      id: fb.id,
      message: fb.message,
      isAnonymous: fb.isAnonymous,
      createdAt: fb.createdAt,
      // Only expose author if NOT anonymous
      author: fb.isAnonymous
        ? null
        : {
            name: fb.author.name || fb.author.email.split("@")[0],
            avatarUrl: fb.author.avatarUrl,
          },
      // Current user can see if it's their own (for delete)
      isOwner: fb.author.id === req.user.id,
      // Replies always show author name
      replies: fb.replies.map((r) => ({
        id: r.id,
        message: r.message,
        createdAt: r.createdAt,
        author: {
          name: r.author.name || r.author.email.split("@")[0],
        },
        isOwner: r.author.id === req.user.id,
      })),
    }));

    return success(res, sanitized);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/feedback
 * Post feedback for a product
 * Body: { message, productId, isAnonymous? }
 */
async function createFeedback(req, res, next) {
  try {
    const { message, productId, isAnonymous = true } = req.body;

    if (!message || !message.trim()) {
      return error(res, "Message is required.", 400);
    }
    if (!productId) {
      return error(res, "Product ID is required.", 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return error(res, "Product not found.", 404);
    }

    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim(),
        productId,
        isAnonymous,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Return sanitized version
    return success(
      res,
      {
        id: feedback.id,
        message: feedback.message,
        isAnonymous: feedback.isAnonymous,
        createdAt: feedback.createdAt,
        author: feedback.isAnonymous
          ? null
          : { name: feedback.author.name || feedback.author.email.split("@")[0] },
        isOwner: true,
        replies: [],
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/feedback/:id
 * Delete own feedback or admin delete
 */
async function deleteFeedback(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return error(res, "Feedback not found.", 404);
    }
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only delete your own feedback.", 403);
    }

    // Delete replies first, then feedback
    await prisma.reply.deleteMany({ where: { feedbackId: id } });
    await prisma.feedback.delete({ where: { id } });

    return success(res, { message: "Feedback deleted." });
  } catch (err) {
    next(err);
  }
}

export { getFeedback, createFeedback, deleteFeedback };
