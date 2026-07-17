import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getSettings, updateSettings } from '../services/api'
import { useThemeStore } from '../store/themeStore'
import { Save, Shield, Sliders, Moon, Sun, Key, Cpu, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const PROVIDERS = [
  { id: 'openrouter', label: 'OpenRouter', desc: 'Unified interface for 100+ models' },
  { id: 'gemini', label: 'Google Gemini', desc: 'Native Gemini 1.5 & 2.0 models' },
  { id: 'openai', label: 'OpenAI GPT', desc: 'GPT-4o and GPT-4o-mini' },
  { id: 'mistral', label: 'Mistral AI', desc: 'European open-weight models' },
  { id: 'grok', label: 'xAI Grok', desc: 'Realtime lookup Grok model' },
  { id: 'ollama', label: 'Ollama (Local)', desc: 'Run model locally offline (free)' }
]

const MODELS: Record<string, string[]> = {
  openrouter: ['google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3-70b-instruct'],
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'o1-mini'],
  mistral: ['mistral-large-latest', 'open-mixtral-8x22b', 'pixtral-12b'],
  grok: ['grok-2-1212', 'grok-beta'],
  ollama: ['llama3', 'mistral', 'phi3', 'codellama']
}

export default function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useThemeStore()
  const [provider, setProvider] = useState('openrouter')
  const [model, setModel] = useState('google/gemini-2.5-flash')
  const [keys, setKeys] = useState<Record<string, string>>({
    gemini: '', openrouter: '', openai: '', mistral: '', grok: ''
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings()
      .then(res => {
        const d = res.data
        setProvider(d.selected_provider)
        setModel(d.selected_model)
        setKeys(d.api_keys || {})
        if (d.theme) {
          setTheme(d.theme as 'light' | 'dark')
        }
      })
      .catch(() => {
        toast.error('Failed to load settings from server. Running in fallback mode.')
      })
      .finally(() => setLoading(false))
  }, [setTheme])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings({
        theme,
        selected_provider: provider,
        selected_model: model,
        api_keys: keys
      })
      toast.success('Configuration saved successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save configuration.')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyChange = (prov: string, val: string) => {
    setKeys(prev => ({ ...prev, [prov]: val }))
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Configuration & Settings</h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">Control AI routing engines, keys, and customize visual themes</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Visual Theme */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Sun size={16} className="text-amber-500" /> Premium Theme
            </h2>
            <p className="text-xs text-slate-500 dark:text-white/60 mb-6">
              Switch between clean Neural Light Lab layout and premium AI Neural Glass Lab midnight mode.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-500/5 text-blue-600 font-bold'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white'
                }`}
              >
                <span className="flex items-center gap-2"><Sun size={16} /> Neural Light Lab</span>
                {theme === 'light' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400 font-bold'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white'
                }`}
              >
                <span className="flex items-center gap-2"><Moon size={16} /> AI Neural Glass Lab</span>
                {theme === 'dark' && <span className="w-2 h-2 rounded-full bg-cyan-500" />}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 border-dashed border-primary/20">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-wide">Developer Sandbox</h3>
            <p className="text-[11px] text-slate-500 dark:text-white/60 leading-relaxed">
              Missing custom API keys? CareerPilot automatically routes requests through our sandbox OpenRouter endpoint to let you test everything instantly.
            </p>
          </div>
        </div>

        {/* Right Column: AI Model Selection & Credentials */}
        <div className="md:col-span-2 space-y-6">
          {/* AI Providers Grid */}
          <div className="glass-card p-6">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Cpu size={16} className="text-primary-500" /> Active AI Provider Manager
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id)
                    setModel(MODELS[p.id][0])
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    provider === p.id
                      ? 'border-blue-500 bg-blue-500/5 text-blue-700'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white'
                  }`}
                >
                  <p className="text-sm font-bold">{p.label}</p>
                  <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5 font-medium">{p.desc}</p>
                </button>
              ))}
            </div>

            {/* Model Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-white/60">Selected LLM Model</label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="input-field py-3 text-sm appearance-none bg-no-repeat"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='%23ffffff' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>")`, backgroundPosition: 'right 16px center' }}
              >
                {MODELS[provider]?.map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Secure Keys inputs */}
          {provider !== 'ollama' && (
            <div className="glass-card p-6">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Key size={16} className="text-emerald-500" /> Secure Credentials Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-white/60 mb-4">
                Keys are stored using AES-256 database configurations and never shared outside direct API queries.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 dark:text-white/50 capitalize font-medium">{provider} API Token</label>
                  <input
                    type="password"
                    value={keys[provider] || ''}
                    onChange={e => handleKeyChange(provider, e.target.value)}
                    placeholder={keys[provider] ? '••••••••••••••••' : `Enter your custom ${provider} key`}
                    className="input-field font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving Preferences...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  )
}
