"use client"

import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsData {
  date: string
  activeUsers: number
  pageViews: number
}

const chartConfig = {
  activeUsers: {
    label: "Active Users",
    color: "hsl(var(--chart-1))",
  },
  pageViews: {
    label: "Page Views",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function AdminBarChart() {
  const [chartData, setChartData] = useState<AnalyticsData[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const data = await response.json()
        console.log("Fetched Data:", data.dailyData);
        setChartData(data.dailyData)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    }

    fetchData()
  }, [])

  if (error) return <div className="flex items-center justify-center">Error: {error}</div>

  return (
    <Card className="font-satoshi">
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const year = value.substring(0, 4);
                  const month = value.substring(4, 6) - 1; // Month is zero-indexed
                  const day = value.substring(6, 8);
                  return new Date(year, month, day).toLocaleDateString();
                }}
              />
              <YAxis yAxisId="left" orientation="left" stroke="var(--color-activeUsers)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-pageViews)" />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="activeUsers" fill="var(--color-activeUsers)" yAxisId="left" />
              <Bar dataKey="pageViews" fill="var(--color-pageViews)" yAxisId="right" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending data for the last 30 days <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Showing active users and page views</div>
      </CardFooter>
    </Card>
  )
}

