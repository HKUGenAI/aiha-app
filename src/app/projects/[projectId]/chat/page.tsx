import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import { notFound, unauthorized } from "next/navigation";
import ChatInterface from "./chat-interface";

export default async function ProjectChatPage({
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

  if (
    !project.isPublic &&
    project.ownerId !== session?.user?.id &&
    !project.collaborators.includes(session?.user?.id ?? "")
  ) {
    unauthorized();
  }

  return <ChatInterface project={project} />;
}
