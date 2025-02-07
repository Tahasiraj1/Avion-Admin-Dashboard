"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { Input } from "./ui/input";
import { searchOrder } from "@/lib/searchOrder";
import { Search } from "lucide-react";
import { BarLoader } from "react-spinners";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TbSelectAll } from "react-icons/tb";
import { PiSelectionAllFill } from "react-icons/pi";
import { Order } from "@/Types/types";



export default function PendingOrders({ orders }: { orders: Order[] }) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Order[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const ordersPerPage = 10;
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BarLoader color="#2A254B" />
      </div>
    );
  }

  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    router.push("/");
    return null;
  }

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = searchResult
    ? searchResult
    : orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Function to handle "Select All"
  const handleSelectAll = () => {
    const allOrderIds = currentOrders.map((order) => order.id); // Extract order IDs from the current page
  
    setSelectedOrders((prev) =>
      allOrderIds.every((id) => prev.includes(id)) // Check if all orders are already selected
        ? prev.filter((id) => !allOrderIds.includes(id)) // Deselect all
        : [...prev, ...allOrderIds.filter((id) => !prev.includes(id))] // Select all
    );
  };
  
  // Check if all orders on the current page are selected
  const isAllSelected = currentOrders.every((order) => selectedOrders.includes(order.id));
  

  const handleConfirmOrders = async () => {
    try {
      setIsConfirming(true);
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedOrders,
          status: "confirmed",
        }),
      });
      setIsConfirming(false);

      if (!response.ok) {
        throw new Error("Failed to confirm orders");
      }

      //// I don't think shipEninge lets you create batches with test API keys... ////

      // const shippingresponse = await fetch("/api/shipping", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     customerDetails: {
      //       firstName: "John",
      //       lastName: "Doe",
      //       phoneNumber: "+1 415-555-5678",
      //       houseNo: "567 Maple St",
      //       city: "San Francisco",
      //       state: "CA",
      //       postalCode: "94107",
      //       country: "US",
      //     },
      //   }),
      // })

      // const data = await shippingresponse.json()

      // if (!data || !data.label_download || !data.label_download.pdf) {
      //   throw new Error("Label PDF URL is missing from ShipEngine response.");
      // }
  


      // // I don't think shipEninge lets you create batches with test API keys...
      // if (data.form_download?.href) {
      //   window.open(data.form_download.href, "_blank");
      //   // Sent Email Using Nodemailer to customer with his order status updation details with tracking number...

      // } else {
      //   console.error("No form download URL found:", data);
      // }

      router.refresh();
      setSelectedOrders([]);
    } catch (error) {
      console.error("Error Confirming orders:", error);
    }
  };

  const handleSearch = async () => {
    if (searchInput.trim()) {
      setIsSearching(true);
      setSearchError(null);
      try {
        const result = await searchOrder(searchInput.trim());
        if (result) {
          setSearchResult(result as Order[]);
        } else {
          setSearchError(`No order found with ID: ${searchInput}`);
          setSearchResult(null);
        }
      } catch (error) {
        console.error("Error searching for order:", error);
        setSearchError(
          `An error occurred while searching for the order: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        setSearchResult(null);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResult(null);
      setSearchError(null);
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchResult(null);
    setSearchError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      clearSearch();
    }
  };


  if (!Array.isArray(orders) && !searchResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <h2 className="text-xl font-semibold text-red-600">
          Error Loading Orders
        </h2>
        <p className="text-gray-500 mt-2">
          There was an error loading the orders. Please try again later.
        </p>
      </div>
    );
  }

  if (orders.length === 0 && !searchResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <PackageSearch className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600">
          No Pending Orders Found
        </h2>
        <p className="text-gray-500 mt-2">Pending Orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <div className="flex items-center justify-between space-x-4 w-full sm:w-auto">
          {!searchResult && (
            <Button
              onClick={handleConfirmOrders}
              disabled={selectedOrders.length === 0}
              className="rounded-md bg-[#2A254B] text-white hover:bg-[#4a4280]"
            >
              {isConfirming ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-400"></div>
              ) : (
                "Confirm & Print Labels"
              )}
            </Button>
          )}
          <div className="relative w-full sm+:w-64">
            <Input
              onKeyDown={handleKeyDown}
              type="text"
              placeholder="Search by Order ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pr-10 rounded-full"
            />
            <Button
              variant="ghost"
              className="absolute right-0 top-0 hover:bg-transparent rounded-full"
              onClick={searchResult ? clearSearch : handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2A254B]"></div>
              ) : searchResult ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {searchError && <div className="text-red-500 mb-4">{searchError}</div>}
      <div className="w-full overflow-x-auto">
        <Table className="w-full border-collapse border border-[#2A254B]">
          <TableHeader>
            <TableRow className="border border-[#2A254B]">
              {!searchResult && (
                <TableHead className="w-16 p-2 text-center">
                  <Button 
                    variant="ghost"
                    className="bg-transparent text-black hover:bg-transparent hover:text-black"
                    onClick={handleSelectAll}
                  >
                    {isAllSelected ? <PiSelectionAllFill /> : <TbSelectAll />}
                  </Button>
                </TableHead>
              )}
              <TableHead className="p-2 hidden md:table-cell">
                Order ID
              </TableHead>
              <TableHead className="p-2">Items</TableHead>
              <TableHead className="p-2 hidden lg:table-cell">
                Customer Details
              </TableHead>
              <TableHead className="p-2 hidden lg:table-cell">
                Address
              </TableHead>
              <TableHead className="p-2">Total</TableHead>
              <TableHead className="p-2">Date</TableHead>
              <TableHead className="p-2 hidden lg:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow
                key={order.id}
                className="border-b border-[#544b94] hover:bg-gray-200"
              >
                {!searchResult && (
                  <TableCell className="p-2 text-center">
                    <Checkbox
                      className="rounded-full"
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => handleOrderSelect(order.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="p-2 hidden md:table-cell">
                  {order.id}
                </TableCell>
                <TableCell className="p-2">
                  <ul className="list-disc list-inside">
                    {order.items.map((item, index) => (
                      <div key={index}>
                        <li
                          key={`${item.name}-${order.id}`}
                        >{`${item.name} (x${item.quantity})`}</li>
                        <li
                          key={`${item.color}-${order.id}`}
                        >{`Color: ${item.color}`}</li>
                        <li
                          key={`${item.size}-${order.id}`}
                        >{`Size: ${item.size}`}</li>
                      </div>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="p-2 hidden lg:table-cell">
                  <ul className="list-disc list-inside space-y-1">
                    <li>{`${order.customerDetails.firstName} ${order.customerDetails.lastName}`}</li>
                    <li>{order.customerDetails.email}</li>
                    <li>{order.customerDetails.phoneNumber}</li>
                  </ul>
                </TableCell>
                <TableCell className="p-2 hidden lg:table-cell">
                  <ul className="list-disc list-inside">
                    <li>{order.customerDetails.city}</li>
                    <li>{order.customerDetails.houseNo}</li>
                    <li>{order.customerDetails.postalCode}</li>
                  </ul>
                </TableCell>
                <TableCell className="p-2">
                  PKR {order.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="p-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="p-2">
                  <span
                    className={`px-2 py-1 hidden lg:table-cell rounded-full text-xs font-semibold ${
                      order.status === "pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : order.status === "confirmed"
                          ? "bg-green-200 text-green-800"
                          : order.status === "dispatched"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 lg:hidden">
        <Accordion type="single" collapsible className="w-full">
          {currentOrders.map((order) => (
            <AccordionItem value={order.id} key={order.id}>
              <AccordionTrigger className="text-sm">
                Order: {order.id} -{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Customer:</strong>{" "}
                    {`${order.customerDetails.firstName} ${order.customerDetails.lastName}`}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.customerDetails.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.customerDetails.phoneNumber}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {`${order.customerDetails.city}, ${order.customerDetails.houseNo}, ${order.customerDetails.postalCode}`}
                  </p>
                  <p>
                    <strong>Total:</strong> PKR {order.totalAmount.toFixed(2)}
                  </p>
                  <div>
                    <strong>Items:</strong>
                    <ul className="list-disc list-inside">
                      {order.items.map((item, index) => (
                        <li
                          key={index}
                        >{`${item.name} (x${item.quantity})`}</li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === "pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : order.status === "confirmed"
                            ? "bg-green-200 text-green-800"
                            : order.status === "dispatched"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {!searchResult && (
        <Pagination className="mt-6">
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem className="cursor-pointer">
              {currentPage > 1 && (
                <PaginationPrevious onClick={() => paginate(currentPage - 1)} />
              )}
            </PaginationItem>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem className="cursor-pointer" key={i}>
                <PaginationLink
                  onClick={() => paginate(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Next Button */}
            <PaginationItem className="cursor-pointer">
              <PaginationNext
                onClick={() => {
                  if (currentPage < totalPages) {
                    paginate(currentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
