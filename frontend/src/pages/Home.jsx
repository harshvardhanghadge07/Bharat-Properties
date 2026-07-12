import HeroSection from '../components/sections/HeroSection'
import FeaturedProperties from '../components/sections/FeaturedProperties'
import StatsSection from '../components/sections/StatsSection'
import CitiesSection from '../components/sections/CitiesSection'
import Testimonials from '../components/sections/Testimonials'
import WhyUs from '../components/sections/WhyUs'
import BrowseByType from '../components/sections/BrowseByType'
import CTABanner from '../components/sections/CTABanner'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <BrowseByType />
      <FeaturedProperties />
      <CitiesSection />
      <WhyUs />
      <Testimonials />
      <CTABanner />
    </main>
  )
}
