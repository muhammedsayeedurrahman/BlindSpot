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

export default api
