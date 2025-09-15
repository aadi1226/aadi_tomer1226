"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle, Clock, Eye } from "lucide-react"
import type { Order } from "@/lib/types"
import Image from "next/image"

interface OrderStatusCardProps {
  order: Order
  onViewDetails?: () => void
}

export function OrderStatusCard({ order, onViewDetails }: OrderStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "processing":
        return <Package className="h-5 w-5 text-yellow-500" />
      case "out-for-delivery":
        return <Truck className="h-5 w-5 text-orange-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "received":
        return "Order Received"
      case "processing":
        return "Processing"
      case "out-for-delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return "Unknown Status"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "out-for-delivery":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Card className="bg-card border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-card-foreground">Order {order.id}</CardTitle>
          <Badge className={getStatusColor(order.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(order.status)}
              {getStatusText(order.status)}
            </div>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Placed on {order.createdAt.toLocaleDateString()} at{" "}
          {order.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items Preview */}
        <div>
          <h4 className="font-medium text-card-foreground mb-2">{itemCount} Items</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.product.id} className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{order.items.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Total */}
        <div className="flex justify-between items-center">
          <span className="font-medium text-card-foreground">Total Amount</span>
          <span className="text-xl font-bold text-primary">₹{order.total}</span>
        </div>

        {/* Delivery Address */}
        <div>
          <span className="text-sm font-medium text-card-foreground">Delivery Address:</span>
          <p className="text-sm text-muted-foreground">{order.customerInfo.address}</p>
        </div>

        {/* Action Button */}
        {onViewDetails && (
          <Button onClick={onViewDetails} variant="outline" className="w-full bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
