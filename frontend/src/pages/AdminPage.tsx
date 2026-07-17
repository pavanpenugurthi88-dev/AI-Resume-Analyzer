import { useEffect, useState } from 'react'
import { getAdminAnalytics, updateDefaultModel } from '../services/api'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Shield, RefreshCw, Users, HelpCircle, HardDrive, Terminal, DollarSign, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminStats {
  total_users: number
  total_api_calls: number
  provider_distribution: Record<string, number>
  avg_response_time_ms: number
  monthly_cost_est: number
  system_status: string
  model_settings: {
    default_provider: string
    default_model: string
  }
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [defProvider, setDefProvider] = useState('openrouter')
  const [defModel, setDefModel] = useState('google/gemini-2.5-flash')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    getAdminAnalytics()
      .then(res => {
        setStats(res.data)
        setDefProvider(res.data.model_settings.default_provider)
        setDefModel(res.data.model_settings.default_model)
      })
      .catch(() => {
        toast.error('Failed to load admin analytics statistics.')
      })
      .finally(() => setLoading(false))
  }

  const handleUpdateDefaults = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    try {
      await updateDefaultModel(defProvider, defModel)
      toast.success('Global default model settings updated!')
      loadAnalytics()
    } catch {
      toast.error('Failed to update default system settings.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  // Format chart data for provider calls distribution
  const chartData = Object.entries(stats.provider_distribution).map(([provider, count]) => ({
    name: provider.toUpperCase(),
    Queries: count
  }))

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Admin Management Center</h1>
          <p className="text-slate-500 dark:text-white/60 text-sm">Oversee global model routing parameters, logs, and user analytics</p>
        </div>
        <div className="badge badge-success px-4 py-2 flex items-center gap-1.5 font-bold">
          <Activity size={12} className="animate-pulse" /> System: {stats.system_status}
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Total API Queries', value: stats.total_api_calls, icon: Terminal, color: 'text-cyan-500 bg-cyan-500/10' },
          { label: 'Avg Latency', value: `${stats.avg_response_time_ms}ms`, icon: HardDrive, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Cost Est. (Month)', value: `$${stats.monthly_cost_est.toFixed(3)}`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map(item => (
          <div key={item.label} className="glass-card p-5 flex flex-col gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={16} />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-xs text-slate-500 dark:text-white/60 font-semibold">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: API distribution */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Model Distribution Queries</h3>
          <p className="text-xs text-slate-400 dark:text-white/40 mb-4">Realtime logs showing routing calls across various models</p>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="Queries" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column: Global Model Default overrides */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Shield size={16} className="text-primary-500" /> Default Model Router
            </h3>
            <p className="text-xs text-slate-400 dark:text-white/40 mb-6">
              Configure which AI model and provider the system routes queries to by default when users have not specified their own key.
            </p>

            <form onSubmit={handleUpdateDefaults} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-white/50 mb-1.5 block">Global Provider</label>
                <select
                  value={defProvider}
                  onChange={e => setDefProvider(e.target.value)}
                  className="input-field py-2.5 text-xs bg-slate-100 dark:bg-white/5"
                >
                  <option value="openrouter">OpenRouter</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI GPT</option>
                  <option value="mistral">Mistral AI</option>
                  <option value="grok">xAI Grok</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-white/50 mb-1.5 block">Default Model Name</label>
                <input
                  type="text"
                  value={defModel}
                  onChange={e => setDefModel(e.target.value)}
                  className="input-field py-2.5 text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-primary w-full py-3 text-xs font-bold mt-2"
              >
                {updating ? 'Updating...' : 'Apply Default Settings'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
