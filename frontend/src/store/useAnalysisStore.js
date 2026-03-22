import { create } from 'zustand'
import DEMO_DATA from '../data/demoData'

const useAnalysisStore = create((set, get) => ({
  // Full analysis response — falls back to demo data
  data: DEMO_DATA,

  // Highest journey step visited (0=dashboard, 1=analysis, 2=explore, 3=roadmap, 4=opportunities)
  journeyStep: 0,

  // Replace the entire data blob (called from Onboarding/Landing)
  setData: (data) => set({ data }),

  // Mark a step as visited — only advances forward, never backward
  advanceJourney: (step) => set({ journeyStep: Math.max(get().journeyStep, step) }),

  // Reset journey (for re-analyze)
  resetJourney: () => set({ journeyStep: 0 }),
}))

export default useAnalysisStore
