"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Search } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { parseNaturalLanguageQuery, parseOrderCommand } from "@/lib/utils/nlp"
import { mockProducts } from "@/lib/data"
import { toast } from "@/hooks/use-toast"

interface VoiceSearchProps {
  onSearch: (query: string) => void
}

export function VoiceSearch({ onSearch }: VoiceSearchProps) {
  const { isListening, setIsListening, setSearchQuery, addToCart } = useAppStore()
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<any | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      recognitionInstance.onstart = () => {
        setIsListening(true)
      }

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex
        const transcriptResult = event.results[current][0].transcript
        setTranscript(transcriptResult)

        if (event.results[current].isFinal) {
          handleVoiceCommand(transcriptResult)
        }
      }

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or use text search.",
          variant: "destructive",
        })
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const handleVoiceCommand = (command: string) => {
    console.log("[v0] Processing voice command:", command)

    // Check if it's an order command
    const orderCommand = parseOrderCommand(command)
    if (orderCommand.action === "add_to_cart" && orderCommand.product) {
      // Find matching product
      const product = mockProducts.find(
        (p) =>
          p.name.toLowerCase().includes(orderCommand.product!.toLowerCase()) ||
          orderCommand.product!.toLowerCase().includes(p.name.toLowerCase()),
      )

      if (product) {
        addToCart(product, orderCommand.quantity)
        toast({
          title: "Added to Cart",
          description: `${orderCommand.quantity} ${product.name} added to cart`,
        })
        setTranscript("")
        return
      }
    }

    // Otherwise treat as search query
    const searchQuery = parseNaturalLanguageQuery(command)
    console.log("[v0] Parsed search query:", searchQuery)

    setSearchQuery(command)
    onSearch(command)
    setTranscript("")

    toast({
      title: "Voice Search",
      description: `Searching for: ${command}`,
    })
  }

  const startListening = () => {
    if (recognition) {
      setTranscript("")
      recognition.start()
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
  }

  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (transcript.trim()) {
      handleVoiceCommand(transcript)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleTextSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search products or say 'Order 2 packs of dosa batter'"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="pr-12 bg-input border-border focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`px-4 ${
            isListening
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Voice
            </>
          )}
        </Button>
      </form>

      {isListening && (
        <div className="mt-2 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Listening... Try saying "Show me breakfast items under 200" or "Order 2 packs of dosa batter"
          </p>
        </div>
      )}
    </div>
  )
}
