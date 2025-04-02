"use server";

import { mongoosePromise } from "@/server/db";
import { Chunk } from "@/server/models/chunk";
import { userHasAccessToProject } from "./projects";

import { embed } from "ai";
import { azure } from "@ai-sdk/azure";
import type mongoose from "mongoose";

export interface SearchChunkResponse {
  content: string;
  metadata: {
    documentId: string;
    projectId: string;
    loc?: {
      lines?: {
        from: number;
        to: number;
      };
    };
    [key: string]: unknown;
  };
  score: number;
}

export async function searchChunks(
  projectId: string,
  query: string,
  topK: number,
): Promise<SearchChunkResponse[]> {
  await mongoosePromise;
  // const verified = await userHasAccessToProject(projectId);
  // if (!verified) {
  //   throw new Error("Unauthorized");
  // }
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

  return await Chunk.aggregate(agg as mongoose.PipelineStage[]);
}
