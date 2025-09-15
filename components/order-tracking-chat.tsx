"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Package, Truck, CheckCircle, Clock } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { ChatMessage } from "@/lib/types"

export function OrderTrackingChat() {
  const { chatMessages, addChatMessage, getOrderById } = useAppStore()
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chatMessages])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "processing":
        return <Package className="h-4 w-4 text-yellow-500" />
      case "out-for-delivery":
        return <Truck className="h-4 w-4 text-orange-500" />
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
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

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true)

    setTimeout(() => {
      let botResponse = ""

      // Extract order ID from message
      const orderIdMatch = userMessage.match(/(ORD-\d+)|#(\d+)/i)
      const orderIdFromHash = userMessage.match(/#(\d+)/i)

      let orderId = ""
      if (orderIdMatch) {
        orderId = orderIdMatch[1] || `ORD-${orderIdMatch[2]}`
      } else if (orderIdFromHash) {
        orderId = `ORD-${orderIdFromHash[1]}`
      }

      if (orderId) {
        const order = getOrderById(orderId)

        if (order) {
          const statusText = getStatusText(order.status)
          const orderDate = order.createdAt.toLocaleDateString()
          const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

          botResponse = `Great! I found your order ${order.id}.\n\n📦 Status: ${statusText}\n📅 Order Date: ${orderDate}\n🛍️ Items: ${itemCount} items\n💰 Total: ₹${order.total}\n\n`

          if (order.status === "received") {
            botResponse +=
              "Your order has been received and is being prepared. You'll get an update once it's ready for delivery!"
          } else if (order.status === "processing") {
            botResponse += "Your order is currently being processed. It should be ready for delivery soon!"
          } else if (order.status === "out-for-delivery") {
            botResponse += "Great news! Your order is out for delivery and should reach you within 2-3 hours."
          } else if (order.status === "delivered") {
            botResponse += "Your order has been delivered! Hope you enjoyed your shopping experience with us."
          }
        } else {
          botResponse = `I couldn't find an order with ID ${orderId}. Please check the order ID and try again. Order IDs usually start with "ORD-" followed by numbers.`
        }
      } else if (
        userMessage.toLowerCase().includes("track") ||
        userMessage.toLowerCase().includes("status") ||
        userMessage.toLowerCase().includes("order")
      ) {
        botResponse =
          "I'd be happy to help you track your order! Please provide your order ID. You can find it in your email confirmation or say something like 'Track order ORD-1234567890' or 'Where is order #1234567890'."
      } else if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
        botResponse =
          "Hello! I'm your order tracking assistant. I can help you check the status of your orders. Just provide your order ID and I'll give you the latest updates!"
      } else if (userMessage.toLowerCase().includes("help")) {
        botResponse =
          "I can help you track your orders! Here's what you can ask me:\n\n• 'Track order ORD-1234567890'\n• 'Where is my order #1234567890'\n• 'Status of order ORD-1234567890'\n\nJust provide your order ID and I'll get you the latest information!"
      } else {
        botResponse =
          "I'm here to help you track your orders. Please provide your order ID (like ORD-1234567890) and I'll check the status for you. You can also ask for help if you need assistance!"
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "bot",
        content: botResponse,
        timestamp: new Date(),
      }

      addChatMessage(botMessage)
      setIsTyping(false)
    }, 1500) // Simulate thinking time
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    addChatMessage(userMessage)

    // Simulate bot response
    simulateBotResponse(inputMessage)

    setInputMessage("")
  }

  // Initialize chat with welcome message if no messages exist
  useEffect(() => {
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "bot",
        content:
          "Hi! I'm your order tracking assistant. I can help you check the status of your orders. Just provide your order ID and I'll give you real-time updates!",
        timestamp: new Date(),
      }
      addChatMessage(welcomeMessage)
    }
  }, [])

  return (
    <Card className="h-[600px] flex flex-col bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Bot className="h-5 w-5 text-primary" />
          Order Tracking Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-current rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-6 pt-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your order... (e.g., 'Track order ORD-1234567890')"
              className="flex-1 bg-input border-border"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
