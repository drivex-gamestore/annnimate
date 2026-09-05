import React, { useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import AnimatedHeading from '@animations/components/AnimatedHeading';
import AnimatedText from '@animations/components/AnimatedText'; 
import AnimatedButton from '@animations/components/AnimatedButton'; 
import Tabs from '@components/ui/Tabs'; 
import Checklist from '@features/components/ui/Checklist';
import { useReveal } from '@hooks/useReveal';
import storeConfig, { effectiveCyclePrice } from '@config/storeConfig';
import { t } from '@features/helpers/translate';

import HandIcon from '@features/utilities/HandIcon';
import RobotIcon from '@features/utilities/RobotIcon';

const USAGE_TYPES = [
  { id: 'site', components: 4 },
  { id: 'projects', components: 12 },
  { id: 'client', components: 30 },
];

const TASKS = [
  { id: 'design', hand: 2, ai: 1.5 },
  { id: 'build', hand: 3, ai: 0.5 },
  { id: 'responsive', hand: 1.5, ai: 0.5 },
  { id: 'qa', hand: 1.5, ai: 0.5 },
];

function formatCurrency(value) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatHours(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function ValueMath({ cta, sectionId = 'value-math' }) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const introReadyFn = useRef(null);

  const [usageType, setUsageType] = useState(USAGE_TYPES[0].id);
  const [mode, setMode] = useState('hand');

  const activeUsage = USAGE_TYPES.find((e) => e.id === usageType) ?? USAGE_TYPES[0];
  const totalHours = useMemo(() => TASKS.reduce((acc, task) => acc + task[mode], 0), [mode]);
  
  const totalUsageHours = totalHours * activeUsage.components;
  const totalValue = 80 * totalUsageHours;
  
  const [animatedValue, setAnimatedValue] = useState(totalValue);
  const animatedValueRef = useRef(totalValue);
  const hasMountedRef = useRef(false);

  useGSAP(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      animatedValueRef.current = totalValue;
      return;
    }
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animatedValueRef.current = totalValue;
      setAnimatedValue(totalValue);
      return;
    }
    
    const proxy = { v: animatedValueRef.current };
    const tween = gsap.to(proxy, {
      v: totalValue,
      duration: 0.9,
      ease: 'expo.out',
      onUpdate: () => {
        animatedValueRef.current = proxy.v;
        setAnimatedValue(proxy.v);
      },
    });
    
    return () => tween.kill();
  }, {
    dependencies: [totalValue],
    scope: sectionRef,
  });

  useReveal(sectionRef, {
    mode: 'scroll',
    build: () => {
      const tl = gsap.timeline({ paused: true });
      return (
        tl.call(() => headingRef.current?.reveal?.(), [], 0),
        tl.call(() => introReadyFn.current?.(), [], 0.2),
        tl
      );
    },
  });

  const usageTabs = USAGE_TYPES.map((e) => ({
    id: e.id,
    label: t(`common.valueMath.usage.${e.id}`),
  }));

  const modeTabs = [
    {
      id: 'hand',
      label: t('common.valueMath.mode.hand'),
      Icon: HandIcon,
    },
    {
      id: 'ai',
      label: t('common.valueMath.mode.ai'),
      Icon: RobotIcon,
    },
  ];

  const yearlyPlan = storeConfig.stripe?.landingPlans?.find((e) => e.key === 'solo')?.yearly;
  const yearlyPrice = effectiveCyclePrice(yearlyPlan);

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      data-theme="dark"
      className="value-math relative bg-background py-64 text-foreground lg:py-96"
    >
      <div className="v2-container">
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-12 gap-x-24 gap-y-8">
              <header className="col-span-12 lg:col-span-6">
                <AnimatedHeading
                  ref={headingRef}
                  as="h2"
                  className="max-w-[18ch]"
                  trigger="manual"
                >
                  {t('common.valueMath.headline')}
                </AnimatedHeading>
                <AnimatedText
                  tag="p"
                  className="text-body m-0 mt-12 max-w-[52ch] text-foreground-muted lg:mt-24"
                  type="lines"
                  mask="lines"
                  duration={0.6}
                  stagger={0.03}
                  ease="power2.out"
                  animationProps={{ yPercent: 100 }}
                  triggerMode="manual"
                  onReady={(e) => {
                    introReadyFn.current = e;
                  }}
                >
                  {t('common.valueMath.intro')}
                </AnimatedText>
              </header>

              <div className="col-span-12 mt-16 flex items-end lg:col-span-6 lg:col-start-7 lg:mt-0">
                <Tabs
                  tabs={usageTabs}
                  activeId={usageType}
                  onChange={setUsageType}
                  ariaLabel={t('common.valueMath.usageAria')}
                  fill={true}
                />
              </div>

              <div className="col-span-12 mt-16 lg:col-span-5 lg:mt-24">
                <p className="text-mono-sm m-0 text-foreground-muted">
                  {t('common.valueMath.savedLabel')}
                </p>
                <p className="text-h1 m-0 mt-12 leading-none tabular-nums text-foreground">
                  €{formatCurrency(animatedValue)}
                </p>
                <p className="text-body m-0 mt-12 text-foreground-muted">
                  {t('common.valueMath.savedHours', { hours: totalUsageHours })}
                </p>
                <Checklist
                  className="mt-32"
                  items={[
                    t('common.valueMath.points.components', { count: activeUsage.components }),
                    t('common.valueMath.points.breakEven'),
                    t('common.valueMath.points.ownership'),
                  ]}
                />
              </div>

              <div className="col-span-12 mt-16 lg:col-span-6 lg:col-start-7 lg:mt-0">
                <div className="bg-surface p-24 lg:p-32">
                  <div className="flex flex-wrap items-center justify-between gap-16">
                    <p className="text-mono-sm m-0 text-foreground-muted">
                      {t('common.valueMath.modeLabel')}
                    </p>
                    <Tabs
                      tabs={modeTabs}
                      activeId={mode}
                      onChange={setMode}
                      ariaLabel={t('common.valueMath.modeAria')}
                      iconSize="size-16"
                    />
                  </div>

                  <dl className="m-0 mt-16">
                    {TASKS.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-baseline justify-between gap-16 border-t border-border py-8"
                      >
                        <dt className="text-body-sm m-0 text-foreground-muted">
                          {t(`common.valueMath.rows.${task.id}`)}
                          <span className="text-foreground/45">
                            , {formatHours(task[mode])}h
                          </span>
                        </dt>
                        <dd className="text-body-sm m-0 shrink-0 tabular-nums text-foreground">
                          €{formatCurrency(80 * task[mode])}
                        </dd>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-16 border-t border-foreground/30 pt-12">
                      <dt className="text-body-sm m-0 font-medium text-foreground">
                        {t('common.valueMath.rowTotal')}
                        <span className="font-normal text-foreground/45">
                          , {formatHours(totalHours)}h
                        </span>
                      </dt>
                      <dd className="text-body-sm m-0 shrink-0 font-medium tabular-nums text-foreground">
                        €{formatCurrency(80 * totalHours)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="col-span-12 mt-16 flex flex-col gap-24 border-t border-border pt-32 lg:mt-24 lg:flex-row lg:items-end lg:justify-between lg:pt-40">
                <div>
                  <div className="flex flex-wrap items-end gap-x-40 gap-y-16">
                    <div>
                      <p className="text-mono-sm m-0 text-foreground-muted">
                        {t('common.valueMath.compareBuildLabel')}
                      </p>
                      <p className="text-h2 m-0 mt-8 leading-none tabular-nums text-foreground-muted line-through">
                        {t('common.valueMath.compareBuildValue', { money: formatCurrency(animatedValue) })}
                      </p>
                    </div>
                    <div>
                      <p className="text-mono-sm m-0 text-brand">
                        {t('common.valueMath.compareUsLabel')}
                      </p>
                      <p className="text-h2 m-0 mt-8 leading-none text-foreground">
                        {t('common.valueMath.priceLine', { price: yearlyPrice })}
                      </p>
                    </div>
                  </div>
                  <p className="text-body-sm m-0 mt-16 max-w-[52ch] text-foreground-muted">
                    {t('common.valueMath.priceSupport')}
                  </p>
                </div>
                <AnimatedButton href={cta.href} theme="brand" size="sm">
                  {cta.label}
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}