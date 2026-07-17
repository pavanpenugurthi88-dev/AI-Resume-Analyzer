import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, User, Mail, Phone, Briefcase, GraduationCap, Code2, Star, CheckCircle2, XCircle, Activity, Sparkles } from 'lucide-react'

const TEMPLATES = [
  { id: 'modern', name: 'ATS Modern', desc: 'Clean, ATS-optimized layout', color: 'from-primary-500 to-blue-400', accent: '#6366f1' },
  { id: 'harvard', name: 'Harvard Style', desc: 'Classic academic format', color: 'from-gray-600 to-gray-500', accent: '#4b5563' },
  { id: 'tech', name: 'Tech Engineer', desc: 'Developer-focused template', color: 'from-emerald-500 to-teal-400', accent: '#10b981' },
  { id: 'analyst', name: 'Data Analyst', desc: 'Metrics & charts emphasis', color: 'from-amber-500 to-orange-400', accent: '#f59e0b' },
]

interface ResumeData {
  name: string; email: string; phone: string; title: string; summary: string;
  skills: string; experience: string; education: string; projects: string;
}

const DEFAULT: ResumeData = {
  name: 'Pavan Kumar', email: 'pavan@email.com', phone: '+91 9876543210',
  title: 'Data Scientist | ML Engineer',
  summary: 'Results-driven Data Scientist with 2+ years of experience building ML models and data pipelines. Passionate about solving real-world problems with AI.',
  skills: 'Python, SQL, Machine Learning, TensorFlow, AWS, Docker, Power BI, Git',
  experience: 'Data Scientist at XYZ Corp (2022–Present)\n• Built UPI fraud detection model with 95% accuracy\n• Reduced data processing time by 40% using Apache Spark\n\nML Intern at ABC Pvt Ltd (2021–2022)\n• Developed NLP pipeline for customer sentiment analysis',
  education: 'B.Tech in Computer Science, VIT University (2021)\nCGPA: 8.7/10',
  projects: 'UPI Fraud Detection System — Python, Scikit-learn, XGBoost\nAI Resume Analyzer — React, FastAPI, Gemini API',
}

export default function BuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [data, setData] = useState<ResumeData>(DEFAULT)
  const [showPreview, setShowPreview] = useState(false)

  const calculateATSScore = () => {
    let score = 0;
    const checks = [];

    // 1. Completeness (20 pts)
    const isComplete = data.name && data.email && data.summary && data.experience && data.skills;
    if (isComplete) { score += 20; checks.push({ text: 'All essential sections filled', pass: true }); }
    else { checks.push({ text: 'Missing essential sections', pass: false }); }

    // 2. Action Verbs (20 pts)
    const actionVerbs = ['developed', 'built', 'managed', 'led', 'created', 'designed', 'optimized', 'reduced', 'increased', 'improved', 'implemented'];
    const expLower = data.experience.toLowerCase();
    const foundVerbs = actionVerbs.filter(v => expLower.includes(v));
    if (foundVerbs.length >= 3) { score += 20; checks.push({ text: 'Strong action verbs used', pass: true }); }
    else { score += Math.min(20, foundVerbs.length * 6); checks.push({ text: 'Use more action verbs (e.g., Developed, Managed)', pass: false }); }

    // 3. Metrics (20 pts)
    const hasNumbers = /\d+%|\d+x|\$\d+|\d+\+?/i.test(data.experience);
    if (hasNumbers) { score += 20; checks.push({ text: 'Quantifiable metrics included', pass: true }); }
    else { checks.push({ text: 'Add numbers/metrics to prove impact', pass: false }); }

    // 4. Skills (20 pts)
    const skillsCount = data.skills.split(',').filter(s => s.trim().length > 0).length;
    if (skillsCount >= 6) { score += 20; checks.push({ text: 'Good skills density', pass: true }); }
    else { score += Math.min(20, skillsCount * 3); checks.push({ text: 'List at least 6 key skills', pass: false }); }

    // 5. Summary (20 pts)
    const summaryWords = data.summary.split(/\s+/).filter(w => w.length > 0).length;
    if (summaryWords >= 20 && summaryWords <= 100) { score += 20; checks.push({ text: 'Summary length is optimal', pass: true }); }
    else { checks.push({ text: 'Summary should be 20-100 words', pass: false }); }

    return { score, checks };
  }

  const atsHealth = calculateATSScore();

  const update = (field: keyof ResumeData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [field]: e.target.value }))

  const handlePrint = () => {
    setShowPreview(true)
    setTimeout(() => window.print(), 300)
  }

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>
      <h1 className="text-2xl font-black text-white mb-1 no-print">Resume Builder</h1>
      <p className="text-white/60 text-sm mb-6 no-print">Choose a template, fill in your details, and export to PDF</p>

      <div className="grid xl:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-5 no-print">
          {/* Template selector */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-white mb-4">Choose Template</h2>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(({ id, name, desc, color }) => (
                <button key={id} onClick={() => setSelectedTemplate(id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 ${selectedTemplate === id ? 'border-primary/60 bg-primary/10' : 'border-white/10 hover:border-white/20'}`}>
                  <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${color} mb-2 opacity-80`} />
                  <p className="text-xs font-semibold text-white">{name}</p>
                  <p className="text-xs text-white/60">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-white">Personal Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Full Name</label>
                <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input value={data.name} onChange={update('name')} className="input-field pl-9 text-sm" /></div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Job Title</label>
                <div className="relative"><Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input value={data.title} onChange={update('title')} className="input-field pl-9 text-sm" /></div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Email</label>
                <div className="relative"><Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input value={data.email} onChange={update('email')} className="input-field pl-9 text-sm" /></div>
              </div>
              <div>
                <label className="text-xs text-white/60 mb-1 block">Phone</label>
                <div className="relative"><Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input value={data.phone} onChange={update('phone')} className="input-field pl-9 text-sm" /></div>
              </div>
            </div>

            {[
              { field: 'summary' as const, label: 'Professional Summary', icon: Star, rows: 3 },
              { field: 'skills' as const, label: 'Skills (comma separated)', icon: Code2, rows: 2 },
              { field: 'experience' as const, label: 'Experience', icon: Briefcase, rows: 5 },
              { field: 'education' as const, label: 'Education', icon: GraduationCap, rows: 3 },
              { field: 'projects' as const, label: 'Projects', icon: Code2, rows: 3 },
            ].map(({ field, label, icon: Icon, rows }) => (
              <div key={field}>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-white/60 flex items-center gap-1.5">
                    <Icon size={11} /> {label}
                  </label>
                  <button className="text-[10px] flex items-center gap-1 text-primary hover:text-primary-300 transition-colors">
                    <Sparkles size={10} /> AI Enhance
                  </button>
                </div>
                <textarea value={data[field]} onChange={update(field)} rows={rows} className="input-field resize-none text-sm leading-relaxed" />
              </div>
            ))}
          </div>

          <button onClick={handlePrint} className="btn-primary w-full justify-center py-4 text-base">
            <Download size={18} /> Export to PDF
          </button>
        </div>

        {/* Right: Preview & ATS Score */}
        <div className="space-y-6">
          {/* Live ATS Score Widget */}
          <div className="glass-card p-5 no-print relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Activity className={atsHealth.score >= 80 ? "text-emerald-400" : atsHealth.score >= 60 ? "text-amber-400" : "text-red-400"} size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live ATS Score</h3>
                <p className="text-xs text-white/60">Optimize as you type</p>
              </div>
              <div className="ml-auto text-3xl font-black gradient-text">{Math.round(atsHealth.score)}</div>
            </div>
            
            <div className="space-y-2.5">
              {atsHealth.checks.map((check, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {check.pass ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span className={check.pass ? 'text-white/80' : 'text-red-400 font-medium'}>
                    {check.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky top-6">
            <div className="flex justify-between items-center mb-3 no-print">
              <p className="text-xs text-white/60">Live Preview</p>
              <span className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-white/80 border border-white/10">A4 format</span>
            </div>
            <motion.div
              key={selectedTemplate}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              style={{ minHeight: 600 }}
            >
              {/* Resume Preview Content */}
              <div className="p-8 text-gray-800 text-sm font-sans" style={{ fontFamily: 'Georgia, serif' }}>
                {/* Header */}
                <div className="border-b-4 pb-4 mb-5" style={{ borderColor: template.accent }}>
                  <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
                  <p className="text-base font-medium mt-0.5" style={{ color: template.accent }}>{data.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{data.email} · {data.phone}</p>
                </div>

                {/* Summary */}
                {data.summary && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: template.accent }}>Summary</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{data.summary}</p>
                  </div>
                )}

                {/* Skills */}
                {data.skills && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: template.accent }}>Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: template.accent }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {data.experience && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: template.accent }}>Experience</h3>
                    {data.experience.split('\n').map((line, i) => (
                      <p key={i} className={`text-xs ${line.startsWith('•') ? 'text-gray-600 pl-3' : line ? 'font-semibold text-gray-800 mt-2' : ''} leading-relaxed`}>{line}</p>
                    ))}
                  </div>
                )}

                {/* Education */}
                {data.education && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: template.accent }}>Education</h3>
                    {data.education.split('\n').map((line, i) => (
                      <p key={i} className="text-xs text-gray-700 leading-relaxed">{line}</p>
                    ))}
                  </div>
                )}

                {/* Projects */}
                {data.projects && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: template.accent }}>Projects</h3>
                    {data.projects.split('\n').map((line, i) => (
                      <p key={i} className="text-xs text-gray-700 leading-relaxed">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
