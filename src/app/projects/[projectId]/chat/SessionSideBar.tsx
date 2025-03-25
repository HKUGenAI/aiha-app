import { PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionManager, ChatSession } from "@/hooks/useSessionManager";
import { useState } from "react";

// Format timestamp without using Date API to avoid hydration errors
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface SessionSideBarProps {
  projectId: string;
  chatSessions: ChatSession[];
  currentSessionId: string;
  setCurrentSessionId: (id: string) => void;
  isLoading: boolean;
}

export default function SessionSideBar({
  projectId,
  chatSessions,
  currentSessionId,
  setCurrentSessionId,
  isLoading,
}: SessionSideBarProps) {
  const { createNewSession, deleteSession } = useSessionManager(projectId);
  // Track which session is being hovered
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  const handleCreateNewSession = () => {
    createNewSession();
  };

  return (
    <div className="flex w-64 flex-col border-r border-border bg-muted/30">
      <div className="border-b border-border p-4">
        <button
          onClick={handleCreateNewSession}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <div className="text-sm text-muted-foreground">
              Loading sessions...
            </div>
          </div>
        ) : chatSessions.length > 0 ? (
          chatSessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group relative border-b border-border/50 transition-colors hover:bg-muted",
                currentSessionId === session.id && "bg-muted",
              )}
              onMouseEnter={() => setHoveredSessionId(session.id)}
              onMouseLeave={() => setHoveredSessionId(null)}
            >
              <button
                onClick={() => setCurrentSessionId(session.id)}
                className="w-full px-4 py-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate font-medium">{session.title}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(session.lastUpdated)} · {session.messageCount}{" "}
                  messages
                </div>
              </button>

              {/* Delete button - appears on hover */}
              {(hoveredSessionId === session.id ||
                currentSessionId === session.id) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this chat session?")) {
                      deleteSession(session.id);
                    }
                  }}
                  className="absolute right-2 top-2 rounded-full p-1.5 text-destructive/70 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete session"
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="flex h-20 items-center justify-center">
            <div className="text-sm text-muted-foreground">
              No chat sessions
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
