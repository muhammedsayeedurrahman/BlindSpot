import { useState, useEffect } from 'react'

export default function useCountUp(end, duration = 2000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(0)
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased * 10) / 10)
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])

  return value
}
