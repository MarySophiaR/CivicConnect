const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        /* =========================================================
           EMPLOYEE ID
        ========================================================= */

        employeeId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },


        /* =========================================================
           NAME
        ========================================================= */

        name: {
            type: String,
            required: true,
            trim: true,
        },


        /* =========================================================
           EMAIL
        ========================================================= */

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },


        /* =========================================================
           ROLE

           systemAdmin = SA
        ========================================================= */

        role: {
            type: String,
            required: true,
            enum: [
                "systemAdmin",
                "juniorEngineer",
                "assistantExecutiveEngineer",
                "executiveEngineer",
                "municipalCommissioner",
            ],
        },


        /* =========================================================
           MUNICIPALITIES

           Supports one or multiple municipalities.

           Examples:
           ["Shimoga"]

           ["Davangere"]

           ["Shimoga", "Davangere"]
        ========================================================= */

        municipalities: {
            type: [String],
            required: true,
            default: [],
            set: (values) =>
                Array.isArray(values)
                    ? [
                        ...new Set(
                            values
                                .map(
                                    (value) =>
                                        String(value).trim()
                                )
                                .filter(Boolean)
                        ),
                    ]
                    : [],
        },


        /* =========================================================
           WARD NUMBERS

           JE / AEE / EE:
           Assigned ward numbers.

           Example:
           [1]

           or:

           [1, 2, 3]

           MC / SA:
           [] means municipality-wide access.
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
   EMPLOYEE DATABASE CONNECTION
========================================================= */

const {
    getEmployeeDBConnection
} = require("../config/employeeDB");


/* =========================================================
   EMPLOYEE MODEL
========================================================= */

const employeeDB =
    getEmployeeDBConnection();


const Employee =
    employeeDB.model(
        "Employee",
        employeeSchema
    );


/* =========================================================
   EXPORT
========================================================= */

module.exports = Employee;