import { notFound, redirect } from 'next/navigation';
import { auth } from "@/server/auth";
import { getProjectById, updateProject } from "@/server/actions/projects";
import Link from "next/link";
import EditProjectForm from './EditProjectForm';

async function handleUpdateProject(projectId: string, formData: FormData) {
  'use server';
  
  const projectName = formData.get('projectName') as string;
  const description = formData.get('description') as string;
  const isPublic = formData.has('isPublic');
  
  try {
    await updateProject(projectId, { projectName, description, isPublic });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error.message };
  }
}

export default async function EditProjectPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const session = await auth();
  const project = await getProjectById(params.slug);
  
  // Check if project exists
  if (!project) {
    notFound();
  }
  
  // Check if user is owner
  if (!session?.user?.id || session.user.id !== project.ownerId) {
    redirect(`/projects/${project._id}`);
  }
  
  const updateProjectWithId = handleUpdateProject.bind(null, project._id.toString());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
        <Link
          href={`/projects/${project._id}`}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
        >
          Cancel
        </Link>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <EditProjectForm 
          project={project} 
          updateProject={updateProjectWithId} 
        />
      </div>
    </div>
  );
}