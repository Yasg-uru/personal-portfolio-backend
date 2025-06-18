import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import ConnectDatabase from "./lib/connectDb";
import { ErrorhandlerMiddleware } from "./util/Errorhandler.util";
import redisCache from "./config/redis-config";

import userRouter from "./route/user.route";
import projectRouter from "./route/project.route";
import NotificationRouter from "./route/notification.route";

import "./jobs/load-data-in-cache";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://personal-porfolio-jdx2ue9gj-yash-choudharys-projects-6acb3c69.vercel.app",
      "https://personal-porfolio-liart-psi.vercel.app"
    ],
    credentials: true,
  },
});


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://personal-porfolio-jdx2ue9gj-yash-choudharys-projects-6acb3c69.vercel.app",
    "https://personal-porfolio-liart-psi.vercel.app"
  ],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.set("io", io);


app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/notification", NotificationRouter);


app.use(ErrorhandlerMiddleware);


(async () => {
  try {
    await redisCache.connect();
    await ConnectDatabase(); // assuming this is also async
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      console.log("Server is running on port:", PORT);
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
})();
