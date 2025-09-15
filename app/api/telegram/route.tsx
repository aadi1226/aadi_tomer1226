import { type NextRequest, NextResponse } from "next/server"
import { mockProducts } from "@/lib/data"
import type { Product } from "@/lib/types"

// In-memory storage for demo purposes (use database in production)
const userCarts: Record<string, Array<{ product: Product; quantity: number }>> = {}
const userOrders: Record<string, any[]> = {}

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    first_name: string
    username?: string
  }
  chat: {
    id: number
    type: string
  }
  text: string
}

interface TelegramUpdate {
  update_id: number
  message: TelegramMessage
}

// Telegram Bot API functions
async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not configured")
    return
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
        parse_mode: "HTML",
      }),
    })
  } catch (error) {
    console.error("Error sending Telegram message:", error)
  }
}

function formatProductList(products: Product[], limit = 10): string {
  const productList = products
    .slice(0, limit)
    .map((product, index) => {
      const status = product.inStock ? "✅" : "❌"
      return `${index + 1}. <b>${product.name}</b> - ₹${product.price} ${status}\n   <i>${product.description}</i>`
    })
    .join("\n\n")

  const moreText = products.length > limit ? `\n\n... and ${products.length - limit} more products` : ""

  return productList + moreText
}

function createProductKeyboard(products: Product[], prefix = "add"): any {
  const keyboard = products.slice(0, 6).map((product) => [
    {
      text: `Add ${product.name} - ₹${product.price}`,
      callback_data: `${prefix}_${product.id}`,
    },
  ])

  return {
    inline_keyboard: keyboard,
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const { message } = update
    const chatId = message.chat.id
    const userId = message.from.id.toString()
    const text = message.text.toLowerCase().trim()

    // Initialize user cart if doesn't exist
    if (!userCarts[userId]) {
      userCarts[userId] = []
    }
    if (!userOrders[userId]) {
      userOrders[userId] = []
    }

    // Command handling
    if (text === "/start") {
      const welcomeMessage = `
🛒 <b>Welcome to VoiceCart Bot!</b>

I can help you shop for South Indian groceries. Here are the commands you can use:

🔍 <b>/products</b> - View all available products
🛍️ <b>/addtocart [product_id]</b> - Add item to your cart
🛒 <b>/cart</b> - View your current cart
💳 <b>/checkout</b> - Place your order
📦 <b>/orders</b> - View your order history
📍 <b>/track [order_id]</b> - Track a specific order
❓ <b>/help</b> - Show this help message

You can also just type what you're looking for, like:
• "show me breakfast items"
• "add dosa batter to cart"
• "where is my order #123"

Let's start shopping! 🎉
      `
      await sendMessage(chatId, welcomeMessage)
    } else if (text === "/products" || text.includes("show") || text.includes("list")) {
      const message = `
🛍️ <b>Available Products:</b>

${formatProductList(mockProducts)}

Use /addtocart [product_id] to add items to your cart, or click the buttons below:
      `

      await sendMessage(chatId, message, createProductKeyboard(mockProducts.slice(0, 3)))
    } else if (text.startsWith("/addtocart") || (text.includes("add") && text.includes("cart"))) {
      const parts = text.split(" ")
      const productId = parts[1] || ""

      if (!productId) {
        await sendMessage(chatId, "Please specify a product ID. Use /products to see available items.")
        return NextResponse.json({ ok: true })
      }

      const product = mockProducts.find((p) => p.id === productId || p.name.toLowerCase().includes(productId))

      if (!product) {
        await sendMessage(chatId, `Product not found. Use /products to see available items.`)
        return NextResponse.json({ ok: true })
      }

      if (!product.inStock) {
        await sendMessage(chatId, `Sorry, <b>${product.name}</b> is currently out of stock. ❌`)
        return NextResponse.json({ ok: true })
      }

      // Add to cart
      const existingItem = userCarts[userId].find((item) => item.product.id === product.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        userCarts[userId].push({ product, quantity: 1 })
      }

      await sendMessage(
        chatId,
        `✅ Added <b>${product.name}</b> to your cart!\n\nPrice: ₹${product.price}\nUse /cart to view your cart or /checkout to place order.`,
      )
    } else if (text === "/cart") {
      const cart = userCarts[userId]

      if (cart.length === 0) {
        await sendMessage(chatId, "🛒 Your cart is empty. Use /products to browse items.")
        return NextResponse.json({ ok: true })
      }

      const cartItems = cart
        .map(
          (item, index) =>
            `${index + 1}. <b>${item.product.name}</b>\n   Qty: ${item.quantity} × ₹${item.product.price} = ₹${item.quantity * item.product.price}`,
        )
        .join("\n\n")

      const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

      const cartMessage = `
🛒 <b>Your Cart:</b>

${cartItems}

<b>Total: ₹${total}</b>

Use /checkout to place your order!
      `

      await sendMessage(chatId, cartMessage)
    } else if (text === "/checkout") {
      const cart = userCarts[userId]

      if (cart.length === 0) {
        await sendMessage(chatId, "🛒 Your cart is empty. Add some items first using /products")
        return NextResponse.json({ ok: true })
      }

      const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const orderId = `TG-${Date.now()}`

      // Create order
      const order = {
        id: orderId,
        items: [...cart],
        total,
        status: "received",
        createdAt: new Date(),
        customerInfo: {
          name: message.from.first_name,
          telegramId: userId,
          username: message.from.username || "N/A",
        },
      }

      userOrders[userId].push(order)
      userCarts[userId] = [] // Clear cart

      const orderMessage = `
🎉 <b>Order Placed Successfully!</b>

📦 Order ID: <code>${orderId}</code>
💰 Total: ₹${total}
📅 Date: ${new Date().toLocaleDateString()}

Your order is being processed. You'll receive updates on the status.

Use /track ${orderId} to track your order anytime!
      `

      await sendMessage(chatId, orderMessage)
    } else if (text === "/orders") {
      const orders = userOrders[userId]

      if (orders.length === 0) {
        await sendMessage(chatId, "📦 You haven't placed any orders yet. Use /products to start shopping!")
        return NextResponse.json({ ok: true })
      }

      const orderList = orders
        .slice(-5)
        .map((order, index) => {
          const statusEmoji =
            {
              received: "📥",
              processing: "⚙️",
              "out-for-delivery": "🚚",
              delivered: "✅",
            }[order.status] || "📦"

          return `${statusEmoji} <b>${order.id}</b>\n   Status: ${order.status}\n   Total: ₹${order.total}\n   Date: ${order.createdAt.toLocaleDateString()}`
        })
        .join("\n\n")

      await sendMessage(
        chatId,
        `📦 <b>Your Recent Orders:</b>\n\n${orderList}\n\nUse /track [order_id] to get detailed status.`,
      )
    } else if (text.startsWith("/track") || text.includes("track") || text.includes("where is")) {
      const orderIdMatch = text.match(/(?:track|#)\s*([A-Z]+-\d+)/i) || text.match(/(\d+)/)

      if (!orderIdMatch) {
        await sendMessage(chatId, "Please provide an order ID. Example: /track TG-1234567890")
        return NextResponse.json({ ok: true })
      }

      const orderId = orderIdMatch[1].startsWith("TG-") ? orderIdMatch[1] : `TG-${orderIdMatch[1]}`
      const order = userOrders[userId].find((o) => o.id === orderId)

      if (!order) {
        await sendMessage(chatId, `❌ Order ${orderId} not found. Use /orders to see your order history.`)
        return NextResponse.json({ ok: true })
      }

      const statusEmoji =
        {
          received: "📥",
          processing: "⚙️",
          "out-for-delivery": "🚚",
          delivered: "✅",
        }[order.status] || "📦"

      const statusMessage =
        {
          received: "Your order has been received and is being prepared.",
          processing: "Your order is currently being processed.",
          "out-for-delivery": "Great news! Your order is out for delivery.",
          delivered: "Your order has been delivered successfully!",
        }[order.status] || "Order status unknown."

      const trackingMessage = `
📦 <b>Order Tracking</b>

🆔 Order ID: <code>${order.id}</code>
${statusEmoji} Status: <b>${order.status.toUpperCase()}</b>
💰 Total: ₹${order.total}
📅 Order Date: ${order.createdAt.toLocaleDateString()}

${statusMessage}
      `

      await sendMessage(chatId, trackingMessage)
    } else if (text === "/help") {
      const helpMessage = `
❓ <b>VoiceCart Bot Help</b>

<b>Available Commands:</b>
🔍 /products - View all products
🛍️ /addtocart [id] - Add item to cart
🛒 /cart - View your cart
💳 /checkout - Place order
📦 /orders - Your order history
📍 /track [order_id] - Track order
❓ /help - Show this help

<b>Natural Language:</b>
You can also chat naturally:
• "show me breakfast items"
• "add dosa batter"
• "where is my order"
• "track order TG-123"

Need more help? Just ask! 😊
      `

      await sendMessage(chatId, helpMessage)
    } else {
      // Natural language processing for unrecognized commands
      if (text.includes("breakfast") || text.includes("morning")) {
        const breakfastItems = mockProducts.filter((p) => p.category === "breakfast")
        await sendMessage(
          chatId,
          `🌅 <b>Breakfast Items:</b>\n\n${formatProductList(breakfastItems)}`,
          createProductKeyboard(breakfastItems.slice(0, 3)),
        )
      } else if (text.includes("spice") || text.includes("masala")) {
        const spiceItems = mockProducts.filter((p) => p.category === "spices")
        await sendMessage(
          chatId,
          `🌶️ <b>Spices & Masalas:</b>\n\n${formatProductList(spiceItems)}`,
          createProductKeyboard(spiceItems.slice(0, 3)),
        )
      } else if (text.includes("ready") || text.includes("instant")) {
        const readyItems = mockProducts.filter((p) => p.category === "ready-to-eat")
        await sendMessage(
          chatId,
          `⚡ <b>Ready-to-Eat Items:</b>\n\n${formatProductList(readyItems)}`,
          createProductKeyboard(readyItems.slice(0, 3)),
        )
      } else {
        await sendMessage(
          chatId,
          `🤔 I didn't understand that. Try:\n\n• /products - to see all items\n• /help - for all commands\n• Or just tell me what you're looking for!`,
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "VoiceCart Telegram Bot is running",
    timestamp: new Date().toISOString(),
  })
}
