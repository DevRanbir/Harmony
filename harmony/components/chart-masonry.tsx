"use client";

import React from "react";
import Chart, { ChartConfig } from "./chart";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChartMasonryProps {
  charts: ChartConfig[];
  className?: string;
}

const ChartMasonry: React.FC<ChartMasonryProps> = ({ charts, className = "" }) => {
  const isMobile = useIsMobile();
  
  if (charts.length === 0) return null;

  // For single chart, render normally
  if (charts.length === 1) {
    return (
      <div className={`w-full ${className}`}>
        <Chart config={charts[0]} />
      </div>
    );
  }

  // Helper function to determine charts per row based on total count
  const getChartsPerRow = (totalCharts: number): number => {
    if (isMobile) {
      // On mobile, always use single column layout for better readability
      return 1;
    }
    
    // Desktop behavior - optimized for up to 4 charts
    if (totalCharts <= 2) return totalCharts;
    if (totalCharts === 3) return 3; // Show 3 in a single row
    if (totalCharts === 4) return 2; // Show 4 in a 2x2 grid (2 per row)
    return 3; // For 5+ charts, use 3 per row
  };

  // Helper function to render charts in rows (left to right, then next row)
  const renderChartRows = (chartList: ChartConfig[]) => {
    const rows: React.ReactElement[] = [];
    const chartsPerRow = getChartsPerRow(chartList.length);
    
    for (let i = 0; i < chartList.length; i += chartsPerRow) {
      const rowCharts = chartList.slice(i, i + chartsPerRow);
      
      // Special spacing for 4-chart 2x2 grid
      const gapClass = chartList.length === 4 ? "gap-3" : "gap-4";
      
      rows.push(
        <div 
          key={`row-${i}`}
          className={`grid ${gapClass}`}
          style={{
            gridTemplateColumns: `repeat(${rowCharts.length}, 1fr)`,
          }}
        >
          {rowCharts.map((chart, index) => {
            const globalIndex = i + index;
            const adjustedChart = {
              ...chart,
              height: getOptimalHeight(chart, globalIndex, chartList.length, isMobile)
            };
            
            return (
              <div 
                key={globalIndex}
                className="w-full min-w-0"
              >
                <Chart config={adjustedChart} />
              </div>
            );
          })}
        </div>
      );
    }
    
    return rows;
  };

  // For multiple charts, use row-first masonry layout
  return (
    <div className={`w-full ${className}`}>
      <div className={charts.length === 4 ? "space-y-3" : "space-y-4"}>
        {renderChartRows(charts)}
      </div>
    </div>
  );
};

// Helper function to get optimal height for masonry layout
const getOptimalHeight = (chart: ChartConfig, index: number, totalCharts: number, isMobile: boolean): number => {
  // If height is already specified, use it
  if (chart.height) return chart.height;
  
  // Default heights based on chart type for better visual balance
  const baseHeights = {
    line: isMobile ? 250 : 320,
    area: isMobile ? 250 : 320,
    bar: isMobile ? 230 : 300,
    pie: isMobile ? 300 : 380, // Increased height for pie charts to accommodate labels and legend
    scatter: isMobile ? 230 : 300
  };
  
  let height = baseHeights[chart.type] || (isMobile ? 250 : 320);
  
  // Special handling for 4 charts in 2x2 grid - make them more uniform (desktop only)
  if (totalCharts === 4 && !isMobile) {
    // Use consistent height for 2x2 grid layout
    height = chart.type === 'pie' ? 360 : 300;
  }
  // Slightly vary heights for better masonry effect only if we have multiple charts (but not 4) and not mobile
  else if (totalCharts > 1 && totalCharts !== 4 && !isMobile) {
    const variations = [0, 20, -20, 30, -30];
    height += variations[index % variations.length];
  }
  
  // Ensure minimum height
  return Math.max(height, isMobile ? 200 : 280);
};

export default ChartMasonry;