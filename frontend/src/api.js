import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export async function analyzeProfile(profile) {
  const response = await api.post('/analyze', profile)
  return response.data
}

export async function fetchSkills() {
  const response = await api.get('/skills')
  return response.data
}

export async function fetchRoles() {
  const response = await api.get('/roles')
  return response.data
}

export async function checkHealth() {
  const response = await api.get('/health')
  return response.data
}

// === NEW: Assessment API functions (delete block to revert) ===
export async function generateAssessment(skills) {
  const response = await api.post('/assess', { action: 'generate', skills })
  return response.data
}

export async function scoreAssessment(questions, answers, skills) {
  const response = await api.post('/assess', { action: 'score', questions, answers, skills })
  return response.data
}
// === END Assessment API ===

export async function fetchEvolutionPaths(skill) {
  const params = skill ? { skill } : {}
  const response = await api.get('/evolution', { params })
  return response.data
}

export async function fetchExplanation(contextType, data) {
  const response = await api.post('/explain', { context_type: contextType, data })
  return response.data
}

export default api
