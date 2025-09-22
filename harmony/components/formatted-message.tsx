import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Chart, { ChartConfig } from '@/components/chart';
import ChartMasonry from '@/components/chart-masonry';
import { CopyToImageButton } from '@/components/copy-to-image-button';
import { useIsMobile } from '@/hooks/use-mobile';

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
            // Auto-determine chart type based on data structure
            const stringKeys = keys.filter(key => typeof firstItem[key] === 'string');
            const numericKeys = keys.filter(key => typeof firstItem[key] === 'number');
            
            if (numericKeys.length > 0) {
              const xKey = stringKeys[0] || keys[0];
              const yKey = numericKeys[0];
              
              // Determine optimal chart type based on data characteristics
              let chartType: ChartConfig['type'] = 'bar';
              
              // If we have one string field and one numeric field, good for pie chart
              if (stringKeys.length === 1 && numericKeys.length === 1) {
                chartType = 'pie';
              }
              // If we have multiple numeric fields, use bar chart
              else if (numericKeys.length > 1) {
                chartType = 'bar';
              }
              // If the x-axis looks like a time series or continuous data, use line chart
              else if (parsed.length > 3 && typeof firstItem[xKey] === 'string') {
                const xValues = parsed.map(item => item[xKey]).filter(val => val);
                const isDateLike = xValues.some(val => 
                  /\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(val)
                );
                if (isDateLike) chartType = 'line';
              }
              
              return {
                type: chartType,
                data: parsed,
                xKey: xKey,
                yKey: yKey,
                dataKeys: numericKeys.length > 1 ? numericKeys : undefined,
                title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
              };
            }
          }
        }
      }
      
      // Handle chart data with metadata
      if (parsed.chartData || parsed.data) {
        const data = parsed.chartData || parsed.data;
        const title = parsed.title || parsed.chartTitle || 'Data Visualization';
        const type = parsed.type || parsed.chartType || 'bar';
        
        if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          if (typeof firstItem === 'object' && firstItem !== null) {
            const keys = Object.keys(firstItem);
            const stringKeys = keys.filter(key => typeof firstItem[key] === 'string');
            const numericKeys = keys.filter(key => typeof firstItem[key] === 'number');
            
            const xKey = parsed.xKey || stringKeys[0] || keys[0];
            const yKey = parsed.yKey || numericKeys[0] || keys.find(key => typeof firstItem[key] === 'number');
            
            return {
              type: type as ChartConfig['type'],
              data: data,
              xKey: xKey,
              yKey: yKey,
              dataKeys: numericKeys.length > 1 ? numericKeys : undefined,
              title: title
            };
          }
        }
      }
      
      // Handle object format like { "Category A": 10, "Category B": 20 }
      if (!Array.isArray(parsed) && Object.keys(parsed).length > 0) {
        const entries = Object.entries(parsed);
        const hasNumericValues = entries.every(([key, value]) => 
          typeof value === 'number' && !isNaN(value)
        );
        
        if (hasNumericValues) {
          const data = entries.map(([key, value]) => ({
            name: key,
            value: value as number
          }));
          
          return {
            type: 'pie',
            data: data,
            xKey: 'name',
            yKey: 'value',
            title: 'Data Distribution'
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
  const isMobile = useIsMobile();
  
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

  // Remove all chart placeholders from the final content
  processedContent = processedContent.replace(/__CHART_PLACEHOLDER_\d+__/g, '').trim();

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
          table: ({ children }) => {
            const TableComponent = () => {
              const tableRef = React.useRef<HTMLDivElement>(null);
              
              return (
                <div className={`my-6 ${isMobile ? 'flex flex-col items-center' : ''}`}>
                  <div className="relative group w-full flex justify-center">
                    <div 
                      ref={tableRef}
                      className={`overflow-x-auto border border-border/30 rounded-lg bg-card/50 backdrop-blur-sm shadow-sm ${
                        isMobile ? 'max-w-[calc(100vw-1rem)] w-full' : ''
                    }`}
                  >
                    <table className={`w-full border-collapse bg-transparent ${
                      isMobile ? 'min-w-full text-sm' : 'min-w-[600px]'
                    }`}>
                      {children}
                    </table>
                  </div>
                  
                  {/* Copy button - shows on hover, hidden on mobile for better touch experience */}
                  {!isMobile && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CopyToImageButton
                        targetRef={tableRef}
                        filename="table"
                        variant="outline"
                        size="sm"
                        className="bg-background/80 backdrop-blur-sm border-border/40 hover:bg-accent shadow-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Table description */}
                <div className={`mt-2 text-muted-foreground flex items-center gap-2 ${isMobile ? 'text-xs justify-center' : 'text-xs'}`}>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-6 h-6 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" d="M3 11h18m-9 0v8m-8 0h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"/>
                    </svg>
                    Table
                  </span>
                  {!isMobile && (
                    <>
                      <span className="text-muted-foreground/60">•</span>
                      <span>Hover to copy as image</span>
                    </>
                  )}
                </div>
              </div>
              );
            };
            
            return <TableComponent />;
          },
          th: ({ children }) => (
            <th className={`border-r border-b border-border/30 bg-muted/30 text-left font-semibold text-foreground last:border-r-0 ${
              isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3'
            }`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`border-r border-b border-border/20 bg-transparent text-foreground last:border-r-0 hover:bg-muted/20 transition-colors ${
              isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3'
            }`}>
              {children}
            </td>
          ),
          thead: ({ children }) => (
            <thead className="bg-transparent [&>tr:last-child>th]:border-b-2 [&>tr:last-child>th]:border-border/40">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-transparent [&>tr:last-child>td]:border-b-0 [&>tr:hover]:bg-muted/10">
              {children}
            </tbody>
          ),
          p: ({ children }) => {
            // Handle both string and React element children
            let processedChildren;
            
            if (typeof children === 'string') {
              processedChildren = children.replace(/__CHART_PLACEHOLDER_\d+__/g, '').trim();
            } else if (React.isValidElement(children)) {
              // If it's a React element, check its content
              const childContent = String((children.props as Record<string, unknown>)?.children || '');
              if (/__CHART_PLACEHOLDER_\d+__/.test(childContent)) {
                return null;
              }
              processedChildren = children;
            } else if (Array.isArray(children)) {
              // Filter out any chart placeholders from children array
              processedChildren = children.filter(child => {
                if (typeof child === 'string') {
                  return !/__CHART_PLACEHOLDER_\d+__/.test(child);
                }
                return true;
              });
              if (processedChildren.length === 0) return null;
            } else {
              processedChildren = children;
            }
            
            // Don't render empty paragraphs
            if (!processedChildren || 
                (typeof processedChildren === 'string' && processedChildren === '') ||
                (Array.isArray(processedChildren) && processedChildren.length === 0)) {
              return null;
            }
            
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
                ? String((children.props as Record<string, unknown>).children || '') 
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