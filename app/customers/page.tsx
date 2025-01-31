"use client";

import { useState, useEffect } from "react";
import { BarLoader } from "react-spinners";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

interface CustomerDetails {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  city: string;
  houseNo: string;
  postalCode: string;
  country: string;
  totalPurchases: number;
  avatarUrl: string;
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers", { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json();

        if (response.ok) {
          setCustomers(data.data);
        } else {
          setError(data.error || "Failed to fetch customers");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BarLoader color="#2A254B" />
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 text-2xl">
        Error: {error}
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers List</h1>
      <Table className="min-w-full border-collapse border border-gray-300">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-gray-300 px-4 py-2">Avatar</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">First Name</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">Last Name</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">Email</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">Phone Number</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">City</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">Country</TableHead>
            <TableHead className="border border-gray-300 px-4 py-2">Purchases</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="border border-gray-300 px-4 py-2">
                <Image
                src={customer.avatarUrl}
                alt={customer.firstName}
                width={30}
                height={30}
                className="rounded-sm"
                />
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.firstName}
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.lastName}
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.email}
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.phoneNumber}
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.city}
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.country}
              </TableCell>
              <TableCell className="border border-gray-300 px-4 py-2">
                {customer.totalPurchases}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomersPage;
