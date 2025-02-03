"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"
import aiChatService from "@/services/aiChatService"

interface ChatMessage {
  content: string
  isUser: boolean
}

export function AIChatInterface() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat()
    }
  }, [isOpen, sessionId])

  const initializeChat = async () => {
    try {
      const session = await aiChatService.initializeChat()
      setSessionId(session.id)
      const history = await aiChatService.getChatHistory(session.id)
      setMessages(history)
    } catch (error) {
      console.error("Error initializing chat:", error)
    }
  }

  const sendMessage = async () => {
    if (!sessionId || !inputMessage.trim()) return

    const userMessage: ChatMessage = { content: inputMessage, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")

    try {
      const response = await aiChatService.sendMessage(sessionId, inputMessage)
      setMessages((prev) => [...prev, response])
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const toggleChat = () => setIsOpen(!isOpen)

  const chatVariants = {
    open: {
      width: 300,
      height: 400,
      borderRadius: 12,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      width: 48,
      height: 48,
      borderRadius: 24,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const contentVariants = {
    open: {
      opacity: 1,
      transition: { delay: 0.2 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  const iconVariants = {
    open: { scale: 0, opacity: 0 },
    closed: { scale: 1, opacity: 1 },
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence initial={false}>
        <motion.div
          key="chat-container"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={chatVariants}
          className="bg-slate-100 shadow-lg overflow-hidden flex flex-col absolute bottom-0 right-0"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="chat-content"
                initial="closed"
                animate="open"
                exit="closed"
                variants={contentVariants}
                className="flex-grow flex flex-col bg-white"
              >
                <div className="p-4 bg-slate-200 text-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">AI Financial Advisor</h2>
                  <button onClick={toggleChat} className="text-gray-600 hover:text-gray-800 focus:outline-none">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.isUser ? "text-right" : "text-left"}`}>
                      <span
                        className={`inline-block p-2 rounded-lg ${msg.isUser ? "bg-slate-200 text-gray-700" : "bg-slate-300 text-gray-800"}`}
                      >
                        {msg.content}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-100 border-t border-gray-200 flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow p-2 rounded-l border border-gray-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-slate-200 text-gray-700 p-2 rounded-r hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="chat-button"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex items-center justify-center text-white bg-slate-400 focus:outline-none"
                onClick={toggleChat}
              >
                <MessageCircle size={24} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

