import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const uploadDir = path.join(process.cwd(), "/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});
const upload = multer({ storage });
export const uploadFiles = upload.fields([
  { name: "gallery", maxCount: 10 }, // You can change `maxCount` based on your needs
  { name: "videos", maxCount: 5 },   // Similarly, change maxCount for videos
]);
export default upload;
