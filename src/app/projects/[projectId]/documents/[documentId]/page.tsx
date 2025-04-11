import { getDocumentById } from "@/server/actions/documents";
import { Markdown } from "@/components/markdown";

export default async function DocumentDetailsPage({
  params,
}: {
  params: Promise<{ documentId: string, projectId: string }>;
}) {
  const { documentId, projectId } = await params;
  const document = await getDocumentById(documentId, projectId);

  // Fetch the markdown content
  const mdResponse = await fetch(document.documentMdUrl ?? "");
  const mdContent = await mdResponse.text();

  return (
    <div className="flex h-full w-full gap-4">
      {/* Source document on the left */}
      <div className="w-1/2 overflow-auto rounded-lg border border-border bg-card shadow-sm">
        <div className="p-4">
          <h2 className="mb-4 text-xl font-semibold">{document.documentTitle}</h2>
          {document.documentSourceUrl ? (
            <iframe 
              src={document.documentSourceUrl} 
              className="h-[calc(100vh-16rem)] w-full rounded border border-border"
            />
          ) : (
            <div className="flex h-[calc(100vh-16rem)] items-center justify-center rounded border border-border bg-muted">
              <p className="text-muted-foreground">Source document not available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Markdown content on the right */}
      <div className="w-1/2 overflow-auto rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Document Content</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown>{mdContent}</Markdown>
        </div>
      </div>
    </div>
  );
}
