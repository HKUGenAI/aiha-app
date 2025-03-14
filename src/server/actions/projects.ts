'use server'

import { mongoosePromise } from '@/server/db';
import { Project, IProject } from '@/server/models/project';
import { auth } from '@/server/auth';

export async function getMyProjects(userId: string): Promise<IProject[]> {
  await mongoosePromise;
  return Project.find({ ownerId: userId }).sort({ updatedAt: -1 });
}

export async function getPublicProjects(): Promise<IProject[]> {
  await mongoosePromise;
  return Project.find({ isPublic: true }).sort({ updatedAt: -1 });
}

export async function getProjectById(id: string): Promise<IProject | null> {
  await mongoosePromise;
  const session = await auth();
  
  try {
    const project = await Project.findById(id);
    
    if (project && (
      project.isPublic || (
        session?.user?.id && (
          project.ownerId === session.user.id || 
          project.collaborators.includes(session.user.id)
        )
      )
    )) {
      return project;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function updateProject(
  projectId: string, 
  data: {
    projectName?: string;
    description?: string;
    isPublic?: boolean;
  }
): Promise<Boolean> {
  await mongoosePromise;
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Check if user is the owner
    if (project.ownerId !== session.user.id) {
      throw new Error('Only the owner can edit this project');
    }
    
    // Check if project name is already taken by another project from the same user
    if (data.projectName && data.projectName !== project.projectName) {
      const existingProject = await Project.findOne({ 
        ownerId: session.user.id, 
        projectName: data.projectName,
        _id: { $ne: projectId } // exclude current project
      });
      
      if (existingProject) {
        throw new Error('Project name already exists');
      }
    }
    
    // Update fields
    if (data.projectName) project.projectName = data.projectName;
    if (data.description !== undefined) project.description = data.description;
    if (data.isPublic !== undefined) project.isPublic = data.isPublic;
    
    project.updatedAt = new Date();
    
    await project.save();
    return true;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

export async function createProject(data: { 
  projectName: string; 
  description: string; 
  isPublic?: boolean;
}): Promise<Boolean> {
  await mongoosePromise;
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (await Project.findOne({ ownerId: session.user.id, projectName: data.projectName })) {
    throw new Error('Project name already exists');
  }

  try {
    const project = new Project({
      ...data,
      ownerId: session.user.id,
      ownerName: session.user.name,
      collaborators: []
    })

    await project.save()
    console.log('Project created:', project)
  } catch {
    throw new Error('Failed to create project')
  }
  return true;
}
