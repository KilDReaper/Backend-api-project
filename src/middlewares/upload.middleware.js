import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads/users");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
  const ext = path.extname(file.originalname);

  const ownerId =
    req.params.id || req.user?._id || "user";

  cb(null, `${ownerId}-${Date.now()}${ext}`);
},
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Invalid file type"));
};

export default multer({ storage, fileFilter });
