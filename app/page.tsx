import React, { Suspense } from "react";
import AdminBarChart from "@/components/BarChart";
import AdminPieChart from "@/components/PieChart";
import AdminFullBarChart from "@/components/AreaChart";
import { BarLoader } from "react-spinners";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const AdminDashboard = async () => {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-clashDisplay mb-4">Admin Dashboard</h1>
      <Suspense fallback={<BarLoader color="#2A254B" />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-5">
          <AdminBarChart />
          <AdminPieChart />
        </div>
        <AdminFullBarChart />
      </Suspense>
    </div>
  );
};

export default AdminDashboard;
