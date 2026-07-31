import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  X,
  Sparkles,
  Building2,
  ChevronRight,
  Calculator,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'
import { aiApi } from '../../services/api'
import { formatPrice } from '../../utils/helpers'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! 👋 I am **Bharat AI**, your 24/7 real estate assistant.\n\nAsk me to search properties in any city, calculate loan EMIs, or guide you on posting listings!',
      suggestions: [
        'Properties in Mumbai',
        'Calculate EMI for 50 Lakhs',
        'How to post property?',
        'Properties in Pune',
      ],
    },
  ])

  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsgId = Date.now().toString()
    const newMessages = [
      ...messages,
      { id: userMsgId, sender: 'user', text: query.trim() },
    ]

    setMessages(newMessages)
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const res = await aiApi.chat(query.trim())
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.replyText || 'I found some information for you:',
          properties: res.properties || [],
          suggestions: res.suggestions || [],
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I'm having trouble connecting right now. Please try asking again or visit our Help & Support page.",
          suggestions: ['Try again', 'Help & Support'],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Chat history cleared. How can I help you today?',
        suggestions: [
          'Properties in Mumbai',
          'Calculate EMI for 50 Lakhs',
          'How to post property?',
        ],
      },
    ])
  }

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-5 right-5 z-[999]">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-orange-500/40 relative overflow-hidden"
          >
            {/* Glowing ring animation */}
            <span className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-30" />

            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>

            <span className="hidden sm:inline text-sm font-bold tracking-wide">
              Ask Bharat AI
            </span>

            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
          </motion.button>
        )}
      </div>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 z-[9999] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                    Bharat AI Assistant
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">
                      Online
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1">Real Estate Intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear Chat"
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender Bubble */}
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-primary-500 text-white rounded-br-none shadow-md shadow-orange-500/10'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Matched Property Cards Grid */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 w-full">
                      {msg.properties.map((prop) => (
                        <Link
                          key={prop.id || prop._id}
                          to={`/properties/${prop.id || prop._id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 hover:border-primary-300 rounded-xl shadow-sm hover:shadow-md transition-all group"
                        >
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=80'}
                            alt={prop.title}
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-gray-900 truncate group-hover:text-primary-600">
                              {prop.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate">
                              {prop.city} • {prop.type}
                            </p>
                            <p className="text-xs font-bold text-primary-600 mt-0.5">
                              {formatPrice(prop.price)}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-500 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Suggestion Pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] bg-white hover:bg-orange-50 text-gray-700 hover:text-primary-600 border border-gray-200 hover:border-primary-300 px-2.5 py-1 rounded-full transition-all font-medium shadow-2xs"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-2 bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none w-24 text-gray-400 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Bharat AI..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-orange-500/20 shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
