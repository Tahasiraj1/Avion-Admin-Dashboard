import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";

export async function GET() {
  const { userId } = await auth();

  // Authentication check
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin authorization check
  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("GET request received for customers");

  try {
    // Fetch all orders, including customer details and order items
    const orders = await prisma.order.findMany({
      include: {
        customerDetails: true, // Include customer details for each order
        items: true, // Include order items
      },
    });

    // Create a map to aggregate customers by clerkId (to avoid duplicates)
    const customerMap: Map<
      string,
      { customer: object; totalPurchases: number; avatarUrl: string }
    > = new Map();

    // Fetch all users from Clerk to get their avatars
    const client = await clerkClient();
    const response = await client.users.getUserList();
    const users = response.data;

    // Create a map of clerkId to avatarUrl for easier lookup
    const userAvatars: Map<string, string> = new Map();
    users.forEach((user) => {
      const avatarUrl = user.imageUrl;
      const clerkId = user.id; 
      if (avatarUrl && clerkId) {
        userAvatars.set(clerkId, avatarUrl);
      }
    });

    // Aggregate orders and associate avatars
    orders.forEach((order) => {
      const clerkId = order.clerkId; // Use clerkId to aggregate orders by customer

      if (customerMap.has(clerkId)) {
        const existingCustomer = customerMap.get(clerkId);
        // Add up the items purchased in this order
        existingCustomer!.totalPurchases += order.items.length;
      } else {
        // Otherwise, create a new entry for this clerkId and sum their purchases
        const totalPurchases = order.items.length;
        const avatarUrl = userAvatars.get(clerkId) || ""; // Get avatarUrl, or fallback to empty string
        customerMap.set(clerkId, {
          customer: order.customerDetails,
          totalPurchases,
          avatarUrl,
        });
      }
    });

    // Convert the map values to an array of customers
    const customersWithPurchases = Array.from(customerMap.values()).map(
      (entry) => ({
        ...entry.customer,
        totalPurchases: entry.totalPurchases,
        avatarUrl: entry.avatarUrl, // Add avatar URL to customer data
      })
    );

    console.log(
      "Fetched customers with total purchases:",
      JSON.stringify(customersWithPurchases, null, 2)
    );

    return NextResponse.json({ success: true, data: customersWithPurchases });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
