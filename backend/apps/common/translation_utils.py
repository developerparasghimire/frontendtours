"""Auto-translate text fields using the MyMemory free API.

Called from model save() hooks. All languages are fetched in parallel via
ThreadPoolExecutor so a full re-translation takes ~1-2 s instead of ~10 s.
"""
import json
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

CONTACT_EMAIL = "technepalaus@gmail.com"

LANG_TO_ISO: dict[str, str] = {
    "NP": "ne",
    "DE": "de",
    "FR": "fr",
    "ES": "es",
    "ZH": "zh-CN",
    "JA": "ja",
}


def _chunk_text(text: str, max_chars: int = 450) -> list[str]:
    """Split text at sentence boundaries so each chunk fits the API limit."""
    if len(text) <= max_chars:
        return [text]
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0
    for part in re.split(r"([.!?]+\s+)", text):
        if current_len + len(part) <= max_chars:
            current.append(part)
            current_len += len(part)
        else:
            if current:
                chunks.append("".join(current))
            current = [part]
            current_len = len(part)
    if current:
        chunks.append("".join(current))
    return chunks or [text[:max_chars]]


def _translate_one(text: str, iso: str) -> str:
    """Single API call — returns original text on any failure."""
    if not text or not text.strip():
        return text
    parts = []
    for chunk in _chunk_text(text):
        try:
            params = urllib.parse.urlencode(
                {"q": chunk, "langpair": f"en|{iso}", "de": CONTACT_EMAIL}
            )
            url = f"https://api.mymemory.translated.net/get?{params}"
            with urllib.request.urlopen(url, timeout=8) as resp:
                data = json.loads(resp.read())
            if data.get("responseStatus") == 200:
                parts.append(data["responseData"]["translatedText"])
            else:
                parts.append(chunk)
        except Exception:
            parts.append(chunk)
    return " ".join(parts)


def auto_translate(fields: dict[str, str]) -> dict[str, dict[str, str]]:
    """Translate {field: text} to all supported languages in parallel.

    Returns {lang_code: {field: translated_text}}.
    Falls back to empty dict on total failure so save() is never blocked.
    """
    if not fields or not any(fields.values()):
        return {}

    def _translate_lang(lang: str) -> tuple[str, dict]:
        iso = LANG_TO_ISO[lang]
        return lang, {field: _translate_one(text, iso) for field, text in fields.items() if text}

    translations: dict[str, dict[str, str]] = {}
    try:
        with ThreadPoolExecutor(max_workers=len(LANG_TO_ISO)) as ex:
            futures = {ex.submit(_translate_lang, lang): lang for lang in LANG_TO_ISO}
            for future in as_completed(futures):
                try:
                    lang, result = future.result()
                    translations[lang] = result
                except Exception:
                    pass
    except Exception:
        pass
    return translations
