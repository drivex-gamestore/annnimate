import React from 'react';
import { t } from '@components/helpers/translate';
import AnimatedHeading from '@animations/components/AnimatedHeading';
import AnimatedText from '@animations/components/AnimatedText';
import NewsletterFrom from '@components/NewsletterEyebrow';

export default function StarterPackSection({
  source = "homepage",
  idPrefix = "homepage",
  theme = "light"
}) {
  return (
    <section data-theme={theme} className="bg-background text-foreground">
      <div className="v2-container py-96 lg:py-160">
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-16 text-center">
          <AnimatedHeading
            as="h2"
            sizeClass="text-h2"
            trigger="scroll"
            className="font-medium"
          >
            {t("common.starterPack.headline")}
          </AnimatedHeading>
          
          <AnimatedText
            triggerMode="scroll"
            className="text-body max-w-[44ch] leading-relaxed text-foreground-muted"
          >
            {t("common.starterPack.body")}
          </AnimatedText>
          
          <div className="mt-16 w-full max-w-[36rem] text-left">
            <NewsletterFrom
              source={source}
              idPrefix={idPrefix}
              buttonLabel={t("common.starterPack.buttonLabel")}
              inputSize="lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

