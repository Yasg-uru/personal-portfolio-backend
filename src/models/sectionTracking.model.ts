import mongoose, { Schema, Document } from 'mongoose';

// Interface for Device Information
interface DeviceInfo {
  deviceType: string; // e.g., "mobile", "desktop", "tablet"
  browser: string; // Browser name, e.g., "Chrome", "Firefox"
  os: string; // Operating system, e.g., "Windows", "iOS", "Android"
  screenResolution: string; // Screen resolution, e.g., "1920x1080"
}

// Interface for Session Information
interface SessionInfo {
  sessionId: string; // Unique session identifier
  ipAddress: string; // User's IP address
  geoLocation?: {
    country: string;
    region: string;
    city: string;
  }; // Optional geolocation data
  startTime: Date; // Session start time
  endTime?: Date; // Optional session end time
}

// Interface for User Interaction
interface UserInteraction {
  userId?: mongoose.Types.ObjectId; // Optional if tracking anonymous users
  sessionId: string; // Correlates interaction to a session
  eventType: string; // e.g., "view", "scroll", "click", "hover"
  timestamp: Date;
  duration?: number; // Duration spent in milliseconds
  metadata?: Record<string, any>; // Additional context (e.g., button clicked, percentage scrolled)
}

// Interface for Section Tracking
interface SectionTracking {
  sectionName: string; // e.g., "About Me", "Projects", "Contact"
  interactions: UserInteraction[]; // List of user interactions for this section
  deviceInfo: DeviceInfo[]; // Device-specific tracking data
  totalViews: number; // Total views of the section
  averageTimeSpent: number; // Average time spent in milliseconds
  totalTimeSpent: number; // Total time spent in milliseconds
  uniqueVisitors: number; // Unique visitors for this section
  mostInteractedElement?: string; // e.g., a button or link ID
}

// Interface for the Tracking Document
export interface TrackingDocument extends Document {
  pageName: string; // e.g., "Home", "Portfolio"
  sessions: SessionInfo[]; // Array of session data
  sections: SectionTracking[]; // Array of section tracking data
  createdAt: Date;
  updatedAt: Date;
}

// Device Information Schema
const DeviceInfoSchema = new Schema<DeviceInfo>({
  deviceType: { type: String, required: true },
  browser: { type: String, required: true },
  os: { type: String, required: true },
  screenResolution: { type: String, required: true },
});

// Session Information Schema
const SessionInfoSchema = new Schema<SessionInfo>({
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
const UserInteractionSchema = new Schema<UserInteraction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String, required: true },
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  duration: { type: Number, required: false },
  metadata: { type: Schema.Types.Mixed, required: false },
});

// Section Tracking Schema
const SectionTrackingSchema = new Schema<SectionTracking>({
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
const TrackingSchema = new Schema<TrackingDocument>(
  {
    pageName: { type: String, required: true },
    sessions: { type: [SessionInfoSchema], required: true },
    sections: { type: [SectionTrackingSchema], required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Model Export
export const TrackingModel = mongoose.model<TrackingDocument>('Tracking', TrackingSchema);
