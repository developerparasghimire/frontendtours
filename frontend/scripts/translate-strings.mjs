/**
 * Translates all untranslated strings in language JSON files
 * using the MyMemory free API (same service as the backend).
 * Usage: node scripts/translate-strings.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const TRANS_DIR = join(__dir, "../src/translations");

const LANGS = [
  { code: "de", pair: "en|de" },
  { code: "fr", pair: "en|fr" },
  { code: "es", pair: "en|es" },
  { code: "zh", pair: "en|zh-CN" },
  { code: "ja", pair: "en|ja" },
];

const en = JSON.parse(readFileSync(join(TRANS_DIR, "en.json"), "utf8"));

async function translate(text, langpair) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}&de=technepalaus@gmail.com`;
  const r = await fetch(url);
  const d = await r.json();
  const t = d?.responseData?.translatedText;
  // MyMemory sometimes returns HTML-encoded text; strip it
  return t ? t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"') : text;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

for (const { code, pair } of LANGS) {
  console.log(`\n=== Translating → ${code.toUpperCase()} ===`);
  const path = join(TRANS_DIR, `${code}.json`);
  const existing = JSON.parse(readFileSync(path, "utf8"));

  const out = {};
  const keys = Object.keys(en);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const enVal = en[key];
    const curVal = existing[key];

    // Skip if already translated (differs from English)
    if (curVal && curVal !== enVal) {
      out[key] = curVal;
      continue;
    }

    // Skip very short strings that don't need translation
    if (!enVal || enVal.length < 2) {
      out[key] = enVal;
      continue;
    }

    try {
      const translated = await translate(enVal, pair);
      out[key] = translated;
      console.log(`  [${i + 1}/${keys.length}] ${key}: "${enVal}" → "${translated}"`);
    } catch (e) {
      console.error(`  ERROR on ${key}:`, e.message);
      out[key] = enVal;
    }

    // Rate limit: MyMemory allows ~1 req/sec on free tier
    await sleep(700);
  }

  writeFileSync(path, JSON.stringify(out, null, 2), "utf8");
  console.log(`✓ Saved ${code}.json`);
}

console.log("\n✅ All language files updated.");
