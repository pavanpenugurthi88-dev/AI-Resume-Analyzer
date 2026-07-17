import { create } from 'zustand'
import type { Resume, ATSResult, InterviewSession } from '../types'

interface AppState {
  currentResume: Resume | null
  atsResult: ATSResult | null
  interviewSession: InterviewSession | null
  isAnalyzing: boolean
  missingSkills: string[]
  setCurrentResume: (resume: Resume | null) => void
  setATSResult: (result: ATSResult | null) => void
  setInterviewSession: (session: InterviewSession | null) => void
  setIsAnalyzing: (v: boolean) => void
  setMissingSkills: (skills: string[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentResume: null,
  atsResult: null,
  interviewSession: null,
  isAnalyzing: false,
  missingSkills: [],
  setCurrentResume: (resume) => set({ currentResume: resume }),
  setATSResult: (result) => set({ atsResult: result }),
  setInterviewSession: (session) => set({ interviewSession: session }),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  setMissingSkills: (skills) => set({ missingSkills: skills }),
}))
