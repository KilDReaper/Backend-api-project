import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import adminMiddleware from "../../middlewares/admin.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
import * as adminController from "./admin.controller.js";

const router = Router();

router.post(
  "/users",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  adminController.createUser
);

router.get("/users", authMiddleware, adminMiddleware, adminController.getUsers);
router.get("/users/:id", authMiddleware, adminMiddleware, adminController.getUser);

router.put(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  adminController.updateUser
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteUser
);

export default router;
