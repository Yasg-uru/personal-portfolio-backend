"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.Resetpassword = exports.forgotPassword = exports.Logout = exports.Login = exports.Register = void 0;
const catchasync_middleware_1 = __importDefault(require("../middleware/catchasync.middleware"));
const usermodel_1 = __importDefault(require("../models/usermodel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendmail_util_1 = require("../util/sendmail.util");
const cloudinary_util_1 = __importDefault(require("../util/cloudinary.util"));
const Errorhandler_util_1 = __importDefault(require("../util/Errorhandler.util"));
const sendtoken_1 = __importDefault(require("../util/sendtoken"));
const Register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        let profileUrl = "";
        if (req.file) {
            const cloudinary = yield (0, cloudinary_util_1.default)(req.file.path);
            if (cloudinary && cloudinary.secure_url) {
                profileUrl = cloudinary.secure_url;
            }
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new usermodel_1.default({
            email,
            profileUrl,
            password: hashedPassword,
        });
        yield newUser.save();
        const token = newUser.generateToken();
        (0, sendtoken_1.default)(res, token, 200, newUser);
    }
    catch (error) {
        next(error);
    }
});
exports.Register = Register;
exports.Login = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log("this is a req.body:", req.body);
        if (!email || !password) {
            return next(new Errorhandler_util_1.default(404, "Please Enter credentials"));
        }
        const user = yield usermodel_1.default.findOne({ email });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "Invalid credentials"));
        }
        const isCorrectPassword = yield user.comparePassword(password);
        if (!isCorrectPassword) {
            return next(new Errorhandler_util_1.default(404, "Invalid credentials"));
        }
        const token = user.generateToken();
        (0, sendtoken_1.default)(res, token, 200, user);
    }
    catch (error) {
        console.log("Error Login", error);
        return next(new Errorhandler_util_1.default(500, "Internal server Error "));
    }
}));
exports.Logout = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: false,
        sameSite: "none",
        secure: true,
    })
        .status(200)
        .json({
        success: true,
        message: "Logged out successfully",
    });
}));
exports.forgotPassword = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield usermodel_1.default.findOne({ email });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "User not found"));
        }
        user.ResetToken();
        yield user.save();
        const resetUrl = `http://localhost:5173/reset-password/${user.ResetPasswordToken}`;
        const mailresponse = yield (0, sendmail_util_1.sendResetPasswordMail)(resetUrl, email);
        if (!mailresponse.success) {
            return next(new Errorhandler_util_1.default(403, mailresponse.message));
        }
        res.status(200).json({
            success: true,
            message: "sent forgot password email successfully",
        });
    }
    catch (error) {
        return next(new Errorhandler_util_1.default(500, "Error forgot password"));
    }
}));
exports.Resetpassword = (0, catchasync_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        //finding the user by this resettoken
        const user = yield usermodel_1.default.findOne({
            ResetPasswordToken: token,
            ResetPasswordTokenExpire: { $gt: new Date() },
        });
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "Resetpassword token has been expired"));
        }
        user.password = password;
        user.ResetPasswordToken = undefined;
        user.ResetPasswordTokenExpire = undefined;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "your reset password successfully",
        });
    }
    catch (error) {
        return next(new Errorhandler_util_1.default(500, "Error password Reset"));
    }
}));
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield usermodel_1.default.findById(userId);
        if (!user) {
            return next(new Errorhandler_util_1.default(404, "your token has been expired so please login to continue"));
        }
        res.status(200).json({
            message: "user nverifies verified successfully",
            user,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyUser = verifyUser;
