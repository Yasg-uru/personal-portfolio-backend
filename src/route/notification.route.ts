import { Router } from "express";
import notificationController from "../controller/notification.controller";

const NotificationRouter =Router();
NotificationRouter.post('/send-message',notificationController.sendMessage);

export default NotificationRouter;
