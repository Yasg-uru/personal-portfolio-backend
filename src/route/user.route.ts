import { Router } from "express";
import {
  forgotPassword,
  Login,
  Logout,
  Register,
  Resetpassword,
} from "../controller/user.controller";
import upload from "../middleware/multer.middleware";
import { isAuthenticated } from "../middleware/auth.middleware";

const userRouter = Router();
userRouter.post("/register", upload.single("profileUrl"), Register); //marked

userRouter.post("/sign-in", Login); //marked
userRouter.post("/logout", Logout); //marked
userRouter.post("/forgot-password", forgotPassword); //marked
userRouter.put("/reset-password/:token", Resetpassword); //marked

export default userRouter;
