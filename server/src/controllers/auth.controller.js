import prisma from "../utils/prisma.js";
import { signToken } from "../utils/jwt.js";
import { success, error } from "../utils/response.js";
import { validateDomain } from "../middleware/auth.middleware.js";
import { verifyGoogleToken } from "../services/auth.service.js";

/**
 * POST /api/auth/google
 * Login or register via Google OAuth
 * Body: { idToken: "google-id-token" }
 */
async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return error(res, "Google ID token is required.", 400);
    }

    // 1. Verify the Google token
    const googleUser = await verifyGoogleToken(idToken);

    // 2. Check email domain
    if (!validateDomain(googleUser.email)) {
      return error(
        res,
        `Only @${process.env.ALLOWED_DOMAIN} email addresses are allowed.`,
        403
      );
    }

    // 3. Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.avatarUrl,
        },
      });
    } else {
      // Update name/avatar if changed on Google
      user = await prisma.user.update({
        where: { email: googleUser.email },
        data: {
          name: googleUser.name || user.name,
          avatarUrl: googleUser.avatarUrl || user.avatarUrl,
        },
      });
    }

    // 4. Generate JWT
    const token = signToken(user);

    // 5. Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return success(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Get current logged-in user
 */
async function getMe(req, res) {
  return success(res, { user: req.user });
}

/**
 * POST /api/auth/logout
 * Clear auth cookie
 */
async function logout(req, res) {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return success(res, { message: "Logged out successfully." });
}

// ─── DEV ONLY: Login without Google (for testing) ───
async function devLogin(req, res, next) {
  try {
    if (process.env.NODE_ENV === "production") {
      return error(res, "Dev login is not available in production.", 403);
    }

    const { email } = req.body;

    if (!email) {
      return error(res, "Email is required.", 400);
    }

    if (!validateDomain(email)) {
      return error(
        res,
        `Only @${process.env.ALLOWED_DOMAIN} email addresses are allowed.`,
        403
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
        },
      });
    }

    const token = signToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return success(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export { googleLogin, getMe, logout, devLogin };
