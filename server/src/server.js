require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]); // dev-only: local DNS workaround
}

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    if (err.message && err.message.includes("querySrv") && !process.env.RENDER) {
      require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);
      try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
      } catch (retryErr) {
        console.error("DB connection failed:", retryErr.message);
        process.exit(1);
      }
    } else {
      console.error("DB connection failed:", err.message);
      process.exit(1);
    }
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();