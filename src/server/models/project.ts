import mongoose from 'mongoose';

export interface IProject extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  projectName: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>({
  projectName: { 
    type: String, 
    required: true 
  },
  description: String,
  ownerId: { 
    type: String, 
    required: true 
  },
  ownerName: {
    type: String,
    required: true
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  collaborators: [String],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Prevent duplicate model initialization
export const Project = (mongoose.models.Project as mongoose.Model<IProject>) || mongoose.model('Project', projectSchema);