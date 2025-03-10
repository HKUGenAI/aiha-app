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
