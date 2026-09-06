
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { toast } from 'sonner'; 
import AnimatedButton from '@animations/components/AnimatedButton'; 
import NavLink from '@components/NavLink';  
import { analytics } from '@lib/analytics/analytics'; 

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;[span_1](start_span)[span_1](end_span)
const SPECIAL_SOURCES = new Set([
  "starter-pack",
  "animations-library",
  "animations-detail",
  "animations-list-modal",
  "mobile-detail",
  "paywall-block",
  "kit-reveal-ad",
  "kit-reveal-page",
  "homepage",
  "pricing"
]);[span_2](start_span)[span_2](end_span)

export function NewsletterEyebrow({
  primary = "Weekly drop",
  secondary = "Join over 1,000+ developers and designers"
}) {
  return (
    <div className="text-mono-sm flex flex-wrap items-center gap-x-12 gap-y-4 text-foreground-muted">
      <span className="text-foreground">{primary}</span>
      <span aria-hidden="true" className="inline-block size-8 bg-brand" />
      <span>{secondary}</span>
    </div>
  );
}

export default function NewsletterForm({
  source = "footer",
  eyebrow,
  buttonLabel = "Join",
  buttonSize = "sm",
  inputSize = "sm",
  emailPlaceholder = "you@studio.com",
  idPrefix,
  className = "",
  wantedComponent,
  onSuccess,
  compact = false
}) {
  const [email, setEmail] = useState("");
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isProfileDone, setIsProfileDone] = useState(false);

  const emailInputRef = useRef(null);
  const policyCheckboxRef = useRef(null);
  const formRef = useRef(null);
  const hasTrackedView = useRef(false);
  const hasTrackedStart = useRef(false);

  const getAnalyticsData = () => ({
    source: source || "unknown",
    page_url: window.location.href
  });

  useEffect(() => {
    const el = formRef.current;
    if (!el || hasTrackedView.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasTrackedView.current) {
          hasTrackedView.current = true;
          analytics.track("newsletter_form_viewed", getAnalyticsData());
          observer.disconnect();
        }
      }
    }, { threshold: 0.4 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [source]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    const validationErrors = (({ email, acceptedPolicy }) => {
      const errs = {};
      const trimmedEmail = email.trim();
      if (trimmedEmail) {
        if (!EMAIL_REGEX.test(trimmedEmail)) errs.email = "Enter a valid email address.";
      } else {
        errs.email = "Email is required.";
      }
      if (!acceptedPolicy) errs.policy = "Please accept the privacy policy to continue.";
      return errs;
    })({ email, acceptedPolicy });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      analytics.track("newsletter_form_validation_failed", {
        ...getAnalyticsData(),
        errors: Object.keys(validationErrors)
      });
      if (validationErrors.email) emailInputRef.current?.focus();
      else if (validationErrors.policy) policyCheckboxRef.current?.focus();
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: source,
          wantedComponent: wantedComponent || undefined,
          metadata: {
            page_url: window.location.href,
            referrer: typeof document !== "undefined" && document.referrer || null
          }
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Error(data.error || "Could not subscribe");

      analytics.track("newsletter_subscribed", { source: source || "unknown", page_url: window.location.href });
      toast.success(SPECIAL_SOURCES.has(source) 
        ? "Almost there. Open the email from julian@annnimate.com and confirm. Your Starter Pack lands right after." 
        : "Almost there. Open the email from julian@annnimate.com and click confirm.");
      
      onSuccess?.();
      setSubmittedEmail(email.trim());
      analytics.track("newsletter_profile_shown", getAnalyticsData());
      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      toast.error(err.message || "Something went wrong. Try again?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    
    const trimmedFirstName = firstName.trim();
    if (!trimmedFirstName) {
      handleSkipProfile();
      return;
    }

    setIsSavingProfile(true);
    try {
      await fetch("/api/newsletter/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submittedEmail, firstName: trimmedFirstName })
      });
      analytics.track("newsletter_profile_completed", getAnalyticsData());
    } catch (err) {
    } finally {
      setIsSavingProfile(false);
      setIsProfileDone(true);
    }
  };

  const handleSkipProfile = () => {
    if (!isSavingProfile) {
      analytics.track("newsletter_profile_skipped", getAnalyticsData());
      setIsProfileDone(true);
    }
  };

  const prefix = idPrefix || source;
  const firstNameId = `${prefix}-newsletter-firstname`;
  const emailId = `${prefix}-newsletter-email`;
  const policyId = `${prefix}-newsletter-policy`;
  const emailErrorId = `${emailId}-error`;
  const policyErrorId = `${policyId}-error`;

  const inputBaseClasses = `${inputSize === "lg" ? "text-body-lg pt-10 pb-20" : "text-body-sm pt-8 pb-16"} flex-1 min-w-0 rounded-none bg-transparent px-0 text-foreground placeholder:text-foreground-muted/60 focus:outline-none disabled:opacity-50 transition-colors duration-(--duration-quick) ease-(--ease-expo-out)`;
  const emailBorderClasses = errors.email ? "border-b border-brand" : "border-b border-foreground/20 focus:border-foreground";[span_11](start_span)[span_11](end_span)

  return (
    <form ref={formRef} onSubmit={isSuccess ? handleProfileSubmit : handleSubmit} noValidate className={`flex flex-col gap-16 ${className}`}>
      {eyebrow || null}
      
      {isSuccess ? (
        isProfileDone ? (
          <p className="text-body-sm text-foreground-muted">
            <span className="text-foreground">One last step.</span> Open the email from julian@annnimate.com and click confirm. No email? Check spam, or reply to any of ours and we sort it.
          </p>
        ) : (
          <Fragment>
            <div className="flex flex-col gap-6">
              <p className="text-body-sm text-foreground">
                {SPECIAL_SOURCES.has(source) 
                  ? "Almost there - open the email from julian@annnimate.com and confirm. Your Starter Pack lands right after." 
                  : "Almost there - open the email from julian@annnimate.com and click confirm."}
              </p>
              <p className="text-body-sm text-foreground/70">One quick thing: what should we call you?</p>
            </div>
            <div className="relative flex flex-col">
              <label htmlFor={firstNameId} className="sr-only">First name</label>
              <input
                id={firstNameId}
                type="text"
                autoComplete="given-name"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSavingProfile}
                autoFocus
                className={`${inputBaseClasses} border-b border-foreground/20 focus:border-foreground`}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-16">
              <AnimatedButton
                type="button"
                onClick={handleSkipProfile}
                disabled={isSavingProfile}
                className="text-mono-sm text-foreground-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                Skip
              </AnimatedButton>
              <AnimatedButton type="submit" theme="brand" size={buttonSize} loading={isSavingProfile} disabled={!firstName.trim()}>
                Save
              </AnimatedButton>
            </div>
          </Fragment>
        )
      ) : (
        <Fragment>
          <div className="relative flex flex-col">
            <label htmlFor={emailId} className="sr-only">Your email</label>
            {errors.email ? (
              <p id={emailErrorId} role="alert" className="text-mono-sm absolute bottom-full left-0 right-0 mb-6 text-brand">
                {errors.email}
              </p>
            ) : null}
            <input
              ref={emailInputRef}
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (!hasTrackedStart.current) {
                  hasTrackedStart.current = true;
                  analytics.track("newsletter_form_started", getAnalyticsData());
                }
                if (errors.email) {
                  setErrors((prev) => {
                    const { email, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              disabled={isSubmitting}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? emailErrorId : undefined}
              className={`${inputBaseClasses} ${emailBorderClasses}`}
            />
          </div>
          <div className="relative">
            <div className={compact ? "flex flex-col gap-12" : "flex flex-wrap items-start justify-between gap-16"}>
              <label htmlFor={policyId} className={`flex cursor-pointer items-center gap-8 self-start text-foreground-muted ${compact ? "text-body-sm" : "text-mono-sm"}`}>
                <input
                  ref={policyCheckboxRef}
                  id={policyId}
                  type="checkbox"
                  checked={acceptedPolicy}
                  onChange={(e) => {
                    setAcceptedPolicy(e.target.checked);
                    if (errors.policy && e.target.checked) {
                      setErrors((prev) => {
                        const { policy, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  disabled={isSubmitting}
                  aria-invalid={errors.policy ? "true" : "false"}
                  aria-describedby={errors.policy ? policyErrorId : undefined}
                  className={`size-18 cursor-pointer appearance-none bg-transparent transition-colors checked:border-brand checked:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${errors.policy ? "border border-brand" : "border border-foreground/30"}`}
                />
                <span className="inline-flex flex-wrap items-center gap-x-6">
                  <span>I agree to the</span>
                  <NavLink href="/privacy" className="text-foreground">privacy policy</NavLink>
                </span>
              </label>
              <AnimatedButton type="submit" theme="brand" size={buttonSize} loading={isSubmitting} className={compact ? "self-end" : undefined}>
                {buttonLabel}
              </AnimatedButton>
            </div>
            {errors.policy ? (
              <p id={policyErrorId} role="alert" className="text-mono-sm absolute left-0 right-0 top-full mt-8 text-brand">
                {errors.policy}
              </p>
            ) : null}
          </div>
        </Fragment>
      )}
    </form>
  );
}
