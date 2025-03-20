import { type NextRequest, NextResponse } from "next/server";
import { type UIMessage, streamText } from "ai";
import { azure } from "@ai-sdk/azure";
import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import {
  searchChunks,
  type SearchChunkResponse,
} from "@/server/actions/search";
import { mongoosePromise } from "@/server/db";
import { systemPrompt } from "./system-prompt";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const TOP_K = 6;

// Only set up proxy if HTTP_PROXY is defined and we're not in a test environment
if (process.env.HTTP_PROXY && process.env.NODE_ENV !== 'test') {
  const proxyAgent = new ProxyAgent(process.env.HTTP_PROXY);
  setGlobalDispatcher(proxyAgent);
}

export async function POST(
  req: NextRequest
) {
  try {
    await mongoosePromise;
    const { messages, projectId } = (await req.json()) as { messages: UIMessage[], projectId: string };
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

    const userQuery = lastMessage.content;

    // Retrieve relevant chunks from the database
    const chunks = await searchChunks(projectId, userQuery, TOP_K);
    console.log("Chunks retrieved");

    const contextString: string = chunks
      .map((chunk: SearchChunkResponse) => chunk.content)
      .join("\n\n")
      .replace("${BASE_URL}", process.env.IMAGES_BASE_URL ?? "");

    const result = streamText({
      model: azure("gpt-4o-mini"),
      system: systemPrompt
        .replace("{{projectName}}", project.projectName)
        .replace("{{context}}", contextString),
      messages,
    });

    return result.toDataStreamResponse();
    // Prepare the messages for the AI
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 },
    );
  }
}
