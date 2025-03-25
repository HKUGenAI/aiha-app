"use client";

import { useRef, useEffect, useState } from "react";
import { Message, useChat } from "@ai-sdk/react";
import { type IProject } from "@/server/models/project";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";
import { PlusCircle } from "lucide-react";

// Define the structure of a chat session
interface ChatSession {
  id: string;
  title: string;
  lastUpdated: number;
  messageCount: number;
}

export default function ChatInterface({ project }: { project: IProject }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectId = project._id.toString();

  // Track current active chat session
  const [currentSessionId, setCurrentSessionId] = useState<string>("default");
  // Store all available chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "default",
      title: "New Chat",
      lastUpdated: Date.now(),
      messageCount: 1,
    },
  ]);

  // Load saved messages from localStorage on component mount
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Get stored messages and sessions from localStorage
  useEffect(() => {
    try {
      // Load sessions
      const storedSessions = localStorage.getItem(`chat-sessions-${projectId}`);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions) as ChatSession[];
        if (parsedSessions && parsedSessions.length > 0) {
          setChatSessions(parsedSessions);
          // Set the most recently updated session as the current one
          const mostRecentSession = [...parsedSessions].sort(
            (a, b) => b.lastUpdated - a.lastUpdated,
          )[0];
          setCurrentSessionId(mostRecentSession!.id);
        }
      }

      // Load messages for current session
      const storedMessages = localStorage.getItem(
        `chat-${projectId}-${currentSessionId}`,
      );
      if (storedMessages) {
        const parsedMessages: Message[] = JSON.parse(
          storedMessages,
        ) as Message[];
        if (parsedMessages && parsedMessages.length > 0) {
          setStoredMessages(parsedMessages);
        }
      }
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Failed to load stored sessions or messages:", error);
      setInitialLoadDone(true);
    }
  }, [projectId]);

  // Initial welcome message as default
  const [storedMessages, setStoredMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your AI assistant for the "${project.projectName}" project. How can I help you today?`,
    },
  ]);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    initialMessages: storedMessages,
    body: {
      projectId: projectId,
    },
    id: `chat-${projectId}-${currentSessionId}`,
  });

  console.log(messages);
  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      // Save messages to localStorage
      localStorage.setItem(
        `chat-${projectId}-${currentSessionId}`,
        JSON.stringify(messages),
      );

      // Update chat sessions using functional update pattern
      setChatSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                lastUpdated: Date.now(),
                messageCount: messages.length,
              }
            : session,
        );

        // Save updated sessions to localStorage
        localStorage.setItem(
          `chat-sessions-${projectId}`,
          JSON.stringify(updatedSessions),
        );

        return updatedSessions;
      });
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  // Create a new chat session
  const createNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: `Chat ${chatSessions.length + 1}`,
      lastUpdated: Date.now(),
      messageCount: 1,
    };

    const updatedSessions = [...chatSessions, newSession];
    setChatSessions(updatedSessions);
    localStorage.setItem(
      `chat-sessions-${projectId}`,
      JSON.stringify(updatedSessions),
    );

    // Switch to the new session
    setCurrentSessionId(newSessionId);

    // Reset stored messages to default welcome message
    setStoredMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hello! I'm your AI assistant for the "${project.projectName}" project. How can I help you today?`,
      },
    ]);
  };

  // Clear the current chat session
  const clearCurrentSession = () => {
    if (confirm("Are you sure you want to clear this chat history?")) {
      localStorage.removeItem(`chat-${projectId}-${currentSessionId}`);
      window.location.reload();
    }
  };

  console.log(status);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat Sessions Sidebar */}
      <div className="flex w-64 flex-col border-r border-border bg-muted/30">
        <div className="border-b border-border p-4">
          <button
            onClick={createNewSession}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setCurrentSessionId(session.id)}
              className={cn(
                "w-full border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted",
                currentSessionId === session.id && "bg-muted",
              )}
            >
              <div className="truncate font-medium">{session.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(session.lastUpdated).toLocaleDateString()} ·{" "}
                {session.messageCount} messages
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {project.projectName} - Chat
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearCurrentSession}
              className="rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20"
            >
              Clear History
            </button>
            <Link
              href={`/projects/${projectId}`}
              className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80"
            >
              Back to Project
            </Link>
          </div>
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
