import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import JourneySidebar from '../components/JourneySidebar'
import useAnalysisStore from '../store/useAnalysisStore'

const PATH_TO_STEP = {
  '/dashboard': 0,
  '/analysis': 1,
  '/explore': 2,
  '/roadmap': 3,
  '/opportunities': 4,
}

export default function JourneyLayout() {
  const { pathname } = useLocation()
  const advanceJourney = useAnalysisStore((s) => s.advanceJourney)

  useEffect(() => {
    const step = PATH_TO_STEP[pathname]
    if (step !== undefined) advanceJourney(step)
  }, [pathname, advanceJourney])

  return (
    <div className="min-h-screen">
      <JourneySidebar />
      <main className="md:ml-64 pt-14 md:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
