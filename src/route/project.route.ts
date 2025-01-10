import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import projectController from "../controller/project.controller";
import upload, { uploadFiles } from "../middleware/multer.middleware";

const projectRouter = Router();
projectRouter.post(
  "/create",
  isAuthenticated,
  authorization(['admin']),

  uploadFiles,
  projectController.createProject
);

projectRouter.get('/projects',projectController.getProjects);
projectRouter.post('/addcomment',isAuthenticated,projectController.addComment);

export default projectRouter;
