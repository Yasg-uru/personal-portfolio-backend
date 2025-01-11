import { NextFunction, Request, Response } from "express";
import catchAsync from "../middleware/catchasync.middleware";
import usermodel, { User } from "../models/usermodel";
import bcrypt from "bcrypt";
import sendVerificationMail, {
  sendResetPasswordMail,
} from "../util/sendmail.util";
import UploadOnCloudinary from "../util/cloudinary.util";
import Errorhandler from "../util/Errorhandler.util";
import sendtoken from "../util/sendtoken";
import { reqwithuser } from "../middleware/auth.middleware";
import { Schema, ObjectId } from "mongoose";

export const Register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    let profileUrl = "";
    if (req.file) {
      const cloudinary = await UploadOnCloudinary(req.file.path);
      if (cloudinary && cloudinary.secure_url) {
        profileUrl = cloudinary.secure_url;
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new usermodel({
      email,
      profileUrl,
      password: hashedPassword,
    });
    await newUser.save();
    const token = newUser.generateToken();
    sendtoken(res, token, 200, newUser);
  } catch (error) {
    next(error);
  }
};

export const Login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      console.log("this is a req.body:", req.body);
      if (!email || !password) {
        return next(new Errorhandler(404, "Please Enter credentials"));
      }
      const user = await usermodel.findOne({ email });
      if (!user) {
        return next(new Errorhandler(404, "Invalid credentials"));
      }

      const isCorrectPassword = await user.comparePassword(password);
      if (!isCorrectPassword) {
        return next(new Errorhandler(404, "Invalid credentials"));
      }
      const token = user.generateToken();
      sendtoken(res, token, 200, user);
    } catch (error: any) {
      console.log("Error Login", error);
      return next(new Errorhandler(500, "Internal server Error "));
    }
  }
);
export const Logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: false,
        sameSite: "none" as const,
        secure: true,
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  }
);
export const forgotPassword = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await usermodel.findOne({ email });
      if (!user) {
        return next(new Errorhandler(404, "User not found"));
      }
      user.ResetToken();
      await user.save();
      const resetUrl = `http://localhost:5173/reset-password/${user.ResetPasswordToken}`;
      const mailresponse = await sendResetPasswordMail(resetUrl, email);
      if (!mailresponse.success) {
        return next(new Errorhandler(403, mailresponse.message));
      }
      res.status(200).json({
        success: true,
        message: "sent forgot password email successfully",
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error forgot password"));
    }
  }
);
export const Resetpassword = catchAsync(
  async (req: reqwithuser, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      //finding the user by this resettoken
      const user = await usermodel.findOne({
        ResetPasswordToken: token,
        ResetPasswordTokenExpire: { $gt: new Date() },
      });
      if (!user) {
        return next(
          new Errorhandler(404, "Resetpassword token has been expired")
        );
      }
      user.password = password;
      user.ResetPasswordToken = undefined;
      user.ResetPasswordTokenExpire = undefined;
      await user.save();
      res.status(200).json({
        success: true,
        message: "your reset password successfully",
      });
    } catch (error) {
      return next(new Errorhandler(500, "Error password Reset"));
    }
  }
);
export const verifyUser = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const user = await usermodel.findById(userId);
    if (!user) {
      return next(
        new Errorhandler(
          404,
          "your token has been expired so please login to continue"
        )
      );
    }
    res.status(200).json({
      message: "user nverifies verified successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
