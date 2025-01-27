"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = __importDefault(require("../controller/notification.controller"));
const NotificationRouter = (0, express_1.Router)();
NotificationRouter.post('/send-message', notification_controller_1.default.sendMessage);
exports.default = NotificationRouter;
