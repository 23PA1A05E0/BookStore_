const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    try {
        // Set custom DNS servers to bypass querySrv resolution issues in certain environments
        try {
            dns.setServers(["8.8.8.8", "8.8.4.4"]);
        } catch (dnsErr) {
            console.warn("Warning: Could not set custom DNS servers, trying default resolution...", dnsErr.message);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;