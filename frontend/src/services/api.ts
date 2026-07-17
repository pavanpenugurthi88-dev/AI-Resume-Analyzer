import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    let msg = 'An error occurred'
    
    if (error.code === 'ECONNABORTED') {
      msg = 'Request timeout. Backend server may not be running.'
    } else if (error.code === 'ERR_NETWORK') {
      msg = `Network error: Cannot connect to ${API_URL}. Is the backend running?`
    } else if (error.response?.status === 500) {
      msg = 'Server error. Check backend logs.'
    } else if (error.response?.status === 404) {
      msg = error.response?.data?.detail || 'Not found'
    } else if (error.response?.data?.detail) {
      msg = error.response.data.detail
    } else if (error.message) {
      msg = error.message
    }
    
    error.message = msg
    return Promise.reject(error)
  }
)

export const uploadResume = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const listResumes = () => api.get('/resume')

export const analyzeResume = (resumeId: string, jdText: string, jdTitle?: string, jdCompany?: string) =>
  api.post('/ats/analyze', { resume_id: resumeId, jd_text: jdText, jd_title: jdTitle, jd_company: jdCompany })

export const startInterviewSession = (resumeId: string, jdText: string, sessionType: string, numQuestions: number) =>
  api.post('/interview/start', { resume_id: resumeId, jd_text: jdText, session_type: sessionType, num_questions: numQuestions })

export const evaluateAnswer = (sessionId: string, questionId: number, questionText: string, answer: string, expectedKeywords: string[], category: string) =>
  api.post('/interview/evaluate-answer', { session_id: sessionId, question_id: questionId, question_text: questionText, answer, expected_keywords: expectedKeywords, category })

export const completeSession = (sessionId: string, evaluations: unknown[]) =>
  api.post('/interview/complete', { session_id: sessionId, evaluations })

export const getDashboardStats = () => api.get('/dashboard/stats')
export const getRecentActivity = () => api.get('/dashboard/activity')
export const generateRoadmap = (missingSkills: string[]) => api.post('/ats/roadmap', missingSkills)

// Settings APIs
export const getSettings = () => api.get('/settings')
export const updateSettings = (data: { theme: string; selected_provider: string; selected_model: string; api_keys: Record<string, string> }) =>
  api.post('/settings', data)

// Chat APIs
export const getChatSessions = () => api.get('/chat/sessions')
export const createChatSession = (title?: string) => api.post('/chat/sessions', { title })
export const sendChatMessage = (sessionId: string, message: string, resumeId?: string, interviewSessionId?: string) =>
  api.post('/chat/send', { session_id: sessionId, message, resume_id: resumeId, interview_session_id: interviewSessionId })

// Application Tracker APIs
export const getApplications = () => api.get('/tracker')
export const createApplication = (data: { company: string; role: string; status: string; priority?: string; deadline?: string; notes?: string }) =>
  api.post('/tracker', data)
export const updateApplication = (id: string, data: { company: string; role: string; status: string; priority?: string; deadline?: string; notes?: string }) =>
  api.put(`/tracker/${id}`, data)
export const deleteApplication = (id: string) => api.delete(`/tracker/${id}`)

// Admin Panel APIs
export const getAdminAnalytics = () => api.get('/admin/analytics')
export const updateDefaultModel = (provider: string, model: string) =>
  api.post('/admin/default-model', { provider, model })
