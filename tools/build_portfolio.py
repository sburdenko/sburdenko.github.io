#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
CONFIG_PATH = ROOT / "portfolio.config.json"
HTML_PATH = ROOT / "index.html"


def load_config() -> dict:
    if CONFIG_PATH.exists():
        return json.loads(CONFIG_PATH.read_text())
    return {
        "active": "serie_1",
        "series": {
            "serie_1": {"dir": "images", "rows": [4, 3, 4, 3, 2, 4, 4, 2, 1, 3, 3]},
            "serie_2": {"dir": "images/serie2", "rows": [4, 3, 4, 3, 2, 4, 4, 4]},
        },
    }


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


def build_series(dir_path: Path, rows: list[int]) -> dict:
    hor_dir = dir_path / "hor"
    vert_dir = dir_path / "vert"
    hor_dir.mkdir(parents=True, exist_ok=True)
    vert_dir.mkdir(parents=True, exist_ok=True)

    convert_cr3(hor_dir)
    convert_cr3(vert_dir)

    prefix_path = dir_path.relative_to(IMAGES_DIR)
    prefix = "" if prefix_path == Path(".") else f"{prefix_path.as_posix()}/"

    horizontal = [f"{prefix}hor/{name}" for name in list_images(hor_dir)]
    vertical = [f"{prefix}vert/{name}" for name in list_images(vert_dir)]

    return {"horizontal": horizontal, "rows": rows, "vertical": vertical}


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
    series_config = config.get("series") or {}
    active = config.get("active") or next(iter(series_config.keys()), "serie_1")

    series_data: dict[str, dict] = {}
    for name, series in series_config.items():
        dir_value = series.get("dir", "images")
        dir_path = (ROOT / dir_value).resolve()
        rows = series.get("rows") or []
        series_data[name] = build_series(dir_path, rows)

    data = {"active": active, "series": series_data}
    update_html(data)
    print("Updated portfolio-data in index.html")
    for name, series in series_data.items():
        print(f"{name}: {len(series['horizontal'])} horizontal, {len(series['vertical'])} vertical")


if __name__ == "__main__":
    main()
