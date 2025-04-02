import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import { notFound } from "next/navigation";
import ProjectSidebar from "../../../components/project-sidebar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  const { projectId } = await params;
  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex w-full min-w-full justify-start min-h-full max-h-[calc(100vh-8rem)]">
      <div className="w-52 flex-shrink">
        <ProjectSidebar projectId={projectId} />
      </div>
      <div className="flex-1 ml-4 min-h-full flex-grow w-full">
        {children}
      </div>
    </div>
  );
}