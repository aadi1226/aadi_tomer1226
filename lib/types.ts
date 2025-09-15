export interface Product {
  id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  inStock: boolean
  tags: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "received" | "processing" | "out-for-delivery" | "delivered"
  createdAt: Date
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
}

export interface SearchQuery {
  category?: string
  price?: {
    min?: number
    max?: number
  }
  keywords?: string[]
  inStock?: boolean
}

export interface ChatMessage {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}
