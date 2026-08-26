const mongoose = require("mongoose");

let employeeDBConnection = null;


/* =========================================================
   CONNECT TO GOVERNMENT EMPLOYEE DATABASE
========================================================= */

const connectEmployeeDB = async () => {

    try {

        // Prevent creating multiple connections
        if (employeeDBConnection) {

            return employeeDBConnection;

        }


        employeeDBConnection =
            await mongoose.createConnection(
                process.env.EMPLOYEE_MONGO_URI
            ).asPromise();


        console.log(
            "Government Employee Database Connected Successfully!"
        );


        return employeeDBConnection;

    } catch (error) {

        console.error(
            "Government Employee Database Connection Failed"
        );

        console.error(
            error.message
        );

        employeeDBConnection = null;

        throw error;

    }

};


/* =========================================================
   GET EMPLOYEE DATABASE CONNECTION
========================================================= */

const getEmployeeDBConnection = () => {

    if (!employeeDBConnection) {

        throw new Error(
            "Government Employee Database is not connected."
        );

    }


    return employeeDBConnection;

};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {

    connectEmployeeDB,

    getEmployeeDBConnection

};