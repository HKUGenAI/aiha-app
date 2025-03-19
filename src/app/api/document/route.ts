import { NextResponse, type NextRequest } from "next/server";
import { Document } from "@langchain/core/documents";
import { moveBlobs } from "./move-blobs";
import {
  addChunksToProject,
  addDocumentToProject,
} from "@/server/actions/documents";
import {
  type Document as DBDocumentType,
  DocumentTypes,
} from "@/server/models/project";
import { v4 as uuidv4 } from "uuid";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

import { embed } from "ai";
import { azure } from "@ai-sdk/azure";

// Create the Tiktoken instance once
const encoding = new Tiktoken(o200k_base);

// Reuse the same instance in the length function
const lengthFunction = (text: string) => encoding.encode(text).length;

export async function PUT(request: NextRequest) {
  try {
    const { containerName, imagesDir, mdDocUrl, projectId, docName, docType } =
      await request.json();

    if (!containerName) {
      throw new Error("Missing containerName");
    }
    if (!imagesDir) {
      throw new Error("Missing imagesDir");
    }
    if (!mdDocUrl) {
      throw new Error("Missing mdDocUrl");
    }
    if (!mdDocUrl.startsWith("https://aiha.blob.core.windows.net/aiha")) {
      throw new Error("Invalid mdDocUrl");
    }
    if (!projectId) {
      throw new Error("Missing projectId");
    }
    if (!docName) {
      throw new Error("Missing docName");
    }
    if (!docType) {
      throw new Error("Missing docType");
    }
    if (!Object.values(DocumentTypes).includes(docType as DocumentTypes)) {
      throw new Error("Missing docType");
    }

    // console.log('Fetching MD...');

    // Fetch the MD file content
    const mdResponse = await fetch(mdDocUrl);
    if (!mdResponse.ok) {
      throw new Error(`Failed to fetch MD file: ${mdResponse.statusText}`);
    }
    let mdContent = await mdResponse.text();

    // console.log('MD fetched');

    // Move images and replace image URLs in MD content
    // const sourceContainerName = containerName + "/tmp/images";
    const sourceContainerName = "aiha";
    const destinationContainerName = "images";
    await moveBlobs(sourceContainerName, imagesDir, destinationContainerName);

    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const images = mdContent.match(imageRegex);
    if (images) {
      images.forEach((image) => {
        const imageUrl = image.match(/\((.*?)\)/)?.[1];
        if (imageUrl) {
          const newImageUrl = imageUrl.replace(imagesDir, "${BASE_URL}");
          mdContent = mdContent.replace(imageUrl, newImageUrl);
        }
      });
    }

    // Split the MD content into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 128,
      lengthFunction,
      separators: ["\n\n", "\n", " ", ".", ","],
    });

    const chunks = await splitter.splitDocuments([
      new Document({ pageContent: mdContent }),
    ]);

    // Add new document to the project
    const documentId = uuidv4();
    const newDocument: DBDocumentType = {
      documentId: documentId,
      documentTitle: docName,
      documentType: docType,
      documentUrl: mdDocUrl,
      createdAt: new Date(),
    };
    await addDocumentToProject(projectId, newDocument);
    // console.log('Document added to project');

    // Add the document ID to each chunk, and store the chunks in the database

    const chunkDocumentsPromises = chunks.map(async (chunk) => ({
      documentId,
      projectId,
      content: chunk.pageContent,
      metadata: {
        ...chunk.metadata,
        documentId,
        projectId,
      },
      embedding: (
        await embed({
          model: azure.textEmbeddingModel("text-embedding-3-small"),
          value: chunk.pageContent,
        })
      ).embedding as number[],
      createdAt: new Date(),
    }));

    const chunkDocuments = await Promise.all(chunkDocumentsPromises);
    await addChunksToProject(projectId, documentId, chunkDocuments);
    // console.log('Chunks added to project');

    return NextResponse.json(chunks);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
