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
exports.TrackingModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Device Information Schema
const DeviceInfoSchema = new mongoose_1.Schema({
    deviceType: { type: String, required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    screenResolution: { type: String, required: true },
});
// Session Information Schema
const SessionInfoSchema = new mongoose_1.Schema({
    sessionId: { type: String, required: true },
    ipAddress: { type: String, required: true },
    geoLocation: {
        country: { type: String, required: false },
        region: { type: String, required: false },
        city: { type: String, required: false },
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
});
// User Interaction Schema
const UserInteractionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: false },
    sessionId: { type: String, required: true },
    eventType: { type: String, required: true },
    timestamp: { type: Date, required: true },
    duration: { type: Number, required: false },
    metadata: { type: mongoose_1.Schema.Types.Mixed, required: false },
});
// Section Tracking Schema
const SectionTrackingSchema = new mongoose_1.Schema({
    sectionName: { type: String, required: true },
    interactions: { type: [UserInteractionSchema], default: [] },
    deviceInfo: { type: [DeviceInfoSchema], default: [] },
    totalViews: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    mostInteractedElement: { type: String, required: false },
});
// Main Tracking Schema
const TrackingSchema = new mongoose_1.Schema({
    pageName: { type: String, required: true },
    sessions: { type: [SessionInfoSchema], required: true },
    sections: { type: [SectionTrackingSchema], required: true },
}, { timestamps: true } // Automatically adds createdAt and updatedAt
);
// Model Export
exports.TrackingModel = mongoose_1.default.model('Tracking', TrackingSchema);
