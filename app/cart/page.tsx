"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { generateRecommendations } from "@/lib/utils/nlp"
import { mockProducts } from "@/lib/data"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, addToCart, addOrder } = useAppStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const recommendations = generateRecommendations(cart, mockProducts)
  const cartTotal = getCartTotal()
  const deliveryFee = cartTotal > 500 ? 0 : 40
  const finalTotal = cartTotal + deliveryFee

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    })
  }

  const handleAddRecommendation = (product: any) => {
    addToCart(product, 1)
    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    })
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      })
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const orderId = `ORD-${Date.now()}`
      const order = {
        id: orderId,
        items: [...cart],
        total: finalTotal,
        status: "received" as const,
        createdAt: new Date(),
        customerInfo: { ...customerInfo },
      }

      addOrder(order)
      clearCart()

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${orderId} has been placed`,
      })

      router.push(`/orders?orderId=${orderId}`)
    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (cart.length === 0) {
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
            <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
          </div>

          <div className="text-center py-12">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some products to get started</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
          <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
          <Badge variant="secondary">{cart.reduce((total, item) => total + item.quantity, 0)} items</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.product.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-primary">₹{item.product.price}</span>
                        <Badge variant="secondary" className="text-xs">
                          {item.product.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">₹{(item.product.price * item.quantity).toFixed(0)}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">You might also like</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((product) => (
                      <div key={product.id} className="border border-border rounded-lg p-4">
                        <div className="w-full h-24 bg-muted rounded-lg overflow-hidden mb-2">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={100}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-medium text-sm text-card-foreground">{product.name}</h4>
                        <p className="text-primary font-bold">₹{product.price}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAddRecommendation(product)}
                          className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Checkout Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                {cartTotal <= 500 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{(500 - cartTotal).toFixed(0)} more for free delivery
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      required
                      className="bg-input border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      required
                      className="bg-input border-border"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isCheckingOut ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Place Order - ₹{finalTotal.toFixed(0)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
