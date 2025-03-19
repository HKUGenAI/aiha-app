"use server";

import { mongoosePromise } from "@/server/db";
import { Project, type Document } from "@/server/models/project";
import { Chunk, type ChunkType } from "@/server/models/chunk";
import { auth } from "@/server/auth";

export async function addDocumentToProject(
  projectId: string,
  document: Document,
): Promise<boolean> {
  await mongoosePromise;
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is the owner or a collaborator
    if (
      project.ownerId !== session.user.id &&
      !project.collaborators.includes(session.user.id)
    ) {
      throw new Error("Only the owner or collaborators can add documents");
    }

    project.documents.push(document);
    project.updatedAt = new Date();

    await project.save();
    return true;
  } catch (error) {
    console.error("Failed to add document to project:", error);
    throw error;
  }
}

export async function addChunksToProject(
  projectId: string,
  documentId: string,
  chunkDocuments: ChunkType[],
): Promise<boolean> {
  await mongoosePromise;
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is the owner or a collaborator
    if (
      project.ownerId !== session.user.id &&
      !project.collaborators.includes(session.user.id)
    ) {
      throw new Error("Only the owner or collaborators can add chunks");
    }

    // Check if the document exists in the project
    const documentExists = project.documents.some(
      (doc) => doc.documentId === documentId,
    );

    if (!documentExists) {
      throw new Error("Document not found in project");
    }

    // Store chunks in database
    await Chunk.insertMany(chunkDocuments);

    // Update project's updatedAt timestamp
    project.updatedAt = new Date();
    await project.save();

    return true;
  } catch (error) {
    console.error("Failed to add chunks to project:", error);
    throw error;
  }
}
