import prisma from "../utils/prisma.js";
import { success, error } from "../utils/response.js";
import { hasPermission } from "../utils/roleAssignment.js";
import { getStatusDisplayName, getAllStatuses } from "../utils/statusMapping.js";

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
        statusHistory: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3 // Include last 3 status changes for list view
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
        statusDisplayName: getStatusDisplayName(update.status),
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
        statusHistory: update.statusHistory.map(entry => ({
          id: entry.id,
          fromStatus: entry.fromStatus,
          toStatus: entry.toStatus,
          fromStatusDisplay: entry.fromStatus ? getStatusDisplayName(entry.fromStatus, true) : null,
          toStatusDisplay: getStatusDisplayName(entry.toStatus, true),
          changedBy: {
            name: entry.user.name || entry.user.email.split('@')[0],
            email: entry.user.email
          },
          reason: entry.reason,
          timestamp: entry.createdAt
        })),
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
      statusDisplayName: getStatusDisplayName(update.status),
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

    // Check permissions
    if (!hasPermission(req.user.role, "CREATE_UPDATE")) {
      return error(
        res, 
        "Access denied. Only management can create product updates. Contact your administrator for elevated permissions.", 
        403
      );
    }

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

    const finalStatus = status || "WIP";
    
    const update = await prisma.update.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: finalStatus,
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

    // Log the initial status in history
    await prisma.updateStatusHistory.create({
      data: {
        updateId: update.id,
        fromStatus: null, // Initial status has no previous status
        toStatus: finalStatus,
        changedBy: req.user.id,
        reason: "Update created"
      }
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
    const { title, description, status, reason } = req.body;

    // Check ownership
    const existing = await prisma.update.findUnique({ where: { id } });
    if (!existing) {
      return error(res, "Update not found.", 404);
    }
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only edit your own updates.", 403);
    }

    // Track status change if status is being updated
    if (status && status !== existing.status) {
      await prisma.updateStatusHistory.create({
        data: {
          updateId: id,
          fromStatus: existing.status,
          toStatus: status,
          changedBy: req.user.id,
          reason: reason || `Status changed from ${existing.status} to ${status}`
        }
      });
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
        statusHistory: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5 // Include last 5 status changes in response
        }
      },
    });

    return success(res, {
      ...updated,
      statusDisplayName: getStatusDisplayName(updated.status),
      isOwner: updated.authorId === req.user.id,
      votes: {
        up: 0,
        down: 0,
        userVote: null
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/updates/:id/status
 * Change update status with reason
 */
async function changeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return error(res, "Status is required.", 400);
    }

    // Check if the update exists and user has permission
    const existing = await prisma.update.findUnique({ 
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!existing) {
      return error(res, "Update not found.", 404);
    }
    
    if (existing.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return error(res, "You can only change status of your own updates.", 403);
    }

    // Don't create history if status isn't actually changing
    if (existing.status === status) {
      return error(res, `Update is already in ${status} status.`, 400);
    }

    // Create status history entry
    await prisma.updateStatusHistory.create({
      data: {
        updateId: id,
        fromStatus: existing.status,
        toStatus: status,
        changedBy: req.user.id,
        reason: reason || `Status changed from ${existing.status} to ${status}`
      }
    });

    // Update the status
    const updated = await prisma.update.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
        statusHistory: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Show more history for status change endpoint
        },
        votes: {
          select: { id: true, type: true, userId: true },
        }
      },
    });

    // Transform vote data
    const upvotes = updated.votes.filter((v) => v.type === "UP").length;
    const downvotes = updated.votes.filter((v) => v.type === "DOWN").length;
    const userVote = updated.votes.find((v) => v.userId === req.user.id);

    return success(res, {
      ...updated,
      statusDisplayName: getStatusDisplayName(updated.status),
      isOwner: updated.authorId === req.user.id,
      votes: {
        up: upvotes,
        down: downvotes,
        userVote: userVote?.type || null
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/updates/:id/history
 * Get complete status history for an update
 */
async function getStatusHistory(req, res, next) {
  try {
    const { id } = req.params;

    // Check if update exists
    const update = await prisma.update.findUnique({ where: { id } });
    if (!update) {
      return error(res, "Update not found.", 404);
    }

    const history = await prisma.updateStatusHistory.findMany({
      where: { updateId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return success(res, {
      updateId: id,
      updateTitle: update.title,
      currentStatus: update.status,
      history: history.map(entry => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        fromStatusDisplay: entry.fromStatus ? getStatusDisplayName(entry.fromStatus, true) : null,
        toStatusDisplay: getStatusDisplayName(entry.toStatus, true),
        changedBy: {
          id: entry.user.id,
          name: entry.user.name || entry.user.email.split('@')[0],
          email: entry.user.email
        },
        reason: entry.reason,
        timestamp: entry.createdAt
      }))
    });
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

/**
 * GET /api/updates/statuses
 * Get all valid statuses with display names
 */
async function getStatuses(req, res, next) {
  try {
    const { friendly } = req.query;
    const statuses = getAllStatuses(friendly === 'true');
    return success(res, statuses);
  } catch (err) {
    next(err);
  }
}

export { getUpdates, getUpdateById, createUpdate, editUpdate, changeStatus, getStatusHistory, deleteUpdate, getStatuses };
