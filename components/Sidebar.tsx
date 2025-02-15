"use client"
import { Package, ShoppingCart, Users, BarChart, Settings, ShoppingBag, Truck, ExternalLink } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { SignOutButton } from "@clerk/nextjs"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


const sidebarItems = [
  { icon: BarChart, label: "Analytics", href: "/" },
  { icon: Package, label: "Products", href: "/studio" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: ShoppingCart, label: "Pending Orders", href: "/pending-orders" },
  { icon: ShoppingBag, label: "Confirmed Orders", href: "/confirmed-orders" },
  { icon: Truck, label: "Dispatched Orders", href: "/dispatched-orders" },
  {
    icon: ExternalLink,
    label: "Website",
    href: "https://hackathon-2-flax.vercel.app/",
    target: "_blank",
  },
  { icon: Settings, label: "Settings", href: "/" },
]

export default function AdminSidebar() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role

  return (
    <Sidebar collapsible="icon">
      {role === "admin" && (
        <>
          <SidebarHeader className="flex flex-row items-center group-data-[collapsible=icon]:justify-center p-4">
            {user?.imageUrl && (
              <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>
                  {user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="group-data-[collapsible=icon]:hidden">{user?.username}</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild>
                        <a href={item.href} target={item.target}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </>
      )}
      <SidebarFooter className="p-2 items-center justify-center bg-[#2A254B]">
        <Link href="/sign-in">
          <SignOutButton>
            <span className="flex text-white">
              <LogOut className="w-6 h-6 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">LogOut</span>
            </span>
          </SignOutButton>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}

