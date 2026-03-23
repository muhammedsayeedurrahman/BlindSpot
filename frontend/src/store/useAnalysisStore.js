import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import DEMO_DATA from '../data/demoData'

const useAnalysisStore = create((set, get) => ({
  // Full analysis response — falls back to demo data
  data: DEMO_DATA,

  // Highest journey step visited (0=dashboard, 1=analysis, 2=explore, 3=roadmap, 4=opportunities)
  journeyStep: 0,

  // Replace the entire data blob (called from Onboarding/Landing)
  setData: (data) => {
    set({ data })
    // Save to Supabase in background (non-blocking)
    _saveAnalysis(data)
  },

  // Mark a step as visited — only advances forward, never backward
  advanceJourney: (step) => set({ journeyStep: Math.max(get().journeyStep, step) }),

  // Reset journey (for re-analyze)
  resetJourney: () => set({ journeyStep: 0 }),
}))

async function _saveAnalysis(data) {
  if (!supabase) return
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('analyses').insert({
      user_id: user.id,
      skills: data.profile?.skills || [],
      bsi_score: data.blindspot_index?.score,
      bsi_level: data.blindspot_index?.level,
      result: data,
    })
  } catch {
    // Non-blocking — analysis still works without persistence
  }
}

export default useAnalysisStore
