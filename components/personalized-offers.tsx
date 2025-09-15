"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, ShoppingCart, Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { generatePersonalizedOffers } from "@/lib/utils/ai-features"
import { mockProducts } from "@/lib/data"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

export function PersonalizedOffers() {
  const { orders, addToCart } = useAppStore()
  const [offers, setOffers] = useState<any[]>([])

  useEffect(() => {
    const personalizedOffers = generatePersonalizedOffers(orders, mockProducts)
    setOffers(personalizedOffers)
  }, [orders])

  const handleAddToCart = (product: any) => {
    addToCart(product, 1)
    toast({
      title: "Added to Cart",
      description: `${product.name} added to cart with special offer!`,
    })
  }

  if (offers.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Personalized Offers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Gift className="h-6 w-6 text-primary" />
                <Badge className="bg-primary text-primary-foreground">{offer.discount}% OFF</Badge>
              </div>
              <CardTitle className="text-lg text-card-foreground">{offer.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{offer.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Featured Products */}
              <div className="grid grid-cols-2 gap-2">
                {offer.products.slice(0, 4).map((product: any) => (
                  <div key={product.id} className="text-center">
                    <div className="w-full h-16 bg-muted rounded-lg overflow-hidden mb-2">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium text-card-foreground truncate">{product.name}</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs text-muted-foreground line-through">₹{product.price}</span>
                      <span className="text-xs font-bold text-primary">
                        ₹{Math.round(product.price * (1 - offer.discount / 100))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {offer.products.slice(0, 2).map((product: any) => (
                  <Button
                    key={product.id}
                    onClick={() => handleAddToCart(product)}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start bg-background/50"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add {product.name}
                  </Button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">Limited time offer • Valid for next 24 hours</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
