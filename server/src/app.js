const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler, notFound } = require("./middleware/error.middleware");

// Import routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const updateRoutes = require("./routes/update.routes");
const voteRoutes = require("./routes/vote.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const replyRoutes = require("./routes/reply.routes");

const app = express();

// ─── Global Middleware ───
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow cookies
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/updates", updateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/replies", replyRoutes);

// ─── Error Handling ───
app.use(notFound);
app.use(errorHandler);

module.exports = app;
