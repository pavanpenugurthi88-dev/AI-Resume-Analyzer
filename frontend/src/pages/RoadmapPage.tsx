import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { generateRoadmap } from '../services/api'
import { Map, BookOpen, Clock, ExternalLink, Loader, Briefcase, Code2, PlayCircle, Sparkles } from 'lucide-react'
import type { WeeklyTopic } from '../types'

const TYPE_ICONS: Record<string, string> = { docs: '📄', video: '🎥', platform: '☁️', tutorial: '📚', course: '🎓', search: '🔍' }
const SKILL_COLORS = ['from-primary-500 to-blue-400', 'from-violet-500 to-purple-400', 'from-emerald-500 to-teal-400', 'from-amber-500 to-orange-400', 'from-pink-500 to-rose-400', 'from-cyan-500 to-blue-400', 'from-indigo-500 to-violet-400', 'from-orange-500 to-red-400']

export default function RoadmapPage() {
  const { missingSkills, setMissingSkills } = useAppStore()
  const [roadmap, setRoadmap] = useState<WeeklyTopic[]>([])
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const [targetRole, setTargetRole] = useState('')
  const [currentSkills, setCurrentSkills] = useState('')

  const handleGenerate = () => {
    if (!targetRole) return;
    setIsGenerating(true);
    
    // Mock AI Skill Gap Logic
    setTimeout(() => {
      const roleLower = targetRole.toLowerCase();
      let required: string[] = [];
      
      if (roleLower.includes('frontend') || roleLower.includes('react')) {
        required = ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Jest'];
      } else if (roleLower.includes('backend') || roleLower.includes('python')) {
        required = ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'];
      } else if (roleLower.includes('data')) {
        required = ['Python', 'SQL', 'Pandas', 'Machine Learning', 'TensorFlow', 'Tableau'];
      } else {
        required = ['JavaScript', 'Git', 'REST APIs', 'Cloud Computing', 'System Design'];
      }

      const current = currentSkills.toLowerCase().split(',').map(s => s.trim());
      const missing = required.filter(req => !current.some(c => req.toLowerCase().includes(c)));
      
      setMissingSkills(missing.length ? missing : ['System Design', 'Advanced Cloud Architecture']); // Fallback if no gaps
      setIsGenerating(false);
    }, 1500);
  }

  useEffect(() => {
    if (missingSkills.length > 0) {
      setLoading(true)
      generateRoadmap(missingSkills.slice(0, 8))
        .then(r => setRoadmap(r.data.roadmap || []))
        .catch(() => setRoadmap(getMockRoadmap(missingSkills)))
        .finally(() => setLoading(false))
    }
  }, [missingSkills])

  if (!missingSkills.length && !loading) return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-1">Interactive Learning Roadmap</h1>
      <p className="text-white/60 text-sm mb-8">Enter your target role and current skills to get a personalized upskilling path.</p>
      
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <Briefcase size={14} /> Target Job Role
          </label>
          <input 
            type="text" 
            placeholder="e.g. Full Stack Developer, Data Scientist" 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="input-field" 
          />
        </div>

        <div>
          <label className="text-xs text-white/60 mb-1.5 flex items-center gap-1.5">
            <Code2 size={14} /> Current Skills (comma separated)
          </label>
          <textarea 
            rows={4}
            placeholder="e.g. HTML, CSS, JavaScript, Python" 
            value={currentSkills}
            onChange={(e) => setCurrentSkills(e.target.value)}
            className="input-field resize-none leading-relaxed" 
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={!targetRole || isGenerating}
          className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
        >
          {isGenerating ? (
            <><Loader size={18} className="animate-spin" /> Analyzing Skill Gaps...</>
          ) : (
            <><Sparkles size={18} /> Generate Upskill Roadmap</>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-1">Learning Roadmap</h1>
      <p className="text-white/60 text-sm mb-2">Personalized week-by-week plan to close your skill gaps</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {missingSkills.slice(0, 8).map(s => <span key={s} className="badge badge-error">{s}</span>)}
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center mt-8">
          <Loader size={32} className="text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Generating your personalized roadmap with AI...</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary-500 via-accent-500 to-transparent hidden md:block" />

          <div className="space-y-6">
            {roadmap.map(({ week, skill, topics, resources, estimated_hours }, i) => (
              <motion.div
                key={week}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative md:pl-16"
              >
                {/* Week bubble */}
                <div className="hidden md:flex absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 items-center justify-center shadow-glow-primary shrink-0">
                  <span className="text-xs font-black text-white">W{week}</span>
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 md:hidden">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${SKILL_COLORS[i % SKILL_COLORS.length]} flex items-center justify-center text-xs font-black text-white`}>W{week}</div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{skill}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="badge badge-primary text-xs">Week {week}</span>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <Clock size={11} />
                          {estimated_hours}h estimated
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-4">
                    <p className="text-xs text-white/60 font-semibold mb-2 flex items-center gap-1.5">
                      <BookOpen size={11} /> Topics to cover
                    </p>
                    <ul className="space-y-1">
                      {topics.map((topic, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  {resources.length > 0 && (
                    <div>
                      <p className="text-xs text-white/60 font-semibold mb-2">Top Resources</p>
                      <div className="flex flex-wrap gap-2">
                        {resources.map((r, j) => (
                          <a key={j} href={r.url}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 hover:text-white hover:border-primary-500/30 transition-all">
                            {r.type === 'video' ? <PlayCircle size={12} className="text-red-500" /> : <span>{TYPE_ICONS[r.type] || '🔗'}</span>}
                            <span className="font-medium">{r.title}</span>
                            <ExternalLink size={9} className="opacity-50" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {roadmap.length > 0 && (
            <div className="mt-8 glass-card p-5 text-center">
              <p className="text-sm text-white/80">
                Total learning time: ~<span className="text-white font-bold">{roadmap.reduce((a, b) => a + b.estimated_hours, 0)} hours</span> across <span className="text-white font-bold">{roadmap.length} weeks</span>
              </p>
              <button onClick={() => setMissingSkills([])} className="mt-4 btn-ghost text-xs">Start Over</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getMockRoadmap(skills: string[]): WeeklyTopic[] {
  const topChannels = ['freeCodeCamp', 'Programming with Mosh', 'Traversy Media', 'Fireship', 'Net Ninja', 'Web Dev Simplified'];
  
  return skills.slice(0, 6).map((skill, i) => {
    const channel = topChannels[i % topChannels.length];
    return {
      week: i + 1,
      skill,
      topics: [`Core Concepts of ${skill}`, `${skill} Architecture`, `Building a Project with ${skill}`, `Advanced ${skill} Patterns`],
      resources: [
        { title: `${skill} Full Course - ${channel}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' full course ' + channel)}`, type: 'video' },
        { title: `${skill} Official Docs`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}`, type: 'search' }
      ],
      estimated_hours: 10 + (i * 2),
    }
  })
}
