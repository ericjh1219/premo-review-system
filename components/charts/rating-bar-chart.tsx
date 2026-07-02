"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ratingDistribution } from "@/lib/mock-data";

export function RatingBarChart() {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Rating Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">Breakdown by star rating</p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDistribution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis
                dataKey="rating"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
