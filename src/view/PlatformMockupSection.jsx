
import PlatformMockup from "@features/utilities/PlatformMockup";
import { getPlatformMockupData } from "@sanity/queries/PlatformMockupData";

export default async function PlatformMockupSection() {
  const data = await getPlatformMockupData();

  if (!data?.animations?.length) {
    return null;
  }

  return (
    <PlatformMockup
      animations={data.animations}
      filterPool={data.filterPool ?? []}
      totalCount={data.totalCount ?? null}
      revealOnPageEnter={data.revealOnPageEnter ?? false}
      filterBarDemo={data.filterBarDemo ?? false}
    />
  );
}
