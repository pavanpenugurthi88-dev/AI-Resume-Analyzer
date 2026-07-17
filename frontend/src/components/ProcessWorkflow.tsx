import { motion } from 'framer-motion'
import {
  LogIn, Upload, FileText, Target, MessageSquare, Brain,
  Briefcase, BookOpen, Mic2, BarChart, Sparkles, Send
} from 'lucide-react'

const steps = [
  { id: 1, title: 'User Login', icon: LogIn, description: 'Create an account or sign in to access personalized career tools.' },
  { id: 2, title: 'Upload Resume (PDF/DOCX)', icon: Upload, description: 'Securely upload your latest resume format.' },
  { id: 3, title: 'Resume Parsing', icon: FileText, description: 'Our AI extracts text, experience, and education data accurately.' },
  { id: 4, title: 'ATS Score Analysis', icon: Target, description: 'Evaluate how well your resume matches Applicant Tracking Systems.' },
  { id: 5, title: 'AI Resume Feedback', icon: MessageSquare, description: 'Receive detailed, line-by-line actionable feedback.' },
  { id: 6, title: 'Skill Gap Analysis', icon: Brain, description: 'Identify missing skills based on your target job role.' },
  { id: 7, title: 'Job Matching', icon: Briefcase, description: 'Find the best job roles that align with your current skills.' },
  { id: 8, title: 'Interview Preparation', icon: BookOpen, description: 'Review tailored questions and technical concepts.' },
  { id: 9, title: 'Mock Interview', icon: Mic2, description: 'Practice with our AI voice-based interview coach.' },
  { id: 10, title: 'Performance Report', icon: BarChart, description: 'Analyze your interview performance and readiness.' },
  { id: 11, title: 'Resume Improvement', icon: Sparkles, description: 'Apply AI-driven enhancements to your resume content.' },
  { id: 12, title: 'Apply Again', icon: Send, description: 'Submit your optimized resume with confidence.' },
]

export default function ProcessWorkflow() {
  return (
    <div className="py-8 relative">
      {/* Vertical Line */}
      <div className="absolute left-8 md:left-1/2 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary-500/50 via-primary-300/30 to-transparent -translate-x-1/2 rounded-full hidden sm:block" />

      <div className="space-y-6 md:space-y-12">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isEven = index % 2 === 0

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 relative group ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              {/* Step Content */}
              <div className={`flex-1 w-full md:w-auto ${isEven ? 'md:text-right' : 'md:text-left'} sm:pl-20 md:pl-0`}>
                <div className="glass-card p-6 md:p-8 inline-block w-full md:max-w-md group-hover:shadow-glow-primary transition-all duration-500 cursor-default relative z-20">
                  <div className={`flex items-center gap-3 mb-3 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                    <span className="badge badge-primary text-xs font-bold px-3 py-1">Step {step.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Center Icon */}
              <div className="absolute left-4 md:static sm:flex relative z-30 shrink-0 w-16 h-16 rounded-[20px] bg-[#0F172A] border border-white/10 items-center justify-center transform group-hover:scale-110 transition-all duration-500 hidden">
                <div className="absolute inset-0 rounded-[20px] bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
                <Icon size={24} className="text-primary relative z-10" strokeWidth={2.5} />
              </div>

              {/* Empty Space for Grid Alignment */}
              <div className="flex-1 hidden md:block" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
