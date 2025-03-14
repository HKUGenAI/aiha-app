'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProject } from '@/server/models/project';

export default function EditProjectForm({ 
  project, 
  updateProject 
}: { 
  project: IProject;
  updateProject: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await updateProject(formData);
      
      if (result.success) {
        router.push(`/projects/${project._id}`);
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to update project');
      }
    } catch (error: unknown) {
      setError(error.message ?? 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
          Project Name*
        </label>
        <input
          type="text"
          id="projectName"
          name="projectName"
          defaultValue={project.projectName}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={project.description}
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          defaultChecked={project.isPublic}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
          Make project public
        </label>
      </div>
      
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}