import nodeCron from "node-cron";
import { ProjectModel } from "../models/projects.model";
import redisCache from "../config/redis-config";

nodeCron.schedule("0 2 * * *", async () => {
  try {
    const cacheKeyForAllProjects = "all-projects";

    const projects = await ProjectModel.find({})
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

    
    await redisCache.set(cacheKeyForAllProjects, projects, 86400); // 24 hours

    
    for (const project of projects) {
      const cacheKey = `project:${project._id}`;
      await redisCache.set(cacheKey, project, 86400); // 24 hours
    }

    console.log("Projects and details cached at 2 AM");
  } catch (error) {
    console.error("Error in cron job caching projects:", error);
  }
});
