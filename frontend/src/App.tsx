import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import ResultsPage from './pages/ResultsPage'
import InterviewPage from './pages/InterviewPage'
import RoadmapPage from './pages/RoadmapPage'
import BuilderPage from './pages/BuilderPage'
import JourneyPage from './pages/JourneyPage'
import SettingsPage from './pages/SettingsPage'
import ChatPage from './pages/ChatPage'
import TrackerPage from './pages/TrackerPage'
import ReviewerRewritePage from './pages/ReviewerRewritePage'
import AnalyticsPage from './pages/AnalyticsPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import AINeuralGlassLabBackground from './components/AINeuralGlassLabBackground'

export default function App() {
  const { setLoading } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Apply morning/midnight theme classes dynamically
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    // Check for persisted demo session
    const demoUser = localStorage.getItem('demo_user')
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser)
        useAuthStore.getState().setUser(user)
      } catch {}
    }
    setLoading(false)
  }, [setLoading])

  return (
    <>
      <AINeuralGlassLabBackground />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/builder" element={<BuilderPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/reviewer-rewrite" element={<ReviewerRewritePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  )
}
