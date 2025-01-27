import express from "express";
import cors from "cors";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./route/user.route";
import { Server } from "socket.io";
import http from "http";
import { ErrorhandlerMiddleware } from "./util/Errorhandler.util";
import projectRouter from "./route/project.route";
import NotificationRouter from "./route/notification.route";
const app = express();
const httpServer = http.createServer(app);
dotenv.config();

export const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});
app.use(
  cors({
    origin: ["http://localhost:5173"], // The IP address where your Expo app is running
    credentials: true,
  })
);
app.set('io',io);
app.use(cookieParser());
app.use(express.json());

app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use('/notification',NotificationRouter)

app.use(ErrorhandlerMiddleware);

ConnectDatabase();
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log("server is running on port:", PORT);
});
app.use(ErrorhandlerMiddleware);
