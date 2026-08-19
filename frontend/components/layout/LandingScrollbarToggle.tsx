'use client'

import { useEffect } from 'react'

const LANDING_NO_SCROLLBAR_CLASS = 'landing-no-scrollbar'

const LandingScrollbarToggle = () => {
  useEffect(() => {
    document.documentElement.classList.add(LANDING_NO_SCROLLBAR_CLASS)
    document.body.classList.add(LANDING_NO_SCROLLBAR_CLASS)

    return () => {
      document.documentElement.classList.remove(LANDING_NO_SCROLLBAR_CLASS)
      document.body.classList.remove(LANDING_NO_SCROLLBAR_CLASS)
    }
  }, [])

  return null
}

export default LandingScrollbarToggle