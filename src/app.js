import express from "express";
import path from "path";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { fileURLToPath } from "url";
import adminRoutes from "./modules/admin/admin.routes.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads/users', express.static(path.join(__dirname, 'uploads/users')));

app.use("/api/admin", adminRoutes);

app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
