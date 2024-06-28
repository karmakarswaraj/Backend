import express from "express";
import cors from "cors";

import cokiesParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "40mb" }));
app.use(express.urlencoded({ limit: "40mb", extended: true }));
app.use(cokiesParser());
app.use(express.static("public"));

// Routes import
import userRoutes from "./routes/user.routes.js";

app.use("/api/v1/users", userRoutes);

export default app;
