"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { campaignStatusData } from "@/lib/mock-data";

export function CampaignDonutChart() {
  const total = campaignStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Campaign Status</CardTitle>
        <p className="text-sm text-muted-foreground">{total} total campaigns</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={campaignStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {campaignStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight">{total}</span>
              <span className="text-xs text-muted-foreground">Campaigns</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3">
            {campaignStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
