import { Router } from "express";
import {
  forgotPassword,
  Login,
  Logout,
  Register,
  Resetpassword,
  verifyUser,
} from "../controller/user.controller";
import upload from "../middleware/multer.middleware";
import { isAuthenticated } from "../middleware/auth.middleware";

const userRouter = Router();
userRouter.post("/register", upload.single("profileUrl"), Register); //marked

userRouter.post("/login", Login); //marked
userRouter.post("/logout", Logout); //marked
userRouter.post("/forgot-password", forgotPassword); //marked
userRouter.put("/reset-password/:token", Resetpassword); //marked
userRouter.get('/verify-user',isAuthenticated,verifyUser)
export default userRouter;
