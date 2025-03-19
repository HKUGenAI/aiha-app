// Client component to access usePathname
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getProjectName } from "@/server/actions/projects";

export default function NavLinks() {
  const pathname = usePathname();

  // Check if we're on a project page
  const projectMatch = pathname.match(/^\/projects\/([^\/]+)/);
  const projectId =
    projectMatch && projectMatch[1] !== "new" ? projectMatch[1] : null;

  return (
    <div className="flex items-center space-x-2">
      <Separator />
      <Link
        href="/projects"
        className="inline-flex items-center border-b-2 border-transparent pr-1 pt-0.5 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
      >
        Projects
      </Link>

      {projectId && (
        <>
          <Separator />
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center border-b-2 border-transparent pr-1 pt-0.5 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <ProjectName projectId={projectId} />
          </Link>
        </>
      )}
    </div>
  );
}

function Separator() {
  return (
    <span className="mx-1 mb-[0.1rem] text-3xl font-[100] text-gray-400">
      /
    </span>
  );
}

// Client component to fetch project name
function ProjectName({ projectId }: { projectId: string }) {
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    // Fetch project name using server action
    async function fetchProjectName() {
      try {
        const result = await getProjectName(projectId);
        if (result) {
          setProjectName(result);
        }
      } catch (error) {
        console.error("Failed to fetch project name", error);
      }
    }

    fetchProjectName();
  }, [projectId]);

  return <>{projectName}</>;
}
