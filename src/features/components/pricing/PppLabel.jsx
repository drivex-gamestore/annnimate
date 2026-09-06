import { Info } from 'lucide-react'; 

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@providers/TooltipProvider'; 
import { t } from '@components/helpers/translate';
import { usePppGeo } from '@hooks/usePppGeo'; 

function getRegionName(countryCode) {
  if (!countryCode) return null;
  try {
    return new Intl.DisplayNames(["en"], {
      type: "region"
    }).of(countryCode) || null;
  } catch {
    return null;
  }
}

/**
 * Custom hook to determine the Purchasing Power Parity (PPP) message.
 * Mapped from mangled function `s()`.
 */
function usePppMessage() {
  const geo = usePppGeo(); // mangled: let e = (0, n.usePppGeo)()
  
  if (!geo?.tier) return null;

  const countryName = getRegionName(geo.country);

  return countryName 
    ? t("pricing.tiers.pppNotice", { country: countryName }) 
    : t("pricing.tiers.pppNoticeGeneric");
}

export function PppLabel({ className = "" }) {
  const message = usePppMessage(); // mangled: let n = s()

  if (!message) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`text-mono-sm inline-flex items-center gap-6 text-brand ${className}`}
          >
            {t("pricing.tiers.pppName")}
            <Info size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8} className="max-w-[36ch]">
          <p className="text-body-sm font-sans normal-case leading-relaxed text-foreground">
            {message}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function PppBanner({ className = "", align = "center" }) {
  const message = usePppMessage(); // mangled: let l = s()

  if (!message) return null;

  return (
    <aside className={`flex ${align === "start" ? "justify-start" : "justify-center"} ${className}`}>
      <div className="flex max-w-[560px] flex-col gap-8 border border-foreground/10 bg-surface px-20 py-16">
        <p className="text-mono-sm flex items-center gap-8 text-brand">
          <span aria-hidden="true" className="inline-block size-8 bg-brand" />
          {t("pricing.tiers.pppName")}
        </p>
        <p className="text-body-sm text-foreground-muted">
          {message}
        </p>
      </div>
    </aside>
  );
}