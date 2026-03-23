import { useState, useCallback, useRef } from 'react'
import { enrichRoles } from '../api'

/**
 * Hook for fetching + caching AI-enriched role details.
 * Returns { getDetails, detailsMap, loading, prefetch }.
 */
export default function useRoleDetails() {
  const [detailsMap, setDetailsMap] = useState({})
  const [loading, setLoading] = useState({})
  const inflightRef = useRef({})

  const fetchRoles = useCallback(async (roleNames) => {
    // Filter out already cached or in-flight roles
    const needed = roleNames.filter(
      (r) => !detailsMap[r] && !inflightRef.current[r]
    )
    if (needed.length === 0) return

    // Mark as in-flight
    for (const r of needed) {
      inflightRef.current[r] = true
    }
    setLoading((prev) => {
      const next = { ...prev }
      for (const r of needed) next[r] = true
      return next
    })

    try {
      const results = await enrichRoles(needed)
      setDetailsMap((prev) => ({ ...prev, ...results }))
    } catch {
      // On failure, silently degrade — cards still work without AI details
    } finally {
      setLoading((prev) => {
        const next = { ...prev }
        for (const r of needed) {
          delete next[r]
          delete inflightRef.current[r]
        }
        return next
      })
    }
  }, [detailsMap])

  const getDetails = useCallback(
    (role) => detailsMap[role] || null,
    [detailsMap]
  )

  const isLoading = useCallback(
    (role) => !!loading[role],
    [loading]
  )

  const prefetch = useCallback(
    (roleNames) => {
      fetchRoles(roleNames)
    },
    [fetchRoles]
  )

  return { getDetails, isLoading, detailsMap, prefetch, fetchRoles }
}
