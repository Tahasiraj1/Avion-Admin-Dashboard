"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ChartData {
  browser: string
  visitors: number
  fill: string
}

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-0))",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function AdminPieChart() {
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }
        const data = await response.json()
        const formattedData = data.browserData.map((item: { browser: string; visitors: number }) => ({
          ...item,
          fill: chartConfig[item.browser as keyof typeof chartConfig]?.color || chartConfig.other.color,
        }))
        setChartData(formattedData)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      }
    }

    fetchData()
  }, [])

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [chartData])

  if (error) return <div className="flex items-center justify-center">Error: {error}</div>

  return (
    <Card className="flex flex-col font-satoshi">
      <CardHeader className="items-center pb-0">
        <CardTitle>Browser Usage</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto w-full aspect-square max-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="browser"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                            Visitors
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Showing total visitors for the last 30 days</div>
      </CardFooter>
    </Card>
  )
}

