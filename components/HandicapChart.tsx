// Line chart component to show handicap progression over time
// Using Recharts library for the chart rendering
"use client"

import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { HandicapHistory } from "@/lib/types"

interface HandicapChartProps {
  data: HandicapHistory[]
}

export function HandicapChart({ data }: HandicapChartProps) {
  // Show message if not enough data for a chart
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500">
        Need at least 3 rounds to display handicap trend
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        {/* Background grid lines */}
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        
        {/* X-axis showing dates */}
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          tick={{ fill: "#94a3b8" }}
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
        />
        
        {/* Y-axis showing handicap values */}
        <YAxis 
          stroke="#94a3b8" 
          tick={{ fill: "#94a3b8" }} 
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        
        {/* Tooltip that shows on hover */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#fff",
          }}
          labelFormatter={(date) =>
            new Date(date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          }
        />
        
        {/* The actual line showing handicap progression */}
        <Line
          type="monotone"
          dataKey="handicap"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: "#10b981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
