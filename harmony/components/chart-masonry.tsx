"use client";

import React from "react";
import Chart, { ChartConfig } from "./chart";

interface ChartMasonryProps {
  charts: ChartConfig[];
  className?: string;
}

const ChartMasonry: React.FC<ChartMasonryProps> = ({ charts, className = "" }) => {
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
    // Check for mobile screen size
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    if (isMobile) {
      // On mobile, use fewer charts per row
      if (totalCharts <= 2) return 1;
      return 2;
    }
    
    // Desktop behavior
    if (totalCharts <= 2) return totalCharts;
    if (totalCharts <= 4) return 2;
    return 3; // For 5+ charts, use 3 per row
  };

  // Helper function to render charts in rows (left to right, then next row)
  const renderChartRows = (chartList: ChartConfig[]) => {
    const rows: React.ReactElement[] = [];
    const chartsPerRow = getChartsPerRow(chartList.length);
    
    for (let i = 0; i < chartList.length; i += chartsPerRow) {
      const rowCharts = chartList.slice(i, i + chartsPerRow);
      
      rows.push(
        <div 
          key={`row-${i}`}
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${rowCharts.length}, 1fr)`,
          }}
        >
          {rowCharts.map((chart, index) => {
            const globalIndex = i + index;
            const adjustedChart = {
              ...chart,
              height: getOptimalHeight(chart, globalIndex, chartList.length)
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
      <div className="space-y-4">
        {renderChartRows(charts)}
      </div>
    </div>
  );
};

// Helper function to get optimal height for masonry layout
const getOptimalHeight = (chart: ChartConfig, index: number, totalCharts: number): number => {
  // If height is already specified, use it
  if (chart.height) return chart.height;
  
  // Default heights based on chart type for better visual balance
  const baseHeights = {
    line: 320,
    area: 320,
    bar: 300,
    pie: 350,
    scatter: 300
  };
  
  let height = baseHeights[chart.type] || 320;
  
  // For mobile screens, reduce height slightly
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    height = Math.max(height - 40, 280);
  }
  
  // Slightly vary heights for better masonry effect only if we have multiple charts
  if (totalCharts > 1) {
    const variations = [0, 20, -20, 30, -30];
    height += variations[index % variations.length];
  }
  
  // Ensure minimum height
  return Math.max(height, 280);
};

export default ChartMasonry;