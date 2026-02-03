import { Router } from "express";
import * as controller from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/profile", authMiddleware, controller.getProfile);
router.put("/profile", authMiddleware, controller.updateProfile);
router.post(
  "/upload-profile-image",
  authMiddleware,
  upload.single("image"),
  controller.uploadProfileImage
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  controller.updateUserById
);

export default router;
