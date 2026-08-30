#!/usr/bin/env python3
"""Build the reader's word-to-sound lookup from the CMU Pronouncing Dictionary.

Run with:
  uv run --with cmudict python scripts/build-word-phonics.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import cmudict


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "assets" / "phonics" / "word-sounds.json"
SHARD_DIRECTORY = ROOT / "assets" / "phonics" / "words"

SOUNDS = {
    "a": {"label": "a", "ipa": "/æ/"},
    "ai": {"label": "ai", "ipa": "/eɪ/"},
    "air": {"label": "air", "ipa": "/ɛr/"},
    "ar": {"label": "ar", "ipa": "/ɑr/"},
    "b": {"label": "b", "ipa": "/b/"},
    "c": {"label": "c", "ipa": "/k/"},
    "ch": {"label": "ch", "ipa": "/tʃ/"},
    "d": {"label": "d", "ipa": "/d/"},
    "e": {"label": "e", "ipa": "/ɛ/"},
    "ear": {"label": "ear", "ipa": "/ɪr/"},
    "ee": {"label": "ee", "ipa": "/iː/"},
    "f": {"label": "f", "ipa": "/f/"},
    "g": {"label": "g", "ipa": "/ɡ/"},
    "h": {"label": "h", "ipa": "/h/"},
    "i": {"label": "i", "ipa": "/ɪ/"},
    "igh": {"label": "igh", "ipa": "/aɪ/"},
    "j": {"label": "j", "ipa": "/dʒ/"},
    "k": {"label": "k", "ipa": "/k/"},
    "l": {"label": "l", "ipa": "/l/"},
    "m": {"label": "m", "ipa": "/m/"},
    "n": {"label": "n", "ipa": "/n/"},
    "ng": {"label": "ng", "ipa": "/ŋ/"},
    "o": {"label": "o", "ipa": "/ɑ/"},
    "oa": {"label": "oa", "ipa": "/oʊ/"},
    "oi": {"label": "oi", "ipa": "/ɔɪ/"},
    "oo": {"label": "oo", "ipa": "/uː/"},
    "oo_short": {"label": "oo", "ipa": "/ʊ/"},
    "or": {"label": "or", "ipa": "/ɔr/"},
    "ow": {"label": "ow", "ipa": "/aʊ/"},
    "p": {"label": "p", "ipa": "/p/"},
    "qu": {"label": "qu", "ipa": "/kw/"},
    "r": {"label": "r", "ipa": "/ɹ/"},
    "s": {"label": "s", "ipa": "/s/"},
    "schwa": {"label": "ə", "ipa": "/ə/"},
    "sh": {"label": "sh", "ipa": "/ʃ/"},
    "t": {"label": "t", "ipa": "/t/"},
    "th": {"label": "th", "ipa": "/θ/"},
    "thv": {"label": "th", "ipa": "/ð/"},
    "u": {"label": "u", "ipa": "/ʌ/"},
    "ur": {"label": "ur", "ipa": "/ɝ/"},
    "ure": {"label": "ure", "ipa": "/ʊr/"},
    "v": {"label": "v", "ipa": "/v/"},
    "w": {"label": "w", "ipa": "/w/"},
    "x": {"label": "x", "ipa": "/ks/"},
    "y": {"label": "y", "ipa": "/j/"},
    "yoo": {"label": "yoo", "ipa": "/juː/"},
    "z": {"label": "z", "ipa": "/z/"},
    "zh": {"label": "zh", "ipa": "/ʒ/"},
}

CONSONANTS = {
    "B": "b", "CH": "ch", "D": "d", "DH": "thv", "F": "f",
    "G": "g", "HH": "h", "JH": "j", "K": "k", "L": "l",
    "M": "m", "N": "n", "NG": "ng", "P": "p", "R": "r",
    "S": "s", "SH": "sh", "T": "t", "TH": "th", "V": "v",
    "W": "w", "Y": "y", "Z": "z", "ZH": "zh",
}

VOWELS = {
    "AA": "o", "AE": "a", "AO": "o", "AW": "ow", "AY": "igh",
    "EH": "e", "ER": "ur", "EY": "ai", "IH": "i", "IY": "ee",
    "OW": "oa", "OY": "oi", "UH": "oo_short", "UW": "oo",
}

R_VOWELS = {
    "AA": "ar", "AO": "or", "EH": "air", "IH": "ear", "IY": "ear",
    "UH": "ure", "UW": "ure",
}

PRONUNCIATION_OVERRIDES = {
    "read": ["R", "IY1", "D"],
    "mia": ["M", "IY1", "AH0"],
    "birdbath": ["B", "ER1", "D", "B", "AE2", "TH"],
    "chirped": ["CH", "ER1", "P", "T"],
    "dragonflies": ["D", "R", "AE1", "G", "AH0", "N", "F", "L", "AY2", "Z"],
    "drat": ["D", "R", "AE1", "T"],
    "quacked": ["K", "W", "AE1", "K", "T"],
    "snored": ["S", "N", "AO1", "R", "D"],
    "toad's": ["T", "OW1", "D", "Z"],
}

CHUNK_OVERRIDES = {
    "a": ["a"], "an": ["a", "n"], "and": ["a", "n", "d"],
    "bench": ["ben", "ch"], "duck": ["d", "uck"], "moon": ["m", "oo", "n"],
    "tree": ["tr", "ee"], "peep": ["p", "ee", "p"], "sock": ["s", "ock"],
    "milk": ["m", "ilk"], "pond": ["p", "ond"], "much": ["mu", "ch"],
}

MULTIGRAPHS = (
    "eigh", "ough", "tch", "dge", "igh", "air", "ear", "ure", "tion", "sion",
    "ai", "ay", "ee", "ea", "oa", "oo", "ow", "ou", "oi", "oy", "ar", "or",
    "ur", "er", "ir", "sh", "ch", "th", "ng", "ck", "ph", "wh", "qu",
)


def normalize_word(text: str) -> str:
    return re.sub(r"^[^a-z]+|[^a-z']+$", "", text.lower().replace("’", "'")).strip("'")


def collect_words() -> set[str]:
    words: set[str] = set()
    stories = json.loads((ROOT / "stories.json").read_text())
    for book in stories:
        for sentence in book["pages"]:
            words.update(normalize_word(match.group()) for match in re.finditer(r"[A-Za-z]+(?:[’'][A-Za-z]+)?", sentence))
    for path in (ROOT / "books").glob("*/words.json"):
        pages = json.loads(path.read_text()).get("pages", {})
        for page_words in pages.values():
            for item in page_words:
                word = normalize_word(item.get("text", ""))
                if word:
                    words.add(word)
    words.update(CHUNK_OVERRIDES)
    words.update({
        "about", "bird", "boat", "book", "car", "chair", "coin", "cube", "ear",
        "feet", "fork", "fox", "jam", "night", "pure", "queen", "rain", "this",
        "treasure", "van", "web", "yes", "zip",
    })
    return {word for word in words if word}


def split_phone(phone: str) -> tuple[str, int | None]:
    match = re.fullmatch(r"([A-Z]+)([012])?", phone)
    if not match:
        return phone, None
    return match.group(1), int(match.group(2)) if match.group(2) is not None else None


def phones_to_sounds(word: str, pronunciation: list[str]) -> list[str]:
    phones = [split_phone(phone) for phone in pronunciation]
    result: list[str] = []
    index = 0
    while index < len(phones):
        phone, stress = phones[index]
        next_phone = phones[index + 1][0] if index + 1 < len(phones) else ""

        if phone == "Y" and next_phone == "UW":
            result.append("yoo")
            index += 2
            continue
        if phone == "K" and next_phone == "W" and "qu" in word:
            result.append("qu")
            index += 2
            continue
        if phone == "K" and next_phone == "S" and "x" in word:
            result.append("x")
            index += 2
            continue
        if phone in R_VOWELS and next_phone == "R":
            result.append(R_VOWELS[phone])
            index += 2
            continue
        if phone == "AH":
            result.append("schwa" if stress == 0 else "u")
        elif phone == "AO" and re.search(r"aw|au|ough|all|alk", word):
            result.append("or")
        elif phone in VOWELS:
            result.append(VOWELS[phone])
        elif phone in CONSONANTS:
            result.append(CONSONANTS[phone])
        index += 1
    return result


def spelling_chunks(word: str) -> list[str]:
    if word in CHUNK_OVERRIDES:
        return CHUNK_OVERRIDES[word]
    chunks: list[str] = []
    plain = word.replace("'", "")
    cursor = 0
    buffer = ""
    while cursor < len(plain):
        match = next((pattern for pattern in MULTIGRAPHS if plain.startswith(pattern, cursor)), None)
        if match:
            if buffer:
                chunks.append(buffer)
                buffer = ""
            chunks.append(match)
            cursor += len(match)
        else:
            buffer += plain[cursor]
            cursor += 1
    if buffer:
        chunks.append(buffer)
    return chunks if len(chunks) > 1 else []


def make_entry(word: str, pronunciation: list[str]) -> dict[str, list[str]] | None:
    sounds = phones_to_sounds(word, pronunciation)
    if not sounds:
        return None
    entry: dict[str, list[str]] = {"sounds": sounds}
    chunks = spelling_chunks(word)
    if chunks:
        entry["chunks"] = chunks
    return entry


def main() -> None:
    dictionary = cmudict.dict()
    entries: dict[str, dict[str, list[str]]] = {}
    missing: list[str] = []
    for word in sorted(collect_words()):
        pronunciations = dictionary.get(word)
        pronunciation = PRONUNCIATION_OVERRIDES.get(word) or (pronunciations[0] if pronunciations else None)
        if not pronunciation:
            missing.append(word)
            continue
        entry = make_entry(word, pronunciation)
        if not entry:
            missing.append(word)
            continue
        entries[word] = entry

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "source": "CMU Pronouncing Dictionary 0.7b subset",
        "sounds": SOUNDS,
        "words": entries,
    }, ensure_ascii=False, indent=2) + "\n")

    shards: dict[str, dict[str, dict[str, list[str]]]] = {letter: {} for letter in "abcdefghijklmnopqrstuvwxyz"}
    for word, pronunciations in dictionary.items():
        if not re.fullmatch(r"[a-z]+(?:'[a-z]+)?", word) or not pronunciations:
            continue
        entry = make_entry(word, PRONUNCIATION_OVERRIDES.get(word) or pronunciations[0])
        if entry:
            shards[word[0]][word] = entry
    for word, entry in entries.items():
        if re.fullmatch(r"[a-z]+(?:'[a-z]+)?", word):
            shards[word[0]][word] = entry

    SHARD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    for letter, words in shards.items():
        (SHARD_DIRECTORY / f"{letter}.json").write_text(
            json.dumps(words, ensure_ascii=False, separators=(",", ":")) + "\n"
        )

    print(f"wrote {len(entries)} word pronunciations to {OUTPUT.relative_to(ROOT)}")
    print(f"wrote {sum(map(len, shards.values()))} searchable words to {SHARD_DIRECTORY.relative_to(ROOT)}/")
    print(f"missing {len(missing)} words: {', '.join(missing[:40])}")


if __name__ == "__main__":
    main()
