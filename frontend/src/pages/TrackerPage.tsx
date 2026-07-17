import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getApplications, createApplication, updateApplication, deleteApplication } from '../services/api'
import { Plus, Trash2, Calendar, Edit2, Check, X, Shield, Star, RefreshCw, Kanban, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface JobApplication {
  id: string
  company: string
  role: string
  status: string // "wishlist" | "applied" | "interview" | "offer" | "rejected"
  priority: string // "low" | "medium" | "high"
  deadline?: string
  notes: string
}

const COLUMNS = [
  { id: 'wishlist', title: 'Wishlist', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  { id: 'applied', title: 'Applied', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'interview', title: 'Interviewing', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'offer', title: 'Offers', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'badge-accent',
  medium: 'badge-warning',
  high: 'badge-error'
}

export default function TrackerPage() {
  const [apps, setApps] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null)
  
  // Form fields
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('wishlist')
  const [priority, setPriority] = useState('medium')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = () => {
    getApplications()
      .then(res => {
        setApps(res.data)
      })
      .catch(() => {
        toast.error('Failed to load applications.')
      })
      .finally(() => setLoading(false))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !role.trim()) {
      toast.error('Company and Role are required.')
      return
    }

    try {
      const res = await createApplication({
        company, role, status, priority, deadline, notes
      })
      setApps(prev => [res.data, ...prev])
      toast.success('Job application tracked!')
      resetForm()
    } catch {
      toast.error('Failed to track application.')
    }
  }

  const handleUpdateStatus = async (app: JobApplication, nextStatus: string) => {
    try {
      const res = await updateApplication(app.id, {
        company: app.company,
        role: app.role,
        status: nextStatus,
        priority: app.priority,
        deadline: app.deadline,
        notes: app.notes
      })
      setApps(prev => prev.map(a => a.id === app.id ? res.data : a))
      toast.success(`Moved application to ${nextStatus}`)
    } catch {
      toast.error('Failed to move application status.')
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingApp) return

    try {
      const res = await updateApplication(editingApp.id, {
        company, role, status, priority, deadline, notes
      })
      setApps(prev => prev.map(a => a.id === editingApp.id ? res.data : a))
      toast.success('Application updated successfully!')
      setEditingApp(null)
      resetForm()
    } catch {
      toast.error('Failed to update application details.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this job from tracker?')) return
    try {
      await deleteApplication(id)
      setApps(prev => prev.filter(a => a.id !== id))
      toast.success('Application removed.')
    } catch {
      toast.error('Failed to remove application.')
    }
  }

  const startEdit = (app: JobApplication) => {
    setEditingApp(app)
    setCompany(app.company)
    setRole(app.role)
    setStatus(app.status)
    setPriority(app.priority)
    setDeadline(app.deadline || '')
    setNotes(app.notes)
    setShowAddForm(true)
  }

  const resetForm = () => {
    setCompany('')
    setRole('')
    setStatus('wishlist')
    setPriority('medium')
    setDeadline('')
    setNotes('')
    setShowAddForm(false)
    setEditingApp(null)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Application Tracker</h1>
          <p className="text-slate-500 dark:text-white/60 text-sm">Visual pipeline tracking your job submissions and statuses</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
          className="btn-primary py-2.5 px-5 text-sm"
        >
          <Plus size={16} /> Track New Job
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg p-6 bg-white dark:bg-[#0f172a] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingApp ? 'Edit Application' : 'Track New Application'}
                </h3>
                <button onClick={resetForm} className="text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={editingApp ? handleSaveEdit : handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Company Name *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Apple"
                    className="input-field py-2.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Job Role / Title *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Lead Backend Engineer"
                    className="input-field py-2.5 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Pipeline Stage</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="input-field py-2.5 text-sm bg-slate-100 dark:bg-white/5"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interviewing</option>
                      <option value="offer">Offers</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="input-field py-2.5 text-sm bg-slate-100 dark:bg-white/5"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Deadline / Interview Date (optional)</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="input-field py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Notes & Details</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Interview loops details, questions asked, salary ranges..."
                    className="input-field py-2.5 text-sm h-28 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={resetForm} className="btn-secondary py-2 px-5 text-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 px-6 text-sm">
                    {editingApp ? 'Save Changes' : 'Add Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto select-none pb-4">
        {COLUMNS.map(col => {
          const colApps = apps.filter(a => a.status === col.id)
          return (
            <div key={col.id} className="flex flex-col bg-slate-100/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 min-h-[500px] h-full">
              {/* Column Header */}
              <div className={`flex justify-between items-center mb-4 p-2.5 rounded-xl border border-transparent ${col.color}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{col.title}</span>
                <span className="text-xs font-black">{colApps.length}</span>
              </div>

              {/* Cards wrapper */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                {colApps.length > 0 ? (
                  colApps.map(app => (
                    <motion.div
                      key={app.id}
                      layoutId={app.id}
                      className="glass-card p-4 flex flex-col gap-2 relative bg-white dark:bg-white/5 hover:border-blue-500/20 shadow-sm"
                    >
                      {/* Controls overlay */}
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className={`badge text-[9px] px-2 py-0.5 capitalize ${PRIORITY_COLORS[app.priority]}`}>
                          {app.priority}
                        </span>
                        
                        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100">
                          <button onClick={() => startEdit(app)} className="text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10" title="Edit">
                            <Edit2 size={11} />
                          </button>
                          <button onClick={() => handleDelete(app.id)} className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-red-500/10" title="Delete">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{app.role}</h4>
                      <p className="text-xs text-slate-500 dark:text-white/60 font-semibold">{app.company}</p>
                      
                      {app.notes && (
                        <p className="text-[11px] text-slate-400 dark:text-white/40 line-clamp-2 mt-1 leading-relaxed">
                          {app.notes}
                        </p>
                      )}

                      {app.deadline && (
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-white/40 mt-1">
                          <Calendar size={10} />
                          <span>{new Date(app.deadline).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Status quick mover */}
                      <div className="flex items-center justify-end gap-1 border-t border-slate-100 dark:border-white/5 pt-2 mt-2">
                        {COLUMNS.filter(c => c.id !== app.status).slice(0, 2).map(col_next => (
                          <button
                            key={col_next.id}
                            onClick={() => handleUpdateStatus(app, col_next.id)}
                            className="text-[9px] px-2 py-1 rounded bg-slate-100 dark:bg-white/10 hover:bg-blue-500/10 dark:hover:bg-primary/20 text-slate-500 dark:text-white/60 dark:hover:text-white border border-slate-200 dark:border-white/5 transition-all font-semibold"
                          >
                            Go {col_next.title}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-28 border border-dashed border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center p-4 text-center">
                    <p className="text-[10px] text-slate-400 dark:text-white/30">Drag jobs or click track new job to add cards here.</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
