"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, ShoppingCart, TrendingUp } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { getSmartRecommendations } from "@/lib/utils/ai-features"
import { mockProducts } from "@/lib/data"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export function SmartRecommendations() {
  const { cart, orders, addToCart } = useAppStore()
  const [recommendations, setRecommendations] = useState<any[]>([])

  useEffect(() => {
    const smartRecs = getSmartRecommendations(cart, mockProducts, orders)
    setRecommendations(smartRecs)
  }, [cart, orders])

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart`,
    })
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">AI Recommendations</h2>
        <Badge variant="secondary" className="ml-2">
          <TrendingUp className="h-3 w-3 mr-1" />
          Smart Picks
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Card key={product.id} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <div className="aspect-square relative mb-2 bg-muted rounded-lg overflow-hidden">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <CardTitle className="text-sm text-card-foreground">{product.name}</CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">₹{product.price}</span>
                <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground mb-3">{product.description}</p>

              <Button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ShoppingCart className="h-3 w-3 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">Recommendations based on your cart and purchase history</p>
      </div>
    </div>
  )
}
