# Little Word Club

A gentle story and phonics app for brand-new readers. The shelf includes two original read-alongs plus the two-page **Little Bear** and **Frog and Toad Are Friends** readers.

Features include:

- word-by-word highlighting synchronized with narration;
- arrow-key word selection, optional automatic pronunciation, and Space-bar playback;
- an inline word helper that plays the whole word and each sound, such as `bench → b · e · n · ch`;
- a quick lookup backed by more than 124,000 pronunciations for words found in physical books;
- 48 common phonics sounds, with optional private local sound packs;
- an eight-round, story-based Find the Word game; and
- an original illustration for every page.

## Run locally

This is a static site, so any local web server will work:

```sh
python3 -m http.server 8766
```

Then open <http://localhost:8766>.

Private imported phonics recordings live under `phonics/audio/*-local/` and are intentionally git-ignored. A local `phonics/audio/local-manifest.json` makes those packs available on localhost without publishing them to GitHub Pages.

## Regenerating audio

The checked-in audio is ready to use. To regenerate it locally with Kokoro, see `scripts/generate-kokoro-audio.py`. Word timing data can be rebuilt with `scripts/build-word-timings.py` and a local Whisper installation.

Rebuild the word-to-sounds lookup and its on-demand dictionary shards with:

```sh
uv run --with cmudict python scripts/build-word-phonics.py
```

## License

The source code is available under the [MIT License](LICENSE).
