const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");

const {
  connectEmployeeDB
} = require("./config/employeeDB");


/* =========================================================
   ROUTES
========================================================= */

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const municipalCommissionerRoutes = require(
  "./routes/municipalCommissionerRoutes"
);

const juniorEngineerRoutes = require(
  "./routes/juniorEngineerRoutes"
);

const assistantExecutiveEngineerRoutes = require(
  "./routes/assistantExecutiveEngineerRoutes"
);

const executiveEngineerRoutes = require(
  "./routes/executiveEngineerRoutes"
);

const dashboardRoutes = require(
  "./routes/dashboardRoutes"
);

const systemAdminRoutes = require(
  "./routes/systemAdminRoutes"
);

const alertRoutes =
  require("./routes/alertRoutes");


/* =========================================================
   JOBS
========================================================= */

const escalationJob = require("./jobs/escalationJob");


/* =========================================================
   APP
========================================================= */

const app = express();


/* =========================================================
   CORS
========================================================= */

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


/* =========================================================
   OPTIONS / PREFLIGHT
========================================================= */

app.use((req, res, next) => {

  if (req.method === "OPTIONS") {

    res.header(
      "Access-Control-Allow-Origin",
      req.headers.origin ||
        "http://localhost:5173"
    );

    res.header(
      "Access-Control-Allow-Credentials",
      "true"
    );

    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );

    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept,Authorization"
    );

    return res.sendStatus(204);
  }

  next();

});


/* =========================================================
   REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {

  next();

});


/* =========================================================
   CONNECT DATABASES
========================================================= */

const startDatabaseConnections = async () => {

  try {

    /* -----------------------------------------
       MAIN DATABASE
    ----------------------------------------- */

    await connectDB();


    /* -----------------------------------------
       GOVERNMENT EMPLOYEE DATABASE
    ----------------------------------------- */

    await connectEmployeeDB();


    console.log(
      "All databases connected successfully."
    );

  } catch (error) {

    console.error(
      "Database startup failed."
    );

    console.error(
      error.message
    );

    process.exit(1);

  }

};


/* =========================================================
   SECURITY
========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);


/* =========================================================
   COMPRESSION
========================================================= */

app.use(compression());


/* =========================================================
   RATE LIMITER
========================================================= */

const limiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: 1000,

  message: {
    message:
      "Too many requests. Please try again after 15 minutes.",
  },

  standardHeaders: true,

  legacyHeaders: false,

  skip: (req) =>
    req.method === "OPTIONS",

});

app.use(limiter);


/* =========================================================
   BODY PARSERS
========================================================= */

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


/* =========================================================
   STATIC UPLOADS
========================================================= */

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


/* =========================================================
   API ROUTES
========================================================= */


/* ---------------------------------------------------------
   AUTH
--------------------------------------------------------- */

app.use(
  "/api/auth",
  authRoutes
);


/* ---------------------------------------------------------
   COMPLAINTS
--------------------------------------------------------- */

app.use(
  "/api/complaints",
  complaintRoutes
);


/* ---------------------------------------------------------
   SYSTEM ADMIN
--------------------------------------------------------- */

app.use(
  "/api/system-admin",
  systemAdminRoutes
);


/* ---------------------------------------------------------
   JUNIOR ENGINEER
--------------------------------------------------------- */

app.use(
  "/api/junior-engineer",
  juniorEngineerRoutes
);


/* ---------------------------------------------------------
   ASSISTANT EXECUTIVE ENGINEER
--------------------------------------------------------- */

app.use(
  "/api/assistant-executive-engineer",
  assistantExecutiveEngineerRoutes
);


/* ---------------------------------------------------------
   EXECUTIVE ENGINEER
--------------------------------------------------------- */

app.use(
  "/api/executive-engineer",
  executiveEngineerRoutes
);


/* ---------------------------------------------------------
   MUNICIPAL COMMISSIONER
--------------------------------------------------------- */

app.use(
  "/api/municipal-commissioner",
  municipalCommissionerRoutes
);


/* ---------------------------------------------------------
   ALERTS
--------------------------------------------------------- */

app.use(
  "/api/alerts",
  alertRoutes
);


/* ---------------------------------------------------------
   DASHBOARD
--------------------------------------------------------- */

app.use(
  "/api/dashboard",
  dashboardRoutes
);


/* =========================================================
   HOME
========================================================= */

app.get(
  "/",
  (req, res) => {

    res.json({
      message:
        "Smart Issue Detection Backend Running!",
    });

  }
);


/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {

    res.status(404).json({

      message:
        "Route not found",

      method:
        req.method,

      path:
        req.originalUrl,

    });

  }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "Server Error:",
      err
    );

    res.status(
      err.status || 500
    ).json({

      message:
        err.message ||
        "Internal server error",

    });

  }
);


/* =========================================================
   SERVER START
========================================================= */

const PORT =
  process.env.PORT || 5001;


const startServer = async () => {

  await startDatabaseConnections();


  app.listen(PORT, () => {

      console.log(
        `Server running on http://localhost:${PORT}`
      );


      /* -------------------------------------------------------
         START SLA ESCALATION JOB
      ------------------------------------------------------- */

      escalationJob();

    }
  );

};


/* =========================================================
   START APPLICATION
========================================================= */

startServer().catch((error) => {

  console.error(
    "Server startup failed:"
  );

  console.error(
    error.message
  );

  process.exit(1);

});