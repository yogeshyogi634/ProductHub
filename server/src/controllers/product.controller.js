const prisma = require("../utils/prisma");
const { success } = require("../utils/response");

/**
 * GET /api/products
 * List all products ordered by their display order
 */
async function getProducts(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        order: true,
        _count: {
          select: {
            updates: true,
            feedbacks: true,
          },
        },
      },
    });

    return success(res, products);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProducts };
