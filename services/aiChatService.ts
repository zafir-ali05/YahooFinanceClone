import axios from "axios"

// Base URL for your Django backend
const API_BASE_URL = "http://your-django-backend-url.com/api"

// Interface for chat message
interface ChatMessage {
  content: string
  isUser: boolean
}

// Interface for financial advice request
interface FinancialAdviceRequest {
  topic: string
  context?: string
}

const aiChatService = {
  // Initialize a new chat session
  initializeChat: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/initialize/`)
      return response.data
    } catch (error) {
      console.error("Error initializing chat:", error)
      throw error
    }
  },

  // Send a message and get a response
  sendMessage: async (sessionId: string, message: string): Promise<ChatMessage> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/message/`, {
        session_id: sessionId,
        message: message,
      })
      return response.data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  },

  // Get chat history
  getChatHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/history/${sessionId}/`)
      return response.data
    } catch (error) {
      console.error("Error fetching chat history:", error)
      throw error
    }
  },

  // Request financial advice
  getFinancialAdvice: async (request: FinancialAdviceRequest): Promise<string> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/financial-advice/`, request)
      return response.data.advice
    } catch (error) {
      console.error("Error getting financial advice:", error)
      throw error
    }
  },
}

export default aiChatService

