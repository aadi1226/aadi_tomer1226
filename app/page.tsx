"use client"

import { useState } from "react"
import { VoiceSearch } from "@/components/voice-search"
import { ProductGrid } from "@/components/product-grid"
import { PersonalizedOffers } from "@/components/personalized-offers"
import { SmartRecommendations } from "@/components/smart-recommendations"
import { ShoppingCart, Package, MessageCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import Link from "next/link"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { cart } = useAppStore()

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">VoiceCart</h1>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>

              <Link href="/orders">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Track Orders
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Shop with Your Voice</h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Search for products naturally or add items to cart with voice commands
          </p>

          {/* Voice Search */}
          <VoiceSearch onSearch={setSearchQuery} />

          {/* Quick Examples */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("breakfast items under 200")}>
              "breakfast items under 200"
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("south indian spices")}>
              "south indian spices"
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery("ready to eat")}>
              "ready to eat"
            </Button>
          </div>
        </div>

        <PersonalizedOffers />

        <SmartRecommendations />

        {/* Product Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">All Products</h2>
          <ProductGrid searchQuery={searchQuery} />
        </div>
      </main>
    </div>
  )
}
