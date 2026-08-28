#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import tempfile
import re
from pathlib import Path

from kokoro_mlx import KokoroTTS


def main():
    parser = argparse.ArgumentParser(description="Generate local neural narration for Little Word Club")
    parser.add_argument("--limit", type=int, default=0, help="Generate only the first N clips")
    parser.add_argument("--all-books", action="store_true", help="Also generate clips for books not currently featured")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    output = root / "assets" / "audio"
    output.mkdir(parents=True, exist_ok=True)
    books = json.loads((root / "stories.json").read_text())
    if not args.all_books:
        books = books[:1]
    story_clips = [
        (f"story:{book['id']}:{page_index}", sentence, f"story-{book['id']}-{page_index + 1}.mp3")
        for book in books
        for page_index, sentence in enumerate(book["pages"])
    ]
    phrases = []
    word_meta = {
        "cat": ("hat", "The cat can nap."), "dog": ("log", "The dog can run."),
        "sun": ("fun", "The sun is hot."), "hat": ("cat", "I put on my hat."),
        "red": ("bed", "The dot is red."), "map": ("cap", "We look at the map."),
        "pig": ("wig", "The pig is pink."), "bed": ("red", "I sleep in a bed."),
        "fox": ("box", "The fox can hop."), "bug": ("rug", "A bug is on the rug."),
        "dad": ("sad", "My dad can nap."), "nap": ("cap", "It is time for a nap."),
    }
    for word, (rhyme, story_sentence) in word_meta.items():
        phrases.extend([
            f"Can you find the word, {word}?",
            f"Let's build the word, {word}. Tap the letters in order.",
            f"{word}. What sound does {word} start with?",
            f"Which word rhymes with {word}?",
            f"{story_sentence.replace(word, 'blank')} Which word belongs in the blank?",
            f"{word}. You found it!",
            f"You built {word}!",
            rhyme,
        ])
    # Every word shown in a story can be tapped. Record each one with the same
    # Kokoro voice so taps never jump to a mismatched browser voice.
    story_words = {
        word.lower()
        for book in books
        for sentence in book["pages"]
        for word in re.findall(r"[A-Za-z]+(?:[’'][A-Za-z]+)?", sentence)
    }
    phrases.extend(sorted(story_words))
    find_words = {word for book in books for word in book.get("findWords", [])}
    for word in sorted(find_words):
        phrases.extend([f"Can you find the word, {word}?", f"{word}. You found it!"])
    phrases.extend([
        "Good try. Have another look.", "You found it!", "Nice looking!", "That’s it!",
        "Great trying!", "Lovely playing!", "You read a book!",
    ])
    normal_clips = []
    for text in dict.fromkeys(phrases):
        key = text.strip().lower()
        slug = "-".join("".join(character if character.isalnum() else " " for character in key).split())[:46]
        digest = hashlib.sha1(key.encode()).hexdigest()[:8]
        normal_clips.append((key, text, f"voice-{slug}-{digest}.mp3"))
    clips = story_clips + normal_clips
    if args.limit:
        clips = clips[:args.limit]

    manifest_path = output / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text())
    else:
        manifest = {"model": "hexgrad/Kokoro-82M", "voice": "af_heart", "audio": {}}

    model_source = os.environ.get("KOKORO_MODEL_PATH", "mlx-community/Kokoro-82M-bf16")
    with KokoroTTS.from_pretrained(model_source) as tts:
        for index, (key, text, filename) in enumerate(clips, start=1):
            destination = output / filename
            if destination.exists():
                print(f"[{index}/{len(clips)}] cached {key}", flush=True)
                manifest["audio"][key] = f"assets/audio/{filename}"
                continue

            with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
                tts.save(text, wav.name, voice="af_heart", speed=0.92)
                subprocess.run(
                    ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav.name,
                     "-codec:a", "libmp3lame", "-b:a", "96k", str(destination)],
                    check=True,
                )
            manifest["audio"][key] = f"assets/audio/{filename}"
            manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
            print(f"[{index}/{len(clips)}] generated {key}", flush=True)


if __name__ == "__main__":
    main()
