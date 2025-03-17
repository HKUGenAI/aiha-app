import { auth } from "@/server/auth";
import { getMyProjects, getPublicProjects } from "@/server/actions/projects";
import { IProject } from "@/server/models/project";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function ProjectPage() {
  const session = await auth();

  // Only fetch public projects if not logged in
  const publicProjects = await getPublicProjects();
  const myProjects = session?.user?.id
    ? await getMyProjects(session.user.id)
    : null;

  return (
    <div className="min-h-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        {session && (
          <Link
            href="/projects/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Project
          </Link>
        )}
      </div>

      {/* My Projects Section */}
      <section id="my-projects" className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">My Projects</h2>
        {!session ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center text-card-foreground">
            <p className="mb-4 text-muted-foreground">
              Sign in to see your projects
            </p>
            <Link
              href="/api/auth/signin"
              className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Link>
          </div>
        ) : !myProjects || myProjects?.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">
              You haven't created any projects yet.
            </p>
            <Link
              href="/projects/new"
              className="mt-4 inline-block text-sm text-primary hover:text-primary/80"
            >
              Create your first project →
            </Link>
          </div>
        ) : (
          <ProjectList projects={myProjects} />
        )}
      </section>

      {/* Public Projects Section */}
      <section id="public-projects" className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Public Projects
        </h2>
        {publicProjects.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-muted-foreground">
              No public projects available.
            </p>
          </div>
        ) : (
          <ProjectList projects={publicProjects} showOwner={true} />
        )}
      </section>
    </div>
  );
}

function ProjectList({
  projects,
  showOwner = false,
}: {
  projects: IProject[];
  showOwner?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project._id.toString()}
          href={`/projects/${project._id}`}
          className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md"
        >
          <h3 className="text-lg font-medium text-foreground">
            {project.projectName}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {project.description}
          </p>
          <div className="mt-4 flex items-center justify-between">
            {showOwner ? (
              <span className="text-xs text-muted-foreground">
                By {project.ownerName || "Anonymous"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            )}
            {!showOwner && project.isPublic && (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Public
              </span>
            )}
            {showOwner && (
              <span className="text-xs text-muted-foreground">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
