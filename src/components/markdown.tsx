import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { CodeBlock } from "./code-block";

const components: Partial<Components> = {
  // @ts-expect-error - `node` is not used
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="ml-8 list-outside list-decimal" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="my-1 ml-8 list-outside list-decimal" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error - `node` is not used
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="mb-2 mt-6 text-3xl font-semibold" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="mb-2 mt-6 text-2xl font-semibold" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="mb-2 mt-6 text-xl font-semibold" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="mb-2 mt-6 text-lg font-semibold" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="mb-2 mt-6 text-base font-semibold" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="mb-2 mt-6 text-sm font-semibold" {...props}>
        {children}
      </h6>
    );
  },
  hr: ({ node, children, ...props }) => {
    return <hr className="my-4" {...props} />;
  },
  img: ({ node, ...props }) => {
    return <img className="max-h-[35rem] max-w-[40rem]" {...props} />;
  },
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="leading-relaxed flex flex-col gap-2">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
