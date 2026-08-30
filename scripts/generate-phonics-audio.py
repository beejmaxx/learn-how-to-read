#!/usr/bin/env python3
"""Generate pure phoneme and word clips for the Sound Garden app.

Run with:
  uv run --with kokoro-mlx python scripts/generate-phonics-audio.py
"""

from __future__ import annotations

import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from kokoro_mlx import KokoroTTS


SOUNDS = {
    "s": ("s", "continuous"), "a": ("æ", "vowel"), "t": ("t", "stop"),
    "p": ("p", "stop"), "i": ("ɪ", "vowel"), "n": ("n", "continuous"),
    "m": ("m", "continuous"), "d": ("d", "stop"), "g": ("ɡ", "stop"),
    "o": ("ɑ", "vowel"), "c": ("k", "stop"), "k": ("k", "stop"),
    "e": ("ɛ", "vowel"), "u": ("ʌ", "vowel"), "b": ("b", "stop"),
    "f": ("f", "continuous"), "h": ("h", "continuous"), "r": ("ɹ", "continuous"),
    "l": ("l", "continuous"), "sh": ("ʃ", "continuous"),
    "ch": ("tʃ", "stop"), "th": ("θ", "continuous"), "ng": ("ŋ", "continuous"),
}

WORDS = [
    "sun", "apple", "top", "pig", "igloo", "nest", "moon", "dog", "goat",
    "octopus", "cat", "kite", "egg", "up", "bed", "fish", "hat", "red",
    "log", "ship", "chick", "thumb", "ring", "sat", "pin", "tap", "nap",
    "mat", "map", "chat",
]


def write_wav(path: Path, audio: np.ndarray, sample_rate: int = 24000) -> None:
    peak = max(float(np.max(np.abs(audio))), 0.001)
    normalized = np.clip(audio / peak * 0.88, -1.0, 1.0)
    pcm = (normalized * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        output.writeframes(pcm.tobytes())


def encode_mp3(audio: np.ndarray, destination: Path) -> None:
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav_file:
        write_wav(Path(wav_file.name), audio)
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", wav_file.name,
             "-codec:a", "libmp3lame", "-b:a", "96k", str(destination)],
            check=True,
        )


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    output = root / "phonics" / "audio"
    output.mkdir(parents=True, exist_ok=True)
    manifest = {"model": "hexgrad/Kokoro-82M", "voice": "af_heart", "sounds": {}, "words": {}}
    silence_end = np.zeros(int(24000 * 0.12), dtype=np.float32)

    with KokoroTTS.from_pretrained("mlx-community/Kokoro-82M-bf16") as tts:
        voice = tts._voices.load_voice("af_heart")

        for sound_id, (phoneme, kind) in SOUNDS.items():
            repeats = 3 if kind == "continuous" else 1
            phonemes = phoneme * repeats
            token_count = sum(character in tts._config.vocab for character in phonemes)
            style = tts._voices.get_style(voice, token_count)
            clip = np.array(tts._model.forward(phonemes, style, 0.78).tolist(), dtype=np.float32)
            clip = np.concatenate([clip, silence_end])
            filename = f"sound-{sound_id}.mp3"
            encode_mp3(clip, output / filename)
            manifest["sounds"][sound_id] = f"audio/{filename}"
            print(f"sound {sound_id}", flush=True)

        for word in WORDS:
            filename = f"word-{word}.mp3"
            destination = output / filename
            if destination.exists():
                manifest["words"][word] = f"audio/{filename}"
                print(f"word {word} (cached)", flush=True)
                continue
            wav_path = output / f"word-{word}.wav"
            tts.save(word, wav_path, voice="af_heart", speed=0.9)
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
                 "-codec:a", "libmp3lame", "-b:a", "96k", str(destination)],
                check=True,
            )
            wav_path.unlink()
            manifest["words"][word] = f"audio/{filename}"
            print(f"word {word}", flush=True)

    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")


if __name__ == "__main__":
    main()
