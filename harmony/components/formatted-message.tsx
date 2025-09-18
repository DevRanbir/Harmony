import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FormattedMessageProps {
  content: string;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="my-4">
            <div className="overflow-x-auto border border-white/20 dark:border-white/20 rounded-md">
              <table className="w-full border-collapse bg-transparent min-w-[600px]">
                {children}
              </table>
            </div>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-r border-b border-white/20 dark:border-white/20 bg-transparent px-4 py-2 text-left font-semibold text-foreground last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-r border-b border-white/20 dark:border-white/20 bg-transparent px-4 py-2 text-foreground last:border-r-0">
            {children}
          </td>
        ),
        thead: ({ children }) => (
          <thead className="bg-transparent [&>tr:last-child>th]:border-b-2">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="bg-transparent [&>tr:last-child>td]:border-b-0">
            {children}
          </tbody>
        ),
        p: ({ children }) => (
          <div className="mb-2 last:mb-0" style={{ whiteSpace: 'pre-wrap' }}>
            {children}
          </div>
        ),
        pre: ({ children }) => (
          <div className="bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/20 rounded-md p-3 my-2 overflow-x-auto">
            {children}
          </div>
        ),
        code: ({ inline, className, children, ...props }: { node?: unknown; inline?: boolean; className?: string; children?: React.ReactNode }) => {
          return !inline ? (
            <code className={`block ${className || ''}`} {...props}>
              {children}
            </code>
          ) : (
            <code className="bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/20 px-1 py-0.5 rounded text-sm" {...props}>
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-white/30 dark:border-white/30 pl-4 my-2 italic text-foreground/70">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-2 text-foreground">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-2 text-foreground">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="my-1 text-foreground">
            {children}
          </li>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-bold my-3 text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold my-2 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-md font-semibold my-2 text-foreground">
            {children}
          </h3>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic">
            {children}
          </em>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}