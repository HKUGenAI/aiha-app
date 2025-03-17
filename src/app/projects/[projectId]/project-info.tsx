"use client";
import Link from "next/link";
import { IProject } from "@/server/models/project";
import { Session } from "next-auth";
import { useState } from "react";
import { updateProject } from "@/server/actions/projects";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  Pencil1Icon,
  LockOpen1Icon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProjectInfo({
  project,
  session,
}: {
  project: IProject;
  session: Session | null;
}) {
  const router = useRouter();
  const isOwner = session?.user?.id === project.ownerId;
  const isCollaborator = project.collaborators.includes(
    session?.user?.id ?? "",
  );

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(project.projectName);
  const [description, setDescription] = useState(project.description || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveTitle = async () => {
    if (title.trim() === "") return;
    setIsSubmitting(true);
    setError(null);

    try {
      await updateProject(project._id.toString(), {
        projectName: title,
      });
      setEditingTitle(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update title");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDescription = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await updateProject(project._id.toString(), {
        description,
      });
      setEditingDescription(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update description",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!isOwner) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await updateProject(project._id.toString(), {
        isPublic: !project.isPublic,
      });
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update visibility",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        {editingTitle ? (
          <div className="flex w-full max-w-md items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-foreground focus:border-primary focus:ring-primary"
              disabled={isSubmitting}
            />
            <button
              onClick={handleSaveTitle}
              disabled={isSubmitting}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditingTitle(false);
                setTitle(project.projectName);
              }}
              className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        ) : (
          <h1 className="flex items-center gap-1 text-2xl font-bold text-foreground">
            {project.projectName}
            {isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    onClick={() => setEditingTitle(true)}
                    className="ml-1 rounded-sm p-1 hover:bg-muted/80"
                  >
                    <Pencil1Icon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </h1>
        )}
        <div className="flex gap-4">
          <Link
            href="/projects"
            className="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
          >
            Back to Projects
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        {/* Project Status */}
        <div className="mb-4 flex items-center gap-4">
          {isOwner ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  onClick={handleTogglePublic}
                  disabled={isSubmitting}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    project.isPublic
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                  )}
                >
                  {project.isPublic ? (
                    <>
                      <LockOpen1Icon className="h-3 w-3" />
                      Public
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-3 w-3" />
                      Private
                    </>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Click to {project.isPublic ? "make private" : "make public"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                project.isPublic
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800",
              )}
            >
              {project.isPublic ? "Public" : "Private"}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Created by {project.ownerName}
          </span>
        </div>

        {/* Project Description */}
        <div className="mb-6">
          <div className="mb-2 flex items-center">
            <h3 className="text-md font-medium text-foreground">Description</h3>
            {isOwner && !editingDescription && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    onClick={() => setEditingDescription(true)}
                    className="ml-1 rounded-sm p-1 hover:bg-muted/80"
                  >
                    <Pencil1Icon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Description</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {editingDescription ? (
            <div className="space-y-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input px-3 py-2 text-foreground focus:border-primary focus:ring-primary"
                disabled={isSubmitting}
              ></textarea>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditingDescription(false);
                    setDescription(project.description || "");
                  }}
                  className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-card-foreground">
              {project.description || "No description provided."}
            </p>
          )}
        </div>

        {/* Project Metadata */}
        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Created
            </h3>
            <p className="text-card-foreground">
              {new Date(project.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Last Updated
            </h3>
            <p className="text-card-foreground">
              {new Date(project.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Collaborators Section */}
        {(isOwner || isCollaborator) && (
          <div className="mt-6 border-t border-border pt-4">
            <h2 className="text-md mb-2 font-medium text-card-foreground">
              Collaborators
            </h2>
            {project.collaborators.length > 0 ? (
              <ul className="list-disc pl-5">
                {project.collaborators.map((collaborator, index) => (
                  <li key={index} className="text-muted-foreground">
                    {collaborator}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No collaborators yet.</p>
            )}

            {isOwner && (
              <Link
                href={`/projects/${project._id}/invite`}
                className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800"
              >
                + Invite collaborators
              </Link>
            )}
          </div>
        )}

        {/* Documents Section */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-card-foreground">
              Documents
            </h2>
            {(isOwner || isCollaborator) && (
              <Link
                href={`/projects/${project._id}/documents/new`}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add Document
              </Link>
            )}
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Link
                  href={`/projects/${project._id}/documents/${doc.id}`}
                  key={doc.id}
                  className="flex overflow-hidden rounded-lg border border-border transition-shadow hover:shadow-md"
                >
                  <div className="h-24 w-24 flex-shrink-0">
                    <img
                      src={doc.thumbnail}
                      alt={doc.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-grow p-3">
                    <h3 className="font-medium text-card-foreground">
                      {doc.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {doc.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      Updated {doc.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No documents in this project yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Hardcoded documents for now
const documents = [
  {
    id: "1",
    title: "Document 1",
    thumbnail: "https://picsum.photos/128",
    description: "This is document 1.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "Document 2",
    thumbnail: "https://picsum.photos/128",
    description: "This is document 2.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    title: "Document 3",
    thumbnail: "https://picsum.photos/128",
    description: "This is document 3.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
