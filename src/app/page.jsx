import LandingClient from "@components/sections/heroSextion"; 
import TestimonialsSection from '@components/sections/Testimonials'
import PlatformMockupSection from '@/view/PlatformMockupSection'

export default function ProjectPage() {
  return (
    <main>
      <LandingClient />
      <TestimonialsSection images={someImages} />
      <PlatformMockupSection />
    </main>
  );
}
