// @ts-nocheck
import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();

async function indexVectorStore() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Invalid/Missing environment variable: 'MONGODB_URI'");
  }
  const client = new MongoClient(uri);
  try {
    const database = client.db("aiha");
    const collection = database.collection("chunks");

    // define Atlas Vector Search index
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            numDimensions: 1536,
            path: "embedding",
            similarity: "dotProduct",
            quantization: "scalar",
          },
          {
            type: "filter",
            path: "metadata.projectId",
          },
          {
            type: "filter",
            path: "metadata.documentId",
          },
        ],
      },
    };

    // run the helper method
    const result = await collection.createSearchIndex(index);
    console.log(`New search index named ${result} is building.`);

    // wait for the index to be ready to query
    console.log(
      "Polling to check if the index is ready. This may take up to a minute.",
    );
    let isQueryable = false;
    while (!isQueryable) {
      const cursor = collection.listSearchIndexes();
      for await (const index of cursor) {
        if (index.name === result) {

          if (index.queryable) {
            console.log(`${result} is ready for querying.`);
            isQueryable = true;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }
    }
  } finally {
    await client.close();
  }
}

indexVectorStore().catch(console.dir);
