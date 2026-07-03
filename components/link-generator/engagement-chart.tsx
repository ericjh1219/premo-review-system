"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

export type EngagementDatum = {
  name: string;
  value: number;
};

type EngagementChartProps = {
  data: EngagementDatum[];
};

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#111827]">Engagement Distribution</h3>

      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={90}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <YAxis
              domain={[0, 5]}
              tickCount={6}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#6b7280]">
        <span className="size-2.5 rounded-full bg-[#3b82f6]" />
        Engagement
      </div>
    </div>
  );
}
