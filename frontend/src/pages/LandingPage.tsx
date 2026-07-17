import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, ArrowRight, Target, Brain, Zap, TrendingUp, 
  BookOpen, Mic, CheckCircle, Star, Upload
} from 'lucide-react'

const features = [
  { icon: Target, title: 'ATS Score', desc: 'Multi-factor resume scoring vs job descriptions with 95%+ accuracy', color: 'from-blue-500 to-cyan-400' },
  { icon: Brain, title: 'AI Resume Parser', desc: 'Extract skills, experience, and education automatically using NLP', color: 'from-violet-500 to-purple-400' },
  { icon: Zap, title: 'Skill Gap Analysis', desc: 'Visual comparison of your skills vs what the job requires', color: 'from-amber-500 to-orange-400' },
  { icon: Mic, title: 'Interview Coach', desc: 'AI-generated questions tailored to your resume and the role', color: 'from-pink-500 to-rose-400' },
  { icon: TrendingUp, title: 'AI Suggestions', desc: 'Specific improvement tips with before/after examples from Gemini', color: 'from-emerald-500 to-teal-400' },
  { icon: BookOpen, title: 'Learning Roadmap', desc: 'Week-by-week plan to acquire missing skills for your dream job', color: 'from-indigo-500 to-blue-400' },
]

const steps = [
  { num: '01', title: 'Upload Your Resume', desc: 'Drag & drop your PDF or DOCX resume. Our AI extracts everything instantly.' },
  { num: '02', title: 'Paste Job Description', desc: 'Paste any job description and our engine compares it semantically against your resume.' },
  { num: '03', title: 'Get AI Insights', desc: 'Receive ATS score, skill gaps, improvement suggestions, and personalized interview prep.' },
]

const stats = [
  { value: '10K+', label: 'Resumes Analyzed' },
  { value: '94%', label: 'Interview Success Rate' },
  { value: '50+', label: 'ATS Systems Supported' },
  { value: '4.9★', label: 'User Rating' },
]

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">ResumeAI Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="btn-ghost text-sm hidden sm:flex">Sign In</Link>
          <Link to="/auth" className="btn-primary text-sm py-2 px-4">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Background orbs */}
        <div className="orb-primary w-96 h-96 top-10 -left-32 animate-float" style={{ animationDelay: '0s' }} />
        <div className="orb-accent w-80 h-80 bottom-10 -right-20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="orb-primary w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8"
          >
            <Sparkles size={14} />
            Powered by Google Gemini AI + Sentence Transformers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6"
          >
            <span className="text-white">Supercharge Your</span>
            <br />
            <span className="gradient-text-hero">Career with AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Upload your resume, paste a job description, and get an instant ATS score, 
            AI-powered improvement tips, skill gap analysis, and personalized interview coaching — 
            all in one powerful platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/auth" className="btn-primary text-base py-3.5 px-8 group">
              Start Analyzing Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/auth" className="btn-secondary text-base py-3.5 px-8">
              <Upload size={18} />
              Upload Resume
            </Link>
          </motion.div>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 glass-card p-6 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs text-white/60 font-mono">ATS Analysis Result</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="10"
                    strokeDasharray="251.2" strokeDashoffset="67.8" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">73</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-left">
                {[
                  { label: 'Keyword Match', val: 68, col: '#6366f1' },
                  { label: 'Skill Match', val: 80, col: '#10b981' },
                  { label: 'Grammar', val: 95, col: '#f59e0b' },
                ].map(({ label, val, col }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/80">{label}</span>
                      <span className="text-white font-semibold">{val}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${val}%`, background: col }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Python ✓', 'SQL ✓', 'AWS ✓', 'Docker ✗', 'Kubernetes ✗'].map(skill => (
                <span key={skill} className={`badge ${skill.includes('✓') ? 'badge-success' : 'badge-error'}`}>
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5 bg-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl md:text-4xl font-black gradient-text">{value}</p>
              <p className="text-white/60 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything you need to <span className="gradient-text">land the job</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              From resume parsing to mock interviews — one platform covers your entire job search journey.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={fadeInUp} className="glass-card p-6 group cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-white mb-4">How it <span className="gradient-text-accent">works</span></h2>
            <p className="text-white/60">Three simple steps to transform your job search</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black gradient-text">{num}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="max-w-3xl mx-auto text-center glass-card p-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
            <Star size={28} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">
            Ready to <span className="gradient-text">level up</span>?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Join thousands of job seekers who've improved their resume and aced their interviews with ResumeAI Pro.
          </p>
          <Link to="/auth" className="btn-primary text-lg py-4 px-10">
            Get Started Free — No Credit Card
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-white">ResumeAI Pro</span>
          </div>
          <p className="text-white/40 text-xs">Built with React, FastAPI, and Google Gemini AI · Portfolio Project</p>
          <div className="flex items-center gap-4">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-xs text-white/60">Free to use</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
