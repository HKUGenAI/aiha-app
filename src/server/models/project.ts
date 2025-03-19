import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  projectName: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  collaborators: string[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentTypes {
  PDF = "pdf",
  TXT = "txt",
  MD = "md",
}

export interface Document {
  documentId: string;
  documentTitle: string;
  documentType: DocumentTypes;
  documentThumbnail?: string;
  documentUrl?: string;
  createdAt: Date;
}

const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
  },
  documentTitle: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    enum: Object.values(DocumentTypes),
    required: true,
  },
  documentThumbnail: String,
  documentUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema<IProject>({
  projectName: {
    type: String,
    required: true,
  },
  description: String,
  ownerId: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  collaborators: [String],
  documents: [documentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate model initialization
export const Project =
  (mongoose.models.Project as mongoose.Model<IProject>) ||
  mongoose.model("Project", projectSchema);
