import { NextFunction, Request, Response } from "express";
import { reqwithuser } from "../middleware/auth.middleware";
import { ProjectModel } from "../models/projects.model";
import UploadOnCloudinary from "../util/cloudinary.util";
import Errorhandler from "../util/Errorhandler.util";
import mongoose from "mongoose";
import { io } from "..";
import usermodel from "../models/usermodel";
import redisCache from "../config/redis-config";

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
      await redisCache.set(`project:${newProject._id}`, newProject, 60 * 60 * 24);
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
      if (!userId) {
        return next(new Errorhandler(400, "Please login to continue"));
      }
  
      const { projectId } = req.params;
      const project = await ProjectModel.findById(projectId).populate({
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
      if (!project) return next(new Errorhandler(404, "Project not found"));
  
      const existingLikedUser = project.likes.findIndex(
        (likeUser) => likeUser.userId.toString() === userId.toString()
      );
      console.log('this is current user Id :',userId)
  console.log('this is existing liked user ',existingLikedUser);
  console.log('this is project likes :',project.likes)
      let action = "liked";
  
      if (existingLikedUser !== -1) {
        action = "unliked";
        project.likes.splice(existingLikedUser, 1); // Remove the user's like
      } else {
        project.likes.push({
          userId: userId as mongoose.Types.ObjectId,
          timestamp: new Date(),
        }); // Add the user's like
      }
  
      // Save the updated project document
      await project.save();
      await redisCache.set(`project:${project._id}`, project, 60 * 60 * 24);
      // Emit the updated like count and action to all connected clients
      io.emit("project-like-update", {
        projectId,
        likes: project.likes,
        action,
      });
  
      res.status(200).json({
        message: `Project ${action} successfully`,
      });
    } catch (error) {
      next(error);
    }
  }
  public async addComment(req: reqwithuser, res: Response, next: NextFunction) {
    try {
      const { projectId, comment } = req.body;
      const userId = req.user?._id;
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
        _id: new mongoose.Types.ObjectId(),
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
      ).populate({
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
      });;;
      if (!updatedProject) {
        return next(new Errorhandler(404, "project not found"));
      }
      const commentWithUserDetails = {
        ...newComment,
        userId: {
          name: user.username,
          email: user.email,
          profilePicture: user.profileUrl, // Optional, if you store profile pictures
        },
      };
      io.emit("newComment", {
        projectId,
        comment: commentWithUserDetails,
      });
      await redisCache.set(`project:${updatedProject._id}`, updatedProject, 60 * 60 * 24);
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

      const project = await ProjectModel.findById(projectId).populate({
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
      });;;
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
      await redisCache.set(`project:${project._id}`, project, 60 * 60 * 24);
      io.emit("commentLike-update", {
        projectId,
        commentId,
        userId, // to track the current user who did this

        likes: comment.likes,
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
      const project = await ProjectModel.findById(projectId).populate({
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
      });;;
      if (!project) return next(new Errorhandler(404, "project not found"));
      const comment = project.comments.find(
        (comment) => comment._id.toString() == commentId
      );
      if (!comment) return next(new Errorhandler(404, "comment not found "));
      // if comment is exist then we need to push the reply in the comment
      const new_reply = {
        _id: new mongoose.Types.ObjectId(),
        userId: userId as mongoose.Types.ObjectId,
        comment: replyText,
        timestamp: new Date(),
        likes: [],
      };
      comment.replies.push(new_reply);
      await project.save();
      io.emit("new_reply", {
        commentId,
        projectId,
        reply: {
          ...new_reply,
          userId: {
            username: user.username,
            email: user.email,
            profilePicture: user.profileUrl,
          },
        },
      });
      await redisCache.set(`project:${project._id}`, project, 60 * 60 * 24);
      res.status(200).json({
        message: "reply added to the comment successfully",
        new_reply,
      });
    } catch (error) {
      next(error);
    }
  }
  public async handleCommentDisLikes(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { projectId, commentId } = req.params;
      const userId = req.user?._id;
      const project = await ProjectModel.findById(projectId).populate({
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
      });;;
      if (!project) {
        return next(new Errorhandler(404, "project not found"));
      }
      const comment = project.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return next(new Errorhandler(404, "comment not found"));
      }
      const exisitingDisLikeIndex = comment.dislikes.findIndex(
        (dislike) => dislike.userId.toString() === (userId as string).toString()
      );

      if (exisitingDisLikeIndex == -1) {
        comment.dislikes.push({
          userId: new mongoose.Types.ObjectId(userId as string),
          timestamp: new Date(),
        });
      } else {
        comment.dislikes.splice(exisitingDisLikeIndex, 1);
      }
      await project.save();
      await redisCache.set(`project:${project._id}`, project, 60 * 60 * 24);
      io.emit("dislike-update", {
        userId,
        projectId,
        commentId,
        dislikes: comment.dislikes,
      });
      res.status(200).json({
        message: "project disliked successfully ",
        comment,
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
      const project = await ProjectModel.findById(projectId).populate({
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
      });;;
      if (!project) {
        return next(new Errorhandler(404, "project not found"));
      }

      // Find the comment that contains the reply
      const comment = project.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return next(new Errorhandler(404, "comment not found"));
      }

      // Find the specific reply
      const reply = comment.replies.find(
        (reply) => reply._id.toString() === replyId.toString()
      );

      if (!reply) {
        return next(new Errorhandler(404, "reply not found"));
      }

      let action: string = "liked"; // Assuming the user is liking for the first time

      // Check if the user has already liked this reply
      const existingLikeIndex = reply.likes.findIndex(
        (like) => like.userId.toString() === (userId as string).toString()
      );

      if (existingLikeIndex !== -1) {
        // If the user has already liked the reply, we "unlike" it
        action = "unliked";
        reply.likes.splice(existingLikeIndex, 1); // Remove the user's like from the reply
      } else {
        // If the user hasn't liked it, we add a new like
        reply.likes.push({
          timestamp: new Date(),
          userId: userId as mongoose.Types.ObjectId,
        });
      }

      // Save the project after modifying the reply's like status
      await project.save();
await redisCache.set(`project:${project._id}`, project, 60 * 60 * 24);
      // Emit the like/unlike action event with updated like count
      io.emit("reply-like-update", {
        projectId,
        commentId,
        replyId,
        action,
        userId,
        likes: reply.likes,
      });

      res.status(200).json({
        message: `Reply ${action} successfully`,
      });
    } catch (error) {
      console.log("This is an error:", error);
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
      const project = await ProjectModel.findById(projectId).populate({
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
      });;
      if (!project) {
        return next(new Errorhandler(404, "projecct not found"));
      }
      const comment = project.comments.find(
        (comment) => comment._id.toString() === commentId
      );
      if (!comment) {
        return next(new Errorhandler(404, "comment not found"));
      }
      const previousText = comment.comment;
      comment.comment = newComment;
      comment.edited.isEdited = true;
      comment.edited.editHistory.push({
        comment: previousText,
        editedAt: new Date(),
      });
      await project.save();
      await redisCache.set(`project:${project._id}`, project, 60 * 60 * 24);
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
      const cacheKey = "all-projects";
      const cachedData = await redisCache.get(cacheKey);
      if(cachedData){
        console.log('this is cached projects ', cachedData)
        res.status(200).json({
        message: "project fetched successfully",
        projects:cachedData,
      });
      return ; 
      }
      const projects = await ProjectModel.find({});
      redisCache.set(cacheKey , projects, 86400) // 24 hrs 

      res.status(200).json({
        message: "project fetched successfully",
        projects,
      });
    } catch (error) {
      console.log('this is error ', error )
      next(error);
    }
  }
 public async getProjectDetails(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const cacheKey = `project:${projectId}`;
    const cachedProject = await redisCache.get(cacheKey);

    if (cachedProject) {
      console.log('cached details : ', cachedProject)
      return res.status(200).json({ success: true, data: cachedProject });
    }

    const project = await ProjectModel.findById(projectId)
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

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    
    await redisCache.set(cacheKey, project, 60 * 60 * 24); // 24 hours in seconds

    return res.status(200).json({ success: true, data: project });

  } catch (error) {
    console.error("Error fetching project details:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

}
export default new projectController();
