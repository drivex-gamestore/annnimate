import common from '@lib/locales/common';
import landing from '@lib/locales/landing';
import pricing from '@lib/locales/pricing';
import kits from '@lib/locales/kits';
import platform from '@lib/locales/platform';
import builtWith from '@lib/locales/built-with';
import faq from '@lib/locales/faq';
import starterPack from '@lib/locales/starter-pack';
import whatsNew from '@lib/locales/whats-new';
import contact from '@lib/locales/contact';
import seo from '@lib/locales/seo';
import affiliate from '@lib/locales/affiliate';
import packs from '@lib/locales/packs';

const messages = {
  common,
  landing,
  pricing,
  kits,
  platform,
  "built-with": builtWith,
  faq,
  "starter-pack": starterPack,
  "whats-new": whatsNew,
  contact,
  seo,
  affiliate,
  packs
};


export function t(key, variables) {
  const resolvedValue = key.split(".").reduce((acc, part) => {
    return acc == null ? acc : acc[part];
  }, messages);

  if (resolvedValue == null) {
    return key;
  }

  if (variables) {
    return String(resolvedValue).replace(/\{(\w+)\}/g, (match, varName) => {
      return variables[varName] != null ? String(variables[varName]) : match;
    });
  }

  return resolvedValue;
}
