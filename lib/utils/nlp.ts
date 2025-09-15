import type { SearchQuery } from "../types"

export function parseNaturalLanguageQuery(query: string): SearchQuery {
  const lowerQuery = query.toLowerCase()
  const searchQuery: SearchQuery = {}

  // Extract category
  const categories = ["breakfast", "condiments", "spices", "ready-to-eat", "beverages", "dairy"]
  for (const category of categories) {
    if (lowerQuery.includes(category)) {
      searchQuery.category = category
      break
    }
  }

  // Extract price constraints
  const priceMatch = lowerQuery.match(/under (\d+)|below (\d+)|less than (\d+)/)
  if (priceMatch) {
    const price = Number.parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3])
    searchQuery.price = { max: price }
  }

  const minPriceMatch = lowerQuery.match(/above (\d+)|over (\d+)|more than (\d+)/)
  if (minPriceMatch) {
    const price = Number.parseInt(minPriceMatch[1] || minPriceMatch[2] || minPriceMatch[3])
    searchQuery.price = { ...searchQuery.price, min: price }
  }

  // Extract keywords
  const keywords = lowerQuery
    .replace(/show me|find|search for|get me|i want|i need/g, "")
    .replace(/under \d+|below \d+|less than \d+|above \d+|over \d+|more than \d+/g, "")
    .split(" ")
    .filter((word) => word.length > 2 && !categories.includes(word))
    .filter((word) => !["items", "products", "things"].includes(word))

  if (keywords.length > 0) {
    searchQuery.keywords = keywords
  }

  return searchQuery
}

export function parseOrderCommand(command: string): { action: string; product?: string; quantity?: number } {
  const lowerCommand = command.toLowerCase()

  // Extract quantity
  const quantityMatch = lowerCommand.match(/(\d+)\s*(pack|packs|piece|pieces|kg|grams?|ml|liters?)?/)
  const quantity = quantityMatch ? Number.parseInt(quantityMatch[1]) : 1

  // Extract product name
  const productMatch = lowerCommand.match(
    /(?:order|add|get|buy)\s+(?:\d+\s+(?:pack|packs|piece|pieces|kg|grams?|ml|liters?)?\s+(?:of\s+)?)?(.+)/,
  )
  const product = productMatch ? productMatch[1].trim() : ""

  if (lowerCommand.includes("order") || lowerCommand.includes("add") || lowerCommand.includes("buy")) {
    return { action: "add_to_cart", product, quantity }
  }

  return { action: "unknown" }
}

export function generateRecommendations(cartItems: any[], allProducts: any[]): any[] {
  // Simple recommendation logic based on categories and common pairings
  const cartCategories = cartItems.map((item) => item.product.category)
  const cartProductIds = cartItems.map((item) => item.product.id)

  const recommendations = allProducts.filter((product) => {
    // Don't recommend items already in cart
    if (cartProductIds.includes(product.id)) return false

    // Recommend complementary items
    if (cartCategories.includes("breakfast") && product.category === "condiments") return true
    if (cartCategories.includes("spices") && product.category === "ready-to-eat") return true
    if (cartCategories.includes("dairy") && product.category === "breakfast") return true

    return false
  })

  return recommendations.slice(0, 3) // Return top 3 recommendations
}
