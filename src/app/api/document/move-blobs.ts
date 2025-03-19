import { BlobServiceClient } from "@azure/storage-blob";

export async function moveBlobs(
  sourceContainerName: string,
  sourceImagesDir: string,
  destinationContainerName: string,
) {
  try {
    // Create BlobServiceClient
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error("Azure Storage Connection String is not defined");
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );
    console.log("BlobServiceClient created");

    const sourceContainerClient =
      blobServiceClient.getContainerClient(sourceContainerName);
    console.log(
      "Source container client created",
      sourceContainerClient.containerName,
      await sourceContainerClient.exists(),
    );
    const destinationContainerClient = blobServiceClient.getContainerClient(
      destinationContainerName,
    );
    console.log(
      "Destination container client created",
      destinationContainerClient.containerName,
      await destinationContainerClient.exists(),
    );

    // Ensure source container exists
    if (!(await sourceContainerClient.exists())) {
      throw new Error(
        `Source container ${sourceContainerName} does not exist.`,
      );
    }

    // Ensure destination container exists
    await destinationContainerClient.createIfNotExists();

    console.log(
      `Moving blobs from ${sourceContainerName} to ${destinationContainerName}...`,
    );

    // List blobs in the source container
    for await (const blob of sourceContainerClient.listBlobsFlat({
      prefix: sourceImagesDir,
    })) {
      const sourceBlobClient = sourceContainerClient.getBlobClient(blob.name);
      const destinationBlobClient =
        destinationContainerClient.getBlockBlobClient(
          blob.name.replace(sourceImagesDir, ""),
        );

      if (await destinationBlobClient.exists()) {
        console.log(
          `Skipping: ${blob.name} - already exists in destination container`,
        );
        continue; // Skip to the next blob
      }

      // Copy the blob to the destination
      const copyPoller = await destinationBlobClient.beginCopyFromURL(
        sourceBlobClient.url,
      );
      await copyPoller.pollUntilDone();
      // Add tags to the destination blob
      await destinationBlobClient.setTags({
        sourceBlob: blob.name,
      });
      console.log(`Copied: ${blob.name}`);

      // Delete the original blob
      // await sourceBlobClient.delete();
      // console.log(`Deleted from source: ${blob.name}`);
    }

    console.log("All blobs moved successfully!");
  } catch (err) {
    const error = err as Error;
    console.error("Error moving blobs:", error.message);
  }
}
