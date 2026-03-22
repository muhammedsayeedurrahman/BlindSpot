import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

      setEvolutionChoice: (skill, path) =>
        set({ evolutionChoices: { ...get().evolutionChoices, [skill]: path } }),

      setSelectedPath: (skill, pathType) =>
        set({ selectedPaths: { ...get().selectedPaths, [skill]: pathType } }),

      setQuizScore: (skill, scoreData) =>
        set({
          quizScores: {
            ...get().quizScores,
            [skill]: { ...scoreData, timestamp: Date.now() },
          },
        }),

      addCompletedSkill: (skill) => {
        const current = get().completedSkills
        if (!current.includes(skill)) {
          set({ completedSkills: [...current, skill] })
        }
      },

      resetJourney: () =>
        set({
          selectedPaths: {},
          quizScores: {},
          completedSkills: [],
          evolutionChoices: {},
        }),
    }),
    { name: 'blindspot-journey' },
  ),
)

export default useJourneyStore
