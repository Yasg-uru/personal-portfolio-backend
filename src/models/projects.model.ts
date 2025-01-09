import mongoose, { Schema, Document } from "mongoose";

interface TeamMember {
  name: string;
  role: string;
  email: string;
  linkedIn: string;
  github: string;
}

interface Task {
  title: string;
  description: string;
  assignee: mongoose.Types.ObjectId;
  status: string;
  priority: string;
  dueDate: Date;
  completedAt: Date | null;
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

interface DeploymentDetails {
  lastDeployed: Date;
  status: string;
  logs: string[];
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
  _id:string ;
  
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
  pinned: boolean;
  mentions: mongoose.Types.ObjectId[];
}

interface Changelog {
  version: string;
  description: string;
  releaseDate: Date;
}

interface Analytics {
  views: number;
  likes: number;
  downloads: number;
  userInteractions: {
    userId: mongoose.Types.ObjectId;
    action: string;
    timestamp: Date;
  }[];
}

interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
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
  tasks: Task[];
  timeline: Timeline[];
  milestones: Milestone[];
  liveDemo: string;
  repository: string;
  deploymentPlatform: string;
  deploymentDetails: DeploymentDetails;
  gallery: { title: string; url: string }[];
  videos: { title: string; url: string }[];
  documents: DocumentFile[];
  likes: Like[];
  comments: Comment[];
  documentation: string;
  apiDocs: string;
  changelog: Changelog[];
  analytics: Analytics;
  challenges: string[];
  learnings: string[];
  accessibilityFeatures: string[];
  pricingModel: string;
  price: number;
  currency: string;
  status: string;
  visibility: string;
  seo: SEO;
  isUnderMaintenance: boolean;
  maintenanceMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<TeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  linkedIn: { type: String, required: true },
  github: { type: String, required: true },
});

const TaskSchema = new Schema<Task>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, required: true },
  priority: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completedAt: { type: Date, default: null },
});

const TimelineSchema = new Schema<Timeline>({
  phase: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
});

const MilestoneSchema = new Schema<Milestone>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  isAchieved: { type: Boolean, required: true },
});

const DeploymentDetailsSchema = new Schema<DeploymentDetails>({
  lastDeployed: { type: Date, required: true },
  status: { type: String, required: true },
  logs: { type: [String], required: true },
});

const DocumentFileSchema = new Schema<DocumentFile>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, required: true },
});

const LikeSchema = new Schema<Like>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, required: true },
});

const CommentSchema = new Schema<Comment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true },
  timestamp: { type: Date, required: true },
  likes: { type: [LikeSchema], default: [] },
  dislikes: { type: [LikeSchema], default: [] }, // Track dislikes
  replies: {
    type: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true },
        timestamp: { type: Date, required: true },
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
  pinned: { type: Boolean, default: false }, // Highlight key comments
  mentions: { type: [Schema.Types.ObjectId], ref: "User", default: [] }, // Mentioned users
});

const ChangelogSchema = new Schema<Changelog>({
  version: { type: String, required: true },
  description: { type: String, required: true },
  releaseDate: { type: Date, required: true },
});

const AnalyticsSchema = new Schema<Analytics>({
  views: { type: Number, required: true },
  likes: { type: Number, required: true },
  downloads: { type: Number, required: true },
  userInteractions: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      action: { type: String, required: true },
      timestamp: { type: Date, required: true },
    },
  ],
});

const SEOSchema = new Schema<SEO>({
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  keywords: { type: [String], required: true },
});

const ProjectSchema = new Schema<ProjectDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true },
    tags: { type: [String], required: true },
    overview: { type: String, required: true },
    objectives: { type: String, required: true },
    features: { type: [String], required: true },
    technologies: { type: [String], required: true },
    difficultyLevel: { type: String, required: true },
    targetAudience: { type: [String], required: true },
    estimatedCompletionTime: { type: String, required: true },
    teamMembers: { type: [TeamMemberSchema], required: true },
    tasks: { type: [TaskSchema], required: true },
    timeline: { type: [TimelineSchema], required: true },
    milestones: { type: [MilestoneSchema], required: true },
    liveDemo: { type: String, required: true },
    repository: { type: String, required: true },
    deploymentPlatform: { type: String },
    deploymentDetails: { type: DeploymentDetailsSchema, required: true },
    gallery: [
      {
        title: {
          type: String,
          // required: true,
        },
        url: {
          type: String,
          // required: true,
        },
      },
    ],
    videos: [
      {
        title: {
          type: String,
          // required: true,
        },
        url: {
          type: String,
          // required: true,
        },
      },
    ],
    documents: { type: [DocumentFileSchema], required: true },
    likes: { type: [LikeSchema], required: true },
    comments: { type: [CommentSchema], required: true },
    documentation: { type: String },
    apiDocs: { type: String },
    changelog: { type: [ChangelogSchema], required: true },
    analytics: { type: AnalyticsSchema },
    challenges: { type: [String], required: true },
    learnings: { type: [String], required: true },
    accessibilityFeatures: { type: [String], required: true },
    pricingModel: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true },
    visibility: { type: String, required: true },
    seo: { type: SEOSchema, required: true },
    isUnderMaintenance: { type: Boolean, required: true },
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
