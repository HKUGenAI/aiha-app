import { useState, useEffect } from "react";
import { Message } from "@ai-sdk/react";

// Define the structure of a chat session
export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: number;
  messageCount: number;
}

export function useSessionManager(projectId: string) {
  // Track current active chat session
  const [currentSessionId, setCurrentSessionId] = useState<string>("default");
  // Store all available chat sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  // Store messages for the current session
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);
  // Track if initial loading is complete
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions and messages from localStorage
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
          setCurrentSessionId(mostRecentSession?.id || "default");
        }
      }

      // Create default session if needed
      if (!storedSessions || JSON.parse(storedSessions).length === 0) {
        const defaultSession = {
          id: "default",
          title: "Default Chat",
          lastUpdated: Date.now(),
          messageCount: 0,
        };
        setChatSessions([defaultSession]);
        setCurrentSessionId("default");
        localStorage.setItem(
          `chat-sessions-${projectId}`,
          JSON.stringify([defaultSession]),
        );
      }
    } catch (error) {
      console.error("Failed to load stored sessions:", error);
      // Create a fallback session
      const defaultSession = {
        id: "default",
        title: "Default Chat",
        lastUpdated: Date.now(),
        messageCount: 0,
      };
      setChatSessions([defaultSession]);
      setCurrentSessionId("default");
    }

    setIsLoading(false);
  }, [projectId]);

  // Load messages whenever currentSessionId changes
  useEffect(() => {
    if (currentSessionId) {
      try {
        const storedMessages = localStorage.getItem(
          `chat-${projectId}-${currentSessionId}`,
        );
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages) as Message[];
          if (parsedMessages && parsedMessages.length > 0) {
            setStoredMessages(parsedMessages);
            return;
          }
        }
        // If no messages or invalid messages, set empty array
        setStoredMessages([]);
      } catch (error) {
        console.error("Failed to load stored messages:", error);
        setStoredMessages([]);
      }
    }
  }, [projectId, currentSessionId]);

  // Update session when messages change
  const updateSession = (messages: Message[]) => {
    if (messages.length > 0) {
      // Save messages to localStorage
      localStorage.setItem(
        `chat-${projectId}-${currentSessionId}`,
        JSON.stringify(messages),
      );

      // Update chat sessions
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
  };

  // Create a new session
  const createNewSession = (title: string = "New Chat") => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title,
      lastUpdated: Date.now(),
      messageCount: 0,
    };

    setChatSessions((prevSessions) => {
      const updatedSessions = [...prevSessions, newSession];
      localStorage.setItem(
        `chat-sessions-${projectId}`,
        JSON.stringify(updatedSessions),
      );
      return updatedSessions;
    });

    setCurrentSessionId(newSessionId);
    setStoredMessages([]);

    return newSessionId;
  };

  // Delete a session
  const deleteSession = (sessionId: string) => {
    // Remove session from localStorage
    localStorage.removeItem(`chat-${projectId}-${sessionId}`);

    // Update sessions list
    setChatSessions((prevSessions) => {
      const filteredSessions = prevSessions.filter(
        (session) => session.id !== sessionId,
      );

      // Save updated sessions to localStorage
      localStorage.setItem(
        `chat-sessions-${projectId}`,
        JSON.stringify(filteredSessions),
      );

      // If we're deleting the current session, switch to another one
      if (sessionId === currentSessionId && filteredSessions.length > 0) {
        const nextSession = filteredSessions[0];
        setCurrentSessionId(nextSession.id || "default");

        // Load messages for the new current session
        try {
          const storedMessages = localStorage.getItem(
            `chat-${projectId}-${nextSession.id}`,
          );
          if (storedMessages) {
            setStoredMessages(JSON.parse(storedMessages));
          } else {
            setStoredMessages([]);
          }
        } catch (error) {
          setStoredMessages([]);
        }
      }

      return filteredSessions;
    });
  };

  return {
    currentSessionId,
    setCurrentSessionId,
    chatSessions,
    storedMessages,
    isLoading,
    updateSession,
    createNewSession,
    deleteSession,
  };
}
