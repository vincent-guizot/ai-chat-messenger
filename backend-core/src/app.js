const express = require("express");
const cors = require("cors");
const Environment = require("./config/environment");
const apiRoutes = require("./routes");
const ErrorMiddleware = require("./middlewares/ErrorMiddleware");

/**
 * Aplikasi Express (tanpa listen), supaya bisa dipakai oleh server.js maupun test.
 */
const app = express();

// Di Render/Vercel aplikasi berjalan di belakang reverse proxy; ini membuat
// request.ip dan request.protocol membaca header X-Forwarded-* dengan benar.
app.set("trust proxy", 1);

app.use(cors({ origin: Environment.corsOrigin }));
app.use(express.json());

app.use("/api", apiRoutes);

app.use(ErrorMiddleware.notFound);
app.use(ErrorMiddleware.handle);

module.exports = app;
