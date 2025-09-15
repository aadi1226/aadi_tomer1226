import type { Product, Order, CartItem } from "../types"

// Auto-categorization of products
export function autoCategorizeProduc(productName: string, description: string): string {
  const text = `${productName} ${description}`.toLowerCase()

  // Define category keywords
  const categoryKeywords = {
    breakfast: ["idly", "dosa", "upma", "breakfast", "morning", "batter"],
    condiments: ["chutney", "pickle", "sauce", "condiment", "dip"],
    spices: ["powder", "masala", "spice", "seasoning", "blend", "rasam"],
    "ready-to-eat": ["ready", "instant", "mix", "quick", "prepared"],
    beverages: ["coffee", "tea", "drink", "beverage", "filter"],
    dairy: ["ghee", "butter", "milk", "cream", "cheese", "yogurt"],
  }

  // Score each category
  const scores: Record<string, number> = {}

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = keywords.reduce((score, keyword) => {
      return score + (text.includes(keyword) ? 1 : 0)
    }, 0)
  }

  // Return category with highest score
  const bestCategory = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))[0]

  return scores[bestCategory] > 0 ? bestCategory : "general"
}

// Personalized offers based on order history
export function generatePersonalizedOffers(
  orders: Order[],
  allProducts: Product[],
): Array<{
  title: string
  description: string
  products: Product[]
  discount: number
}> {
  const offers: Array<{
    title: string
    description: string
    products: Product[]
    discount: number
  }> = []

  if (orders.length === 0) {
    // New customer offers
    offers.push({
      title: "Welcome Offer",
      description: "Get 15% off on your first South Indian breakfast combo!",
      products: allProducts.filter((p) => p.category === "breakfast").slice(0, 3),
      discount: 15,
    })
    return offers
  }

  // Analyze purchase history
  const purchasedCategories: Record<string, number> = {}
  const purchasedProducts: Record<string, number> = {}

  orders.forEach((order) => {
    order.items.forEach((item) => {
      purchasedCategories[item.product.category] = (purchasedCategories[item.product.category] || 0) + item.quantity
      purchasedProducts[item.product.id] = (purchasedProducts[item.product.id] || 0) + item.quantity
    })
  })

  // Most purchased category
  const topCategory = Object.entries(purchasedCategories).reduce((a, b) =>
    purchasedCategories[a[0]] > purchasedCategories[b[0]] ? a : b,
  )[0]

  // Generate category-based offers
  if (topCategory === "breakfast") {
    offers.push({
      title: "South Indian Breakfast Lover",
      description: "Since you love South Indian breakfast, here's 10% off on Chutneys!",
      products: allProducts.filter((p) => p.category === "condiments"),
      discount: 10,
    })
  } else if (topCategory === "spices") {
    offers.push({
      title: "Spice Master",
      description: "Complete your spice collection with 12% off on ready-to-eat items!",
      products: allProducts.filter((p) => p.category === "ready-to-eat"),
      discount: 12,
    })
  }

  // Complementary product offers
  const hasBreakfastItems = purchasedCategories["breakfast"] > 0
  const hasSpices = purchasedCategories["spices"] > 0

  if (hasBreakfastItems && !purchasedCategories["dairy"]) {
    offers.push({
      title: "Perfect Pairing",
      description: "Add premium ghee to enhance your breakfast experience - 8% off!",
      products: allProducts.filter((p) => p.category === "dairy"),
      discount: 8,
    })
  }

  if (hasSpices && !purchasedCategories["beverages"]) {
    offers.push({
      title: "Complete Your Meal",
      description: "Enjoy authentic filter coffee with your spicy meals - 15% off!",
      products: allProducts.filter((p) => p.category === "beverages"),
      discount: 15,
    })
  }

  // Replenishment offers for frequently bought items
  const frequentProducts = Object.entries(purchasedProducts)
    .filter(([_, count]) => count >= 2)
    .map(([productId]) => allProducts.find((p) => p.id === productId))
    .filter(Boolean) as Product[]

  if (frequentProducts.length > 0) {
    offers.push({
      title: "Restock Your Favorites",
      description: "Time to restock your favorite items with 5% off!",
      products: frequentProducts.slice(0, 3),
      discount: 5,
    })
  }

  return offers.slice(0, 3) // Return top 3 offers
}

// Enhanced recommendation engine
export function getSmartRecommendations(
  cartItems: CartItem[],
  allProducts: Product[],
  orderHistory: Order[],
): Product[] {
  const recommendations: Product[] = []
  const cartProductIds = cartItems.map((item) => item.product.id)
  const cartCategories = cartItems.map((item) => item.product.category)

  // Rule-based recommendations
  const rules = [
    // Breakfast + Condiments
    {
      condition: () => cartCategories.includes("breakfast"),
      products: () => allProducts.filter((p) => p.category === "condiments" && !cartProductIds.includes(p.id)),
      reason: "Perfect with your breakfast items",
    },
    // Spices + Ready-to-eat
    {
      condition: () => cartCategories.includes("spices"),
      products: () => allProducts.filter((p) => p.category === "ready-to-eat" && !cartProductIds.includes(p.id)),
      reason: "Quick meals with your spices",
    },
    // Dairy + Breakfast
    {
      condition: () => cartCategories.includes("dairy"),
      products: () => allProducts.filter((p) => p.category === "breakfast" && !cartProductIds.includes(p.id)),
      reason: "Enhanced with ghee",
    },
    // Beverages with any meal
    {
      condition: () => cartItems.length > 0 && !cartCategories.includes("beverages"),
      products: () => allProducts.filter((p) => p.category === "beverages" && !cartProductIds.includes(p.id)),
      reason: "Complete your meal",
    },
  ]

  // Apply rules
  rules.forEach((rule) => {
    if (rule.condition()) {
      const ruleProducts = rule.products().slice(0, 2)
      recommendations.push(...ruleProducts)
    }
  })

  // Historical preferences
  if (orderHistory.length > 0) {
    const historicalProducts: Record<string, number> = {}

    orderHistory.forEach((order) => {
      order.items.forEach((item) => {
        historicalProducts[item.product.id] = (historicalProducts[item.product.id] || 0) + item.quantity
      })
    })

    const topHistoricalProducts = Object.entries(historicalProducts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([productId]) => allProducts.find((p) => p.id === productId))
      .filter((p) => p && !cartProductIds.includes(p.id)) as Product[]

    recommendations.push(...topHistoricalProducts)
  }

  // Remove duplicates and return top recommendations
  const uniqueRecommendations = recommendations.filter(
    (product, index, self) => index === self.findIndex((p) => p.id === product.id),
  )

  return uniqueRecommendations.slice(0, 4)
}

// Smart search suggestions
export function getSearchSuggestions(query: string, allProducts: Product[]): string[] {
  const lowerQuery = query.toLowerCase()
  const suggestions: Set<string> = new Set()

  // Product name matches
  allProducts.forEach((product) => {
    if (product.name.toLowerCase().includes(lowerQuery)) {
      suggestions.add(product.name)
    }

    // Category matches
    if (product.category.toLowerCase().includes(lowerQuery)) {
      suggestions.add(product.category.replace("-", " "))
    }

    // Tag matches
    product.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        suggestions.add(tag.replace("-", " "))
      }
    })
  })

  // Common search patterns
  const commonPatterns = [
    "breakfast items under 200",
    "south indian spices",
    "ready to eat meals",
    "instant breakfast",
    "traditional condiments",
    "premium ghee",
    "filter coffee powder",
  ]

  commonPatterns.forEach((pattern) => {
    if (pattern.toLowerCase().includes(lowerQuery)) {
      suggestions.add(pattern)
    }
  })

  return Array.from(suggestions).slice(0, 5)
}

// Price prediction for dynamic pricing
export function predictOptimalPrice(
  product: Product,
  demandData: { views: number; cartAdds: number; purchases: number },
  competitorPrices: number[] = [],
): number {
  const basePrice = product.price
  let adjustedPrice = basePrice

  // Demand-based adjustment
  const demandScore = (demandData.purchases * 3 + demandData.cartAdds * 2 + demandData.views) / 100

  if (demandScore > 10) {
    // High demand - can increase price slightly
    adjustedPrice *= 1.05
  } else if (demandScore < 3) {
    // Low demand - decrease price to stimulate sales
    adjustedPrice *= 0.95
  }

  // Competitor price adjustment
  if (competitorPrices.length > 0) {
    const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length

    if (adjustedPrice > avgCompetitorPrice * 1.1) {
      // Too expensive compared to competitors
      adjustedPrice = avgCompetitorPrice * 1.05
    }
  }

  return Math.round(adjustedPrice)
}

// Inventory optimization
export function getInventoryRecommendations(
  products: Product[],
  orderHistory: Order[],
  currentStock: Record<string, number>,
): Array<{
  productId: string
  productName: string
  currentStock: number
  recommendedStock: number
  priority: "high" | "medium" | "low"
  reason: string
}> {
  const recommendations: Array<{
    productId: string
    productName: string
    currentStock: number
    recommendedStock: number
    priority: "high" | "medium" | "low"
    reason: string
  }> = []

  // Calculate demand for each product
  const productDemand: Record<string, number> = {}

  orderHistory.forEach((order) => {
    order.items.forEach((item) => {
      productDemand[item.product.id] = (productDemand[item.product.id] || 0) + item.quantity
    })
  })

  products.forEach((product) => {
    const demand = productDemand[product.id] || 0
    const stock = currentStock[product.id] || 0
    const avgDemandPerOrder = demand / Math.max(orderHistory.length, 1)

    let recommendedStock = Math.ceil(avgDemandPerOrder * 10) // 10 orders worth
    let priority: "high" | "medium" | "low" = "medium"
    let reason = "Based on historical demand"

    if (stock < avgDemandPerOrder * 2) {
      priority = "high"
      reason = "Low stock - risk of stockout"
      recommendedStock = Math.max(recommendedStock, Math.ceil(avgDemandPerOrder * 15))
    } else if (demand === 0) {
      priority = "low"
      reason = "No recent demand"
      recommendedStock = Math.max(5, recommendedStock)
    } else if (demand > orderHistory.length * 0.5) {
      priority = "high"
      reason = "High demand product"
      recommendedStock = Math.ceil(avgDemandPerOrder * 20)
    }

    recommendations.push({
      productId: product.id,
      productName: product.name,
      currentStock: stock,
      recommendedStock,
      priority,
      reason,
    })
  })

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}
