"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, ExternalLink, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function TelegramBotSetup() {
  const [botToken, setBotToken] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [webhookInfo, setWebhookInfo] = useState<any>(null)

  const currentDomain = typeof window !== "undefined" ? window.location.origin : ""
  const defaultWebhookUrl = `${currentDomain}/api/telegram`

  const handleSetupWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/telegram/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhookUrl: webhookUrl,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setIsSetupComplete(true)
        toast({
          title: "Success!",
          description: "Telegram bot webhook configured successfully",
        })
        checkWebhookStatus()
      } else {
        toast({
          title: "Setup Failed",
          description: result.error || "Failed to configure webhook",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup webhook",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch("/api/telegram/setup")
      const result = await response.json()
      setWebhookInfo(result.webhook_info)
    } catch (error) {
      console.error("Failed to check webhook status:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Telegram Bot Integration</h2>
        {isSetupComplete && <Badge className="bg-green-100 text-green-800">Active</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Setup Instructions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">1. Create Telegram Bot</h4>
              <p className="text-sm text-muted-foreground">
                Message @BotFather on Telegram and create a new bot using /newbot command
              </p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://t.me/botfather", "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open BotFather
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">2. Get Bot Token</h4>
              <p className="text-sm text-muted-foreground">
                Copy the bot token from BotFather and add it to your environment variables as TELEGRAM_BOT_TOKEN
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">3. Configure Webhook</h4>
              <p className="text-sm text-muted-foreground">
                Set up the webhook URL so Telegram can send messages to your bot
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure your TELEGRAM_BOT_TOKEN environment variable is set before configuring the webhook.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl || defaultWebhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/api/telegram"
                  className="bg-input border-border"
                />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl || defaultWebhookUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is where Telegram will send bot messages. Use your deployed domain.
              </p>
            </div>

            <Button onClick={handleSetupWebhook} disabled={isLoading} className="w-full">
              {isLoading ? "Setting up..." : "Configure Webhook"}
            </Button>

            {webhookInfo && (
              <div className="space-y-2">
                <h4 className="font-medium text-card-foreground">Current Webhook Status</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {webhookInfo.url ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="font-medium">{webhookInfo.url ? "Webhook Active" : "No Webhook Set"}</span>
                  </div>
                  {webhookInfo.url && <p className="text-muted-foreground break-all">URL: {webhookInfo.url}</p>}
                  {webhookInfo.last_error_message && (
                    <p className="text-red-600 text-xs mt-1">Error: {webhookInfo.last_error_message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bot Commands Reference */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Bot Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">Shopping Commands</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <code>/products</code> - View all products
                </p>
                <p>
                  <code>/addtocart [id]</code> - Add item to cart
                </p>
                <p>
                  <code>/cart</code> - View current cart
                </p>
                <p>
                  <code>/checkout</code> - Place order
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-card-foreground">Order Commands</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <code>/orders</code> - View order history
                </p>
                <p>
                  <code>/track [order_id]</code> - Track order
                </p>
                <p>
                  <code>/help</code> - Show help message
                </p>
                <p>
                  <code>/start</code> - Welcome message
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-card-foreground mb-2">Natural Language Support</h4>
            <p className="text-sm text-muted-foreground">
              Users can also chat naturally: "show me breakfast items", "add dosa batter", "where is my order", etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
