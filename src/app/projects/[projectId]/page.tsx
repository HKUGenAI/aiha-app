import { notFound, unauthorized } from "next/navigation";
import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import ProjectInfo from "./project-info";

export default async function ProjectDetailsPage({
  params,
}: {
  params: { projectId: string };
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

  return <ProjectInfo project={project} session={session} />;
}
