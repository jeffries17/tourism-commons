#!/usr/bin/env python3
"""
Translate Botswana reviews to English for sentiment analysis.

Step 3 in the Botswana pipeline. Run after organize_botswana_reviews.py.

What it does:
  - Reads each per-stakeholder file from data/prepared/
  - Detects the language of each review
  - Skips English reviews (already usable)
  - Translates non-English reviews (German, Dutch, Afrikaans, etc.) via Google Cloud
  - Preserves ALL original fields: date, rating, placeInfo, original text, etc.
  - Adds: translated_title, translated_text, original_language, was_translated
  - Outputs to data/translated/

Language count and date metadata are preserved on every review regardless of language,
so downstream scripts can still report on language distribution, review dates, etc.

Usage:
  python translate_to_english.py

Requirements:
  pip install google-cloud-translate langdetect

Input:
  data/prepared/<stakeholder>_reviews.json

Output:
  data/translated/<stakeholder>_reviews.json  (same structure, English text added)
"""

import json
import os
import re
from pathlib import Path
from collections import Counter

# ── Google Cloud credentials ───────────────────────────────────────────────────
CREDENTIALS_PATH = Path(__file__).parent.parent.parent.parent / \
    'config' / 'tourism-development-d620c-5c9db9e21301.json'


def setup_translate_client():
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = str(CREDENTIALS_PATH)
    from google.cloud import translate_v2 as translate
    return translate.Client()


def detect_language_simple(text: str) -> str:
    """
    Fast regex-based language detection for common cases.
    Returns ISO code or 'unknown'. Used as a first pass before calling Google.
    """
    if not text or len(text.strip()) < 10:
        return 'unknown'

    text_lower = text.lower()

    # English
    en_score = sum(len(re.findall(p, text_lower)) for p in [
        r'\b(the|and|or|but|is|are|was|were|have|has|this|that|with)\b',
        r'\b(a|an|of|to|in|for|on|at|it|we|my|our|very|great|good)\b',
    ])
    # German
    de_score = sum(len(re.findall(p, text_lower)) for p in [
        r'\b(und|die|der|das|ein|eine|ist|war|mit|für|von|wir|sehr|nicht)\b',
        r'\b(haben|wurde|worden|werden|waren)\b',
    ])
    # Dutch
    nl_score = sum(len(re.findall(p, text_lower)) for p in [
        r'\b(de|het|een|en|van|voor|met|zijn|was|heeft|we|ook|niet|erg)\b',
        r'\b(hebben|worden|geworden)\b',
    ])

    scores = {'en': en_score, 'de': de_score, 'nl': nl_score}
    best = max(scores, key=scores.get)

    # Only confident if the best score is meaningfully higher than the others
    if scores[best] > 3:
        return best
    return 'unknown'


def translate_reviews(input_dir: Path, output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)

    review_files = sorted(input_dir.glob('*_reviews.json'))
    if not review_files:
        print("❌ No review files found in data/prepared/")
        raise SystemExit(1)

    print(f"\n🌍 Translating reviews to English ({len(review_files)} stakeholder files)")
    print("   Non-English reviews will be translated; originals are always preserved.")
    print("=" * 70)

    # Lazy-load translate client (only if we actually need to translate)
    client = None

    project_lang_counter: Counter = Counter()

    for review_file in review_files:
        print(f"\n📄 {review_file.name}")
        with open(review_file, encoding='utf-8') as f:
            reviews = json.load(f)

        translated_reviews = []
        file_lang_counter: Counter = Counter()
        translated_count = 0
        skipped_count = 0

        for review in reviews:
            title = review.get('title') or ''
            text  = review.get('text')  or ''
            combined = f"{title} {text}".strip()

            # Detect language
            lang = detect_language_simple(combined)

            translated_review = review.copy()
            # Always preserve the original text fields
            translated_review['original_title'] = title
            translated_review['original_text']  = text

            if lang == 'en':
                # Already English — just tag it, no API call
                translated_review['translated_title']   = title
                translated_review['translated_text']    = text
                translated_review['original_language']  = 'en'
                translated_review['was_translated']     = False

            else:
                # Non-English or unknown — call Google Translate with auto-detect
                if client is None:
                    print("   (Initialising Google Cloud Translation client...)")
                    client = setup_translate_client()

                try:
                    if title:
                        t_result = client.translate(title, target_language='en')
                        translated_review['translated_title']  = t_result['translatedText']
                        detected = t_result.get('detectedSourceLanguage', lang)
                    else:
                        translated_review['translated_title'] = ''
                        detected = lang

                    if text:
                        r_result = client.translate(text, target_language='en')
                        translated_review['translated_text'] = r_result['translatedText']
                        detected = r_result.get('detectedSourceLanguage', detected)
                    else:
                        translated_review['translated_text'] = ''

                    translated_review['original_language'] = detected
                    translated_review['was_translated']    = True
                    translated_count += 1

                except Exception as e:
                    print(f"   ⚠️  Translation error: {e} — keeping original text")
                    translated_review['translated_title']  = title
                    translated_review['translated_text']   = text
                    translated_review['original_language'] = lang
                    translated_review['was_translated']    = False
                    skipped_count += 1

            file_lang_counter[translated_review['original_language']] += 1
            project_lang_counter[translated_review['original_language']] += 1
            translated_reviews.append(translated_review)

        # Save — same filename, different folder
        out_file = output_dir / review_file.name
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(translated_reviews, f, indent=2, ensure_ascii=False)

        lang_summary = ', '.join(f"{lang}={count}" for lang, count in file_lang_counter.most_common())
        print(f"   ✅ {len(reviews)} reviews | translated={translated_count} | "
              f"skipped={skipped_count} | languages: {lang_summary}")
        print(f"   💾 → {out_file}")

    print("\n" + "=" * 70)
    print("TRANSLATION COMPLETE")
    print("=" * 70)
    print("Language distribution across all reviews:")
    for lang, count in project_lang_counter.most_common():
        print(f"  {lang:>10}: {count}")
    print(f"\nNext step: run run_botswana_sentiment.py")


if __name__ == '__main__':
    base = Path(__file__).parent
    translate_reviews(
        input_dir=base / 'prepared',
        output_dir=base / 'translated',
    )
