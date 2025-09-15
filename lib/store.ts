import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Order, Product, ChatMessage } from "./types"

interface AppState {
  // Cart state
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number

  // Orders state
  orders: Order[]
  addOrder: (order: Order) => void
  getOrderById: (orderId: string) => Order | undefined

  // Chat state
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void

  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Voice state
  isListening: boolean
  setIsListening: (listening: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart state
      cart: [],
      addToCart: (product, quantity = 1) => {
        const existingItem = get().cart.find((item) => item.product.id === product.id)
        if (existingItem) {
          set((state) => ({
            cart: state.cart.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
            ),
          }))
        } else {
          set((state) => ({
            cart: [...state.cart, { product, quantity }],
          }))
        }
      },
      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }))
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        set((state) => ({
          cart: state.cart.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        }))
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      // Orders state
      orders: [],
      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
        }))
      },
      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId)
      },

      // Chat state
      chatMessages: [],
      addChatMessage: (message) => {
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        }))
      },
      clearChat: () => set({ chatMessages: [] }),

      // Search state
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Voice state
      isListening: false,
      setIsListening: (listening) => set({ isListening: listening }),
    }),
    {
      name: "retail-app-storage",
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        chatMessages: state.chatMessages,
      }),
    },
  ),
)
