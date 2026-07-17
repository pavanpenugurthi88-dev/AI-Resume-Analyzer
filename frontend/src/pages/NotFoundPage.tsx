import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle, ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-gradient-to-b from-[#020617] to-[#0f172a] text-white p-6 relative overflow-hidden font-sans">
      <div className="orb orb-primary top-1/4 left-1/4 w-80 h-80 opacity-20" />
      <div className="orb orb-accent bottom-1/4 right-1/4 w-96 h-96 opacity-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-12 max-w-md w-full text-center relative z-10"
      >
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
          <HelpCircle size={36} className="text-blue-400" />
        </div>

        <h1 className="text-7xl font-black text-white mb-2 tracking-tighter">404</h1>
        <h2 className="text-xl font-bold text-white mb-4">Lost in Transit</h2>
        <p className="text-white/60 text-xs mb-8 leading-relaxed max-w-xs mx-auto">
          The page you are looking for does not exist or has been relocated to another workspace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard"
            className="btn-primary py-3 px-6 text-xs flex-1 justify-center"
          >
            <Home size={14} /> Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
