import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import { notFound, unauthorized } from "next/navigation";
import Link from "next/link";
import { FileIcon, PlusIcon } from "@radix-ui/react-icons";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  if (!project.isPublic && !session?.user?.id) {
    unauthorized();
  }

  const isOwner = session?.user?.id === project.ownerId;
  const isCollaborator = project.collaborators.includes(session?.user?.id ?? "");

  return (
    <div className="container p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Project Documents</h1>
        
        {(isOwner || isCollaborator) && (
          <Link
            href={`/projects/${project._id.toString()}/documents/new`}
            className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Document
          </Link>
        )}
      </div>

      {project.documents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {project.documents.map((doc) => (
            <Link
              href={`/projects/${project._id.toString()}/documents/${doc.documentId}`}
              key={doc.documentId}
              className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all shadow-sm hover:shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                {doc.documentThumbnail ? (
                  <img
                    src={doc.documentThumbnail}
                    alt={doc.documentTitle}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 text-lg font-medium text-card-foreground">{doc.documentTitle}</h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {doc.documentType}
                  </span>
                </div>
                {/* <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {doc.documentDescription || "No description provided."}
                </p> */}
                <div className="mt-auto pt-4 text-xs text-muted-foreground">
                  <p>Updated: {new Date(doc.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <FileIcon className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No documents found</h3>
          <p className="mt-2 text-muted-foreground">
            No document in this project yet.
          </p>
          {(isOwner || isCollaborator) && (
            <Link
              href={`/projects/${project._id.toString()}/documents/new`}
              className="mt-6 inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <PlusIcon className="h-4 w-4" />
              Add your first document
            </Link>
          )}
        </div>
      )}
    </div>
  );
}