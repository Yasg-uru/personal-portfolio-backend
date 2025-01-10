import mongoose, { Schema, Document } from "mongoose";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  linkedIn: string;
  github: string;
}

interface Timeline {
  phase: string;
  startDate: Date;
  endDate: Date;
  description: string;
  status: string;
}

interface Milestone {
  title: string;
  description: string;
  dueDate: Date;
  isAchieved: boolean;
}

interface DocumentFile {
  name: string;
  url: string;
  uploadedAt: Date;
}

interface Like {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
}

interface Reply {
  userId: mongoose.Types.ObjectId;
  comment: string;
  timestamp: Date;
  likes: Like[];
  _id: mongoose.Types.ObjectId;
}

interface EditHistory {
  comment: string;
  editedAt: Date;
}

export interface Comment {
  _id: string;

  userId: mongoose.Types.ObjectId;
  comment: string;
  timestamp: Date;
  likes: Like[];
  dislikes: Like[];
  replies: Reply[];
  edited: {
    isEdited: boolean;
    editHistory: EditHistory[];
  };
}

export interface ProjectDocument extends Document {
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  overview: string;
  objectives: string;
  features: string[];
  technologies: string[];
  difficultyLevel: string;
  targetAudience: string[];
  estimatedCompletionTime: string;
  teamMembers: TeamMember[];

  liveDemo: string;
  repository: string;
  deploymentPlatform: string;

  gallery: { title: string; url: string }[];
  videos: { title: string; url: string }[];
  documents: DocumentFile[];
  likes: Like[];
  comments: Comment[];

  challenges: string[];
  learnings: string[];
  accessibilityFeatures: string[];

  isUnderMaintenance: boolean;
  maintenanceMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<TeamMember>({
  name: { type: String },
  role: { type: String },
  email: { type: String },
  linkedIn: { type: String },
  github: { type: String },
});

const DocumentFileSchema = new Schema<DocumentFile>({
  name: { type: String },
  url: { type: String },
  uploadedAt: { type: Date },
});

const LikeSchema = new Schema<Like>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date },
});

const CommentSchema = new Schema<Comment>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  comment: { type: String },
  timestamp: { type: Date },
  likes: { type: [LikeSchema], default: [] },
  dislikes: { type: [LikeSchema], default: [] }, // Track dislikes
  replies: {
    type: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        timestamp: { type: Date },
        likes: { type: [LikeSchema], default: [] },
      },
    ],
    default: [],
  },
  edited: {
    isEdited: { type: Boolean, default: false },
    editHistory: [
      {
        comment: { type: String },
        editedAt: { type: Date },
      },
    ],
  },
});

const ProjectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String },
    description: { type: String },
    categories: { type: [String] },
    tags: { type: [String] },
    overview: { type: String },
    objectives: { type: String },
    features: { type: [String] },
    technologies: { type: [String] },
    difficultyLevel: { type: String },
    targetAudience: { type: [String] },
    estimatedCompletionTime: { type: String },
    teamMembers: { type: [TeamMemberSchema] },

    liveDemo: { type: String },
    repository: { type: String },
    deploymentPlatform: { type: String },

    gallery: [
      {
        title: {
          type: String,
          // ,
        },
        url: {
          type: String,
          // ,
        },
      },
    ],
    videos: [
      {
        title: {
          type: String,
          // ,
        },
        url: {
          type: String,
          // ,
        },
      },
    ],
    documents: { type: [DocumentFileSchema],default :[] },
    likes: { type: [LikeSchema] },
    comments: { type: [CommentSchema] },

    challenges: { type: [String] },
    learnings: { type: [String] },
    accessibilityFeatures: { type: [String] },

    isUnderMaintenance: { type: Boolean },
    maintenanceMessage: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.model<ProjectDocument>(
  "Project",
  ProjectSchema
);
