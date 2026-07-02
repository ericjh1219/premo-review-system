"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reviewTrendData } from "@/lib/mock-data";

export function ReviewsAreaChart() {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Review Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly review volume over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reviewTrendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis
                dataKey="month"
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
              <Area
                type="monotone"
                dataKey="reviews"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#reviewGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
