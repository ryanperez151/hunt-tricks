import { defineConfig, globalIgnores } from "eslint/config";
import nextTypeScript from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";

// The plan pins ESLint 10, while the React and React Hooks plugins bundled by
// eslint-config-next 16.3.4 declare compatibility through ESLint 9 only.
// Keep Next Core Web Vitals and TypeScript rules, but do not invoke those
// incompatible legacy plugin rules under ESLint 10.
const incompatibleLegacyRules = Object.fromEntries(
  [...nextVitals, ...nextTypeScript]
    .flatMap((config) => Object.keys(config.rules ?? {}))
    .filter((rule) => rule.startsWith("react/") || rule.startsWith("react-hooks/"))
    .map((rule) => [rule, "off"]),
);

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  { rules: incompatibleLegacyRules },
  globalIgnores([".next/**", "out/**", "coverage/**", "playwright-report/**"]),
]);
