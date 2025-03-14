'use client';

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
            projectName: formData.get('projectName') as string,
            description: formData.get('description') as string,
            isPublic: formData.get('isPublic') === 'true'
        };

        try {
            await createProject(projectData);
            router.push('/projects');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Create New Project
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                        Project Name
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="projectName"
                            id="projectName"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
                            placeholder="Enter project name"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <div className="mt-1">
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
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
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                            Make this project public
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}