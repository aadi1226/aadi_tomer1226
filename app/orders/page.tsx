"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { OrderTrackingChat } from "@/components/order-tracking-chat"
import { OrderStatusCard } from "@/components/order-status-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import { useAppStore } from "@/lib/store"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function OrdersPage() {
  const { orders, getOrderById } = useAppStore()
  const [searchOrderId, setSearchOrderId] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const searchParams = useSearchParams()

  // Check if there's an orderId in the URL params
  useEffect(() => {
    const orderId = searchParams.get("orderId")
    if (orderId) {
      const order = getOrderById(orderId)
      if (order) {
        setSelectedOrder(order)
        setSearchOrderId(orderId)
      }
    }
  }, [searchParams, getOrderById])

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchOrderId.trim()) {
      const order = getOrderById(searchOrderId)
      setSelectedOrder(order)
    }
  }

  const sortedOrders = [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Order Tracking</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Tracking Chat */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Chat with Assistant</h2>
            <OrderTrackingChat />
          </div>

          {/* Order Search & History */}
          <div className="space-y-6">
            {/* Quick Order Search */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Order Search</h2>
              <form onSubmit={handleSearchOrder} className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Enter Order ID (e.g., ORD-1234567890)"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  className="flex-1 bg-input border-border"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {/* Selected Order Details */}
              {selectedOrder && (
                <div className="mb-6">
                  <h3 className="font-medium text-foreground mb-2">Order Details</h3>
                  <OrderStatusCard order={selectedOrder} />
                </div>
              )}

              {searchOrderId && !selectedOrder && (
                <div className="text-center py-4 text-muted-foreground">No order found with ID: {searchOrderId}</div>
              )}
            </div>

            {/* Order History */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Orders</h2>

              {sortedOrders.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {sortedOrders.map((order) => (
                    <OrderStatusCard key={order.id} order={order} onViewDetails={() => setSelectedOrder(order)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No orders found.</p>
                  <p className="text-sm mt-2">
                    <Link href="/" className="text-primary hover:underline">
                      Start shopping
                    </Link>{" "}
                    to place your first order!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
