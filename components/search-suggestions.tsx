"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Clock } from "lucide-react"
import { getSearchSuggestions } from "@/lib/utils/ai-features"
import { mockProducts } from "@/lib/data"

interface SearchSuggestionsProps {
  query: string
  onSelectSuggestion: (suggestion: string) => void
  isVisible: boolean
}

export function SearchSuggestions({ query, onSelectSuggestion, isVisible }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches] = useState<string[]>(["breakfast items under 200", "south indian spices", "ready to eat"])

  useEffect(() => {
    if (query.length > 1) {
      const newSuggestions = getSearchSuggestions(query, mockProducts)
      setSuggestions(newSuggestions)
    } else {
      setSuggestions([])
    }
  }, [query])

  if (!isVisible) {
    return null
  }

  const showSuggestions = suggestions.length > 0
  const showRecent = query.length === 0 && recentSearches.length > 0

  if (!showSuggestions && !showRecent) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
      {showRecent && (
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Recent Searches
          </div>
          {recentSearches.map((search, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => onSelectSuggestion(search)}
              className="w-full justify-start text-left h-8 px-2 text-sm"
            >
              {search}
            </Button>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div className="p-2">
          {query.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
              <Search className="h-3 w-3" />
              Suggestions
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => onSelectSuggestion(suggestion)}
              className="w-full justify-start text-left h-8 px-2 text-sm"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
