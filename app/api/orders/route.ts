import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();

  // Check for authentication
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  console.log("GET request received for orders");

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("id");

    const where: { id?: string; status?: string } = {};
    if (status) where.status = status;
    if (orderId) where.id = orderId;

    const order = await prisma.order.findMany({
      where,
      include: {
        customerDetails: true,
        items: true,
      },
    });

    if (!order) {
      console.log(`No order found with ID: ${orderId}`);
      return NextResponse.json(
        { success: false, message: "No order found" },
        { status: 404 }
      );
    }

    console.log("Returning single order:", JSON.stringify(order, null, 2));
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log("Received update data:", JSON.stringify(body, null, 2));

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0 || typeof status !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid update data" },
        { status: 400 }
      );
    }

    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status,
      },
    });

    console.log(
      "Orders updated successfully:",
      JSON.stringify(updatedOrders, null, 2)
    );

    return NextResponse.json(
      { success: true, updatedCount: updatedOrders.count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating orders:", error);

    let errorMessage = "An unexpected error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update orders",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
