import { notFound } from 'next/navigation';
import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import Link from "next/link";

export default async function ProjectDetailsPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const session = await auth();
  const project = await getProjectById(params.slug);
  
  if (!project) {
    notFound();
  }
  
  const isOwner = session?.user?.id === project.ownerId;
  const isCollaborator = project.collaborators.includes(session?.user?.id ?? "");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
        <div className="flex gap-4">
          {isOwner && (
            <Link
              href={`/projects/${project._id}/edit`}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Project
            </Link>
          )}
          <Link
            href="/projects"
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            Back to Projects
          </Link>
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Project Status */}
        <div className="mb-4 flex items-center gap-4">
          {project.isPublic ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              Public
            </span>
          ) : (
            <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
              Private
            </span>
          )}
          <span className="text-sm text-gray-500">
            Created by {project.ownerName}
          </span>
        </div>
        
        {/* Project Description */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
          <p className="text-gray-600">{project.description || "No description provided."}</p>
        </div>
        
        {/* Project Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created</h3>
            <p className="text-gray-900">{new Date(project.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p className="text-gray-900">{new Date(project.updatedAt).toLocaleString()}</p>
          </div>
        </div>
        
        {/* Collaborators Section */}
        {(isOwner || isCollaborator) && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Collaborators</h2>
            {project.collaborators.length > 0 ? (
              <ul className="list-disc pl-5">
                {project.collaborators.map((collaborator, index) => (
                  <li key={index} className="text-gray-600">
                    {collaborator}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No collaborators yet.</p>
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
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            {(isOwner || isCollaborator) && (
              <Link
                href={`/projects/${project._id}/documents/new`}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Add Document
              </Link>
            )}
          </div>
          
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={doc.thumbnail} 
                      alt={doc.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex-grow">
                    <h3 className="font-medium text-gray-900">
                      <Link href={`/projects/${project._id}/documents/${doc.id}`} className="hover:text-blue-600">
                        {doc.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Updated {doc.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No documents in this project yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Hardcoded documents for now
const documents = [
  { id: "1", title: "Document 1", thumbnail: "https://picsum.photos/128", description: "This is document 1.", createdAt: new Date(), updatedAt: new Date() },
  { id: "2", title: "Document 2", thumbnail: "https://picsum.photos/128", description: "This is document 2.", createdAt: new Date(), updatedAt: new Date() },
  { id: "3", title: "Document 3", thumbnail: "https://picsum.photos/128", description: "This is document 3.", createdAt: new Date(), updatedAt: new Date() },
];