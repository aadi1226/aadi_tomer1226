"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { mockProducts } from "@/lib/data"
import { parseNaturalLanguageQuery } from "@/lib/utils/nlp"
import type { Product } from "@/lib/types"
import Image from "next/image"

interface ProductGridProps {
  searchQuery?: string
}

export function ProductGrid({ searchQuery = "" }: ProductGridProps) {
  const { cart, addToCart, updateQuantity } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredProducts = useMemo(() => {
    let products = mockProducts

    // Apply category filter
    if (selectedCategory !== "all") {
      products = products.filter((product) => product.category === selectedCategory)
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      const parsedQuery = parseNaturalLanguageQuery(searchQuery)

      products = products.filter((product) => {
        // Category filter
        if (parsedQuery.category && product.category !== parsedQuery.category) {
          return false
        }

        // Price filter
        if (parsedQuery.price?.max && product.price > parsedQuery.price.max) {
          return false
        }
        if (parsedQuery.price?.min && product.price < parsedQuery.price.min) {
          return false
        }

        // Keyword filter
        if (parsedQuery.keywords && parsedQuery.keywords.length > 0) {
          const productText = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase()
          return parsedQuery.keywords.some((keyword) => productText.includes(keyword.toLowerCase()))
        }

        // Text search fallback
        const searchText = searchQuery.toLowerCase()
        const productText = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase()
        return productText.includes(searchText)
      })
    }

    return products
  }, [searchQuery, selectedCategory])

  const categories = ["all", "breakfast", "condiments", "spices", "ready-to-eat", "beverages", "dairy"]

  const getCartQuantity = (productId: string) => {
    const cartItem = cart.find((item) => item.product.id === productId)
    return cartItem?.quantity || 0
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === "all" ? "All Products" : category.replace("-", " ")}
          </Button>
        ))}
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredProducts.length} products for "{searchQuery}"
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const cartQuantity = getCartQuantity(product.id)

          return (
            <Card key={product.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <div className="aspect-square relative mb-2 bg-muted rounded-lg overflow-hidden">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <CardTitle className="text-lg text-card-foreground">{product.name}</CardTitle>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  <Badge variant={product.inStock ? "default" : "destructive"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                {cartQuantity > 0 ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(product.id, cartQuantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">{cartQuantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(product.id, cartQuantity + 1)}
                        className="h-8 w-8 p-0"
                        disabled={!product.inStock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-sm font-medium">₹{(product.price * cartQuantity).toFixed(0)}</span>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your search.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try searching for "breakfast items", "spices", or "under 200"
          </p>
        </div>
      )}
    </div>
  )
}
