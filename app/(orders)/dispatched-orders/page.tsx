import { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server';
import DispatchedOrdersClient from '@/components/DispatchedOrders';

export const dynamic = 'force-dynamic'

async function getOrders() {
  try {
    const { userId, getToken } = await auth();
    const token = await getToken();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_DISPATCHED_ORDERS}` || `${process.env.NEXT_LOCAL_PUBLIC_DISPATCHED_ORDERS}`
    console.log('Fetching orders from:', apiUrl)
    
    const res = await fetch(apiUrl, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    
    if (!res.ok) {
      throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`)
    }
    
    const data = await res.json()
    // console.log('Fetched orders:', JSON.stringify(data, null, 2))
    return data.data
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export default async function DashboardPage() {
  const orders = await getOrders()
  console.log('Pending Orders in DashboardPage:', JSON.stringify(orders, null, 2))
  
  return (
    <div className="w-full px-4 py-8">
          <h1 className="text-4xl font-clashDisplay mb-5">Dispatched Orders</h1>
      <Suspense fallback={<div>Loading orders...</div>}>
        <DispatchedOrdersClient orders={orders} />
      </Suspense>
    </div>
  )
}