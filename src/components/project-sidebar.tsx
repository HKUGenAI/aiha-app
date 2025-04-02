"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  HomeIcon,
  ChatBubbleIcon,
  FileIcon,
} from "@radix-ui/react-icons";

interface ProjectSidebarProps {
  projectId: string;
}

export default function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  const pathname = usePathname();
  
  const navigation = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      icon: HomeIcon,
      current: pathname === `/projects/${projectId}`
    },
    {
      name: "Chat",
      href: `/projects/${projectId}/chat`,
      icon: ChatBubbleIcon,
      current: pathname === `/projects/${projectId}/chat`
    },
    {
      name: "Documents",
      href: `/projects/${projectId}/documents`,
      icon: FileIcon,
      current: pathname === `/projects/${projectId}/documents`
    }
  ];

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
        {/* <div className="mb-4 border-b border-border pb-3">
          <h2 className="text-lg font-semibold text-foreground">Project Navigation</h2>
        </div> */}
        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                item.current ? 
                  "bg-primary text-primary-foreground" : 
                  "text-card-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <item.icon 
                className={cn(
                  "mr-3 h-5 w-5", 
                  item.current ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} 
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}