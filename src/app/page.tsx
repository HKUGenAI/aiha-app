import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="mb-4 text-4xl font-bold text-foreground">AIHA</h1>
      <h2 className="mb-6 text-2xl text-foreground">AI Historian Assistant</h2>

      <p className="mb-8 max-w-2xl text-muted-foreground">
        Helping researchers analyze and understand multimodal historical
        materials through AI. This site is currently under development.
      </p>

      <div className="mb-12 flex flex-col gap-4 sm:flex-row">
        <Link
          href="https://github.com/HKUGenAI/aiha-app"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Repository
        </Link>
        <Link
          href="/projects"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          View Existing Projects
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        Developed by the{" "}
        <a
          href="mailto:innowing-genai@hku.hk"
          className="text-primary hover:text-primary/80 hover:underline"
        >
          HKU InnoWing GenAI Team
        </a>
      </p>
    </div>
  );
}
