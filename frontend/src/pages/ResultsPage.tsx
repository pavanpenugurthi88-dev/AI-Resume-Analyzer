import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Mic2, Map, Sparkles, ArrowLeft, PlayCircle } from 'lucide-react'
import { useState } from 'react'
import type { ImprovementSuggestion } from '../types'

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size / 2) - 12
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" className="stroke-white/5" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{Math.round(score)}</span>
        <span className="text-xs text-white/60 -mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function SuggestionCard({ s }: { s: ImprovementSuggestion }) {
  const [open, setOpen] = useState(false)
  const priorityColor = s.priority === 'high' ? 'badge-error' : s.priority === 'medium' ? 'badge-warning' : 'badge-primary'

  return (
    <div className="glass-card p-4 cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center gap-3">
        <AlertCircle size={16} className={s.priority === 'high' ? 'text-red-400 shrink-0' : s.priority === 'medium' ? 'text-amber-400 shrink-0' : 'text-primary-400 shrink-0'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${priorityColor} text-xs`}>{s.priority}</span>
            <span className="badge badge-primary text-xs capitalize">{s.category}</span>
          </div>
          <p className="text-sm font-medium text-white mt-1">{s.issue}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-white/60 shrink-0" /> : <ChevronDown size={16} className="text-white/60 shrink-0" />}
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-white/5">
          <p className="text-sm text-white/80 mb-3">{s.suggestion}</p>
          {s.before_example && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 font-semibold mb-1">Before:</p>
                <p className="text-xs text-white/80">{s.before_example}</p>
              </div>
              {s.after_example && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 font-semibold mb-1">After:</p>
                  <p className="text-xs text-white/80">{s.after_example}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function ResultsPage() {
  const { atsResult } = useAppStore()
  const navigate = useNavigate()

  if (!atsResult) {
    return (
      <div className="p-8 text-center">
        <div className="glass-card p-12 max-w-md mx-auto">
          <Sparkles size={40} className="text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Results Yet</h2>
          <p className="text-white/60 text-sm mb-6">Upload your resume and paste a job description to get your ATS analysis.</p>
          <Link to="/analyze" className="btn-primary">Start Analysis</Link>
        </div>
      </div>
    )
  }

  const { scoreBreakdown, matchedSkills, missingSkills, improvementSuggestions, grammarIssues, rewrittenSummary, atsTips } = atsResult

  const scoreItems = [
    { label: 'Keyword Match', val: scoreBreakdown.keywordScore, desc: 'JD keyword overlap' },
    { label: 'Semantic Match', val: scoreBreakdown.semanticScore, desc: 'Contextual similarity' },
    { label: 'Skill Match', val: scoreBreakdown.skillScore, desc: 'Technical skills' },
    { label: 'Experience', val: scoreBreakdown.experienceScore, desc: 'Years of experience' },
    { label: 'Education', val: scoreBreakdown.educationScore, desc: 'Degree requirements' },
    { label: 'Grammar', val: scoreBreakdown.grammarScore, desc: 'Writing quality' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="sr-only">ATS Analysis Results</h1>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/analyze')} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-white">ATS Analysis Results</h2>
          {atsResult.jdTitle && <p className="text-white/60 text-sm">{atsResult.jdTitle}{atsResult.jdCompany ? ` at ${atsResult.jdCompany}` : ''}</p>}
        </div>
      </div>

      {/* Score Hero */}
      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="text-center">
            <ScoreRing score={scoreBreakdown.overallScore} size={140} />
            <p className="text-sm font-semibold text-white mt-3">Overall ATS Score</p>
            <span className={`badge mt-2 ${scoreBreakdown.overallScore >= 75 ? 'badge-success' : scoreBreakdown.overallScore >= 50 ? 'badge-warning' : 'badge-error'}`}>
              {scoreBreakdown.overallScore >= 75 ? '🎉 Excellent Match' : scoreBreakdown.overallScore >= 50 ? '⚡ Good Match' : '⚠️ Needs Work'}
            </span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {scoreItems.map(({ label, val, desc }) => (
              <div key={label} className="p-3 rounded-xl bg-white/5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-white/60">{label}</span>
                  <span className="text-xs font-bold text-white">{Math.round(val)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${val}%` }} />
                </div>
                <p className="text-xs text-white/40 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Alert Messages for ATS Score */}
      {scoreBreakdown.overallScore >= 70 ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-emerald-500 shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-bold text-white">Take the Mock Interview Right Now!</h4>
              <p className="text-xs text-white/60 mt-0.5">Your resume is a great match for this job description. Test your skills in our AI recruiter round.</p>
            </div>
          </div>
          <Link to="/interview" className="btn-primary py-2.5 px-5 text-xs font-semibold shrink-0">
            Start Interview
          </Link>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
            <div>
              <h4 className="text-sm font-bold text-white">Learn Required Skills in the Roadmap!</h4>
              <p className="text-xs text-white/60 mt-0.5">
                Your score is below 70%. We found some missing skills: {missingSkills.length > 0 ? missingSkills.join(', ') : 'None detected'}. Bridge these gaps using our personalized roadmap.
              </p>
            </div>
          </div>
          <Link to="/roadmap" className="btn-secondary py-2.5 px-5 text-xs font-semibold shrink-0">
            View Roadmap
          </Link>
        </div>
      )}

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Matched Skills ({matchedSkills.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.length ? matchedSkills.map(s => (
              <span key={s} className="badge badge-success">{s}</span>
            )) : <p className="text-xs text-white/40">No matched skills detected</p>}
          </div>
        </div>
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-red-400 shrink-0" />
            <h3 className="text-sm font-bold text-white">Missing Skills ({missingSkills.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {missingSkills.length ? missingSkills.map(s => (
              <span key={s} className="badge badge-error">{s}</span>
            )) : <p className="text-xs text-emerald-400 font-semibold">🎉 All required skills matched!</p>}
          </div>

          {missingSkills.length > 0 && (
            <div className="mt-auto">
              <h4 className="text-xs font-bold text-white/60 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <PlayCircle size={12} /> Recommended Tutorials
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin pr-2">
                {missingSkills.slice(0, 5).map((skill, i) => {
                  const channels = ['freeCodeCamp', 'Programming with Mosh', 'Traversy Media', 'Fireship'];
                  const channel = channels[i % channels.length];
                  return (
                    <a 
                      key={skill}
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial ' + channel)}`}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all group"
                    >
                      <span className="text-xs font-medium text-white/80 group-hover:text-white truncate pr-2">
                        Learn {skill}
                      </span>
                      <span className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                        {channel}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      {improvementSuggestions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-400" />
            AI Improvement Suggestions ({improvementSuggestions.length})
          </h3>
          <div className="space-y-3">
            {improvementSuggestions.map((s, i) => <SuggestionCard key={i} s={s} />)}
          </div>
        </div>
      )}

      {/* Rewritten Summary */}
      {rewrittenSummary && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-accent-400" />
            AI-Rewritten Professional Summary
          </h3>
          <div className="p-4 rounded-xl bg-white/5 border border-primary/20">
            <p className="text-sm text-white/80 leading-relaxed font-mono">{rewrittenSummary}</p>
          </div>
        </div>
      )}

      {/* Grammar */}
      {grammarIssues.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-3">Grammar & Spelling Issues ({grammarIssues.length})</h3>
          <div className="space-y-3">
            {grammarIssues.slice(0, 5).map((g, i) => (
              <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Issue #{i + 1}</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{g.message}</p>
                  </div>
                  {g.flagged_text && (
                    <span className="badge badge-error text-xs font-mono shrink-0">"{g.flagged_text}"</span>
                  )}
                </div>
                
                {g.context && (
                  <div className="p-2.5 rounded bg-white/5 text-xs text-white/80 font-mono break-all border border-white/10">
                    {g.flagged_text ? (
                      (() => {
                        const parts = g.context.split(g.flagged_text);
                        if (parts.length > 1) {
                          return (
                            <>
                              {parts[0]}
                              <span className="bg-red-500/35 text-red-100 border-b border-dashed border-red-400 px-0.5 rounded font-bold">{g.flagged_text}</span>
                              {parts.slice(1).join(g.flagged_text)}
                            </>
                          );
                        }
                        return g.context;
                      })()
                    ) : (
                      g.context
                    )}
                  </div>
                )}
                
                {g.replacements && g.replacements.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <span className="text-white/60 font-medium">Suggestions:</span>
                    {g.replacements.map((r, idx) => (
                      <span key={idx} className="badge badge-success text-[11px] font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATS Tips */}
      {atsTips.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-3">ATS Optimization Tips</h3>
          <ul className="space-y-2">
            {atsTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-primary-400 mt-0.5 shrink-0">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/interview" className="btn-primary flex-1 justify-center py-3.5">
          <Mic2 size={18} /> Practice Interview
        </Link>
        <Link to="/roadmap" className="btn-secondary flex-1 justify-center py-3.5">
          <Map size={18} /> Learning Roadmap
        </Link>
        <Link to="/analyze" className="btn-ghost flex-1 justify-center py-3.5">
          Analyze Again
        </Link>
      </div>
    </div>
  )
}
