import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN environment variable is not set" }, { status: 400 })
    }

    const { webhookUrl } = await request.json()

    if (!webhookUrl) {
      return NextResponse.json({ error: "webhookUrl is required" }, { status: 400 })
    }

    // Set webhook
    const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook`
    const response = await fetch(setWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message"],
      }),
    })

    const result = await response.json()

    if (result.ok) {
      return NextResponse.json({
        success: true,
        message: "Webhook set successfully",
        webhook_url: webhookUrl,
      })
    } else {
      return NextResponse.json({ error: "Failed to set webhook", details: result }, { status: 400 })
    }
  } catch (error) {
    console.error("Setup webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN environment variable is not set" }, { status: 400 })
    }

    // Get webhook info
    const getWebhookUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    const response = await fetch(getWebhookUrl)
    const result = await response.json()

    return NextResponse.json({
      webhook_info: result.result,
      bot_configured: !!botToken,
    })
  } catch (error) {
    console.error("Get webhook info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
