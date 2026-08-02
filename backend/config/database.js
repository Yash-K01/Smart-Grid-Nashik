const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(
            `✅ MongoDB Connected: ${conn.connection.host}`.green.bold
        );
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB;