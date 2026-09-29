#!/usr/bin/env node
// Validates the annex research records against the same rules `lib/schemas.ts`
// enforces on the implementation branch, plus the stricter annex conventions.
// No dependencies: run with `node docs/research/validate-records.mjs`.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (name) => JSON.parse(readFileSync(join(here, "records", name), "utf8"));

const EVIDENCE_TYPES = ["incident-report", "experiment", "framework", "historical-research"];
const DATE_PATTERNS = [/^\d{4}$/, /^\d{4}-(0[1-9]|1[0-2])$/, /^\d{4}-\d{2}-\d{2}$/];

const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const isFilledString = (value) => typeof value === "string" && value.trim().length > 0;

const requireStringArray = (where, field, values, { min = 0 } = {}) => {
  if (!Array.isArray(values)) return fail(where, `${field} must be an array`);
  if (values.length < min) fail(where, `${field} requires at least ${min} entry/entries`);
  values.forEach((value, index) => {
    if (!isFilledString(value)) fail(where, `${field}[${index}] must be a non-empty string`);
  });
};

const validateRecord = (record, where, context) => {
  for (const field of ["id", "title", "organization", "publishedAt", "sourceUrl", "summary"]) {
    if (!isFilledString(record[field])) fail(where, `${field} must be a non-empty string`);
  }

  if (record.threatActor !== undefined && !isFilledString(record.threatActor)) {
    fail(where, "threatActor, when present, must be a non-empty string");
  }

  if (isFilledString(record.publishedAt) && !DATE_PATTERNS.some((p) => p.test(record.publishedAt))) {
    fail(where, `publishedAt "${record.publishedAt}" must be YYYY, YYYY-MM, or YYYY-MM-DD`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(record.publishedAt ?? "") && Number.isNaN(Date.parse(record.publishedAt))) {
    fail(where, `publishedAt "${record.publishedAt}" is not a real calendar date`);
  }

  if (isFilledString(record.sourceUrl) && !/^https?:\/\/\S+$/i.test(record.sourceUrl)) {
    fail(where, `sourceUrl "${record.sourceUrl}" must be an absolute HTTP(S) URL`);
  }

  if (!EVIDENCE_TYPES.includes(record.evidenceType)) {
    fail(where, `evidenceType must be one of ${EVIDENCE_TYPES.join(", ")}`);
  }

  requireStringArray(where, "affectedTechnology", record.affectedTechnology, { min: 1 });
  requireStringArray(where, "relevantBehaviors", record.relevantBehaviors, { min: 1 });
  requireStringArray(where, "relatedHunts", record.relatedHunts);
  // Stricter than the app schema, which defaults these to empty: the annex exists
  // to carry claim-level evidence, so a record without both is not publishable.
  requireStringArray(where, "supportedClaims", record.supportedClaims, { min: 1 });
  requireStringArray(where, "limitations", record.limitations, { min: 1 });

  if (Array.isArray(record.relatedHunts)) {
    for (const slug of record.relatedHunts) {
      if (!context.huntSlugs.has(slug)) fail(where, `relatedHunts references unknown hunt slug "${slug}"`);
    }
    if (new Set(record.relatedHunts).size !== record.relatedHunts.length) {
      fail(where, "relatedHunts contains duplicates");
    }
  }

  const unknown = Object.keys(record).filter((key) => !ALLOWED_KEYS.has(key));
  if (unknown.length > 0) fail(where, `unknown field(s): ${unknown.join(", ")}`);
};

const ALLOWED_KEYS = new Set([
  "id", "title", "organization", "publishedAt", "threatActor", "affectedTechnology",
  "relevantBehaviors", "relatedHunts", "sourceUrl", "summary", "evidenceType",
  "supportedClaims", "limitations",
]);

const context = read("registry-context.json");
const huntSlugs = new Set(context.huntSlugs);
const existingIds = new Set(context.existingResearchIds);

const additions = read("methodology-sources.json");
const amendments = read("existing-record-amendments.json");

const seen = new Map();
for (const [file, records] of [["methodology-sources.json", additions], ["existing-record-amendments.json", amendments]]) {
  if (!Array.isArray(records)) {
    fail(file, "file must contain a JSON array");
    continue;
  }
  records.forEach((record, index) => {
    const where = `${file}[${index}] ${record?.id ?? "<no id>"}`;
    if (record === null || typeof record !== "object" || Array.isArray(record)) {
      return fail(where, "record must be an object");
    }
    validateRecord(record, where, { huntSlugs });

    if (isFilledString(record.id)) {
      if (seen.has(record.id)) fail(where, `duplicate id, already defined in ${seen.get(record.id)}`);
      else seen.set(record.id, file);

      const isAmendment = file === "existing-record-amendments.json";
      if (!isAmendment && existingIds.has(record.id)) {
        fail(where, "id collides with an existing registry record; amendments belong in existing-record-amendments.json");
      }
      if (isAmendment && !existingIds.has(record.id)) {
        fail(where, "amendment targets an id that is not in the existing registry");
      }
    }
  });
}

const urls = new Map();
for (const record of [...additions, ...amendments]) {
  if (!isFilledString(record?.sourceUrl)) continue;
  const previous = urls.get(record.sourceUrl);
  if (previous) fail(record.id, `sourceUrl duplicates ${previous}`);
  else urls.set(record.sourceUrl, record.id);
}

const byType = {};
for (const record of additions) byType[record.evidenceType] = (byType[record.evidenceType] ?? 0) + 1;

if (errors.length > 0) {
  console.error(`FAIL — ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log("PASS");
console.log(`  new records:        ${additions.length}`);
console.log(`  amended records:    ${amendments.length}`);
console.log(`  distinct ids:       ${seen.size}`);
console.log(`  distinct URLs:      ${urls.size}`);
console.log(`  hunt slugs known:   ${huntSlugs.size} (from ${context.sourceBranch})`);
console.log(`  evidence types:     ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}`);
