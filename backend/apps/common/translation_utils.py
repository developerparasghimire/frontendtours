"""Auto-translate text fields using the MyMemory free API with DB caching.

MyMemory is completely free — no API key, no signup required.
Providing a contact email bumps the daily limit from 500 → 1000 words/day.
Results are cached in TranslationCache so each unique text is only ever
sent to the API once, keeping usage well within free limits.

Called from model save() hooks. All languages are translated in parallel via
ThreadPoolExecutor so a full translation takes ~1-2 s regardless of language count.
"""
import hashlib
import json
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

CONTACT_EMAIL = "technepalaus@gmail.com"   # raises free daily limit to 1000 words

LANG_TO_ISO: dict[str, str] = {
    "FR": "fr",
    "DE": "de",
    "ES": "es",
    "IT": "it",
    "ZH": "zh-CN",
    "JA": "ja",
    "HI": "hi",
    "RU": "ru",
}

MYMEMORY_URL = "https://api.mymemory.translated.net/get"


# ─── DB cache helpers ─────────────────────────────────────────────────────────

def _cache_key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _cache_get(source_hash: str, target_lang: str) -> str | None:
    try:
        from apps.common.models import TranslationCache
        obj = TranslationCache.objects.get(source_hash=source_hash, target_lang=target_lang)
        return obj.translated_text
    except Exception:
        return None


def _cache_set(source_hash: str, target_lang: str, translated_text: str) -> None:
    try:
        from apps.common.models import TranslationCache
        TranslationCache.objects.update_or_create(
            source_hash=source_hash,
            target_lang=target_lang,
            defaults={"translated_text": translated_text},
        )
    except Exception:
        pass


# ─── Translation ──────────────────────────────────────────────────────────────

def _chunk_text(text: str, max_chars: int = 450) -> list[str]:
    """Split at sentence boundaries so each chunk fits the 500-char API limit."""
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


def _translate_mymemory(text: str, iso: str) -> str:
    """Call the MyMemory API. Returns original text on any failure."""
    if not text or not text.strip():
        return text
    parts = []
    for chunk in _chunk_text(text):
        try:
            params = urllib.parse.urlencode(
                {"q": chunk, "langpair": f"en|{iso}", "de": CONTACT_EMAIL}
            )
            url = f"{MYMEMORY_URL}?{params}"
            with urllib.request.urlopen(url, timeout=10) as resp:
                data = json.loads(resp.read())
            if data.get("responseStatus") == 200:
                parts.append(data["responseData"]["translatedText"])
            else:
                parts.append(chunk)
        except Exception:
            parts.append(chunk)
    return " ".join(parts)


def _translate_one(text: str, iso: str) -> str:
    """Translate text: check DB cache first, then call MyMemory API."""
    if not text or not text.strip():
        return text

    h = _cache_key(text)
    cached = _cache_get(h, iso)
    if cached is not None:
        return cached

    result = _translate_mymemory(text, iso)

    if result and result != text:
        _cache_set(h, iso, result)
    return result or text


# ─── Public API ───────────────────────────────────────────────────────────────

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
