import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import {
  LayoutDashboard, Upload, Mic2, Map, FileText, Menu, Compass,
  LogOut, Sparkles, ChevronRight, User, Sun, Moon, MessageSquare,
  Kanban, Edit3, BarChart, Settings, Shield
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: Upload, label: 'Analyze Resume' },
  { to: '/reviewer-rewrite', icon: Edit3, label: 'Review & Rewrite' },
  { to: '/interview', icon: Mic2, label: 'Interview Coach' },
  { to: '/roadmap', icon: Map, label: 'Learning Roadmap' },
  { to: '/chat', icon: MessageSquare, label: 'Career Chat' },
  { to: '/tracker', icon: Kanban, label: 'Job Tracker' },
  { to: '/analytics', icon: BarChart, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/admin', icon: Shield, label: 'Admin Console' },
]

export default function Layout() {
  const { user, clearUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    clearUser()
    navigate('/auth')
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white/70 dark:bg-[#070b18]/70 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white text-sm leading-none tracking-tight">CareerPilot AI</p>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1.5 font-medium">AI Career Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-none">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all group ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-600 dark:bg-primary/20 dark:text-white border border-blue-500/20 dark:border-white/10 shadow-sm' 
                  : 'text-slate-500 dark:text-white/60 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
              }`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" size={18} strokeWidth={2.2} />
            <span className="text-sm font-semibold">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" size={14} strokeWidth={2.5} />
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-white/5 mb-3 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-inner text-white">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={16} strokeWidth={2.5} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-white/50 truncate font-medium">{user?.email}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shrink-0"
            title={theme === 'dark' ? "Switch to Neural Light Lab Theme" : "Switch to AI Neural Glass Lab Theme"}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 dark:text-white/60 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all duration-300"
        >
          <LogOut size={15} strokeWidth={2.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 shrink-0 p-3 pr-0">
        <div className="h-full rounded-[28px] overflow-hidden shadow-card dark:shadow-card-dark border border-white/60 dark:border-white/10 relative">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 flex flex-col z-10 p-3">
             <div className="h-full rounded-[28px] overflow-hidden shadow-card-dark border border-white/10 relative">
               <Sidebar />
             </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 p-4 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-secondary/50 backdrop-blur-2xl">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-white/60 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary text-white">
              <Sparkles size={14} />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-800 dark:text-white">CareerPilot AI</span>
          </div>
        </div>

        <main className="flex-1 p-3 lg:p-6 lg:pl-4 min-h-0">
           <div className="h-full rounded-[32px] overflow-y-auto relative scroll-smooth scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
             <Outlet />
           </div>
        </main>
      </div>
    </div>
  )
}
