import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleDemo = () => {
    const demoUser = { id: 'demo', email: 'demo@resumeai.pro', displayName: 'Demo User', photoURL: undefined }
    localStorage.setItem('demo_user', JSON.stringify(demoUser))
    setUser(demoUser)
    toast.success('Welcome to Demo Mode!')
    navigate('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      const user = { id: `user_${Date.now()}`, email, displayName: name || email.split('@')[0], photoURL: undefined }
      localStorage.setItem('demo_user', JSON.stringify(user))
      setUser(user)
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!')
      navigate('/dashboard')
    } catch {
      toast.error('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    toast('Google sign-in requires Firebase config. Use Demo Mode for now.', { icon: '💡' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12 bg-black/20">
        <div className="orb-primary w-80 h-80 -top-20 -left-20 opacity-30" />
        <div className="orb-accent w-64 h-64 -bottom-16 -right-16 opacity-25" />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-primary">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-white">ResumeAI Pro</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Your AI-powered<br /><span className="gradient-text">career co-pilot</span>
          </h1>
          <p className="text-white/80 mb-10 leading-relaxed">
            Get ATS scores, AI improvement tips, skill gap analysis, and interview coaching — all in one place.
          </p>
          <div className="space-y-4">
            {[
              'ATS Score Analysis with 5 weighted factors',
              'Gemini AI resume improvement suggestions',
              'Mock interviews with real-time AI feedback',
              'Personalized week-by-week learning roadmap'
            ].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow-primary lg:hidden">
              <Sparkles size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
            <p className="text-white/60 text-sm mt-1">{mode === 'login' ? 'Sign in to your account' : 'Start your AI career journey'}</p>
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemo}
            className="w-full mb-6 py-3 px-4 rounded-xl border-2 border-dashed border-primary-500/40 text-primary-300 text-sm font-semibold hover:border-primary-500/70 hover:bg-primary-500/5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Continue as Demo (No account needed)
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs text-white/40">
              <span className="bg-[#020617] px-3 text-white/60">or sign in with email</span>
            </div>
          </div>

          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === m ? 'bg-primary text-white shadow' : 'text-white/60 hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" size={16} />
                    <input id="name" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                      className="input-field pl-10" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" size={16} />
              <input id="email" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
                className="input-field pl-10" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" size={16} />
              <input id="password" type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="input-field pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <button onClick={handleGoogle}
            className="w-full mt-3 flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/10 text-white/80 text-sm hover:bg-white/5 hover:text-white transition-all duration-200">
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
