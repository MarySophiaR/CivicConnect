require("dotenv").config();

const readline = require("readline");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

const main = async () => {
    try {

        console.log("\n======================================");
        console.log(" Smart Civic Issue Detection System");
        console.log(" First Time Setup");
        console.log("======================================\n");

        // Connect Database
        await connectDB();

        console.log("Connected to MongoDB.\n");

        // Check if System Administrator already exists
        const existingAdmin = await User.findOne({
            role: "systemAdmin"
        });

        if (existingAdmin) {
            console.log("❌ System Administrator already exists.");
            rl.close();
            process.exit(0);
        }

        // Ask Details
        const name = await askQuestion("Enter System Administrator Name: ");
        const email = await askQuestion("Enter Email: ");
        const password = await askQuestion("Enter Password: ");

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create System Administrator
        const systemAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: "systemAdmin"
        });

        // Save to Database
        await systemAdmin.save();

        console.log("\n======================================");
        console.log("✅ System Administrator created successfully!");
        console.log("======================================\n");

        console.log("Login Details");
        console.log("---------------------------");
        console.log(`Name  : ${name}`);
        console.log(`Email : ${email}`);
        console.log("Role  : systemAdmin");

        rl.close();
        process.exit(0);

    } catch (error) {

        console.error("\n❌ Error creating System Administrator:");
        console.error(error);

        rl.close();
        process.exit(1);

    }
};

main();