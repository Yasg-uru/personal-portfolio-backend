"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFiles = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, callback) => {
        const uploadDir = path_1.default.join(process.cwd(), "/uploads");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir);
        }
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage });
exports.uploadFiles = upload.fields([
    { name: "gallery", maxCount: 10 }, // You can change `maxCount` based on your needs
    { name: "videos", maxCount: 5 }, // Similarly, change maxCount for videos
]);
exports.default = upload;
