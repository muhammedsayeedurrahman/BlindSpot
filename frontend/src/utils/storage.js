const STORAGE_KEY = 'blindspot_analyses'

function _getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function _setAll(analyses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses))
}

export function saveAnalysis(data) {
  const analyses = _getAll()
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: data.profile?.name || 'Anonymous',
    role: data.profile?.current_role || 'Unknown',
    bsiScore: data.blindspot_index?.score || 0,
    date: new Date().toISOString(),
    data,
  }
  analyses.unshift(entry)
  // Keep max 20 saved analyses
  if (analyses.length > 20) {
    analyses.length = 20
  }
  _setAll(analyses)
  return entry
}

export function loadAnalysis(id) {
  const analyses = _getAll()
  const entry = analyses.find((a) => a.id === id)
  return entry ? entry.data : null
}

export function listAnalyses() {
  return _getAll().map(({ id, name, role, bsiScore, date }) => ({
    id,
    name,
    role,
    bsiScore,
    date,
  }))
}

export function deleteAnalysis(id) {
  const analyses = _getAll().filter((a) => a.id !== id)
  _setAll(analyses)
}
