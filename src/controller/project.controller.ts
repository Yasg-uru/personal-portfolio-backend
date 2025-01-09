import { NextFunction, Response } from "express";
import { reqwithuser } from "../middleware/auth.middleware";
import { ProjectModel } from "../models/projects.model";
import UploadOnCloudinary from "../util/cloudinary.util";
import Errorhandler from "../util/Errorhandler.util";
import mongoose from "mongoose";
import { io } from "..";

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
        tasks,
        timeline,
        milestones,
        liveDemo,
        repository,
        deploymentDetails,
        gallery, //is comming from the cloudinary
        vedios, //is comming fromt he cloudinary form data ,
        documents,
        challenges,
        learnings,
        accessibilityFeatures,
        pricingModel,
        price,
        currency,
        status,
        visibility,
        isUnderMaintenance,
        maintenanceMessage,
        seo,
      } = req.body;
      // console.log("this is a req.body:", req.body);
      // const galleryUrls: { title: string; url: string }[] = [];
      // const vedioUrls: { title: string; url: string }[] = [];

      // if (req.files && "gallery" in req.files) {
      //   const galleryFiles: Express.Multer.File[] = Array.isArray(
      //     req.files.gallery
      //   )
      //     ? req.files.gallery
      //     : [req.files.gallery];
      //   galleryFiles.forEach(async (file) => {
      //     const cloudinary = await UploadOnCloudinary(file.path);
      //     cloudinary &&
      //       cloudinary.secure_url &&
      //       galleryUrls.push({
      //         title: file.originalname,
      //         url: cloudinary.secure_url,
      //       });
      //   });
      // }
      // if (req.files && "vedios" in req.files) {
      //   const vedioFiles: Express.Multer.File[] = Array.isArray(
      //     req.files.vedios
      //   )
      //     ? req.files.vedios
      //     : [req.files.vedios];
      //   vedioFiles.forEach(async (file) => {
      //     const cloudinary = await UploadOnCloudinary(file.path);
      //     cloudinary &&
      //       cloudinary.secure_url &&
      //       vedioUrls.push({
      //         title: file.originalname,
      //         url: cloudinary.secure_url,
      //       });
      //   });
      // }

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
        tasks,
        timeline,
        milestones,
        liveDemo,
        repository,
        deploymentDetails,
        gallery,
        vedios,
        documents,
        challenges,
        learnings,
        accessibilityFeatures,
        pricingModel,
        price,
        currency,
        status,
        visibility,
        isUnderMaintenance,
        maintenanceMessage,
        seo,
      });
      await newProject.save();
      res.status(200).json({
        message: "project created successfully",
        project: newProject,
      });
    } catch (error) {
      console.log("this is a error :", error);
      next(error);
    }
  }
  public async updateProject(
    req: reqwithuser,
    res: Response,
    next: NextFunction
  ) {
    try {
      const projectId = req.params.id;
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
        tasks,
        timeline,
        milestones,
        liveDemo,
        repository,
        deploymentDetails,
        gallery, // gallery and videos are arrays of file data
        videos,
        documents,
        challenges,
        learnings,
        accessibilityFeatures,
        pricingModel,
        price,
        currency,
        status,
        visibility,
        isUnderMaintenance,
        maintenanceMessage,
        seo,
      } = req.body;

      // Fetch existing project
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Update basic fields if provided
      if (title) project.title = title;
      if (description) project.description = description;
      if (categories) project.categories = categories;
      if (tags) project.tags = tags;
      if (overview) project.overview = overview;
      if (objectives) project.objectives = objectives;
      if (features) project.features = features;
      if (technologies) project.technologies = technologies;
      if (difficultyLevel) project.difficultyLevel = difficultyLevel;
      if (targetAudience) project.targetAudience = targetAudience;
      if (estimatedCompletionTime)
        project.estimatedCompletionTime = estimatedCompletionTime;
      if (liveDemo) project.liveDemo = liveDemo;
      if (repository) project.repository = repository;
      if (deploymentDetails) project.deploymentDetails = deploymentDetails;
      if (challenges) project.challenges = challenges;
      if (learnings) project.learnings = learnings;
      if (accessibilityFeatures)
        project.accessibilityFeatures = accessibilityFeatures;
      if (pricingModel) project.pricingModel = pricingModel;
      if (price) project.price = price;
      if (currency) project.currency = currency;
      if (status) project.status = status;
      if (visibility) project.visibility = visibility;
      if (isUnderMaintenance) project.isUnderMaintenance = isUnderMaintenance;
      if (maintenanceMessage) project.maintenanceMessage = maintenanceMessage;
      if (seo) project.seo = seo;

      // Update teamMembers if provided
      if (teamMembers) project.teamMembers = teamMembers;

      // Update tasks if provided
      if (tasks) project.tasks = tasks;

      // Update timeline if provided
      if (timeline) project.timeline = timeline;

      // Update milestones if provided
      if (milestones) project.milestones = milestones;

      // Handling gallery files (if provided)
      if (gallery) {
        const galleryUrls = [];
        for (const file of gallery) {
          const cloudinaryResponse = await UploadOnCloudinary(file.path);
          if (cloudinaryResponse?.secure_url) {
            galleryUrls.push({
              title: file.originalname,
              url: cloudinaryResponse.secure_url,
            });
          }
        }
        project.gallery = galleryUrls;
      }

      // Handling video files (if provided)
      if (videos) {
        const videoUrls = [];
        for (const file of videos) {
          const cloudinaryResponse = await UploadOnCloudinary(file.path);
          if (cloudinaryResponse?.secure_url) {
            videoUrls.push({
              title: file.originalname,
              url: cloudinaryResponse.secure_url,
            });
          }
        }
        project.videos = videoUrls;
      }

      // Update documents if provided
      if (documents) {
        const documentUrls = documents.map((file: any) => ({
          name: file.originalname,
          url: file.path, // Assuming files are stored locally or uploaded to a cloud service
          uploadedAt: new Date(),
        }));
        project.documents = documentUrls;
      }

      // Update other fields
      project.updatedAt = new Date();

      // Save the updated project to the database
      await project.save();

      return res.status(200).json({
        message: "Project updated successfully",
        project,
      });
    } catch (error) {
      console.error(error);
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
}
export default new projectController();
