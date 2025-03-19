"use client";

import { cn } from "@/lib/utils";
import { createProject } from "@/server/actions/projects";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const projectData = {
      projectName: formData.get("projectName") as string,
      description: formData.get("description") as string,
      isPublic: formData.get("isPublic") === "true",
    };

    try {
      await createProject(projectData);
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[50rem] px-4 py-8 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-foreground sm:truncate sm:text-3xl sm:tracking-tight">
            Create New Project
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Error</h3>
                <div className="mt-2 text-sm text-destructive">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-foreground"
          >
            Project Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="projectName"
              id="projectName"
              required
              className="block w-full rounded-md border border-input bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Enter project name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              className="block w-full rounded-md border border-input bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Enter project description"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              value="true"
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label
              htmlFor="isPublic"
              className="ml-2 block text-sm text-foreground"
            >
              Make this project public
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSubmitting && "cursor-not-allowed opacity-70",
            )}
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
