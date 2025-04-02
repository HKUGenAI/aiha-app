import { type NextRequest, NextResponse } from "next/server";
import { type UIMessage, createDataStreamResponse, streamText } from "ai";
import { azure } from "@ai-sdk/azure";
import { createVertex } from "@ai-sdk/google-vertex";
import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import {
  searchChunks,
  type SearchChunkResponse,
} from "@/server/actions/search";
import { mongoosePromise } from "@/server/db";
import { systemPrompt } from "./prompts";
import { generateSearchQuery } from "./generate-search-query";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const TOP_K = 6;
export const maxDuration = 60;

// Only set up proxy if HTTP_PROXY is defined and we're not in a test environment
if (process.env.HTTP_PROXY && process.env.NODE_ENV !== "test") {
  const proxyAgent = new ProxyAgent(process.env.HTTP_PROXY);
  setGlobalDispatcher(proxyAgent);
}

export const vertex = createVertex({
  googleAuthOptions: {
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
  },
  baseURL: `https://aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_VERTEX_PROJECT}/locations/${process.env.GOOGLE_VERTEX_LOCATION}/publishers/google`,
});

export async function POST(req: NextRequest) {
  try {
    await mongoosePromise;
    const { messages, projectId, webSearch } = (await req.json()) as {
      messages: UIMessage[];
      projectId: string;
      webSearch?: boolean;
    };
    const session = await auth();

    // Check if user has access to this project
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (
      !project.isPublic &&
      !session?.user?.id &&
      project.ownerId !== session?.user?.id &&
      !project.collaborators.includes(session?.user?.id ?? "")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the messages from the request
    const lastMessage = messages[messages.length - 1];

    // Check if lastMessage exists
    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 },
      );
    }

    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Invalid message role" },
        { status: 400 },
      );
    }

    let model;
    // Add web search context if enabled
    if (webSearch) {
      // This is a placeholder - you would implement actual web search here
      model = vertex("gemini-2.0-flash-001", {
        useSearchGrounding: true,
      });
    } else {
      model = vertex("gemini-2.0-flash-001", { useSearchGrounding: false });
      // model = azure("gpt-4o-mini");
    }

    return createDataStreamResponse({
      execute: async (dataStream) => {
        // Retrieve relevant chunks from the database
        const searchQuery = await generateSearchQuery(
          messages,
          vertex("gemini-2.0-flash-001"),
        );
        dataStream.writeData({ searchQuery: searchQuery });
        const chunks = await searchChunks(projectId, searchQuery, TOP_K);

        let contextString = chunks
          .map((chunk: SearchChunkResponse) => chunk.content)
          .join("\n\n")
          .replaceAll("${BASE_URL}", process.env.IMAGES_BASE_URL ?? "")
          // .replace("$%7BBASE_URL%7D", process.env.IMAGES_BASE_URL ?? "");

        const result = streamText({
          model: model,
          temperature: 0.1,
          system: systemPrompt
            .replace("{{projectName}}", project.projectName)
            .replace("{{context}}", contextString),
          messages,
          onError: (error) => {
            console.error("Error in chat API:", error);
          },
        });
        result.mergeIntoDataStream(dataStream, {
          sendSources: true,
        });
      },
      onError: (error) => {
        console.error("Error in chat API:", error);
        if (error instanceof Error) {
          return error.message;
        }
        return "An error occurred while processing your request.";
      },
    });

    // const result = streamText({
    //   model: model,
    //   temperature: 0.1,
    //   system: systemPrompt
    //     .replace("{{projectName}}", project.projectName)
    //     .replace("{{context}}", contextString),
    //   messages,
    //   onError: (error) => {
    //     console.error("Error in chat API:", error);
    //   },
    // });

    // return result.toDataStreamResponse({ sendSources: true });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
