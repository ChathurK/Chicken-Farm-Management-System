const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const buyerRoutes = require("./routes/buyers");
const sellerRoutes = require("./routes/sellers");
const orderRoutes = require("./routes/orders");
const transactionRoutes = require("./routes/transactions");
const chickenRoutes = require("./routes/chickens");
const chickRoutes = require("./routes/chicks");
const eggRoutes = require("./routes/eggs");
const employeeRoutes = require("./routes/employees");

// Initialize express app
const app = express();

// Database connection (already handled in config/database.js)
require("./config/database");

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ extended: false })); // Parse application/json

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/chickens", chickenRoutes);
app.use("/api/chicks", chickRoutes);
app.use("/api/eggs", eggRoutes);
app.use("/api/employees", employeeRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ msg: "Welcome to Chicken Farm Management System API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: "Internal Server Error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    },
  });
});

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
