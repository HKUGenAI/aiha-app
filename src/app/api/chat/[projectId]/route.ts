import { NextRequest, NextResponse } from "next/server";
import { UIMessage, streamText } from "ai";
import { azure } from "@ai-sdk/azure";
import { auth } from "@/server/auth";
import { getProjectById } from "@/server/actions/projects";
import { searchChunks } from "@/server/actions/search";
import { mongoosePromise } from "@/server/db";
import { systemPrompt } from "./system-prompt";

const TOP_K = 6;

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    await mongoosePromise;
    const { projectId } = await params;
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
      !project.collaborators.includes(session?.user?.id || "")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the messages from the request
    const { messages }: { messages: UIMessage[] } = await req.json();
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

    const context = chunks
      .map((chunk) => chunk.content)
      .join("\n\n")
      .replace("${BASE_URL}", process.env.IMAGES_BASE_URL || "");

    const result = streamText({
      model: azure("gpt-4o-mini"),
      system: systemPrompt
        .replace("{{projectName}}", project.projectName)
        .replace("{{context}}", context),
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
