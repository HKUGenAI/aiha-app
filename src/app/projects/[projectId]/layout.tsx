import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import { notFound } from "next/navigation";
import ProjectSidebar from "../../../components/project-sidebar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  const session = await auth();
  const project = await getProjectById(params.projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex w-full justify-between">
      <div className="w-56 flex-shrink-0">
      <ProjectSidebar projectId={params.projectId} />
      </div>
      <div className="flex-1 ml-4">
      {children}
      </div>
    </div>
  );
}