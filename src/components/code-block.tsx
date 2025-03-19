"use client";

// import { useState } from 'react';
// import { CodeIcon, LoaderIcon, PlayIcon, PythonIcon } from './icons';
// import { Button } from './ui/button';
// import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
// import { cn } from '~/lib/utils';
import { CopyIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface CodeBlockProps {
  node: never;
  inline: boolean;
  className: string;
  children: never;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  // const [output, setOutput] = useState<string | null>(null);
  // const [tabs, setTabs] = useState<string[]>(['code', 'run']);
  const tab = "code";
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";

  const handleCopy = async () => {
    const text = String(children);
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (!match) {
    return (
      <code
        className={`${className} rounded-md bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-800`}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="not-prose my-4 flex flex-col">
      <pre className="rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between rounded-t-xl border-b-0 bg-muted px-4 py-0.5">
          <span className="text-xs font-medium text-muted-foreground">
            {language}
          </span>
          <button className="h-6 w-6" onClick={handleCopy}>
            <CopyIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        {tab === "code" && (
          <pre
            {...props}
            className={`w-full overflow-x-auto rounded-xl border border-zinc-200 p-4 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50`}
          >
            <code>{children}</code>
          </pre>
        )}

        {/* {tab === 'run' && output && (
          <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
            <code>{output}</code>
          </div>
        )} */}
      </pre>
    </div>
  );
}
