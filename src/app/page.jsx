import LandingClient from "@components/sections/heroSextion"; 
import PlatformMockupSection from '@/view/PlatformMockupSection'
import { getLatestAnimation } from '@lib/queries/getLatestAnimation';

export default async function ProjectPage() {
  const latestAnimation = await getLatestAnimation();

  return (
    <>
      <LandingClient latestAnimation={latestAnimation} />
      <PlatformMockupSection />
    </>
  );
}
