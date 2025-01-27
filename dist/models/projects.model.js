"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TeamMemberSchema = new mongoose_1.Schema({
    name: { type: String },
    role: { type: String },
    email: { type: String },
    linkedIn: { type: String },
    github: { type: String },
});
const DocumentFileSchema = new mongoose_1.Schema({
    name: { type: String },
    url: { type: String },
    uploadedAt: { type: Date },
});
const LikeSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date },
});
const CommentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String },
    timestamp: { type: Date },
    likes: { type: [LikeSchema], default: [] },
    dislikes: { type: [LikeSchema], default: [] }, // Track dislikes
    replies: {
        type: [
            {
                userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
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
const ProjectSchema = new mongoose_1.Schema({
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
    documents: { type: [DocumentFileSchema], default: [] },
    likes: { type: [LikeSchema] },
    comments: { type: [CommentSchema] },
    challenges: { type: [String] },
    learnings: { type: [String] },
    accessibilityFeatures: { type: [String] },
    isUnderMaintenance: { type: Boolean },
    maintenanceMessage: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
exports.ProjectModel = mongoose_1.default.model("Project", ProjectSchema);
