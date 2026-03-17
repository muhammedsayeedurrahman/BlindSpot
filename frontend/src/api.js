import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export async function analyzeProfile(profile) {
  const response = await api.post('/analyze', profile)
  return response.data
}

export default api
