"use client";

import { useRef, useEffect, useState } from "react";
import { Message, useChat } from "@ai-sdk/react";
import { type IProject } from "@/server/models/project";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
import { PlusCircle } from "lucide-react";
import { set } from "mongoose";
import SessionSideBar from "./SessionSideBar";
import { useSessionManager } from "@/hooks/useSessionManager";

export default function ChatInterface({ project }: { project: IProject }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectId = project._id.toString();
  const sessionManager = useSessionManager(projectId);

  const initialMessages =
    sessionManager.storedMessages.length > 0
      ? sessionManager.storedMessages
      : ([
          {
            id: "welcome",
            role: "assistant",
            content: `Hello! I'm your AI assistant for the "${project.projectName}" project. How can I help you today?`,
          },
        ] as Message[]);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    initialMessages: initialMessages,
    body: {
      projectId: projectId,
    },
    id: `chat-${projectId}-${sessionManager.currentSessionId}`,
  });

  useEffect(() => {
    sessionManager.updateSession(messages);
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat Sessions Sidebar */}
      <SessionSideBar
        projectId={projectId}
        chatSessions={sessionManager.chatSessions}
        currentSessionId={sessionManager.currentSessionId}
        setCurrentSessionId={sessionManager.setCurrentSessionId}
        isLoading={sessionManager.isLoading}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {project.projectName} - Chat
            </h1>
          </div>
          <Link
            href={`/projects/${projectId}`}
            className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80"
          >
            Back to Project
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full max-w-4xl rounded-lg p-4",
                  message.role === "user"
                    ? "ml-auto bg-primary/10"
                    : "bg-muted",
                )}
              >
                <div className="prose dark:prose-invert">
                  {message.role === "user" ? (
                    <p className="text-foreground">{message.content}</p>
                  ) : (
                    <Markdown>{message.content}</Markdown>
                  )}
                </div>
              </div>
            ))}

            {/* Loader */}
            {status === "submitted" && (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Thinking...
              </span>
            )}
            {/* Error notification */}
            {status === "error" && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium">Error occurred</h3>
                    <p className="text-sm">
                      Something went wrong. Please try again or refresh the
                      page.
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium hover:underline"
                  >
                    Refresh page
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border p-4">
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
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
