#!/usr/bin/env python3
"""Align Kokoro story narration to the printed words with local Whisper."""

import argparse
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

import whisper


def words(text):
    return re.findall(r"[A-Za-z]+(?:[’'][A-Za-z]+)?", text)


def normalized(text):
    return re.sub(r"[^a-z]", "", text.lower().replace("’", "'"))


def align(expected, heard):
    """Return one start/end pair per printed word, interpolating ASR misses."""
    expected_norm = [normalized(word) for word in expected]
    heard_norm = [normalized(item["word"]) for item in heard]
    matches = SequenceMatcher(None, expected_norm, heard_norm, autojunk=False).get_matching_blocks()
    result = [None] * len(expected)
    for match in matches:
        for offset in range(match.size):
            result[match.a + offset] = [heard[match.b + offset]["start"], heard[match.b + offset]["end"]]

    # Fill any word Whisper missed between the nearest reliable boundaries.
    for index, timing in enumerate(result):
        if timing is not None:
            continue
        left = next((i for i in range(index - 1, -1, -1) if result[i] is not None), None)
        right = next((i for i in range(index + 1, len(result)) if result[i] is not None), None)
        start = result[left][1] if left is not None else (heard[0]["start"] if heard else 0)
        end = result[right][0] if right is not None else (heard[-1]["end"] if heard else start + 0.35)
        missing = [i for i in range((left + 1) if left is not None else 0, right if right is not None else len(result)) if result[i] is None]
        slot = missing.index(index)
        result[index] = [start + (end - start) * slot / len(missing), start + (end - start) * (slot + 1) / len(missing)]

    return [[round(start, 3), round(end, 3)] for start, end in result]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", default="base.en")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    books = json.loads((root / "stories.json").read_text())
    model = whisper.load_model(args.model)
    output = {"model": f"whisper/{args.model}", "timings": {}}

    total = sum(len(book["pages"]) for book in books)
    count = 0
    for book in books:
        for page_index, sentence in enumerate(book["pages"]):
            count += 1
            key = f"story:{book['id']}:{page_index}"
            audio = root / "assets" / "audio" / f"story-{book['id']}-{page_index + 1}.mp3"
            transcription = model.transcribe(str(audio), language="en", word_timestamps=True, fp16=False)
            heard = [word for segment in transcription["segments"] for word in segment.get("words", [])]
            printed = words(sentence)
            output["timings"][key] = align(printed, heard)
            print(f"[{count}/{total}] {key}: {len(printed)} words / {len(heard)} heard", flush=True)

    destination = root / "assets" / "audio" / "timings.json"
    destination.write_text(json.dumps(output, indent=2) + "\n")
    print(f"Wrote {destination}")


if __name__ == "__main__":
    main()
