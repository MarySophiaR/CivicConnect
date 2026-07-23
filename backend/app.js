const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const municipalCommissionerRoutes = require("./routes/municipalCommissionerRoutes");
const juniorEngineerRoutes = require("./routes/juniorEngineerRoutes");
const assistantExecutiveEngineerRoutes = require("./routes/assistantExecutiveEngineerRoutes");
const executiveEngineerRoutes = require("./routes/executiveEngineerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const systemAdminRoutes = require("./routes/systemAdminRoutes");

const escalationJob = require("./jobs/escalationJob");

const app = express();

// ---------------------------
// Rate Limiter
// ---------------------------
const limiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 100,

    message: {
        message: "Too many requests. Please try again after 15 minutes."
    },

    standardHeaders: true,

    legacyHeaders: false

});

// ---------------------------
// Connect Database
// ---------------------------
connectDB();

// ---------------------------
// Middleware
// ---------------------------

app.use(helmet());

app.use(compression());

app.use(limiter);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ---------------------------
// Serve Uploaded Images
// ---------------------------
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// ---------------------------
// Routes
// ---------------------------
app.use("/api/auth", authRoutes);

app.use("/api/complaints", complaintRoutes);

app.use("/api/system-admin", systemAdminRoutes);

app.use("/api/junior-engineer", juniorEngineerRoutes);

app.use(
    "/api/assistant-executive-engineer",
    assistantExecutiveEngineerRoutes
);

app.use(
    "/api/executive-engineer",
    executiveEngineerRoutes
);

app.use("/api/municipal-commissioner", municipalCommissionerRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/system-admin", systemAdminRoutes);


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

    // Start SLA Escalation Cron Job
    escalationJob();

});