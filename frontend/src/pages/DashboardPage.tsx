import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { getDashboardStats, getRecentActivity } from '../services/api'
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import { Upload, Mic2, TrendingUp, Target, FileText, Brain, ArrowRight, Sparkles } from 'lucide-react'
import type { DashboardStats } from '../types'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / 40
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}{suffix}</>
}

const INITIAL_STATS: DashboardStats = {
  totalResumes: 0,
  totalAnalyses: 0,
  averageAtsScore: 0,
  bestAtsScore: 0,
  totalInterviewSessions: 0,
  skillsMatchedPercent: 0,
  interviewReadiness: 0,
  recentScores: [],
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS)

  const isDark = theme === 'dark'

  useEffect(() => {
    getDashboardStats().then(r => {
      const d = r.data
      setStats({
        totalResumes: d.total_resumes || 0,
        totalAnalyses: d.total_analyses || 0,
        averageAtsScore: d.average_ats_score || 0,
        bestAtsScore: d.best_ats_score || 0,
        totalInterviewSessions: d.total_interview_sessions || 0,
        skillsMatchedPercent: d.skills_matched_percent || 0,
        interviewReadiness: d.interview_readiness || 0,
        recentScores: d.recent_scores || []
      })
    }).catch(() => {})
    getRecentActivity().catch(() => {})
  }, [])

  const lineData = (stats.recentScores || []).map((s: number, i: number) => ({ name: `Run ${i + 1}`, score: s }))

  const radarData = [
    { subject: 'Technical', A: stats.bestAtsScore },
    { subject: 'Communication', A: stats.interviewReadiness },
    { subject: 'Skills Match', A: stats.skillsMatchedPercent },
    { subject: 'Experience', A: 75 },
    { subject: 'Education', A: 88 },
  ]

  const barData = [
    { name: 'Keyword', score: 68 },
    { name: 'Semantic', score: Math.round(stats.averageAtsScore) },
    { name: 'Skills', score: Math.round(stats.skillsMatchedPercent) },
    { name: 'Experience', score: 70 },
    { name: 'Education', score: 88 },
  ]

  const statCards = [
    { label: 'Best ATS Score', value: Math.round(stats.bestAtsScore), suffix: '%', icon: Target, color: 'bg-primary/20 text-primary border border-primary/30', desc: 'Your highest score' },
    { label: 'Avg ATS Score', value: Math.round(stats.averageAtsScore), suffix: '%', icon: TrendingUp, color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30', desc: `Across ${stats.totalAnalyses} analyses` },
    { label: 'Interview Ready', value: Math.round(stats.interviewReadiness), suffix: '%', icon: Mic2, color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30', desc: 'Based on sessions' },
    { label: 'Skills Matched', value: Math.round(stats.skillsMatchedPercent), suffix: '%', icon: Brain, color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30', desc: 'vs job requirements' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="sr-only">Dashboard</h1>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 dark:text-white/60 text-sm mb-1">Welcome back,</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">{user?.displayName || 'User'} 👋</h2>
        </div>
        <div className="flex gap-3">
          <Link to="/analyze" className="btn-primary text-sm py-2.5 px-5">
            <Upload size={15} /> Analyze Resume
          </Link>
          <Link to="/interview" className="btn-secondary text-sm py-2.5 px-5">
            <Mic2 size={15} /> Start Interview
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, suffix, icon: Icon, color, desc }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-5 group">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shrink-0`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">
              <AnimatedNumber value={value} suffix={suffix} />
            </p>
            <p className="text-sm font-semibold text-slate-600 dark:text-white/80 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 dark:text-white/50 mt-0.5">{desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">ATS Score Trend</p>
          <p className="text-xs text-slate-400 dark:text-white/50 mb-4">Your last {lineData.length} analyses</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 12, color: isDark ? '#fff' : '#0f172a', fontSize: 12, backdropFilter: 'blur(10px)' }} />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Skills Radar</p>
          <p className="text-xs text-slate-400 dark:text-white/50 mb-2">Overall profile strength</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="You" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart + Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Score Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#a1a1aa' : '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 12, color: isDark ? '#fff' : '#0f172a', fontSize: 12, backdropFilter: 'blur(10px)' }} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</p>
          <div className="space-y-3">
            {[
              { label: 'Upload & Analyze Resume', desc: 'Get ATS score + AI tips', to: '/analyze', icon: Upload, color: 'bg-primary/20 text-primary border border-primary/30' },
              { label: 'Practice Mock Interview', desc: 'AI-powered coaching', to: '/interview', icon: Mic2, color: 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30' },
              { label: 'View Learning Roadmap', desc: 'Fill your skill gaps', to: '/roadmap', icon: Brain, color: 'bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30' },
              { label: 'Build ATS-Friendly Resume', desc: 'Templates + PDF export', to: '/builder', icon: FileText, color: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30' },
            ].map(({ label, desc, to, icon: Icon, color }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-850 dark:text-white">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-white/50">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-slate-400 dark:text-white/50 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {stats.totalAnalyses === 0 && (
        <div className="glass-card p-6 flex items-center gap-4 border-dashed border-blue-500/30">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-blue-500 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">No analyses yet</p>
            <p className="text-xs text-slate-550 dark:text-white/40 mt-0.5">Upload your resume and paste a job description to get your first ATS score!</p>
          </div>
          <Link to="/analyze" className="btn-primary text-sm py-2 px-4 ml-auto shrink-0">
            Start <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}
