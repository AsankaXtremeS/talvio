import React from 'react'
import Hero from './hero/page'
import { FeaturesSection } from './features/page'
import { UsersSection } from './users/page'
import { ContactSection } from './contact/page'

const LandingPage = () => {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <UsersSection />
      <ContactSection />
    </>
  )
}

export default LandingPage