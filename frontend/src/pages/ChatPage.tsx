import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getChatSessions, createChatSession, sendChatMessage } from '../services/api'
import { useAppStore } from '../store/appStore'
import { MessageSquare, Send, Sparkles, Plus, Loader, Bot, User, Brain, HelpCircle, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import toast from 'react-hot-toast'

interface Message {
  sender: 'user' | 'ai'
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
}

const CONVERSATION_STARTERS = [
  "How can I optimize my resume experience bullets?",
  "What technical skills am I missing for a Frontend Engineer?",
  "Give me behavioral mock questions for Amazon SDE role.",
  "How do I explain a employment gap during an interview?",
  "Analyze my current resume summary and suggest edits."
]

export default function ChatPage() {
  const { currentResume } = useAppStore()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages])

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = (selectId?: string) => {
    getChatSessions()
      .then(res => {
        setSessions(res.data)
        if (res.data.length > 0) {
          const selected = selectId 
            ? res.data.find((s: any) => s.id === selectId) 
            : res.data[0]
          setActiveSession(selected || res.data[0])
        } else {
          // If no sessions exist, auto-create one
          handleNewSession()
        }
      })
      .catch(() => {
        toast.error('Failed to load chat history.')
      })
      .finally(() => setLoading(false))
  }

  const handleNewSession = async () => {
    try {
      const res = await createChatSession()
      const newSession = res.data
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession)
    } catch {
      toast.error('Failed to create new chat session.')
    }
  }

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !activeSession) return
    
    // Add user message locally first for instant feedback
    const userMsg: Message = {
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    }
    
    const updatedMessages = [...activeSession.messages, userMsg]
    setActiveSession(prev => prev ? { ...prev, messages: updatedMessages } : null)
    setInput('')
    setSending(true)

    try {
      const res = await sendChatMessage(
        activeSession.id,
        textToSend,
        currentResume?.id || undefined
      )
      
      const aiMsg: Message = {
        sender: 'ai',
        content: res.data.response,
        timestamp: res.data.timestamp || new Date().toISOString()
      }
      
      // Update session locally
      setActiveSession(prev => prev ? { ...prev, messages: [...updatedMessages, aiMsg] } : null)
      
      // Update session lists
      setSessions(prev => 
        prev.map(s => s.id === activeSession.id ? { ...s, messages: [...updatedMessages, aiMsg] } : s)
      )
    } catch (err: any) {
      toast.error(err.message || 'AI failed to reply.')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto p-4 overflow-hidden">
      {/* Sidebar: Conversations (1 col) */}
      <div className="md:col-span-1 glass-card flex flex-col overflow-hidden max-h-full">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare size={16} /> Conversations
          </h3>
          <button 
            onClick={handleNewSession}
            className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-primary/20 hover:bg-blue-500/20 text-blue-600 dark:text-white transition-all shadow-sm"
            title="Start New Chat"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-thin">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSession(s)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                activeSession?.id === s.id
                  ? 'border-blue-500 bg-blue-500/5 text-blue-700 dark:border-primary/30 dark:bg-primary/10 dark:text-white font-bold'
                  : 'border-transparent text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <p className="text-xs truncate font-semibold">{s.title || "Career Conversation"}</p>
              <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">
                {s.messages.length} messages
              </p>
            </button>
          ))}
        </div>

        {/* Current Resume context badge */}
        {currentResume && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 shrink-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-emerald-600 truncate max-w-full">
                Context: {currentResume.fileName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main chat client (3 cols) */}
      <div className="md:col-span-3 glass-card flex flex-col overflow-hidden max-h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary text-white">
            <Bot size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">AI Career Mentor</h4>
            <p className="text-[10px] text-slate-400 dark:text-white/40">Powered by CareerPilot LLM Engine</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
          <AnimatePresence initial={false}>
            {activeSession?.messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white' 
                    : 'bg-gradient-to-br from-primary to-accent text-white shadow-glow-primary'
                }`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-4 rounded-2xl relative group ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-tl-none text-slate-800 dark:text-white'
                }`}>
                  <div className="prose dark:prose-invert prose-sm text-xs leading-relaxed max-w-none break-words font-medium font-sans text-inherit">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}

            {sending && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot size={14} />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Starters */}
        {activeSession && activeSession.messages.length <= 1 && (
          <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 shrink-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles size={11} /> Suggested Topics
            </p>
            <div className="flex flex-wrap gap-2">
              {CONVERSATION_STARTERS.map(starter => (
                <button
                  key={starter}
                  onClick={() => handleSendMessage(starter)}
                  className="text-left px-3 py-2 rounded-xl bg-white dark:bg-[#111] hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-[11px] font-medium transition-all"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Input */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage(input)}
            disabled={sending}
            placeholder="Ask CareerPilot anything..."
            className="input-field text-sm flex-1"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={sending || !input.trim()}
            className="btn-primary px-5 py-3 shadow-lg flex items-center justify-center shrink-0 disabled:opacity-40 disabled:scale-100"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
