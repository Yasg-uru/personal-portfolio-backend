import { Router } from "express";
import { authorization, isAuthenticated } from "../middleware/auth.middleware";
import projectController from "../controller/project.controller";
import upload, { uploadFiles } from "../middleware/multer.middleware";

const projectRouter = Router();
projectRouter.post(
  "/create",
  isAuthenticated,
  authorization(["admin"]),

  uploadFiles,
  projectController.createProject
);

projectRouter.get("/projects", projectController.getProjects);
projectRouter.get("/:projectId", projectController.getProjectDetails);
projectRouter.post(
  "/like-unlike/:projectId/:commentId",
  isAuthenticated,
  projectController.likeCommentUnlikeComment
);
projectRouter.post(
  "/addcomment",
  isAuthenticated,
  projectController.addComment
);
projectRouter.post(
  "/like-unlike-reply/:projectId/:commentId/:replyId",
  isAuthenticated,
  projectController.addLikeAndUnlikeOnCommentReply
);

projectRouter.post('/edit-comment/:projectId/:commentId/',isAuthenticated,projectController.editComment);

projectRouter.post(
  "/addreply/:projectId/:commentId",
  isAuthenticated,
  projectController.replyComment
);
export default projectRouter;
