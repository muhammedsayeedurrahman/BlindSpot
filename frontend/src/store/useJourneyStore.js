import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

// Debounce helper — waits `ms` after last call before firing
let _syncTimer = null
const _syncToSupabase = (state) => {
  if (!supabase) return
  clearTimeout(_syncTimer)
  _syncTimer = setTimeout(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('journey_progress').upsert(
        {
          user_id: user.id,
          selected_paths: state.selectedPaths,
          quiz_scores: state.quizScores,
          completed_skills: state.completedSkills,
          evolution_choices: state.evolutionChoices,
        },
        { onConflict: 'user_id' },
      )
    } catch {
      // Non-blocking — localStorage is the primary store
    }
  }, 2000)
}

const useJourneyStore = create(
  persist(
    (set, get) => ({
      // { [skill]: 'upgrade'|'expand'|'career' }
      selectedPaths: {},

      // { [skill]: { score, maxLevel, timestamp } }
      quizScores: {},

      // Skills where quiz score >= 70%
      completedSkills: [],

      // { [skill]: { type, label, skills, months } }
      evolutionChoices: {},

      setEvolutionChoice: (skill, path) => {
        set({ evolutionChoices: { ...get().evolutionChoices, [skill]: path } })
        _syncToSupabase(get())
      },

      setSelectedPath: (skill, pathType) => {
        set({ selectedPaths: { ...get().selectedPaths, [skill]: pathType } })
        _syncToSupabase(get())
      },

      setQuizScore: (skill, scoreData) => {
        set({
          quizScores: {
            ...get().quizScores,
            [skill]: { ...scoreData, timestamp: Date.now() },
          },
        })
        _syncToSupabase(get())
      },

      addCompletedSkill: (skill) => {
        const current = get().completedSkills
        if (!current.includes(skill)) {
          set({ completedSkills: [...current, skill] })
          _syncToSupabase(get())
        }
      },

      resetJourney: () => {
        set({
          selectedPaths: {},
          quizScores: {},
          completedSkills: [],
          evolutionChoices: {},
        })
        _syncToSupabase(get())
      },

      // Hydrate from Supabase (called once on app load)
      hydrateFromSupabase: async () => {
        if (!supabase) return
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) return

          const { data } = await supabase
            .from('journey_progress')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          if (!data) return

          // Merge: Supabase wins if it has more data
          const local = get()
          const supaPaths = data.selected_paths || {}
          const supaScores = data.quiz_scores || {}
          const supaSkills = data.completed_skills || []
          const supaChoices = data.evolution_choices || {}

          set({
            selectedPaths: { ...local.selectedPaths, ...supaPaths },
            quizScores: { ...local.quizScores, ...supaScores },
            completedSkills: [
              ...new Set([...local.completedSkills, ...supaSkills]),
            ],
            evolutionChoices: { ...local.evolutionChoices, ...supaChoices },
          })
        } catch {
          // Non-blocking
        }
      },
    }),
    { name: 'blindspot-journey' },
  ),
)

export default useJourneyStore
