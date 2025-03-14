
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { RolePerformance } from "@/lib/agentAnalysis";

interface PerformanceTableProps {
  data: RolePerformance[];
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        <p>No performance data available.</p>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] bg-red-500 text-white">Role</TableHead>
            <TableHead className="bg-red-500 text-white">Rounds</TableHead>
            <TableHead className="bg-red-500 text-white">ACS</TableHead>
            <TableHead className="bg-red-500 text-white">ADR</TableHead>
            <TableHead className="bg-red-500 text-white">K:D</TableHead>
            <TableHead className="bg-red-500 text-white">KAST</TableHead>
            <TableHead className="bg-red-500 text-white">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((role, index) => (
            <TableRow key={index} className={index === 0 ? "bg-red-100 dark:bg-red-900/20" : ""}>
              <TableCell className="font-medium">{role.Role}</TableCell>
              <TableCell>{role["Total Rounds"]}</TableCell>
              <TableCell>{role["Avg ACS"]}</TableCell>
              <TableCell>{role["Avg ADR"]}</TableCell>
              <TableCell>{role["Avg K:D"]}</TableCell>
              <TableCell>{role["Avg KAST"]}%</TableCell>
              <TableCell className="font-bold">{role["Success Score"]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default PerformanceTable;
