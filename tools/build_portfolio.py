#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
HOR_DIR = IMAGES_DIR / "hor"
VERT_DIR = IMAGES_DIR / "vert"
CONFIG_PATH = ROOT / "portfolio.config.json"
HTML_PATH = ROOT / "index.html"


def load_config() -> dict:
    if CONFIG_PATH.exists():
        return json.loads(CONFIG_PATH.read_text())
    return {"rows": [4, 3, 4, 3, 2, 4, 4, 2, 1, 3, 3]}


def ensure_dirs() -> None:
    HOR_DIR.mkdir(parents=True, exist_ok=True)
    VERT_DIR.mkdir(parents=True, exist_ok=True)


def convert_cr3(folder: Path) -> None:
    for cr3 in folder.glob("*.CR3"):
        jpg = cr3.with_suffix(".JPG")
        if jpg.exists() and jpg.stat().st_mtime >= cr3.stat().st_mtime:
            continue
        subprocess.run(
            ["sips", "-s", "format", "jpeg", str(cr3), "--out", str(jpg)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def list_images(folder: Path) -> list[str]:
    files = sorted(p.name for p in folder.glob("*.JPG"))
    return files


def build_data(rows: list[int]) -> dict:
    ensure_dirs()
    convert_cr3(HOR_DIR)
    convert_cr3(VERT_DIR)

    horizontal = [f"hor/{name}" for name in list_images(HOR_DIR)]
    vertical = [f"vert/{name}" for name in list_images(VERT_DIR)]

    return {
        "horizontal": horizontal,
        "rows": rows,
        "vertical": vertical,
    }


def update_html(data: dict) -> None:
    html = HTML_PATH.read_text()
    marker = '<script id="portfolio-data" type="application/json">'
    start = html.find(marker)
    if start == -1:
        raise SystemExit("portfolio-data script tag not found")
    start = html.find(">", start) + 1
    end = html.find("</script>", start)
    if end == -1:
        raise SystemExit("closing script tag not found")

    json_text = json.dumps(data, indent=2)
    indented = "\n" + "\n".join(f"      {line}" for line in json_text.splitlines()) + "\n    "

    updated = html[:start] + indented + html[end:]
    HTML_PATH.write_text(updated)


def main() -> None:
    config = load_config()
    rows = config.get("rows") or [4, 3, 4, 3, 2, 4, 4, 2, 1, 3, 3]
    data = build_data(rows)
    update_html(data)
    print("Updated portfolio-data in index.html")
    print(f"Horizontal: {len(data['horizontal'])} images")
    print(f"Vertical:   {len(data['vertical'])} images")


if __name__ == "__main__":
    main()
