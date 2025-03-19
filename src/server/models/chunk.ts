import mongoose from "mongoose";

export interface ChunkType {
  documentId: string;
  projectId: string;
  content: string;
  metadata: {
    documentId: string;
    projectId: string;
    loc?: {
      lines?: {
        from: number;
        to: number;
      };
    };
    [key: string]: unknown;
  };
  embedding: number[];
  createdAt?: Date;
}

export interface IChunk extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  documentId: string;
  projectId: string;
  content: string;
  metadata: {
    documentId: string;
    projectId: string;
    loc?: {
      lines?: {
        from: number;
        to: number;
      };
    };
    [key: string]: unknown;
  };
  embedding: number[];
  createdAt?: Date;
}

const chunkSchema = new mongoose.Schema<IChunk>({
  documentId: {
    type: String,
    required: true,
    index: true,
  },
  projectId: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object,
    required: true,
    default: {},
  },
  embedding: {
    type: [Number],
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for faster queries
chunkSchema.index({ projectId: 1, documentId: 1 });

// Prevent duplicate model initialization
export const Chunk =
  (mongoose.models.Chunk as mongoose.Model<IChunk>) ||
  mongoose.model("Chunk", chunkSchema);
