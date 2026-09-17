import { useEffect, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [transitionStage, setTransitionStage] = useState<'enter' | 'idle' | 'exit'>('enter')
  const prevPathname = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      // Route changed → exit current page
      setTransitionStage('exit')
      prevPathname.current = location.pathname
    }
  }, [location.pathname])

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timer = setTimeout(() => {
        // After exit animation, swap children and enter
        setDisplayChildren(children)
        setTransitionStage('enter')
      }, 200) // Must match CSS exit animation duration
      return () => clearTimeout(timer)
    }
  }, [transitionStage, children])

  // On initial mount, just show with enter animation
  useEffect(() => {
    setTransitionStage('enter')
  }, [])

  return (
    <div
      className={`transition-page-${transitionStage}`}
    >
      {displayChildren}
    </div>
  )
}
