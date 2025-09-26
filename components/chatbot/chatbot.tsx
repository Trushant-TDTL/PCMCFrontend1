"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, X, Bot, User, Maximize2, Minimize2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotProps {
  dashboardContext: string
  className?: string
}

interface ApiResponse {
  response: string
  cached: boolean
}

// API ENDPOINTS MAPPING
const API_ENDPOINTS: Record<string, string> = {
  // --- ADDED THIS NEW LINE ---
  "environment-conversational": "https://tdtlworld.com/pcmc-backend/api/pcmc_data_rag_api/",
  
  "sustainable-urban-landscape": "https://tdtlworld.com/pcmc-backend/api/urban-landscape-bot/",
  "sustainable-transport-&-mobility": "https://tdtlworld.com/pcmc-backend/api/sustainable-transport-mobility-bot/",
  "disaster-resilience": "https://tdtlworld.com/pcmc-backend/api/disaster-resilience-bot/",
  "sustainable-finance-&-innovation": "https://tdtlworld.com/pcmc-backend/api/sustainable-finance-bot/",
  "project-monitoring-&-evaluation": "http://127.0.0.1:8000/api/project-monitoring-bot/",
  "social-development": "http://127.0.0.1:8000/api/social-development-bot/",
  "default": "https://tdtlworld.com/pcmc-backend/api/urban-landscape-bot/", // Fallback
}

// CORRECT IMPORT: In your other files, import this component using: import { Chatbot } from "@/components/chatbot/chatbot";
export function Chatbot({ dashboardContext, className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Effect to reset and initialize chat when the dashboard context changes
  useEffect(() => {
    setMessages([{
      id: "1",
      content: `👋 Hello! I'm your assistant for the ${dashboardContext} dashboard. How can I help you today?`,
      sender: "bot",
      timestamp: new Date(),
    }])
  }, [dashboardContext])

  // Effect to scroll to the bottom of the messages when new ones are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Effect to auto-resize the textarea
  useEffect(() => {
    const textarea = document.getElementById("chatbot-textarea")
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const callDashboardAPI = async (query: string): Promise<string> => {
    try {
      // Normalize the context string to match the keys in API_ENDPOINTS
      // Example: "Sustainable Transport & Mobility" becomes "sustainable-transport-&-mobility"
      const normalizedContext = dashboardContext.toLowerCase().replace(/ & /g, '-&-').replace(/\s+/g, '-')
      const apiUrl = API_ENDPOINTS[normalizedContext] || API_ENDPOINTS.default

      console.log(`[Chatbot] Context: "${dashboardContext}" -> Normalized: "${normalizedContext}"`);
      console.log(`[Chatbot] Selected API Endpoint: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      if (!response.ok) throw new Error(`API failed with status: ${response.status}`)

      const data: ApiResponse = await response.json()
      return data.response
    } catch (error) {
      console.error("Chatbot API Error:", error)
      return `⚠️ Sorry, I can't access the ${dashboardContext} data right now. Please try again later.`
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue;
    setInputValue("")
    setIsTyping(true)

    try {
      const apiResponse = await callDashboardAPI(currentInput)
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: apiResponse,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const clearChat = () => {
    setIsTyping(true)
    setTimeout(() => {
        setMessages([{
            id: "1",
            content: `Chat cleared! I'm ready to help with the ${dashboardContext} dashboard.`,
            sender: "bot",
            timestamp: new Date(),
        }])
        setIsTyping(false)
    }, 500)
  }

  const getChatbotDimensions = () =>
    isExpanded ? "w-[550px] h-[700px]" : "w-[420px] h-[600px]"

  const getPositionClasses = () => isExpanded ? "bottom-4 right-4" : "bottom-6 right-6"

  return (
    <div className={cn("fixed z-50", getPositionClasses(), className)}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 animate-pulse"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Card
          className={cn(
            "flex flex-col shadow-2xl border border-gray-700 bg-gray-900 text-gray-100 transition-all duration-300 rounded-2xl overflow-hidden",
            getChatbotDimensions()
          )}
        >
          <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between pb-3 border-b border-gray-700 bg-gray-800/90">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{dashboardContext} Assistant</CardTitle>
                <p className="text-xs text-gray-400">Powered by PCMC Data API</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex gap-3", m.sender === "user" ? "justify-end" : "justify-start")}>
                  {m.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    m.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
                  )}>
                    <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    <div className={cn("text-xs mt-1 opacity-70", m.sender === "user" ? "text-blue-200" : "text-gray-400")}>
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {m.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700">
                    <div className="flex gap-1 items-center text-gray-400 text-sm">
                      Typing
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <div className="flex-shrink-0 p-3 border-t border-gray-700 bg-gray-800/90">
            <div className="flex gap-2 items-end">
              <textarea
                id="chatbot-textarea"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none max-h-32 transition-height"
                rows={1}
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                disabled={!inputValue.trim() || isTyping}
                className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex-shrink-0"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Press Shift+Enter for a new line.</p>
          </div>
        </Card>
      )}
    </div>
  )
}