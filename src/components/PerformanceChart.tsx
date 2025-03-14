
import React from "react";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RolePerformance } from "@/lib/agentAnalysis";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PerformanceChartProps {
  data: RolePerformance[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        <p>No performance data available.</p>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = data.map(role => ({
    name: role.Role,
    acs: role["Avg ACS"],
    adr: role["Avg ADR"],
    kd: role["Avg K:D"] * 100, // Scale K:D for better visualization
    kast: role["Avg KAST"],
    score: role["Success Score"] * 10 // Scale score for better visualization
  }));

  const config = {
    acs: { label: "ACS", color: "#ef4444" },
    adr: { label: "ADR", color: "#f97316" },
    kd: { label: "K:D", color: "#84cc16" },
    kast: { label: "KAST", color: "#06b6d4" },
    score: { label: "Score", color: "#8b5cf6" }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">Performance Metrics by Role</h3>
      <div className="h-[300px] w-full">
        <ChartContainer config={config}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="acs" fill="#ef4444" name="ACS" />
            <Bar dataKey="adr" fill="#f97316" name="ADR" />
            <Bar dataKey="kd" fill="#84cc16" name="K:D (x100)" />
            <Bar dataKey="kast" fill="#06b6d4" name="KAST %" />
            <Bar dataKey="score" fill="#8b5cf6" name="Score (x10)" />
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

export default PerformanceChart;
