import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // React Compiler readiness rules (eslint-plugin-react-hooks v6+).
      // This project doesn't use React Compiler yet, and several existing,
      // intentional patterns (perf timestamps, GSAP/R3F "latest ref" sync,
      // direct DOM style mutation in three.js effects) trip these.
      // Downgrading to warn keeps the signal without blocking lint/CI.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
