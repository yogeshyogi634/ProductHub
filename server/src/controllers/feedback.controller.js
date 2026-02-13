import prisma from "../utils/prisma.js";
import { success, error } from "../utils/response.js";
import { buildDateFilter, validateDateQuery, getMonthBoundaries, formatDateString, getMonthDates } from "../utils/dateUtils.js";

/**
 * GET /api/feedback?productId=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&date=YYYY-MM-DD
 * Get all feedback for a product with nested replies
 * Supports date filtering with startDate/endDate or single date
 */
async function getFeedback(req, res, next) {
  try {
    const { productId, startDate, endDate, date } = req.query;

    if (!productId) {
      return error(res, "Product ID is required.", 400);
    }

    // Validate date parameters
    const dateValidation = validateDateQuery({ startDate, endDate, date });
    if (!dateValidation.isValid) {
      return error(res, dateValidation.errors.join(', '), 400);
    }

    // Build query filters
    const whereClause = { productId };
    
    // Add date filter if provided
    const dateFilter = buildDateFilter(startDate, endDate, date);
    if (dateFilter) {
      Object.assign(whereClause, dateFilter);
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
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

    // Process feedback data with 60-second delete window
    const now = new Date();
    const sanitized = feedbacks.map((fb) => {
      const feedbackAge = now - new Date(fb.createdAt);
      const canDelete = fb.author.id === req.user.id && feedbackAge <= 60000; // 60 seconds
      
      return {
        id: fb.id,
        message: fb.message,
        createdAt: fb.createdAt,
        author: {
          name: fb.author.name || fb.author.email.split("@")[0],
          email: fb.author.email,
        },
        isOwner: fb.author.id === req.user.id,
        canDelete: canDelete,
        replies: fb.replies.map((r) => ({
          id: r.id,
          message: r.message,
          createdAt: r.createdAt,
          author: {
            name: r.author.name || r.author.email.split("@")[0],
          },
          isOwner: r.author.id === req.user.id,
        })),
      };
    });

    return success(res, sanitized);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/feedback
 * Post feedback for a product
 * Body: { message, productId }
 */
async function createFeedback(req, res, next) {
  try {
    const { message, productId } = req.body;

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
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Return with 60-second delete window
    return success(
      res,
      {
        id: feedback.id,
        message: feedback.message,
        createdAt: feedback.createdAt,
        author: { 
          name: feedback.author.name || feedback.author.email.split("@")[0],
          email: feedback.author.email
        },
        isOwner: true,
        canDelete: true, // Just created, so can delete for 60 seconds
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
 * Delete own feedback within 60 seconds or admin delete
 */
async function deleteFeedback(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) {
      return error(res, "Feedback not found.", 404);
    }

    // Check if user owns the feedback
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only delete your own feedback.", 403);
    }

    // Check 60-second window for non-admin users
    if (req.user.role !== "ADMIN" && existing.authorId === req.user.id) {
      const now = new Date();
      const feedbackAge = now - new Date(existing.createdAt);
      
      if (feedbackAge > 60000) { // 60 seconds
        return error(res, "Feedback can only be deleted within 60 seconds of posting.", 403);
      }
    }

    // Delete replies first, then feedback
    await prisma.reply.deleteMany({ where: { feedbackId: id } });
    await prisma.feedback.delete({ where: { id } });

    return success(res, { message: "Feedback deleted." });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/feedback/me
 * Get current user's display information for feedback posting
 */
async function getCurrentUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return error(res, "User not found.", 404);
    }

    return success(res, {
      id: user.id,
      name: user.name || user.email.split("@")[0],
      email: user.email
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/feedback/calendar?productId=xxx&month=YYYY-MM
 * Get feedback activity count per day for calendar view
 */
async function getFeedbackCalendar(req, res, next) {
  try {
    const { productId, month } = req.query;

    if (!productId) {
      return error(res, "Product ID is required.", 400);
    }

    if (!month) {
      return error(res, "Month parameter is required (YYYY-MM format).", 400);
    }

    // Validate month format
    const monthValidation = validateDateQuery({ month });
    if (!monthValidation.isValid) {
      return error(res, monthValidation.errors.join(', '), 400);
    }

    const boundaries = getMonthBoundaries(month);
    if (!boundaries) {
      return error(res, "Invalid month format. Use YYYY-MM.", 400);
    }

    // Get all feedback for the month
    const feedbacks = await prisma.feedback.findMany({
      where: {
        productId,
        createdAt: {
          gte: boundaries.startOfMonth,
          lte: boundaries.endOfMonth
        }
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    // Group feedback by date
    const dailyCounts = {};
    const monthDates = getMonthDates(month);
    
    // Initialize all dates with 0
    monthDates.forEach(date => {
      dailyCounts[date] = 0;
    });

    // Count feedback per day
    feedbacks.forEach(feedback => {
      const dateString = formatDateString(feedback.createdAt);
      if (dailyCounts.hasOwnProperty(dateString)) {
        dailyCounts[dateString]++;
      }
    });

    return success(res, {
      month,
      totalFeedback: feedbacks.length,
      dailyCounts
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/feedback/date-range?productId=xxx&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get detailed feedback for specific date range
 */
async function getFeedbackDateRange(req, res, next) {
  try {
    const { productId, startDate, endDate } = req.query;

    if (!productId) {
      return error(res, "Product ID is required.", 400);
    }

    if (!startDate || !endDate) {
      return error(res, "Both startDate and endDate are required.", 400);
    }

    // Validate date parameters
    const dateValidation = validateDateQuery({ startDate, endDate });
    if (!dateValidation.isValid) {
      return error(res, dateValidation.errors.join(', '), 400);
    }

    const dateFilter = buildDateFilter(startDate, endDate);
    if (!dateFilter) {
      return error(res, "Invalid date range.", 400);
    }

    const feedbacks = await prisma.feedback.findMany({
      where: {
        productId,
        ...dateFilter
      },
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

    // Process the data (same as getFeedback)
    const now = new Date();
    const sanitized = feedbacks.map((fb) => {
      const feedbackAge = now - new Date(fb.createdAt);
      const canDelete = fb.author.id === req.user.id && feedbackAge <= 60000; // 60 seconds
      
      return {
        id: fb.id,
        message: fb.message,
        createdAt: fb.createdAt,
        author: {
          name: fb.author.name || fb.author.email.split("@")[0],
          email: fb.author.email,
        },
        isOwner: fb.author.id === req.user.id,
        canDelete: canDelete,
        replies: fb.replies.map((r) => ({
          id: r.id,
          message: r.message,
          createdAt: r.createdAt,
          author: {
            name: r.author.name || r.author.email.split("@")[0],
          },
          isOwner: r.author.id === req.user.id,
        })),
      };
    });

    // Group by date for better frontend handling
    const groupedByDate = {};
    sanitized.forEach(feedback => {
      const dateString = formatDateString(feedback.createdAt);
      if (!groupedByDate[dateString]) {
        groupedByDate[dateString] = [];
      }
      groupedByDate[dateString].push(feedback);
    });

    return success(res, {
      startDate,
      endDate,
      totalFeedback: sanitized.length,
      feedback: sanitized,
      groupedByDate
    });
  } catch (err) {
    next(err);
  }
}

export { getFeedback, createFeedback, deleteFeedback, getCurrentUser, getFeedbackCalendar, getFeedbackDateRange };
