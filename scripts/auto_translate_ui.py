#!/usr/bin/env python3
"""
Auto-translate frontend UI strings.

Reads frontend/src/translations/en.json, translates every string to all 8
supported languages using the free MyMemory API (same service the Django backend
uses), and writes individual JSON files:

  frontend/src/translations/de.json
  frontend/src/translations/fr.json
  ... etc.

Usage (run from the project root):
  python scripts/auto_translate_ui.py

To add new strings:
  1. Add them to frontend/src/translations/en.json
  2. Run this script
  3. Commit the generated JSON files
"""

import json
import re
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).parent.parent
EN_FILE = ROOT / "frontend" / "src" / "translations" / "en.json"
OUT_DIR = ROOT / "frontend" / "src" / "translations"

CONTACT_EMAIL = "technepalaus@gmail.com"

LANGS: dict[str, str] = {
    "de": "de",
    "fr": "fr",
    "es": "es",
    "it": "it",
    "ja": "ja",
    "ru": "ru",
    "zh": "zh-CN",
    "hi": "hi",
}


def _chunk(text: str, max_chars: int = 450) -> list[str]:
    if len(text) <= max_chars:
        return [text]
    chunks: list[str] = []
    current: list[str] = []
    cur_len = 0
    for part in re.split(r"([.!?]+\s+)", text):
        if cur_len + len(part) <= max_chars:
            current.append(part)
            cur_len += len(part)
        else:
            if current:
                chunks.append("".join(current))
            current = [part]
            cur_len = len(part)
    if current:
        chunks.append("".join(current))
    return chunks or [text[:max_chars]]


def _translate_one(text: str, iso: str) -> str:
    if not text or not text.strip():
        return text
    parts = []
    for chunk in _chunk(text):
        try:
            params = urllib.parse.urlencode(
                {"q": chunk, "langpair": f"en|{iso}", "de": CONTACT_EMAIL}
            )
            url = f"https://api.mymemory.translated.net/get?{params}"
            with urllib.request.urlopen(url, timeout=10) as resp:
                data = json.loads(resp.read())
            if data.get("responseStatus") == 200:
                parts.append(data["responseData"]["translatedText"])
            else:
                print(f"  API error for '{chunk[:30]}' → {iso}: {data.get('responseStatus')}", file=sys.stderr)
                parts.append(chunk)
        except Exception as exc:
            print(f"  Request failed for '{chunk[:30]}' → {iso}: {exc}", file=sys.stderr)
            parts.append(chunk)
    return " ".join(parts)


def translate_all(strings: dict[str, str]) -> dict[str, dict[str, str]]:
    """Returns {lang_code: {key: translated_value}}."""
    results: dict[str, dict[str, str]] = {}

    def _do_lang(code: str, iso: str) -> tuple[str, dict[str, str]]:
        translated = {}
        for key, text in strings.items():
            translated[key] = _translate_one(text, iso)
        return code, translated

    with ThreadPoolExecutor(max_workers=len(LANGS)) as ex:
        futures = {ex.submit(_do_lang, code, iso): code for code, iso in LANGS.items()}
        for future in as_completed(futures):
            try:
                code, result = future.result()
                results[code] = result
                print(f"  ✓ {code} ({len(result)} strings)")
            except Exception as exc:
                print(f"  ✗ failed: {exc}", file=sys.stderr)

    return results


def main() -> None:
    if not EN_FILE.exists():
        print(f"ERROR: {EN_FILE} not found", file=sys.stderr)
        sys.exit(1)

    with open(EN_FILE, encoding="utf-8") as f:
        en_strings: dict[str, str] = json.load(f)

    print(f"Translating {len(en_strings)} strings to {len(LANGS)} languages...")
    all_translations = translate_all(en_strings)

    for code, strings in all_translations.items():
        out_path = OUT_DIR / f"{code}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(strings, f, ensure_ascii=False, indent=2)
        print(f"  Wrote {out_path.name}")

    print("\nDone! Commit the generated JSON files in frontend/src/translations/")


if __name__ == "__main__":
    main()
