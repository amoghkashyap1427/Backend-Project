const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const experienceRoutes = require("./routes/experience.routes");
const certificationRoutes = require("./routes/certification.routes");
const skillRoutes = require("./routes/skill.routes");
const openSourceRoutes = require("./routes/openSource.routes");
const publicRoutes = require("./routes/public.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.set("trust proxy", 1);

const clientOrigin = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.replace(/\/+$/, "")
  : process.env.CLIENT_URL;

app.use(helmet());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/open-source", openSourceRoutes);
app.use("/api/public", publicRoutes);

app.use("/api", notFound);
app.use(errorHandler);

module.exports = app;