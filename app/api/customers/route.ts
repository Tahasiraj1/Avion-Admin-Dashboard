import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

async function isAdmin(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata.role === "admin";
}

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
      // Fetch all customers with their orders and order items
      const customers = await prisma.customerDetails.findMany({
        include: {
          orders: {
            include: {
              items: true, // Fetch the order items
            },
          },
        },
      });
  
      // Create a map to aggregate customers by customerDetailsId (to avoid duplicates)
      const customerMap: Map<string, { customer: object; totalPurchases: number }> =
        new Map();
  
      customers.forEach((customer) => {
        // Aggregate purchases by customerDetailsId (assuming `customerDetailsId` uniquely identifies a customer)
        const customerId = customer.email;
  
        if (customerMap.has(customerId)) {
          const existingCustomer = customerMap.get(customerId);
          // Add up the items purchased from this order
          existingCustomer!.totalPurchases += customer.orders.reduce(
            (acc, order) => acc + order.items.length,
            0
          );
        } else {
          // Otherwise, create a new entry for this customer and sum their purchases
          const totalPurchases = customer.orders.reduce(
            (acc, order) => acc + order.items.length,
            0
          );
          customerMap.set(customerId, { customer, totalPurchases });
        }
      });
  
      // Convert the map values to an array of customers
      const customersWithPurchases = Array.from(customerMap.values()).map(
        (entry) => ({
          ...entry.customer,
          totalPurchases: entry.totalPurchases,
        })
      );
  
      console.log(
        "Fetched customers:",
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
  
