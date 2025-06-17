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
const node_cron_1 = __importDefault(require("node-cron"));
const projects_model_1 = require("../models/projects.model");
const redis_config_1 = __importDefault(require("../config/redis-config"));
node_cron_1.default.schedule("0 2 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cacheKeyForAllProjects = "all-projects";
        const projects = yield projects_model_1.ProjectModel.find({})
            .populate({
            path: "comments.likes.userId",
            model: "User",
            select: "name email profileUrl",
        })
            .populate({
            path: "comments.userId",
            model: "User",
            select: "name email profileUrl",
        })
            .populate({
            path: "comments.replies.userId",
            model: "User",
            select: "name email profileUrl",
        });
        yield redis_config_1.default.set(cacheKeyForAllProjects, projects, 86400); // 24 hours
        for (const project of projects) {
            const cacheKey = `project:${project._id}`;
            yield redis_config_1.default.set(cacheKey, project, 86400); // 24 hours
        }
        console.log("Projects and details cached at 2 AM");
    }
    catch (error) {
        console.error("Error in cron job caching projects:", error);
    }
}));
