import { google } from "googleapis"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/isAdmin"
import { auth } from "@clerk/nextjs/server"

const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON

if (!credentialsJson) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not set")
}

const credentials = JSON.parse(credentialsJson)

const SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
const analyticsPropertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID

if (!analyticsPropertyId) {
  throw new Error("GOOGLE_ANALYTICS_PROPERTY_ID is not set")
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    })

    const analyticsDataClient = google.analyticsdata({
      version: "v1beta",
      auth,
    })

    // Fetch browser data
    const browserResponse = await analyticsDataClient.properties.runReport({
      property: `properties/${analyticsPropertyId}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "browser" }],
        metrics: [{ name: "activeUsers" }],
      },
    })

    const browserData =
      browserResponse.data.rows?.map((row) => ({
        browser: row.dimensionValues?.[0].value?.toLowerCase() || "other",
        visitors: Number.parseInt(row.metricValues?.[0].value || "0", 10),
      })) || []

    // Group "other" browsers
    const mainBrowsers = ["chrome", "safari", "firefox", "edge", "opera"]
    const groupedBrowserData = browserData.reduce(
      (acc, curr) => {
        if (mainBrowsers.includes(curr.browser)) {
          acc.push(curr)
        } else {
          const otherIndex = acc.findIndex((item) => item.browser === "other")
          if (otherIndex > -1) {
            acc[otherIndex].visitors += curr.visitors
          } else {
            acc.push({ browser: "other", visitors: curr.visitors })
          }
        }
        return acc
      },
      [] as { browser: string; visitors: number }[],
    )

    // Fetch daily active users and page views
    const dailyResponse = await analyticsDataClient.properties.runReport({
      property: `properties/${analyticsPropertyId}`,
      requestBody: {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
      },
    })

    const dailyData =
      dailyResponse.data.rows?.map((row) => ({
        date: row.dimensionValues?.[0].value || "",
        activeUsers: Number.parseInt(row.metricValues?.[0].value || "0", 10),
        pageViews: Number.parseInt(row.metricValues?.[1].value || "0", 10),
      })) || []


    // Fetch 3 months active users and page views
    const threeMonthsResponse = await analyticsDataClient.properties.runReport({
        property: `properties/${analyticsPropertyId}`,
        requestBody: {
          dateRanges: [{ startDate: "90daysAgo", endDate: "today" }],
          dimensions: [{ name: "date" }, { name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        },
      })
  
      const threeMonthsData = threeMonthsResponse.data.rows?.reduce(
        (acc, row) => {
          const date = row.dimensionValues?.[0].value || ""
          const deviceCategory = row.dimensionValues?.[1].value?.toLowerCase() || ""
          const activeUsers = Number.parseInt(row.metricValues?.[0].value || "0", 10)
        //   const pageViews = Number.parseInt(row.metricValues?.[1].value || "0", 10)
  
          if (!acc[date]) {
            acc[date] = { date, desktop: 0, mobile: 0 }
          }
  
          if (deviceCategory === "desktop") {
            acc[date].desktop += activeUsers
          } else if (deviceCategory === "mobile") {
            acc[date].mobile += activeUsers
          }
  
          return acc
        },
        {} as Record<string, { date: string; desktop: number; mobile: number }>,
      )
  
      const formattedThreeMonthsData = Object.values(threeMonthsData || {}).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      browserData: groupedBrowserData,
      dailyData: dailyData,
      threeMonthsData: formattedThreeMonthsData,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching Google Analytics data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}

