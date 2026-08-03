import HeroSection from '../components/sections/HeroSection'
import FeaturedProperties from '../components/sections/FeaturedProperties'
import StatsSection from '../components/sections/StatsSection'
import CitiesSection from '../components/sections/CitiesSection'
import Testimonials from '../components/sections/Testimonials'
import WhyUs from '../components/sections/WhyUs'
import BrowseByType from '../components/sections/BrowseByType'
import CTABanner from '../components/sections/CTABanner'
import AdBanner from '../components/ui/AdBanner'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 rounded-2xl min-h-[96px] flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200">
          <span className="absolute z-0">Advertisement Space</span>
          <AdBanner dataAdSlot="1111111111" className="relative z-10 w-full" />
        </div>
      </div>

      <BrowseByType />
      <FeaturedProperties />
      <CitiesSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 rounded-2xl min-h-[96px] flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-200">
          <span className="absolute z-0">Advertisement Space</span>
          <AdBanner dataAdSlot="2222222222" className="relative z-10 w-full" />
        </div>
      </div>

      <WhyUs />
      <Testimonials />
      <CTABanner />
    </main>
  )
}
