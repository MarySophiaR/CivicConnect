const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ---------------------------
// Connect Database
// ---------------------------
connectDB();

// ---------------------------
// Middleware
// ---------------------------
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ---------------------------
// Routes
// ---------------------------
app.use("/api/auth", authRoutes);

// ---------------------------
// Home Route
// ---------------------------
app.get("/", (req, res) => {
    res.json({
        message: "Smart Issue Detection Backend Running!"
    });
});

// ---------------------------
// Server
// ---------------------------
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});