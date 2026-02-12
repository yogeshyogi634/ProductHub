import prisma from "../utils/prisma.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/updates?productId=xxx&date=YYYY-MM-DD&status=WIP
 * Get updates for a product, optionally filtered by date and status
 */
async function getUpdates(req, res, next) {
  try {
    const { productId, date, status } = req.query;

    // Build filter
    const where = {};

    if (productId) {
      where.productId = productId;
    }

    if (status) {
      where.status = status;
    }

    // Date filter: returns updates created on that specific day
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const updates = await prisma.update.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
        votes: {
          select: { id: true, type: true, userId: true },
        },
      },
    });

    // Transform: add vote counts + current user's vote
    const transformed = updates.map((update) => {
      const upvotes = update.votes.filter((v) => v.type === "UP").length;
      const downvotes = update.votes.filter((v) => v.type === "DOWN").length;
      const userVote = update.votes.find((v) => v.userId === req.user.id);

      return {
        id: update.id,
        title: update.title,
        description: update.description,
        status: update.status,
        createdAt: update.createdAt,
        updatedAt: update.updatedAt,
        author: update.author,
        product: update.product,
        isOwner: update.authorId === req.user.id,
        votes: {
          up: upvotes,
          down: downvotes,
          userVote: userVote ? userVote.type : null, // "UP", "DOWN", or null
        },
      };
    });

    return success(res, transformed);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/updates/:id
 * Get a single update by ID
 */
async function getUpdateById(req, res, next) {
  try {
    const { id } = req.params;

    const update = await prisma.update.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
        votes: {
          select: { id: true, type: true, userId: true },
        },
      },
    });

    if (!update) {
      return error(res, "Update not found.", 404);
    }

    const upvotes = update.votes.filter((v) => v.type === "UP").length;
    const downvotes = update.votes.filter((v) => v.type === "DOWN").length;
    const userVote = update.votes.find((v) => v.userId === req.user.id);

    return success(res, {
      ...update,
      isOwner: update.authorId === req.user.id,
      votes: {
        up: upvotes,
        down: downvotes,
        userVote: userVote ? userVote.type : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/updates
 * Create a new product update
 */
async function createUpdate(req, res, next) {
  try {
    const { title, description, status, productId } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return error(res, "Title is required.", 400);
    }
    if (!description || !description.trim()) {
      return error(res, "Description is required.", 400);
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

    const update = await prisma.update.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: status || "WIP",
        productId,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return success(
      res,
      {
        ...update,
        isOwner: true,
        votes: { up: 0, down: 0, userVote: null },
      },
      201,
    );
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/updates/:id
 * Edit an update (author or admin only)
 */
async function editUpdate(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Check ownership
    const existing = await prisma.update.findUnique({ where: { id } });
    if (!existing) {
      return error(res, "Update not found.", 404);
    }
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only edit your own updates.", 403);
    }

    const updated = await prisma.update.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(status && { status }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return success(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/updates/:id
 * Delete an update (author or admin only)
 */
async function deleteUpdate(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.update.findUnique({ where: { id } });
    if (!existing) {
      return error(res, "Update not found.", 404);
    }
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only delete your own updates.", 403);
    }

    // Delete related votes first, then the update
    await prisma.vote.deleteMany({ where: { updateId: id } });
    await prisma.update.delete({ where: { id } });

    return success(res, { message: "Update deleted successfully." });
  } catch (err) {
    next(err);
  }
}

export { getUpdates, getUpdateById, createUpdate, editUpdate, deleteUpdate };
