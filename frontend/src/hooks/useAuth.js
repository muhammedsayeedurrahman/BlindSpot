import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Check for existing session, then try anonymous sign-in
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setLoading(false)
      } else {
        supabase.auth
          .signInAnonymously()
          .then(({ data: signInData }) => {
            setUser(signInData?.user || null)
          })
          .catch(() => {})
          .finally(() => setLoading(false))
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, isAnonymous: user?.is_anonymous ?? true }
}
