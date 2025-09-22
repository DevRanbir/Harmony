import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Chart, { ChartConfig } from '@/components/chart';
import ChartMasonry from '@/components/chart-masonry';

interface FormattedMessageProps {
  content: string;
}

// Helper function to detect and parse chart data from code blocks
function parseChartData(codeContent: string): ChartConfig | null {
  try {
    // Remove any language identifier and trim whitespace
    const cleanedContent = codeContent.replace(/^(json|chart|graph|data)\s*\n?/i, '').trim();
    
    // Try to parse as JSON
    const parsed = JSON.parse(cleanedContent);
    
    // Check if it looks like chart configuration
    if (parsed && typeof parsed === 'object') {
      // Direct chart config format
      if (parsed.type && parsed.data && parsed.xKey) {
        return parsed as ChartConfig;
      }
      
      // Auto-detect simple data arrays and create chart config
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          const keys = Object.keys(firstItem);
          if (keys.length >= 2) {
            // Auto-determine chart type based on data
            const hasNumericValues = keys.some(key => 
              typeof firstItem[key] === 'number'
            );
            
            if (hasNumericValues) {
              const xKey = keys.find(key => typeof firstItem[key] === 'string') || keys[0];
              const yKeys = keys.filter(key => typeof firstItem[key] === 'number');
              
              return {
                type: yKeys.length > 1 ? 'bar' : 'line',
                data: parsed,
                xKey: xKey,
                yKey: yKeys[0],
                dataKeys: yKeys.length > 1 ? yKeys : undefined,
                title: `Data Visualization`
              };
            }
          }
        }
      }
      
      // Handle chart data with metadata
      if (parsed.chartData || parsed.data) {
        const data = parsed.chartData || parsed.data;
        const title = parsed.title || parsed.chartTitle || 'Data Visualization';
        const type = parsed.type || parsed.chartType || 'line';
        
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          const keys = Object.keys(firstItem);
          const xKey = parsed.xKey || keys[0];
          const yKey = parsed.yKey || keys.find(key => typeof firstItem[key] === 'number');
          
          return {
            type: type,
            data: data,
            xKey: xKey,
            yKey: yKey,
            title: title
          };
        }
      }
    }
  } catch (error) {
    // Not valid JSON or chart data
    console.log('Not chart data:', error);
  }
  
  return null;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  // Pre-process content to extract all charts and replace with placeholders
  const chartConfigs: ChartConfig[] = [];
  let processedContent = content;
  
  // Find all JSON code blocks and extract chart data
  const jsonCodeBlockRegex = /```(?:json|data|chart)?\s*\n?([\s\S]*?)\s*```/gi;
  let match;
  let chartIndex = 0;
  
  while ((match = jsonCodeBlockRegex.exec(content)) !== null) {
    const jsonContent = match[1].trim();
    const chartConfig = parseChartData(jsonContent);
    
    if (chartConfig) {
      chartConfigs.push(chartConfig);
      // Replace the code block with a placeholder
      processedContent = processedContent.replace(match[0], `__CHART_PLACEHOLDER_${chartIndex}__`);
      chartIndex++;
    }
  }

  return (
    <div>
      {/* Render charts in masonry layout if any were found */}
      {chartConfigs.length > 0 && (
        <div className="my-6">
          <ChartMasonry charts={chartConfigs} />
          
          {/* Collapsible raw data section */}
          <details className="mt-4">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              View raw data ({chartConfigs.length} chart{chartConfigs.length !== 1 ? 's' : ''})
            </summary>
            <div className="mt-2 space-y-2">
              {chartConfigs.map((config, index) => (
                <div key={index} className="bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/20 rounded-md p-3 overflow-x-auto">
                  <pre className="text-sm">
                    <code>{JSON.stringify(config.data, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Render the markdown content with chart placeholders removed */}
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
          p: ({ children }) => {
            // Remove chart placeholders from paragraph content
            const processedChildren = typeof children === 'string' 
              ? children.replace(/__CHART_PLACEHOLDER_\d+__/g, '').trim()
              : children;
            
            // Don't render empty paragraphs
            if (!processedChildren || processedChildren === '') return null;
            
            return (
              <div className="mb-2 last:mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {processedChildren}
              </div>
            );
          },
          pre: ({ children }) => {
            // Skip rendering pre blocks that were converted to charts
            const codeContent = typeof children === 'string' ? children : 
              React.isValidElement(children) && children.type === 'code' 
                ? String((children.props as any).children || '') 
                : '';
            
            if (typeof codeContent === 'string' && parseChartData(codeContent)) {
              return null; // Skip chart code blocks as they're rendered above
            }
            
            return (
              <div className="bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/20 rounded-md p-3 my-2 overflow-x-auto">
                {children}
              </div>
            );
          },
          code: ({ inline, className, children, ...props }: { node?: unknown; inline?: boolean; className?: string; children?: React.ReactNode }) => {
            // For inline code, just render normally
            if (inline) {
              return (
                <code className="bg-black/5 dark:bg-white/5 border border-white/20 dark:border-white/20 px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              );
            }
            
            // For block code, check if it's chart data and skip if so
            const codeContent = typeof children === 'string' ? children : String(children);
            if (parseChartData(codeContent)) {
              return null; // Skip chart code blocks
            }
            
            return (
              <code className={`block ${className || ''}`} {...props}>
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
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}