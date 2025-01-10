import { NextFunction, Request, Response } from "express";
import { reqwithuser } from "../middleware/auth.middleware";
import { ProjectModel } from "../models/projects.model";
import UploadOnCloudinary from "../util/cloudinary.util";
import Errorhandler from "../util/Errorhandler.util";
import mongoose from "mongoose";
import { io } from "..";
import usermodel from "../models/usermodel";

class projectController {
  public async createProject(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        title,
        description,
        categories,
        tags,
        overview,
        objectives,
        features,
        technologies,
        difficultyLevel,
        targetAudience,
        estimatedCompletionTime,
        teamMembers,

        liveDemo,
        repository,
        deploymentPlatform,
        documents,
        challenges,
        learnings,
        accessibilityFeatures,
        isUnderMaintenance,
        maintenanceMessage,
      } = req.body;

      const galleryUrls: { title: string; url: string }[] = [];
      const videoUrls: { title: string; url: string }[] = [];

      // Handle gallery files upload
      if (req.files && "gallery" in req.files) {
        const galleryFiles: Express.Multer.File[] = Array.isArray(
          req.files.gallery
        )
          ? req.files.gallery
          : [req.files.gallery];
        for (const file of galleryFiles) {
          const cloudinary = await UploadOnCloudinary(file.path);
          if (cloudinary && cloudinary.secure_url) {
            galleryUrls.push({
              title: file.originalname,
              url: cloudinary.secure_url,
            });
          }
        }
      }

      // Handle video files upload
      if (req.files && "videos" in req.files) {
        const videoFiles: Express.Multer.File[] = Array.isArray(
          req.files.videos
        )
          ? req.files.videos
          : [req.files.videos];
        for (const file of videoFiles) {
          const cloudinary = await UploadOnCloudinary(file.path);
          if (cloudinary && cloudinary.secure_url) {
            videoUrls.push({
              title: file.originalname,
              url: cloudinary.secure_url,
            });
          }
        }
      }

      // Create new project based on the schema
      const newProject = new ProjectModel({
        title,
        description,
        categories,
        tags,
        overview,
        objectives,
        features,
        technologies,
        difficultyLevel,
        targetAudience,
        estimatedCompletionTime,
        teamMembers,

        liveDemo,
        repository,
        deploymentPlatform,
        gallery: galleryUrls,
        videos: videoUrls,
        documents,
        challenges,
        learnings,
        accessibilityFeatures,
        isUnderMaintenance,
        maintenanceMessage,
      });

      // Save the new project to the database
      await newProject.save();

      // Respond with the success message and the created project
      res.status(200).json({
        message: "Project created successfully",
        project: newProject,
      });
    } catch (error) {
      console.log("Error:", error);
      next(error);
    }
  }

  public async addLikeUnlikePost(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      if (!userId)
        return next(new Errorhandler(400, "please login to continue"));
      const { projectId } = req.params;
      const project = await ProjectModel.findById(projectId);
      if (!project) return next(new Errorhandler(404, "project not found"));
      const existingLikedUser = project.likes.findIndex(
        (likeUser) => likeUser.userId.toString() === userId
      );
      let action = "liked";

      if (existingLikedUser !== -1) {
        action = "unliked";
        project.likes.splice(existingLikedUser, 1);
      } else {
        project.likes.push({
          userId: userId as mongoose.Types.ObjectId,
          timestamp: new Date(),
        });
      }
      io.emit("project-like-update", {
        projectId,
        likes: project.likes.length,
        action,
      });
      res.status(200).json({
        message: `project ${action} successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
  public async addComment(req: reqwithuser, res: Response, next: NextFunction) {
    try {
      const { projectId,  comment } = req.body;
const userId=req.user?._id;
      if (!comment || typeof comment !== "string") {
        return res
          .status(400)
          .json({ error: "Comment is required and must be a string." });
      }

      const user = await usermodel.findById(
        userId,
        "username email profileUrl"
      );
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      const newComment = {
        userId: new mongoose.Types.ObjectId(userId as string),
        comment,
        timestamp: new Date(),
        likes: [],
        dislikes: [],
        replies: [],
        edited: {
          isEdited: false,
          editHistory: [],
        },
      };
      const updatedProject = await ProjectModel.findByIdAndUpdate(
        projectId,
        { $push: { comments: newComment } },
        { new: true }
      );
      if (!updatedProject) {
        return next(new Errorhandler(404, "project not found"));
      }
      const commentWithUserDetails = {
        ...newComment,
        user: {
          name: user.username,
          email: user.email,
          profilePicture: user.profileUrl, // Optional, if you store profile pictures
        },
      };
      io.emit("newComment", {
        projectId,
        comment: commentWithUserDetails,
      });
      res.status(201).json({
        message: "Comment added successfully.",
        comment: commentWithUserDetails,
      });
    } catch (error) {
      next(error);
    }
  }
  public async likeCommentUnlikeComment(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { projectId, commentId } = req.params;
      let action = "liked";

      if (!userId) {
        return next(new Errorhandler(400, "User not authenticated"));
      }

      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return next(new Errorhandler(404, "Project not found"));
      }

      const comment = project.comments.find(
        (comment) => comment._id.toString() === commentId
      );

      if (!comment) {
        return next(new Errorhandler(404, "Comment not found"));
      }

      const existingLikeIndex = comment.likes.findIndex(
        (like) => like.userId.toString() === userId.toString()
      );

      if (existingLikeIndex !== -1) {
        comment.likes.splice(existingLikeIndex, 1);
        action = "unliked";
      } else {
        comment.likes.push({
          userId: new mongoose.Types.ObjectId(userId.toString()),
          timestamp: new Date(),
        });
      }

      await project.save();

      io.emit("commentLike-update", {
        projectId,
        commentId,
        // updatedComment: comment,
        likes: comment.likes.length,
        action,
      });

      res.status(200).json({
        message: `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } successfully.`,
        comment,
      });
    } catch (error) {
      console.error("Error in liking/unliking comment:", error);
      next(error);
    }
  }
  public async replyComment(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { projectId, commentId } = req.params;
      const { replyText } = req.body;
      const userId = req.user?._id;
      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(400, "please login to continue"));
      }
      const project = await ProjectModel.findById(projectId);
      if (!project) return next(new Errorhandler(404, "project not found"));
      const comment = project.comments.find(
        (comment) => comment._id.toString() == commentId
      );
      if (!comment) return next(new Errorhandler(404, "comment not found "));
      // if comment is exist then we need to push the reply in the comment
      const new_reply = {
        userId: userId as mongoose.Types.ObjectId,
        comment: replyText,
        timestamp: new Date(),
        likes: [],
      };
      comment.replies.push();
      await project.save();
      io.emit("new_reply", {
        commentId,
        projectId,
        reply: {
          ...new_reply,
          user: {
            username: user.username,
            email: user.email,
            profilePicture: user.profileUrl,
          },
        },
      });
      res.status(200).json({
        message: "reply added to the comment successfully",
        new_reply,
      });
    } catch (error) {
      next(error);
    }
  }
  public async addLikeAndUnlikeOnCommentReply(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "user not found"));
      }
      const { projectId, commentId, replyId } = req.params;
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return next(new Errorhandler(404, "project not found"));
      }
      const comment = project.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return next(new Errorhandler(404, "comment not found"));
      }
      let action: string = "liked"; //assuming the user is likes first time
      const existingLikeIndex = comment.replies.findIndex(
        (reply) => reply._id.toString() === replyId
      );
      //the like of the user is already exists then we need to unlike it
      if (existingLikeIndex !== -1) {
        action = "unliked";
        //removing the existing like from the replies
        comment.replies.splice(existingLikeIndex, 1);
      } else {
        comment.replies[existingLikeIndex].likes.push({
          timestamp: new Date(),
          userId: userId as mongoose.Types.ObjectId,
        });
      }
      await project.save();
      //after saving triggering the event
      io.emit("reply_like-update", {
        projectId,
        commentId,
        replyId,
        action,
        likes: comment.replies[existingLikeIndex].likes.length,
      });
      res.status(200).json({
        message: `reply ${action} successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
  public async editComment(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?._id;
      const { projectId, commentId } = req.params;
      const { newComment } = req.body;

      const user = await usermodel.findById(userId);
      if (!user) {
        return next(new Errorhandler(404, "user not found"));
      }
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return next(new Errorhandler(404, "projecct not found"));
      }
      const comment = project.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return next(new Errorhandler(404, "comment not found"));
      }
      comment.edited.isEdited = true;
      comment.edited.editHistory.push({
        comment: comment.comment,
        editedAt: new Date(),
      });
      comment.comment = newComment;
      await project.save();
      res.status(200).json({
        message: "comment edited successfully",
        project,
      });
    } catch (error) {
      next(error);
    }
  }
  public async getProjects(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projects = await ProjectModel.find({});
      res.status(200).json({
        message: "project fetched successfully",
        projects,
      });
    } catch (error) {
      next(error);
    }
  }
  public async getProjectDetails(req: Request, res: Response) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }

      const project = await ProjectModel.findById(projectId)

        .populate({
          path: "likes.userId",
          model: "User",
          select: "name email avatar", // Customize fields
        })
        .populate({
          path: "comments.userId",
          model: "User",
          select: "name email avatar",
        })
        .populate({
          path: "comments.replies.userId",
          model: "User",
          select: "name email avatar",
        });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      console.error("Error fetching project details:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
}
export default new projectController();
