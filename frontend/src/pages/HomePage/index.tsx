import { useNavigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { PartnerLogos } from './components/PartnerLogos'
import { DiscoverCourses } from './components/DiscoverCourses'
import { FeatureOverview } from './components/FeatureOverview'
import { LiveCourses } from './components/LiveCourses'
import { Testimonials } from './components/Testimonials'
import { Resources } from './components/Resources'
import { Pricing } from './components/Pricing'
import { Events } from './components/Events'
import { AffiliateProgram } from './components/AffiliateProgram'
import { BecomeInstructor } from './components/BecomeInstructor'
import { FAQ } from './components/FAQ'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handlePrimaryCta = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }
    navigate('/register')
  }

  const handleSecondaryCta = () => {
    if (isAuthenticated) {
      navigate('/courses')
      return
    }
    navigate('/login')
  }

  const handleScrollTo = (target: string) => {
    if (typeof window === 'undefined') {
      return
    }
    const element = document.getElementById(target)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header onPrimaryCta={handlePrimaryCta} onSecondaryCta={handleSecondaryCta} onScrollTo={handleScrollTo} />
      <HeroSection onPrimaryCta={handlePrimaryCta} onSecondaryCta={handleSecondaryCta} />
      <PartnerLogos />
      <DiscoverCourses onSecondaryCta={handleSecondaryCta} />
      <FeatureOverview onSecondaryCta={handleSecondaryCta} />
      <LiveCourses onSecondaryCta={handleSecondaryCta} />
      <Testimonials />
      <Resources onSecondaryCta={handleSecondaryCta} />
      <Pricing onPrimaryCta={handlePrimaryCta} onSecondaryCta={handleSecondaryCta} />
      <Events onPrimaryCta={handlePrimaryCta} onSecondaryCta={handleSecondaryCta} />
      <AffiliateProgram onPrimaryCta={handlePrimaryCta} />
      <BecomeInstructor onPrimaryCta={handlePrimaryCta} />
      <FAQ onSecondaryCta={handleSecondaryCta} />
      {/* <FinalCTA onPrimaryCta={handlePrimaryCta} onSecondaryCta={handleSecondaryCta} /> */}
      <Footer />
    </div>
  )
}

export default HomePage

