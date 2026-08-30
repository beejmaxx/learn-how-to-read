#!/usr/bin/env python3
"""Extract positioned words from a PDF text layer for the web book reader."""

from __future__ import annotations

import argparse
import json
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    with tempfile.NamedTemporaryFile(suffix=".html") as temporary:
        subprocess.run(
            ["pdftotext", "-bbox-layout", str(args.pdf), temporary.name],
            check=True,
        )
        root = ET.parse(temporary.name).getroot()

    namespace = {"x": "http://www.w3.org/1999/xhtml"}
    pages: dict[str, list[dict[str, float | str]]] = {}
    source_width = 0.0
    source_height = 0.0
    for page_number, page in enumerate(root.findall(".//x:page", namespace), start=1):
        source_width = float(page.attrib["width"])
        source_height = float(page.attrib["height"])
        words = []
        for element in page.findall(".//x:word", namespace):
            text = "".join(element.itertext()).strip()
            if not text:
                continue
            x = float(element.attrib["xMin"])
            y = float(element.attrib["yMin"])
            width = float(element.attrib["xMax"]) - x
            height = float(element.attrib["yMax"]) - y
            if text.isdigit() and y > source_height * 0.9:
                continue
            words.append({
                "text": text,
                "x": round(x, 3),
                "y": round(y, 3),
                "w": round(width, 3),
                "h": round(height, 3),
            })
        pages[str(page_number)] = words

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps({"width": source_width, "height": source_height, "pages": pages}, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Wrote {args.output} with {sum(map(len, pages.values()))} positioned words")


if __name__ == "__main__":
    main()
