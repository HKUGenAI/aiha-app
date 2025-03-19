"use server";

import { mongoosePromise } from "@/server/db";
import { Chunk } from "@/server/models/chunk";
import { userHasAccessToProject } from "./projects";

import { embed } from "ai";
import { azure } from "@ai-sdk/azure";

export async function searchChunks(
  projectId: string,
  query: string,
  topK: number,
) {
  await mongoosePromise;
  if (!userHasAccessToProject(projectId)) {
    throw new Error("Unauthorized");
  }
  if (!projectId) {
    throw new Error("Project ID is required");
  }
  if (!query) {
    throw new Error("Query is required");
  }

  const queryEmbedding = await embed({
    model: azure.textEmbeddingModel("text-embedding-3-small"),
    value: query,
  });

  const agg = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryEmbedding.embedding,
        // 'numCandidates': 100,    // use ANN
        exact: true, // use ENN
        limit: topK ?? 6,
      },
    },
    {
      $project: {
        content: 1,
        metadata: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ];

  return await Chunk.aggregate(agg as any[]);
}
