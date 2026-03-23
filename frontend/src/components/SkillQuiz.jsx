/**
 * SkillQuiz — AI-powered skill assessment quiz
 * Props: skills, onComplete(results), onSkip()
 * Supports MCQ + scenario question types with weighted scoring.
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAssessment } from '../api'
import useJourneyStore from '../store/useJourneyStore'

const ANSWER_COLORS = {
  correct: '#34D399',
  incorrect: '#FB7185',
}

// Weighted scoring by question type
const TYPE_WEIGHTS = { easy: 0.15, medium: 0.25, scenario: 0.35, hard: 0.25 }

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="rounded-xl p-6"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="h-4 rounded-full mb-4" style={{ backgroundColor: 'var(--bg-quaternary)', width: '80%' }} />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-10 rounded-lg" style={{ backgroundColor: 'var(--bg-quaternary)' }} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function QuizProgress({ current, total }) {
  const pct = ((current + 1) / total) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium theme-text-tertiary">
          Question {current + 1} of {total}
        </span>
        <span className="text-xs font-mono text-neon-cyan">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-quaternary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #38BDF8, #A78BFA)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const DIFFICULTY_COLORS = { easy: '#34D399', medium: '#38BDF8', hard: '#A78BFA' }

function ScoreSummary({ results, onContinue }) {
  const [displayAccuracy, setDisplayAccuracy] = useState(0)

  useEffect(() => {
    const target = results.overall_accuracy
    const duration = 1500
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplayAccuracy(Math.round(target * progress))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [results.overall_accuracy])

  const maxLevel = results.max_difficulty || 'easy'
  const scenarioCount = results.scenario_count || 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-4"
    >
      <h3 className="text-xl font-bold theme-text mb-2">Assessment Complete</h3>

      <motion.div
        className="text-6xl font-black font-mono my-6"
        style={{
          background: 'linear-gradient(135deg, #38BDF8, #A78BFA)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {displayAccuracy}%
      </motion.div>

      <p className="theme-text-secondary text-sm mb-2">
        {results.total_correct} of {results.total_questions} correct
      </p>

      <div className="flex items-center justify-center gap-3 text-xs theme-text-muted mb-6">
        <span>
          Max difficulty:{' '}
          <span className="font-bold" style={{ color: DIFFICULTY_COLORS[maxLevel] }}>
            {DIFFICULTY_LABELS[maxLevel]}
          </span>
        </span>
        {scenarioCount > 0 && (
          <>
            <span>&middot;</span>
            <span>{scenarioCount} scenario{scenarioCount !== 1 ? 's' : ''} completed</span>
          </>
        )}
      </div>

      <div className="space-y-2 mb-6 max-w-sm mx-auto">
        {results.per_skill.map((s, i) => (
          <motion.div
            key={s.skill}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center justify-between px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <span className="text-sm theme-text-secondary">{s.skill}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold" style={{
                color: s.status === 'verified' ? '#34D399' : s.status === 'hidden_strength' ? '#38BDF8' : '#FB7185',
              }}>
                {s.verified_score.toFixed(0)}%
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                s.status === 'verified'
                  ? 'bg-neon-green/15 text-neon-green'
                  : s.status === 'hidden_strength'
                    ? 'bg-neon-cyan/15 text-neon-cyan'
                    : 'bg-neon-pink/15 text-neon-pink'
              }`}>
                {s.status === 'verified' ? 'Verified' : s.status === 'hidden_strength' ? 'Hidden Strength' : 'Overconfident'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="btn-primary text-sm"
      >
        <span className="relative z-10">Continue to Analysis</span>
      </motion.button>
    </motion.div>
  )
}

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard']

export default function SkillQuiz({ skills, onComplete, onSkip }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMsg, setLoadingMsg] = useState('Generating AI questions...')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [feedback, setFeedback] = useState(null) // { index, isCorrect, explanation }
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  // Adaptive difficulty state
  const [currentDifficulty, setCurrentDifficulty] = useState('easy')
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0)
  const [maxDifficultyReached, setMaxDifficultyReached] = useState('easy')
  const [questionDetails, setQuestionDetails] = useState([])

  useEffect(() => {
    let cancelled = false
    async function loadQuestions() {
      try {
        const data = await generateAssessment(skills)
        if (cancelled) return
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
        } else {
          setError('No questions generated. Please try again.')
        }
      } catch {
        if (cancelled) return
        setLoadingMsg('Using optimized question set...')
        try {
          const data = await generateAssessment(skills)
          if (cancelled) return
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
          } else {
            setError('Could not generate questions. Please skip or try again.')
          }
        } catch {
          if (!cancelled) {
            setError('Assessment service unavailable. You can skip this step.')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadQuestions()
    return () => { cancelled = true }
  }, [skills])

  const handleAnswer = useCallback((answerIndex) => {
    if (feedback) return

    const q = questions[currentIndex]
    const isCorrect = answerIndex === q.correct
    const isScenario = q.type === 'scenario'

    setFeedback({
      index: answerIndex,
      isCorrect,
      explanation: isScenario ? q.explanation : null,
    })

    const newAnswers = [...userAnswers, answerIndex]
    setUserAnswers(newAnswers)

    const newDetail = { difficulty: currentDifficulty, correct: isCorrect, type: q.type || 'mcq' }
    const newDetails = [...questionDetails, newDetail]
    setQuestionDetails(newDetails)

    // Adaptive difficulty logic
    let newConsCorrect = isCorrect ? consecutiveCorrect + 1 : 0
    let newConsIncorrect = isCorrect ? 0 : consecutiveIncorrect + 1
    let newDifficulty = currentDifficulty
    const currentIdx = DIFFICULTY_ORDER.indexOf(currentDifficulty)

    if (newConsCorrect >= 2 && currentIdx < DIFFICULTY_ORDER.length - 1) {
      newDifficulty = DIFFICULTY_ORDER[currentIdx + 1]
      newConsCorrect = 0
    } else if (newConsIncorrect >= 2 && currentIdx > 0) {
      newDifficulty = DIFFICULTY_ORDER[currentIdx - 1]
      newConsIncorrect = 0
    }

    setConsecutiveCorrect(newConsCorrect)
    setConsecutiveIncorrect(newConsIncorrect)
    setCurrentDifficulty(newDifficulty)

    const newMaxIdx = Math.max(
      DIFFICULTY_ORDER.indexOf(maxDifficultyReached),
      DIFFICULTY_ORDER.indexOf(newDifficulty),
    )
    const newMaxDifficulty = DIFFICULTY_ORDER[newMaxIdx]
    setMaxDifficultyReached(newMaxDifficulty)

    // Longer feedback for scenarios with explanations
    const feedbackDelay = isScenario && q.explanation ? 2500 : 800

    setTimeout(() => {
      setFeedback(null)
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Quiz complete — compute weighted results client-side
        const skillScores = {}
        const confidenceMap = {}
        for (const s of skills) {
          confidenceMap[s.skill] = s.confidence || 5
        }

        let scenarioCount = 0
        for (let i = 0; i < questions.length; i++) {
          const quest = questions[i]
          if (!skillScores[quest.skill]) {
            skillScores[quest.skill] = { weightedCorrect: 0, weightedTotal: 0, rawCorrect: 0, rawTotal: 0 }
          }

          const qType = quest.type === 'scenario' ? 'scenario' : quest.difficulty || 'medium'
          const weight = TYPE_WEIGHTS[qType] || TYPE_WEIGHTS.medium

          if (quest.type === 'scenario') scenarioCount++

          if (newAnswers[i] === quest.correct) {
            skillScores[quest.skill].weightedCorrect += weight
            skillScores[quest.skill].rawCorrect++
          }
          skillScores[quest.skill].weightedTotal += weight
          skillScores[quest.skill].rawTotal++
        }

        const perSkill = []
        let totalCorrect = 0
        let totalQ = 0
        let totalGap = 0
        let gapCount = 0

        for (const [skill, scores] of Object.entries(skillScores)) {
          const accuracy = scores.weightedTotal > 0 ? (scores.weightedCorrect / scores.weightedTotal) * 100 : 0
          const selfReported = (confidenceMap[skill] || 5) * 10
          const gap = selfReported - accuracy
          const status = gap > 15 ? 'overconfident' : gap < -15 ? 'hidden_strength' : 'verified'

          perSkill.push({
            skill,
            verified_score: Math.round(accuracy * 10) / 10,
            self_reported: selfReported,
            gap: Math.round(gap * 10) / 10,
            status,
            correct_count: scores.rawCorrect,
            total_count: scores.rawTotal,
          })

          totalCorrect += scores.rawCorrect
          totalQ += scores.rawTotal
          totalGap += gap
          gapCount++
        }

        const overallAccuracy = Math.round((totalCorrect / totalQ) * 1000) / 10

        // Save to journey store
        const journeyStore = useJourneyStore.getState()
        for (const ps of perSkill) {
          journeyStore.setQuizScore(ps.skill, {
            score: ps.verified_score,
            maxLevel: newMaxDifficulty,
          })
          if (ps.verified_score >= 70) {
            journeyStore.addCompletedSkill(ps.skill)
          }
        }

        setResults({
          per_skill: perSkill.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap)),
          overall_accuracy: overallAccuracy,
          verification_gap: Math.round((totalGap / gapCount) * 10) / 10,
          total_correct: totalCorrect,
          total_questions: totalQ,
          max_difficulty: newMaxDifficulty,
          scenario_count: scenarioCount,
        })
      }
    }, feedbackDelay)
  }, [feedback, questions, currentIndex, userAnswers, skills, currentDifficulty, consecutiveCorrect, consecutiveIncorrect, maxDifficultyReached, questionDetails])

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <svg className="animate-spin w-5 h-5 text-neon-cyan" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
          </svg>
          <span className="text-sm theme-text-secondary">{loadingMsg}</span>
        </div>
        <SkeletonLoader />
        <div className="mt-4 text-center">
          <button onClick={onSkip} className="text-xs theme-text-muted hover:text-neon-cyan transition-colors">
            Skip Assessment
          </button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-neon-pink mb-4">{error}</p>
        <button onClick={onSkip} className="btn-primary text-sm">
          <span className="relative z-10">Skip & Continue</span>
        </button>
      </div>
    )
  }

  if (results) {
    return <ScoreSummary results={results} onContinue={() => onComplete(results)} />
  }

  const q = questions[currentIndex]
  if (!q) return null

  const isScenario = q.type === 'scenario'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold theme-text">Skill Assessment</h2>
        <button onClick={onSkip} className="text-xs theme-text-muted hover:text-neon-cyan transition-colors">
          Skip Assessment
        </button>
      </div>
      <p className="theme-text-tertiary mb-4 text-sm">Verify your skills with AI-generated questions</p>

      <QuizProgress current={currentIndex} total={questions.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Badges row */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan uppercase tracking-wider">
              {q.skill}
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: `${DIFFICULTY_COLORS[currentDifficulty]}15`,
                color: DIFFICULTY_COLORS[currentDifficulty],
              }}
            >
              {DIFFICULTY_LABELS[currentDifficulty]}
            </span>
            {isScenario && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border"
                style={{
                  backgroundColor: 'rgba(251, 146, 60, 0.10)',
                  color: '#FB923C',
                  borderColor: 'rgba(251, 146, 60, 0.30)',
                }}
              >
                Scenario
              </span>
            )}
          </div>

          {/* Question text — scenario gets distinct styling */}
          <div
            className={`rounded-xl mb-4 ${isScenario ? 'p-4 border' : ''}`}
            style={isScenario ? {
              backgroundColor: 'rgba(251, 146, 60, 0.05)',
              borderColor: 'rgba(251, 146, 60, 0.15)',
            } : undefined}
          >
            <p className="theme-text font-medium text-base">{q.question}</p>
          </div>

          {/* Answer options */}
          <div className="space-y-2">
            {q.options.map((option, i) => {
              let borderColor = 'var(--border-subtle)'
              let bgColor = 'var(--bg-tertiary)'

              if (feedback) {
                if (i === q.correct) {
                  borderColor = ANSWER_COLORS.correct
                  bgColor = 'rgba(52, 211, 153, 0.08)'
                } else if (i === feedback.index && !feedback.isCorrect) {
                  borderColor = ANSWER_COLORS.incorrect
                  bgColor = 'rgba(251, 113, 133, 0.08)'
                }
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={!!feedback}
                  whileHover={!feedback ? { scale: 1.02, x: 4 } : undefined}
                  whileTap={!feedback ? { scale: 0.97 } : undefined}
                  animate={
                    feedback && i === feedback.index && !feedback.isCorrect
                      ? { x: [0, -5, 5, -5, 0] }
                      : undefined
                  }
                  transition={
                    feedback && i === feedback.index && !feedback.isCorrect
                      ? { duration: 0.3 }
                      : { duration: 0.2 }
                  }
                  className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all border"
                  style={{
                    borderColor,
                    backgroundColor: bgColor,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="font-mono text-neon-cyan mr-3 text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </motion.button>
              )
            })}
          </div>

          {/* Explanation display for scenario questions */}
          <AnimatePresence>
            {feedback && feedback.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.05)',
                  borderColor: 'rgba(56, 189, 248, 0.20)',
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-neon-cyan text-sm mt-0.5">💡</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-neon-cyan mb-1">Explanation</p>
                    <p className="text-sm theme-text-secondary leading-relaxed">{feedback.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
