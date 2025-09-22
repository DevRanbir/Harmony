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

  // Responsive dimensions based on screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const chartHeight = config.height || (isMobile ? 300 : 400);

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
      width: config.width || (isMobile ? 350 : 600),
      height: chartHeight,
      data: config.data,
      margin: isMobile 
        ? { top: 10, right: 15, left: 10, bottom: 10 }
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
        return (
          <PieChart {...commonProps}>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
              outerRadius={150}
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
    <div className={`w-full ${className}`}>
      {config.title && (
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          {config.title}
        </h3>
      )}
      <div className="bg-transparent rounded-lg border border-border/30 p-4 transition-none">
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={chartHeight} minWidth={300}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Chart type indicator */}
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-border/20">
          <span className="text-xs text-muted-foreground bg-background/20 px-2 py-1 rounded-full">
            {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Chart
          </span>
        </div>
      </div>
    </div>
  );
};

export default Chart;