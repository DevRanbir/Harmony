"use client";

import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts";
import { useTheme } from "@/contexts/theme-context";
import { CopyToImageButton } from "@/components/copy-to-image-button";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartConfig {
  title?: string;
  type: "line" | "area" | "bar" | "pie" | "scatter";
  data: ChartDataPoint[];
  xKey: string;
  yKey?: string;
  dataKeys?: string[];
  colors?: string[];
  width?: number;
  height?: number;
}

interface ChartProps {
  config: ChartConfig;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({ config, className = "" }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const chartRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Responsive dimensions based on screen size
  const isTablet = typeof window !== 'undefined' && window.innerWidth < 1024 && !isMobile;
  const chartHeight = config.height || (isMobile ? 250 : isTablet ? 320 : 400);

  // Theme-based color palette
  const getThemeColors = () => {
    if (isDark) {
      return {
        grid: "#374151",
        text: "#E5E7EB",
        background: "transparent",
        tooltipBg: "#1F2937E6", // Semi-transparent
        primary: "#60A5FA",
        secondary: "#F59E0B",
        accent: "#10B981",
        muted: "#9CA3AF",
      };
    } else {
      return {
        grid: "#D1D5DB",
        text: "#374151",
        background: "transparent",
        tooltipBg: "#FFFFFFE6", // Semi-transparent
        primary: "#3B82F6",
        secondary: "#F59E0B",
        accent: "#059669",
        muted: "#6B7280",
      };
    }
  };

  const colors = getThemeColors();
  
  // Default color palette for multiple data series
  const defaultColors = [
    colors.primary,
    colors.secondary,
    colors.accent,
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#84CC16", // lime
  ];

  const chartColors = config.colors || defaultColors;

  // Custom tooltip component with theme support
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg border border-border/40 backdrop-blur-sm p-3 shadow-lg"
          style={{
            backgroundColor: colors.tooltipBg,
            borderColor: colors.grid,
          }}
        >
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render different chart types
  const renderChart = (): React.ReactElement => {
    const commonProps = {
      width: config.width || (isMobile ? 320 : isTablet ? 500 : 600),
      height: chartHeight,
      data: config.data,
      margin: isMobile 
        ? { top: 8, right: 10, left: 5, bottom: 8 }
        : isTablet
        ? { top: 15, right: 20, left: 15, bottom: 15 }
        : { top: 20, right: 30, left: 20, bottom: 20 },
    };

    switch (config.type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey={config.xKey}
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.dataKeys?.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ fill: chartColors[index % chartColors.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            )) || (
              <Line
                type="monotone"
                dataKey={config.yKey || "value"}
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              {config.dataKeys?.map((key, index) => (
                <linearGradient key={key} id={`colorArea${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1}/>
                </linearGradient>
              )) || (
                <linearGradient id="colorArea0" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey={config.xKey}
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.dataKeys?.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                fillOpacity={1}
                fill={`url(#colorArea${index})`}
              />
            )) || (
              <Area
                type="monotone"
                dataKey={config.yKey || "value"}
                stroke={colors.primary}
                fillOpacity={1}
                fill="url(#colorArea0)"
              />
            )}
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              dataKey={config.xKey}
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {config.dataKeys?.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                radius={[2, 2, 0, 0]}
              />
            )) || (
              <Bar
                dataKey={config.yKey || "value"}
                fill={colors.primary}
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        );

      case "pie":
        // Calculate responsive radius based on container size
        const maxRadius = Math.min(
          (config.width || (isMobile ? 320 : isTablet ? 500 : 600)) / 3,
          chartHeight / 3
        );
        const pieRadius = Math.min(maxRadius, isMobile ? 65 : isTablet ? 90 : 120);
        
        return (
          <PieChart {...commonProps}>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
              outerRadius={pieRadius}
              fill={colors.primary}
              dataKey={config.yKey || "value"}
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis
              type="number"
              dataKey={config.xKey}
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey={config.yKey || "value"}
              stroke={colors.text}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={config.data}
              fill={colors.primary}
            />
          </ScatterChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`w-full ${isMobile ? 'mb-4 flex flex-col items-center' : ''} ${className}`}>
      {config.title && (
        <h3 className={`font-semibold text-foreground mb-4 text-center ${isMobile ? 'text-base' : 'text-lg'}`}>
          {config.title}
        </h3>
      )}
      
      <div className="relative group w-full flex justify-center">
        <div 
          ref={chartRef}
          className={`bg-transparent rounded-lg border border-border/30 transition-none ${
            isMobile ? 'p-1 w-full max-w-[calc(100vw-1rem)]' : 'p-4'
          }`}
        >
          <div className="w-full overflow-hidden flex justify-center">
            <ResponsiveContainer 
              width="100%" 
              height={chartHeight} 
              minWidth={isMobile ? 280 : config.type === 'pie' ? 350 : 300}
              minHeight={isMobile ? 200 : config.type === 'pie' ? 350 : 250}
            >
              {renderChart()}
            </ResponsiveContainer>
          </div>

        </div>
        
        {/* Copy button - shows on hover, hidden on mobile for better touch experience */}
        {!isMobile && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <CopyToImageButton
              targetRef={chartRef}
              filename={`${config.type}-chart`}
              variant="outline"
              size="sm"
              showText={true}
              className="bg-background/80 backdrop-blur-sm border-border/40 hover:bg-accent shadow-sm"
            />
          </div>
        )}
      </div>
      
      {/* Chart description */}
      <div className={`mt-2 text-muted-foreground flex items-center gap-2 ${isMobile ? 'text-xs justify-center' : 'text-xs'}`}>
        <span className="inline-flex items-center gap-1">
          <svg className="w-6 h-6 text-gray-400 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z"/>
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z"/>
          </svg>

          {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Chart
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

export default Chart;