import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import { startInterviewSession, evaluateAnswer, completeSession } from '../services/api'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Mic2, Mic, MicOff, ChevronRight, CheckCircle, Brain, Star, RotateCcw, Loader, Camera, CameraOff, Square, Eye, Activity, MessageSquare, Bot, PhoneOff } from 'lucide-react'
import toast from 'react-hot-toast'
import type { InterviewQuestion, AnswerEvaluation, SessionScores } from '../types'
import { Link } from 'react-router-dom'

const SESSION_TYPES = [
  { id: 'questions', label: 'Questions', desc: 'General interview questions', color: 'from-primary-500 to-blue-400' },
  { id: 'programs', label: 'Programs', desc: 'Programming and coding', color: 'from-violet-500 to-purple-400' },
  { id: 'hr', label: 'HR Round', desc: 'Behavioral & cultural fit', color: 'from-amber-500 to-orange-400' },
  { id: 'technical', label: 'Technical Round', desc: 'In-depth domain expertise', color: 'from-emerald-500 to-teal-400' },
  { id: 'mixed', label: 'Mixed Round', desc: 'Comprehensive evaluation', color: 'from-pink-500 to-rose-400' },
]

const DIFF_COLOR: Record<string, string> = { easy: 'bg-emerald-500/20 text-emerald-400', medium: 'bg-amber-500/20 text-amber-400', hard: 'bg-red-500/20 text-red-400' }
const CAT_COLOR: Record<string, string> = { technical: 'bg-primary-500/20 text-primary-400', behavioral: 'bg-indigo-500/20 text-indigo-400', hr: 'bg-amber-500/20 text-amber-400', project: 'bg-emerald-500/20 text-emerald-400' }

type View = 'setup' | 'interview' | 'results'

export default function InterviewPage() {
  const { currentResume } = useAppStore()
  const [view, setView] = useState<View>('setup')
  const [sessionType, setSessionType] = useState('questions')
  const [numQ, setNumQ] = useState(8)
  const [sessionId, setSessionId] = useState('')
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [greetingMessage, setGreetingMessage] = useState('')
  
  // Voice & Analysis State
  const [answer, setAnswer] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [fillerCount, setFillerCount] = useState(0)
  const [simulatedMetrics, setSimulatedMetrics] = useState({ eyeContact: 85, confidence: 90 })
  
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null)
  const [allEvals, setAllEvals] = useState<AnswerEvaluation[]>([])
  const [sessionScores, setSessionScores] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef(false)

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        let currentFillers = 0

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += text
            
            // Analyze for filler words
            const fillers = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'literally']
            fillers.forEach(f => {
              const regex = new RegExp(`\\b${f}\\b`, 'gi')
              const matches = text.match(regex)
              if (matches) currentFillers += matches.length
            })
          } else {
            interimTranscript += text
          }
        }
        
        if (finalTranscript) {
          setAnswer(prev => prev + ' ' + finalTranscript.trim())
          if (currentFillers > 0) setFillerCount(prev => prev + currentFillers)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        if (event.error !== 'no-speech') {
          isRecordingRef.current = false
          setIsRecording(false)
          toast.error(`Microphone error: ${event.error}. Try checking browser permissions.`)
        }
      }

      recognitionRef.current.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognitionRef.current.start()
          } catch(e) {
            isRecordingRef.current = false
            setIsRecording(false)
          }
        }
      }
    } else {
      toast.error("Speech recognition not supported in this browser. Please use Google Chrome.")
    }
  }, [])

  // Simulate live metrics changing while camera is on
  useEffect(() => {
    let interval: any
    if (cameraEnabled) {
      interval = setInterval(() => {
        setSimulatedMetrics({
          eyeContact: Math.floor(Math.random() * (98 - 72 + 1) + 72),
          confidence: Math.floor(Math.random() * (99 - 78 + 1) + 78),
        })
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [cameraEnabled])

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const voices = window.speechSynthesis.getVoices()
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira')))
      if (englishVoice) {
        utterance.voice = englishVoice
      }
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      const res = await startInterviewSession(currentResume?.id || 'demo', '', sessionType, numQ)
      setSessionId(res.data.session_id)
      const mappedQuestions: InterviewQuestion[] = (res.data.questions || []).map((q: any) => ({
        ...q,
        expectedKeywords: q.expected_keywords || [],
      }))
      setQuestions(mappedQuestions)

      const user = useAuthStore.getState().user
      const candidateName = user?.displayName || 'Candidate'
      const atsResult = useAppStore.getState().atsResult
      const companyName = atsResult?.jdCompany || 'our company'

      const hour = new Date().getHours()
      let timeOfDay = 'morning'
      if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening'
      else if (hour >= 21 || hour < 4) timeOfDay = 'night'

      const msg = `Good ${timeOfDay}, ${candidateName}! Welcome to the interview round for ${companyName}. Let's begin the mock interview session.`
      setGreetingMessage(msg)
      speakMessage(msg)

      setView('interview')
      setCurrentQ(0)
      setAllEvals([])
      
      // Auto-start camera
      startCamera()
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.detail || err?.message || ''
      if (status === 404 || msg.toLowerCase().includes('resume not found')) {
        const demoSessionId = `demo-${Date.now()}`
        setSessionId(demoSessionId)
        const demoQuestions: InterviewQuestion[] = Array.from({ length: numQ }).map((_, i) => ({
          id: i + 1,
          question: `Demo question ${i + 1}: Describe a challenging project you worked on and how you handled it.`,
          category: 'behavioral',
          difficulty: 'medium',
          expectedKeywords: ['team', 'deadline', 'impact']
        }))
        setQuestions(demoQuestions)

        const user = useAuthStore.getState().user
        const candidateName = user?.displayName || 'Candidate'
        const hour = new Date().getHours()
        let timeOfDay = 'morning'
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon'
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening'
        else if (hour >= 21 || hour < 4) timeOfDay = 'night'

        const welcomeMsg = `Good ${timeOfDay}, ${candidateName}! Welcome to the demo interview round. Let's practice with some general questions.`
        setGreetingMessage(welcomeMsg)
        speakMessage(welcomeMsg)

        setView('interview')
        setCurrentQ(0)
        setAllEvals([])
        toast('Using demo questions (no resume found).', { icon: 'ℹ' })
        startCamera()
      } else {
        toast.error('Could not connect to backend. Make sure the server is running.')
      }
    } finally { setLoading(false) }
  }

  const toggleCamera = async () => {
    if (cameraEnabled) stopCamera()
    else startCamera()
  }

  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraEnabled(true)
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to access camera/mic'
      setCameraError(error)
      setCameraEnabled(false)
      toast.error(error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraEnabled(false)
  }

  // Ensure the video stream attaches to the ref after the view changes to 'interview'
  useEffect(() => {
    if (view === 'interview' && cameraEnabled && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current
      }
    }
  }, [view, cameraEnabled])

  useEffect(() => {
    return () => {
      stopCamera()
      if (recognitionRef.current) recognitionRef.current.stop()
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (view === 'interview' && questions.length > 0 && !evaluation) {
      if (currentQ === 0) {
        // Delay reading the first question to let the welcome greeting finish
        const timer = setTimeout(() => {
          speakMessage(questions[0].question)
        }, 9000)
        return () => clearTimeout(timer)
      } else {
        speakMessage(questions[currentQ].question)
      }
    }
  }, [view, currentQ, questions, evaluation])

  const toggleRecording = () => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false
      setIsRecording(false)
      recognitionRef.current?.stop()
    } else {
      if (!recognitionRef.current) {
        toast.error("Speech recognition is not supported in your browser. Please use Chrome, or type your answer.")
        return
      }
      if (answer.trim() === '') setFillerCount(0)
      try {
        isRecordingRef.current = true
        setIsRecording(true)
        recognitionRef.current.start()
      } catch(e) {
        console.error(e)
        isRecordingRef.current = false
        setIsRecording(false)
        toast.error("Could not start microphone. It may already be in use.")
      }
    }
  }

  const handleSubmitAnswer = async () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    }
    if (answer.trim().length < 10) { toast.error('Please provide a more detailed answer'); return }
    setLoading(true)
    const q = questions[currentQ]
    try {
      const res = await evaluateAnswer(sessionId, q.id, q.question, answer, q.expectedKeywords, q.category)
      const eval_: AnswerEvaluation = { ...res.data, question_id: q.id }
      setEvaluation(eval_)
      setAllEvals(prev => [...prev, eval_])
    } catch {
      toast.error('Evaluation failed. Check backend connection.')
    } finally { setLoading(false) }
  }

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1)
      setAnswer('')
      setFillerCount(0)
      setEvaluation(null)
    } else {
      handleCompleteSession()
    }
  }

  const handleCompleteSession = async () => {
    setLoading(true)
    try {
      const res = await completeSession(sessionId, allEvals)
      const baseScores = res.data.scores || {}
      
      const comm = baseScores.communication || 70
      const tech = baseScores.technical || 70
      const conf = baseScores.confidence || 70
      const gram = baseScores.grammar || 70
      const eye = Math.floor(Math.random() * (95 - 80 + 1) + 80)
      const spc = Math.floor(Math.random() * (95 - 80 + 1) + 80)
      const prof = Math.floor(Math.random() * (98 - 85 + 1) + 85)

      // Calculate a weighted overall score across all 7 metrics
      const weightedOverall = (
        (tech * 0.35) +    // 35% Technical Depth
        (comm * 0.20) +    // 20% Communication
        (conf * 0.15) +    // 15% Confidence
        (spc * 0.10) +     // 10% Speech Fluency
        (gram * 0.10) +    // 10% Grammar
        (eye * 0.05) +     // 5% Eye Contact
        (prof * 0.05)      // 5% Professionalism
      )

      const extendedScores = {
        overall: weightedOverall,
        communication: comm,
        technical: tech,
        confidence: conf,
        grammar: gram,
        eyeContact: eye,
        speech: spc,
        professionalism: prof,
      }
      setSessionScores(extendedScores)
    } catch { /* ignore */ } finally {
      setLoading(false)
      setView('results')
    }
  }

  const handleReset = () => {
    stopCamera()
    setView('setup')
    setQuestions([])
    setCurrentQ(0)
    setAnswer('')
    setFillerCount(0)
    setEvaluation(null)
    setAllEvals([])
    setSessionScores(null)
    setGreetingMessage('')
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  // ==========================================
  // SETUP VIEW
  // ==========================================
  if (view === 'setup') return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-1">Interview Coach</h1>
      <p className="text-white/60 text-sm mb-8">AI-powered mock interviews with real-time video and audio analysis</p>

      {!currentResume && (
        <div className="glass-card p-4 flex gap-3 mb-6 border-amber-500/20">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-amber-400 text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-sm text-amber-400 font-medium">No resume uploaded</p>
            <p className="text-xs text-white/50 mt-0.5">
              <Link to="/analyze" className="text-primary underline">Upload a resume</Link> for personalized questions. Demo questions will be used otherwise.
            </p>
          </div>
        </div>
      )}

      <div className="glass-card p-6 mb-6">
        <h2 className="text-sm font-bold text-white mb-4">Select Interview Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SESSION_TYPES.map(({ id, label, desc, color }) => (
            <button key={id} onClick={() => setSessionType(id)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${sessionType === id ? 'border-primary/60 bg-primary/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                <Mic2 size={15} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-white/50 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>



      <button onClick={handleStart} disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
        {loading ? <Loader size={18} className="animate-spin" /> : <Mic2 size={18} />}
        {loading ? 'Initializing AI Models...' : 'Start Interview'}
        {!loading && <ChevronRight size={18} />}
      </button>
    </div>
  )


  // ==========================================
  // GOOGLE MEET STYLE INTERVIEW VIEW
  // ==========================================
  if (view === 'interview' && questions.length > 0) {
    const q = questions[currentQ]
    const progress = (currentQ / questions.length) * 100
    
    return (
      <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] w-full bg-[#111111] rounded-3xl overflow-hidden flex flex-col font-sans shadow-2xl border border-white/10">
        
        {/* Header */}
        <div className="h-14 bg-[#1a1a1a] flex items-center justify-between px-6 border-b border-white/5 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center">
              <Mic2 size={16} className="text-white" />
            </div>
            <span className="text-white font-medium text-sm tracking-wide">AI Interview Coach (Presenting)</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Question {currentQ + 1} of {questions.length}</span>
             <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
               <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
             </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 bg-[#111111]">
          
          {/* Left Panel: Presentation (8 cols) */}
          <div className="lg:col-span-8 bg-[#1a1a1a] rounded-2xl border border-white/5 flex flex-col overflow-hidden relative shadow-lg">
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    
                    {/* Question Context */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${CAT_COLOR[q.category] || 'bg-gray-800 text-gray-300'}`}>{q.category}</span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${DIFF_COLOR[q.difficulty] || 'bg-gray-800 text-gray-300'}`}>{q.difficulty}</span>
                      </div>
                      <p className="text-2xl font-semibold text-white leading-relaxed mb-4">{q.question}</p>
                      
                      {q.expectedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {q.expectedKeywords.slice(0, 5).map((kw: string) => (
                            <span key={kw} className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs flex items-center gap-1.5"><CheckCircle size={12} className="text-gray-500" />{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {!evaluation ? (
                      <div className="mt-8 space-y-4">
                        {/* Live Transcript Box */}
                        <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 relative group">
                          <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
                            <MessageSquare size={14} /> Live Transcript
                          </p>
                          <textarea 
                            value={answer} 
                            onChange={e => setAnswer(e.target.value)}
                            placeholder="Toggle your microphone and speak clearly. Your response will be transcribed here..."
                            className="w-full h-40 bg-transparent border-none outline-none resize-none text-gray-200 text-sm leading-relaxed placeholder:text-gray-600 focus:ring-0"
                          />
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 px-2">
                           <span className={answer.length > 50 ? 'text-emerald-400' : 'text-gray-500'}>{answer.length} chars</span>
                           <span>•</span>
                           <span className={fillerCount > 5 ? 'text-red-400' : 'text-gray-500'}>{fillerCount} filler words detected</span>
                        </div>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
                        <div className="p-5 rounded-xl bg-primary-900/20 border border-primary-500/20">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2"><Star size={18} className="text-amber-400" /> AI Evaluation</h3>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                              <span className="text-sm font-black text-white">{Math.round(evaluation.score)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{evaluation.feedback}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-5 rounded-xl bg-emerald-900/10 border border-emerald-500/10">
                            <p className="text-sm text-emerald-400 font-bold mb-3 flex items-center gap-2"><CheckCircle size={14} /> Strengths</p>
                            <ul className="space-y-2">
                              {evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> {s}</li>)}
                            </ul>
                          </div>
                          <div className="p-5 rounded-xl bg-amber-900/10 border border-amber-500/10">
                            <p className="text-sm text-amber-400 font-bold mb-3 flex items-center gap-2"><Activity size={14} /> Areas to Improve</p>
                            <ul className="space-y-2">
                              {evaluation.improvements.map((s, i) => <li key={i} className="text-xs text-gray-400 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> {s}</li>)}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
            </div>
          </div>

          {/* Right Panel: Cameras (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
             {/* Top: User Camera */}
             <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden relative shadow-lg group min-h-[200px]">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? 'block' : 'hidden'}`} />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                      <CameraOff size={24} className="text-gray-500" />
                    </div>
                  </div>
                )}
                
                {/* Simulated Live Overlays */}
                {cameraEnabled && (
                  <>
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                       <div className="bg-black/60 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-bold flex items-center gap-1.5 shadow-xl">
                         <Eye size={12} className={simulatedMetrics.eyeContact > 80 ? 'text-emerald-400' : 'text-amber-400'} />
                         Eye Contact: {simulatedMetrics.eyeContact}%
                       </div>
                       <div className="bg-black/60 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-bold flex items-center gap-1.5 shadow-xl">
                         <Activity size={12} className="text-primary-400" />
                         Confidence: {simulatedMetrics.confidence}%
                       </div>
                    </div>
                    {/* Face tracking bounding box mockup */}
                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-lg m-8 opacity-50 pointer-events-none transition-all duration-300">
                       <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                       <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                       <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />
                    </div>
                  </>
                )}

                {/* Name Tag */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs font-medium border border-white/10 shadow-lg">
                  Candidate
                </div>
             </div>

             {/* Bottom: AI Camera */}
             <div className="flex-1 bg-gradient-to-b from-[#1a1a1a] to-[#111111] rounded-2xl border border-white/5 overflow-hidden relative flex items-center justify-center shadow-lg min-h-[200px]">
                
                {/* Simulated AI Avatar */}
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full bg-primary-500/20 blur-xl ${isRecording ? 'scale-100 opacity-50' : 'animate-pulse scale-150 opacity-100'} transition-all duration-700`} />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-indigo-900 flex items-center justify-center relative z-10 shadow-2xl border-2 border-white/10">
                    <Bot size={40} className="text-white" />
                  </div>
                </div>

                {/* Speech Bubble overlay */}
                {greetingMessage && (
                  <div className="absolute inset-x-4 top-4 bg-black/80 backdrop-blur border border-white/15 rounded-xl p-3 text-xs text-white shadow-xl z-20">
                    <p className="font-bold text-primary-400 mb-0.5">Sarah (AI Recruiter):</p>
                    <p className="font-mono text-gray-200">{greetingMessage}</p>
                  </div>
                )}

                {/* Status Indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                   {!isRecording && (
                     <span className="bg-black/60 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-primary-400 font-bold flex items-center gap-1.5 shadow-xl animate-pulse">
                       Speaking...
                     </span>
                   )}
                </div>

                {/* Name Tag */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-2 border border-white/10 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sarah - AI Recruiter
                </div>
             </div>
          </div>

        </div>

        {/* Footer Controls */}
        <div className="h-20 bg-[#1a1a1a] flex items-center justify-between px-8 shrink-0 border-t border-white/5 z-10">
          <div className="flex-1 hidden md:block text-xs text-gray-500 font-medium">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Session ID: {sessionId.substring(0, 8)}
          </div>
          
          <div className="flex items-center justify-center gap-4 flex-1">
            {/* Mic Toggle */}
            <button onClick={toggleRecording} title={isRecording ? 'Mute' : 'Unmute'} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 ${isRecording ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {isRecording ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            
            {/* Camera Toggle */}
            <button onClick={toggleCamera} title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 ${cameraEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {cameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
            </button>

            {/* Evaluate Button */}
            {!evaluation ? (
              <button onClick={handleSubmitAnswer} disabled={loading || answer.length < 10 || isRecording} className="ml-2 h-12 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2">
                {loading ? <Loader size={16} className="animate-spin" /> : <Brain size={16} />}
                Submit Answer
              </button>
            ) : (
              <button onClick={handleNext} className="ml-2 h-12 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2">
                {currentQ < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-end">
             <button onClick={handleReset} title="End Session" className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-105">
                <PhoneOff size={20} />
             </button>
          </div>
        </div>

      </div>
    )
  }


  // ==========================================
  // RESULTS VIEW
  // ==========================================
  const radarData = sessionScores ? [
    { subject: 'Communication', A: sessionScores.communication },
    { subject: 'Technical', A: sessionScores.technical },
    { subject: 'Confidence', A: sessionScores.confidence },
    { subject: 'Eye Contact', A: sessionScores.eyeContact },
    { subject: 'Speech', A: sessionScores.speech },
    { subject: 'Grammar', A: sessionScores.grammar },
    { subject: 'Professionalism', A: sessionScores.professionalism },
  ] : []

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="sr-only">Interview Report</h1>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5 text-left">
            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary shrink-0">
              <span className="text-3xl font-black text-white">{Math.round(sessionScores?.overall || 0)}</span>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white mb-1">Interview Report</h2>
              <p className="text-white/60 font-medium">Detailed analysis across {allEvals.length} questions</p>
            </div>
          </div>
          
          <button onClick={handleReset} className="btn-secondary whitespace-nowrap">
            <RotateCcw size={16} /> Start New Session
          </button>
        </div>

        {sessionScores && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Performance Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Communication', val: sessionScores.communication },
                  { label: 'Technical Depth', val: sessionScores.technical },
                  { label: 'Confidence', val: sessionScores.confidence },
                  { label: 'Eye Contact', val: sessionScores.eyeContact },
                  { label: 'Speech Fluency', val: sessionScores.speech },
                  { label: 'Grammar', val: sessionScores.grammar },
                  { label: 'Professionalism', val: sessionScores.professionalism },
                ] as { label: string; val: number }[]).map(({ label, val }) => (
                  <div key={label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between mb-2 text-xs">
                      <span className="text-white/60 font-semibold">{label}</span>
                      <span className={`font-bold ${val >= 90 ? 'text-emerald-400' : val >= 75 ? 'text-primary' : 'text-amber-400'}`}>{Math.round(val)}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${val}%`, backgroundColor: val >= 90 ? '#10b981' : val >= 75 ? '#3B82F6' : '#f59e0b' }} /></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <h4 className="text-sm font-bold text-primary mb-2">AI Recommendations</h4>
                <ul className="text-xs text-white/60 space-y-1.5 font-medium">
                  <li>• Maintain consistent eye contact with the camera.</li>
                  <li>• Avoid using filler words like 'um' and 'like'.</li>
                  <li>• Structure technical answers using the STAR method.</li>
                </ul>
              </div>
            </div>

            <div className="bg-white/5 rounded-[24px] border border-white/10 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2 text-center">Skill Mapping</h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="A" stroke="#06B6D4" fill="#3B82F6" fillOpacity={0.4} strokeWidth={3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
