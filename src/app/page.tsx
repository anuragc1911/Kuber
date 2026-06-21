import { HeroSection } from '@/components/hero-section'
import { MagicMomentSection } from '@/components/magic-moment-section'
import { WhatYouGetSection } from '@/components/what-you-get-section'
import { WhyKuberSection } from '@/components/why-kuber-section'
import { WhoItsForSection } from '@/components/who-its-for-section'
import { IntegrationsSection } from '@/components/integrations-section'
import { PricingSection } from '@/components/pricing-section'
import { WhatKuberDoesSection } from '@/components/what-kuber-does-section'
import { CTASection } from '@/components/cta-section'
import { Footer } from '@/components/footer'
import { Waves } from '@/components/ui/wave-background'

function WaveDivider() {
    return (
        <div className="relative w-full">
            <div className="h-px w-full bg-white/10" />
            <div className="relative h-[180px] w-full md:h-[220px]">
                <Waves
                    strokeColor="rgba(176, 196, 222, 0.55)"
                    backgroundColor="transparent"
                    pointerSize={0.4}
                />
            </div>
            <div className="h-px w-full bg-white/10" />
        </div>
    )
}

export default function Home() {
    return (
        <>
            <HeroSection />
            <MagicMomentSection />
            <WhatYouGetSection />
            <WhyKuberSection />
            <WhoItsForSection />
            <IntegrationsSection />
            <WaveDivider />
            <PricingSection />
            <WhatKuberDoesSection />
            <CTASection />
            <Footer />
        </>
    )
}
