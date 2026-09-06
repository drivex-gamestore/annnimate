"use client";

import React from "react";
import { cn } from "@lib/vendor";

const VALID_PROVENANCE_TYPES = new Set([
  "client_commissioned",
  "internal_project",
  "studio_original"
]);

const SITE_PROVENANCE_TYPES = new Set([
  "client_commissioned",
  "internal_project"
]);

export function getProvenance(animation) {
  const provenance = animation?.metadata?.provenance;
  return provenance && typeof provenance === "object" && VALID_PROVENANCE_TYPES.has(provenance.type)
    ? provenance
    : null;
}

export function getProvenanceLine(animation) {
  const provenance = getProvenance(animation);
  if (provenance && SITE_PROVENANCE_TYPES.has(provenance.type) && provenance.site) {
    const contextStr = provenance.context ? ` ${provenance.context}` : "";
    return `Built for ${provenance.site}${contextStr}.`;
  }
  return "A Good Fella original.";
}

export function getProvenanceBody(animation) {
  const provenance = getProvenance(animation);
  
  if (provenance?.body) {
    return provenance.body;
  }
  
  if (provenance?.site) {
    if (provenance.type === "client_commissioned") {
      return `We built it for the ${provenance.site} site and folded it back into the library when the project went live. A Good Fella piece, refined for reuse.`;
    }
    if (provenance.type === "internal_project") {
      return `We built it for ${provenance.site}, our own site, and kept it in the library once it earned its place. The same code runs in production today.`;
    }
  }
  
  return "We built it for the library deliberately, not against a client brief, and kept it once it earned its place here.";
}

export function getProvenanceSite(animation) {
  const provenance = getProvenance(animation);
  return provenance && SITE_PROVENANCE_TYPES.has(provenance.type) && provenance.site
    ? provenance.site
    : null;
}

const SIZES = {
  sm: { dot: "size-6", text: "text-accent-2xs", gap: "gap-6" },
  default: { dot: "size-8", text: "text-accent-xs", gap: "gap-8" },
  lg: { dot: "size-12", text: "text-mono-sm", gap: "gap-12" }
};

export default function ProvenanceChip({
  animation,
  size = "default",
  className = "",
  label
}) {
  const config = SIZES[size] ?? SIZES.default;
  const displayLabel = label ?? getProvenanceLine(animation);

  return (
    <span className={cn("inline-flex items-center text-foreground", config.text, config.gap, className)}>
      <span aria-hidden="true" className={cn("block shrink-0 bg-brand", config.dot)} />
      <span>{displayLabel}</span>
    </span>
  );
}