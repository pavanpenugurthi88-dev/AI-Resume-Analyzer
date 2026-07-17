import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, Loader, ArrowRight, Briefcase, X, Sparkles, ChevronDown, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadResume, analyzeResume } from '../services/api'
import { useAppStore } from '../store/appStore'

type Step = 1 | 2 | 3

const POPULAR_JOB_TITLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Mobile Developer",
  "Product Manager",
  "UX Designer",
  "System Administrator",
  "QA Engineer",
  "Database Administrator"
]

const POPULAR_COMPANIES = [
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "Meta",
  "Netflix",
  "Tesla",
  "Salesforce",
  "Uber",
  "Airbnb",
  "Stripe",
  "Nvidia",
  "Adobe"
]

export default function AnalyzePage() {
  const [step, setStep] = useState<Step>(1)
  const [file, setFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [jdTitle, setJdTitle] = useState('')
  const [jdCompany, setJdCompany] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [showJdTitleDropdown, setShowJdTitleDropdown] = useState(false)
  const [showJdCompanyDropdown, setShowJdCompanyDropdown] = useState(false)
  const { setATSResult, setMissingSkills } = useAppStore()
  const navigate = useNavigate()

  const filteredJobTitles = POPULAR_JOB_TITLES.filter(title =>
    title.toLowerCase().includes(jdTitle.toLowerCase())
  )

  const filteredCompanies = POPULAR_COMPANIES.filter(comp =>
    comp.toLowerCase().includes(jdCompany.toLowerCase())
  )

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setUploading(true)
    try {
      const res = await uploadResume(f)
      setResumeId(res.data.resume_id)
      toast.success('Resume uploaded & parsed successfully!')
      setStep(2)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally { setUploading(false) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: false, disabled: uploading,
  })

  const handleAnalyze = async () => {
    if (!resumeId) { toast.error('Please upload a resume first'); return }
    if (jdText.length < 50) { toast.error('Job description is too short'); return }
    setAnalyzing(true)
    setStep(3)
    try {
      const res = await analyzeResume(resumeId, jdText, jdTitle, jdCompany)
      const result = res.data
      setATSResult({
        id: result.id,
        resumeId: result.resume_id,
        jdTitle: result.jd_title,
        jdCompany: result.jd_company,
        scoreBreakdown: {
          overallScore: result.score_breakdown?.overall_score || 0,
          keywordScore: result.score_breakdown?.keyword_score || 0,
          semanticScore: result.score_breakdown?.semantic_score || 0,
          skillScore: result.score_breakdown?.skill_score || 0,
          experienceScore: result.score_breakdown?.experience_score || 0,
          educationScore: result.score_breakdown?.education_score || 0,
          grammarScore: result.score_breakdown?.grammar_score || 0,
        },
        matchedSkills: result.matched_skills || [],
        missingSkills: result.missing_skills || [],
        matchedKeywords: result.matched_keywords || [],
        missingKeywords: result.missing_keywords || [],
        improvementSuggestions: (result.improvement_suggestions || []).map((s: any) => ({
          category: s.category,
          priority: s.priority,
          issue: s.issue,
          suggestion: s.suggestion,
          before_example: s.before_example,
          after_example: s.after_example
        })),
        grammarIssues: (result.grammar_issues || []).map((g: any) => ({
          message: g.message,
          context: g.context,
          replacements: g.replacements || [],
          flagged_text: g.flagged_text
        })),
        atsTips: result.ats_tips || [],
        rewrittenSummary: result.rewritten_summary || '',
        grammarScore: result.grammar_score || 0
      })
      setMissingSkills(result.missing_skills || [])
      toast.success('Resume analyzed successfully!')
      navigate(`/results/${result.id}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Analysis failed')
      setStep(2)
    } finally { setAnalyzing(false) }
  }

  const [jdText, setJdText] = useState('')

  const handleAutofill = () => {
    const title = jdTitle || "Software Engineer"
    const company = jdCompany || "Google"
    
    let template = ""
    const titleLower = title.toLowerCase()
    
    if (titleLower.includes("data scientist") || titleLower.includes("data analyst")) {
      template = `We are looking for a Data Scientist to join our team at ${company}. You will build predictive models, run experiments, and design dashboards to drive product decisions.

Responsibilities:
- Build machine learning models in Python (Scikit-Learn, Pandas) and deploy them to production.
- Write optimized SQL queries to clean and prepare large datasets.
- Partner with product managers and engineers to understand business requirements.
- Create interactive dashboards in Power BI or Tableau to visualize insights.

Requirements:
- 2+ years experience as a Data Scientist or Data Analyst.
- Strong knowledge of Python, SQL, and database concepts.
- Understanding of machine learning algorithms and statistical testing.`
    } else if (titleLower.includes("machine learning") || titleLower.includes("ml") || titleLower.includes("computer vision")) {
      template = `We are seeking an ML Engineer at ${company} to train, fine-tune, and deploy models. You will work on computer vision, deep learning, and embedding pipelines.

Responsibilities:
- Implement real-time object tracking and pose detection using OpenCV and MediaPipe.
- Design CNNs and transformer-based models for custom datasets.
- Optimize deep learning inference time on cloud GPUs.
- Build microservices in Python/FastAPI and containerize using Docker.

Requirements:
- 3+ years experience in Python, TensorFlow, PyTorch, or JAX.
- Hands-on experience with OpenCV, Mediapipe, and Computer Vision pipelines.
- Knowledge of MLOps pipelines and cloud hosting.`
    } else if (titleLower.includes("frontend") || titleLower.includes("react") || titleLower.includes("web") || titleLower.includes("html")) {
      template = `We are hiring a Frontend Developer at ${company} to craft highly-interactive, responsive, and beautiful user interfaces.

Responsibilities:
- Build reusable UI components in React and TypeScript.
- Implement glassmorphic styles, smooth transitions, and spring animations.
- Optimize page load speeds and API response bindings.
- Work closely with designers to ensure pixel-perfect CSS alignments.

Requirements:
- 2+ years experience with React, JavaScript (ES6+), and CSS/Tailwind.
- Understanding of browser rendering performance and state management.
- Experience consuming REST/GraphQL APIs.`
    } else {
      template = `We are seeking a Full Stack Developer at ${company} to work across our application stacks, building robust REST APIs and interactive frontend experiences.

Responsibilities:
- Design database schemas and write efficient queries in SQL/MySQL or MongoDB Atlas.
- Build scalable server-side systems using Node.js, Express.js, and FastAPI.
- Create user-friendly frontend views in React or HTML/CSS/JS.
- Identify bugs, run integration tests, and debug environment issues.

Requirements:
- 2+ years experience in Full Stack Development.
- Strong coding skills in Python, Node.js, and JavaScript.
- Experience with databases, REST APIs, Git, and Cloud deployments.`
    }
    
    setJdText(template)
    toast.success(`Autofilled template for ${title} at ${company}!`)
  }

  const steps = [
    { n: 1, label: 'Upload Resume' },
    { n: 2, label: 'Job Details' },
    { n: 3, label: 'AI Analysis' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="sr-only">Analyze Resume</h1>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Analyze Your Resume</h2>
        <p className="text-slate-500 dark:text-white/60 text-sm">Upload your resume and paste a job description to get your ATS score</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
              step > n ? 'bg-emerald-550 text-white bg-emerald-500' : step === n ? 'bg-primary text-white shadow-glow-primary' : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/40'
            }`}>
              {step > n ? <CheckCircle size={14} /> : n}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step >= n ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>{label}</span>
            {i < steps.length - 1 && <div className={`h-px flex-1 mx-1 ${step > n ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 - Upload */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div
              {...getRootProps()}
              className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-primary/60 bg-primary/5 shadow-glow-primary' : 'border-dashed border-slate-200 dark:border-white/20 hover:border-primary/40'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDragActive ? 'bg-primary/20 scale-110' : 'bg-slate-100 dark:bg-white/5'} transition-all duration-300`}>
                {uploading ? (
                  <Loader size={28} className="text-primary animate-spin" />
                ) : (
                  <Upload size={28} className={isDragActive ? 'text-primary' : 'text-slate-500 dark:text-white/60'} />
                )}
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                {isDragActive ? 'Drop it here!' : uploading ? 'Processing...' : 'Drop your resume here'}
              </p>
              <p className="text-slate-500 dark:text-white/60 text-sm mb-4">or click to browse files</p>
              <div className="flex items-center justify-center gap-2">
                <span className="badge badge-primary">PDF</span>
                <span className="badge badge-primary">DOCX</span>
                <span className="text-slate-400 dark:text-white/40 text-xs">Max 10MB</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2 - JD */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {/* File badge */}
            <div className="glass-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <FileText size={18} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{file?.name}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Uploaded & parsed successfully</p>
              </div>
              <button onClick={() => { setFile(null); setResumeId(null); setStep(1) }} className="text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs text-slate-550 dark:text-white/60 mb-1.5 block">Job Title (optional)</label>
                <div className="relative z-50">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
                  <input 
                    type="text" 
                    value={jdTitle} 
                    onChange={e => {
                      setJdTitle(e.target.value);
                      setShowJdTitleDropdown(true);
                    }}
                    onFocus={() => {
                      setShowJdTitleDropdown(true);
                      setShowJdCompanyDropdown(false);
                    }}
                    placeholder="e.g. Data Scientist" 
                    className="input-field pl-9 pr-8 text-sm w-full" 
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setShowJdTitleDropdown(!showJdTitleDropdown);
                      setShowJdCompanyDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white"
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showJdTitleDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showJdTitleDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 4 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto glass-card border border-slate-200 dark:border-primary/25 bg-white dark:bg-slate-900 rounded-xl shadow-[0_4px_24px_rgba(59,130,246,0.15)] z-50 py-1 scrollbar-thin text-slate-800 dark:text-white"
                      >
                        {filteredJobTitles.length > 0 ? (
                          filteredJobTitles.map(title => (
                            <button
                              key={title}
                              type="button"
                              onClick={() => {
                                setJdTitle(title);
                                setShowJdTitleDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-white/90 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                            >
                              <Briefcase size={12} className="text-primary/70" />
                              {title}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2.5 text-xs text-slate-550 dark:text-white/50 italic">
                            Press Enter or type to add custom title
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {showJdTitleDropdown && (
                  <div className="fixed inset-0 z-45" onClick={() => setShowJdTitleDropdown(false)} />
                )}
              </div>

              <div className="relative">
                <label className="text-xs text-slate-550 dark:text-white/60 mb-1.5 block">Company (optional)</label>
                <div className="relative z-50">
                  <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 pointer-events-none" />
                  <input 
                    type="text" 
                    value={jdCompany} 
                    onChange={e => {
                      setJdCompany(e.target.value);
                      setShowJdCompanyDropdown(true);
                    }}
                    onFocus={() => {
                      setShowJdCompanyDropdown(true);
                      setShowJdTitleDropdown(false);
                    }}
                    placeholder="e.g. Google" 
                    className="input-field pl-9 pr-8 text-sm w-full" 
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setShowJdCompanyDropdown(!showJdCompanyDropdown);
                      setShowJdTitleDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white"
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showJdCompanyDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showJdCompanyDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 4 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto glass-card border border-slate-200 dark:border-primary/25 bg-white dark:bg-slate-900 rounded-xl shadow-[0_4px_24px_rgba(59,130,246,0.15)] z-50 py-1 scrollbar-thin text-slate-800 dark:text-white"
                      >
                        {filteredCompanies.length > 0 ? (
                          filteredCompanies.map(comp => (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => {
                                setJdCompany(comp);
                                setShowJdCompanyDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-white/90 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                            >
                              <Building size={12} className="text-primary/70" />
                              {comp}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2.5 text-xs text-slate-550 dark:text-white/50 italic">
                            Press Enter or type to add custom company
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {showJdCompanyDropdown && (
                  <div className="fixed inset-0 z-45" onClick={() => setShowJdCompanyDropdown(false)} />
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-550 dark:text-white/60">Job Description *</label>
                  <button
                    type="button"
                    onClick={handleAutofill}
                    className="text-[10px] text-blue-600 dark:text-cyan-400 hover:underline font-bold flex items-center gap-0.5"
                  >
                    ✨ Autofill Template
                  </button>
                </div>
                <span className={`text-xs ${jdText.length < 50 ? 'text-slate-400 dark:text-white/40' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}`}>{jdText.length} chars</span>
              </div>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Data Scientist with 2+ years experience in Python, SQL, Machine Learning, AWS..."
                className="input-field resize-none h-52 text-sm leading-relaxed"
              />
              {jdText.length < 50 && jdText.length > 0 && (
                <p className="text-xs text-amber-500 mt-1 font-semibold">Please paste a more complete job description (min 50 characters)</p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={jdText.length < 50}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles size={18} />
              Analyze with AI
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Step 3 - Loading */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
              <Sparkles size={32} className="text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">AI Analyzing Your Resume...</h3>
            <p className="text-slate-500 dark:text-white/60 text-sm mb-6">Running semantic similarity, keyword matching, and skill gap analysis</p>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {['Extracting keywords from JD...', 'Computing semantic similarity...', 'Matching skills...', 'Generating AI suggestions...'].map((t, i) => (
                <div key={t} className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/60 font-semibold">
                  <div className="w-4 h-4 rounded-full border border-primary/40 border-t-primary animate-spin shrink-0" style={{ animationDelay: `${i * 0.3}s` }} />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
