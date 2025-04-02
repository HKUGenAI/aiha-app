"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { type IProject } from "@/server/models/project";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GlobeIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

export default function ChatInterface({ project }: { project: IProject }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [webSearch, setWebSearch] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, status  } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI assistant for the "${project.projectName}" project. How can I help you today?`,
      },
    ],
    body: {
      projectId: project._id.toString(),
      webSearch,
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onFinish: (messages) => {
      console.log("Finished streaming");
      console.log(messages)
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col">
      {/* <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">
            {project.projectName} - Chat
          </h1>
        </div>
        <Link
          href={`/projects/${project._id.toString()}`}
          className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80"
        >
          Back to Project
        </Link>
      </div> */}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex max-w-4xl rounded-lg p-4",
                message.role === "user" ? "ml-auto bg-primary/10 w-fit" : "bg-muted w-full",
              )}
            >
              <div className="prose dark:prose-invert">
                {message.role === "user" ? (
                  <span className="text-foreground">{message.content}</span>
                ) : (
                  <Markdown>{message.content}</Markdown>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border p-4 pb-0">
        <div className="mb-2 flex items-center justify-end gap-2">
          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="web-search" className="text-sm text-muted-foreground">
            Web Search
          </Label>
          <Switch
            id="web-search"
            checked={webSearch}
            onCheckedChange={setWebSearch}
          />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about this project..."
            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={status !== "ready"}
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim()}
            className={cn(
              "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none",
              (status !== "ready" || !input.trim()) &&
                "cursor-not-allowed opacity-50",
            )}
          >
            {status == "submitted" ? "Sending..." : status == "streaming" ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
