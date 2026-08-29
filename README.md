# Little Word Club

A gentle story and phonics app for brand-new readers. The library currently includes **The Red Hat**, **The Duck in the Cup**, and **The Tiny Door Behind the Bed**.

Features include:

- word-by-word highlighting synchronized with narration;
- consistent local Kokoro speech for story pages and tappable words;
- simple phonics breakdowns such as `cat → c + at`;
- an eight-round, story-based Find the Word game; and
- an original illustration for every page.

## Run locally

This is a static site, so any local web server will work:

```sh
python3 -m http.server 8766
```

Then open <http://localhost:8766>.

## Regenerating audio

The checked-in audio is ready to use. To regenerate it locally with Kokoro, see `scripts/generate-kokoro-audio.py`. Word timing data can be rebuilt with `scripts/build-word-timings.py` and a local Whisper installation.

## License

The source code is available under the [MIT License](LICENSE).
