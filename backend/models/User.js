const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    /* =========================================================
       BASIC USER INFORMATION
    ========================================================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },


    /* =========================================================
       EMPLOYEE ID
       ========================================================= */

    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },


    /* =========================================================
       USER ROLE
    ========================================================= */

    role: {
      type: String,
      enum: [
        "citizen",
        "systemAdmin",
        "juniorEngineer",
        "assistantExecutiveEngineer",
        "executiveEngineer",
        "municipalCommissioner",
      ],
      default: "citizen",
    },


    /* =========================================================
       MUNICIPALITIES
    ========================================================= */

    municipalities: {
      type: [String],
      default: [],
      set: (values) =>
        Array.isArray(values)
          ? [
              ...new Set(
                values
                  .map((value) => String(value).trim())
                  .filter(Boolean)
              ),
            ]
          : [],
    },


    /* =========================================================
       WARD NUMBERS
    ========================================================= */

    wardNumbers: {
      type: [Number],
      default: [],
    },


    /* =========================================================
       ACCOUNT STATUS
    ========================================================= */

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


/* =========================================================
   INDEX
========================================================= */

userSchema.index(
  { employeeId: 1 },
  {
    unique: true,
    sparse: true,
  }
);


/* =========================================================
   EXPORT USER MODEL
========================================================= */

module.exports =
  mongoose.model(
    "User",
    userSchema
  );