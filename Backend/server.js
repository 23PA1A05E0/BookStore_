const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const testRoutes = require("./routes/testRoutes");
const bookRoutes = require("./routes/bookRoutes");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/test", testRoutes);
app.use("/api/books", bookRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to BookStore API"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});