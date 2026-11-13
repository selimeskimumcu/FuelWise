"""Build frontend/data/vehicle-catalog.json.

Cars come from the EEA "CO2 emissions from new passenger cars" open dataset
(https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b),
queried through the public Discodata SQL endpoint. Tank capacities, the list of
models popular in Türkiye and motorcycles are curated in catalog_curation.py.

Usage:
    python backend/scripts/build_vehicle_catalog.py            # fetch (cached) + build
    python backend/scripts/build_vehicle_catalog.py --offline  # build from the cache only

Only the standard library is used so the script runs without the backend's dependencies.
"""

from __future__ import annotations

import argparse
import json
import re
import statistics
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from catalog_curation import (  # noqa: E402
    AUTO_MODEL_FIXES,
    AUTO_TIER_EXCLUDED_MAKES,
    CURATED_MODELS,
    MAKES,
    MOTORCYCLES,
)

ENDPOINT = "https://discodata.eea.europa.eu/sql"
TABLE = "[CO2Emission].[latest].[co2cars]"
YEARS = range(2010, 2023)
ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = Path(__file__).parent / ".catalog-cache"
OUTPUT = ROOT / "frontend" / "data" / "vehicle-catalog.json"

# Official figures are optimistic. These factors turn them into an everyday estimate:
# WLTP runs about 15% under real use, the older NEDC cycle about 30% under.
REAL_WORLD_FACTOR = {"WLTP": 1.15, "NEDC": 1.30}
# LPG holds less energy per litre, so a converted petrol engine burns 20-25% more by volume.
LPG_FACTOR = 1.225
LPG_TANK_LITRES = 40  # usable volume of a typical spare-wheel tank; always shown as an estimate
# Litres per 100 km for each g/km of CO2, used when a row has CO2 but no consumption figure.
CO2_PER_LITRE = {"gasoline": 23.2, "diesel": 26.4}
FUELS = {"PETROL": "gasoline", "DIESEL": "diesel"}

MIN_VARIANT_ROWS = 4   # distinct registration rows before an engine is trusted
MIN_VARIANT_SHARE = 0.04  # ...and at least this share of the model's best-documented engine
MIN_AUTO_MODEL_ROWS = 80  # uncurated models need this much evidence to be listed


def search_prefixes(aliases: list[str]) -> list[str]:
    """Name prefixes to query for one make.

    The endpoint's firewall rejects quoted values that end in "A" (DACIA, TOYOTA, KIA...),
    so makes are selected with a BETWEEN range on a prefix instead of an equality test.
    A range also picks up the long-form spellings some countries report.
    """
    prefixes = sorted({alias[:-1] if alias.endswith("A") else alias for alias in aliases}, key=len)
    return [prefix for index, prefix in enumerate(prefixes)
            if not any(prefix.startswith(shorter) for shorter in prefixes[:index])]


def query_range(prefix: str, year: int) -> list[dict] | None:
    """Fetch every row whose make starts with prefix; None when the firewall refuses the query."""
    upper = prefix + "ZZZZZZ"  # incrementing the last letter breaks on "Z" (MAZ -> MA[)
    query = (
        "SELECT DISTINCT Mk, Cn, Ft, Fm, [Ec (cm3)] AS ec, [Ep (KW)] AS kw, "
        "[E (g/km)] AS e, [Enedc (g/km)] AS nedc, [Ewltp (g/km)] AS wltp, Fc, Year "
        f"FROM {TABLE} WHERE Mk BETWEEN '{prefix}' AND '{upper}' AND Year={year}"
    )
    rows: list[dict] = []
    page = 1
    while True:
        url = f"{ENDPOINT}?{urllib.parse.urlencode({'query': query, 'p': page, 'nrOfHits': 20000})}"
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (catalog build)"})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(request, timeout=180) as response:
                    batch = json.loads(response.read().decode("utf-8"))["results"]
                break
            except urllib.error.HTTPError as error:
                if error.code == 403:
                    return None
                if attempt == 3:
                    raise RuntimeError(f"{prefix} {year}: {error}") from error
            except Exception as error:  # noqa: BLE001 - retry any transport error
                if attempt == 3:
                    raise RuntimeError(f"{prefix} {year}: {error}") from error
            time.sleep(2 * (attempt + 1))
        rows.extend(batch)
        if len(batch) < 20000:
            return rows
        page += 1


def fetch(prefix: str, year: int, offline: bool) -> list[dict]:
    cache = CACHE_DIR / f"{re.sub(r'[^A-Z0-9]+', '_', prefix)}_{year}.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    if offline:
        return []
    # The firewall's false positives depend on the literal, so widen the range until one passes
    # and keep only the rows that really belong to this make.
    for length in range(len(prefix), 1, -1):
        rows = query_range(prefix[:length], year)
        if rows is not None:
            rows = [row for row in rows if (row.get("Mk") or "").upper().strip().startswith(prefix)]
        if rows:
            break
    else:
        rows = []  # the make was not sold that year, or every query form was refused
    CACHE_DIR.mkdir(exist_ok=True)
    cache.write_text(json.dumps(rows), encoding="utf-8")
    return rows


def clean_name(raw: str, aliases: list[str]) -> str:
    name = re.sub(r"\s+", " ", (raw or "").upper().replace("'", "").replace("`", "")).strip()
    for alias in sorted(aliases, key=len, reverse=True):
        if name.startswith(alias + " "):
            name = name[len(alias) + 1:]
    return name.split(" / ")[0].split("/")[0].strip(" -.,")


def auto_model(name: str) -> str | None:
    """Best-effort model name for makes without a curated pattern."""
    tokens = [token for token in name.split() if token not in {"NEW", "NUOVA", "NOUVELLE", "NEUE", "NUEVO", "THE"}]
    if tokens and tokens[0] == "GRAND" and len(tokens) > 1:
        tokens = tokens[1:]
    if not tokens or not re.fullmatch(r"[A-Z0-9\-+]{2,12}", tokens[0]):
        return None
    if re.match(r"^(.{2,5})", tokens[0]):  # "I30I30CW": two fields glued together
        return None
    joiners = {"GRAND", "SANTA", "SPACE", "ECLIPSE", "RANGE", "LAND", "C3", "C4", "C5", "YARIS", "COROLLA", "S", "SX4"}
    second_words = {"AIRCROSS", "CROSS", "CACTUS", "PICASSO", "SPACETOURER", "FE", "STAR", "ROVER", "CRUISER",
                    "SCENIC", "C-MAX", "TOURNEO", "CHEROKEE", "VITARA", "S-CROSS", "CROSSBACK", "MODUS", "COUPE"}
    if len(tokens) > 1 and (tokens[0] in joiners or tokens[1] in second_words) and re.fullmatch(r"[A-Z\-]{2,12}", tokens[1]):
        return f"{tokens[0]} {tokens[1]}"
    return tokens[0]


def title(name: str) -> str:
    return " ".join(word if (len(word) <= 3 or any(ch.isdigit() for ch in word)) else word.capitalize() for word in name.split())


def consumption(row: dict, fuel: str) -> tuple[float, str] | None:
    """Return (litres per 100 km, test cycle) for a registration row."""
    value = row.get("Fc")
    if value and 2.5 <= value <= 20:
        return float(value), "WLTP"
    for column, cycle in (("wltp", "WLTP"), ("nedc", "NEDC"), ("e", "NEDC")):
        grams = row.get(column)
        if grams and 60 <= grams <= 450:
            return grams / CO2_PER_LITRE[fuel], cycle
    return None


def estimate_tank(engine_sizes: list[int]) -> int:
    size = statistics.median(engine_sizes)
    if size <= 1000:
        return 40
    if size <= 1400:
        return 45
    if size <= 1600:
        return 50
    if size <= 2000:
        return 55
    return 65


def tidy_variants(variants: dict) -> dict:
    """Drop the mis-keyed registrations that every national file contains.

    The same engine sometimes appears as a hybrid in one country and not in another, or
    under the wrong fuel. Each (engine size, power) pair keeps its best-documented form,
    and engines backed by only a handful of rows are discarded.
    """
    merged: dict = defaultdict(list)
    for (fuel, hybrid, cc, kw), entries in variants.items():
        merged[(fuel, cc, kw)].append((len(entries), hybrid, entries))
    by_engine: dict = defaultdict(list)
    for (fuel, cc, kw), forms in merged.items():
        forms.sort(key=lambda form: form[0], reverse=True)
        entries = [entry for form in forms for entry in form[2]]
        by_engine[(cc, kw)].append((len(entries), fuel, forms[0][1], entries))
    kept = {}
    for (cc, kw), candidates in by_engine.items():
        candidates.sort(key=lambda candidate: candidate[0], reverse=True)
        best = candidates[0][0]
        for rows, fuel, hybrid, entries in candidates:
            if rows >= best * 0.25:
                kept[(fuel, hybrid, cc, kw)] = entries
    if not kept:
        return {}
    threshold = max(MIN_VARIANT_ROWS, MIN_VARIANT_SHARE * max(len(entries) for entries in kept.values()))
    return {key: entries for key, entries in kept.items() if len(entries) >= threshold}


def build(offline: bool) -> dict:
    jobs = [(make, prefix, year) for make, aliases in MAKES.items() for prefix in search_prefixes(aliases) for year in YEARS]
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda job: (job[0], fetch(job[1], job[2], offline)), jobs))

    # make -> model -> (fuel, hybrid, cc, kw) -> list of (year, litres, cycle)
    grouped: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    curated_hits: dict = defaultdict(int)
    raw_rows = 0

    for make, rows in results:
        aliases = MAKES[make]
        patterns = CURATED_MODELS.get(make, [])
        for row in rows:
            raw_rows += 1
            fuel = FUELS.get((row.get("Ft") or "").upper())
            mode = (row.get("Fm") or "").upper()
            cc, kw = row.get("ec"), row.get("kw")
            if not fuel or mode not in {"M", "H"} or not cc or not kw:
                continue
            if not (600 <= cc <= 6500 and 30 <= kw <= 450):
                continue
            figure = consumption(row, fuel)
            if not figure:
                continue
            name = clean_name(row.get("Cn"), aliases)
            if not name:
                continue
            model = next((display for display, pattern, _tank in patterns if re.search(pattern, name)), None)
            if model:
                curated_hits[(make, model)] += 1
            elif make in AUTO_TIER_EXCLUDED_MAKES:
                continue
            else:
                auto = auto_model(name)
                auto = AUTO_MODEL_FIXES.get(auto, auto)
                if not auto:
                    continue
                model = title(auto)
            grouped[make][model][(fuel, mode == "H", int(cc), int(kw))].append((row["Year"], *figure))

    makes_out = []
    report = []
    for make in MAKES:
        curated_tanks = {display: tank for display, _pattern, tank in CURATED_MODELS.get(make, [])}
        models_out = []
        for model, variants in grouped[make].items():
            is_curated = model in curated_tanks
            total_rows = sum(len(entries) for entries in variants.values())
            if not is_curated and total_rows < MIN_AUTO_MODEL_ROWS:
                continue
            variants = tidy_variants(variants)
            variants_out = []
            for (fuel, hybrid, cc, kw), entries in variants.items():
                cycle = "WLTP" if any(entry[2] == "WLTP" for entry in entries) else "NEDC"
                official = round(statistics.median(entry[1] for entry in entries if entry[2] == cycle), 1)
                real = round(official * REAL_WORLD_FACTOR[cycle], 1)
                years = [entry[0] for entry in entries]
                variant = {
                    "fuel": fuel, "cc": cc, "hp": round(kw * 1.3596), "from": min(years), "to": max(years),
                    "official": official, "cycle": cycle, "real": real,
                }
                if hybrid:
                    variant["hybrid"] = True
                variants_out.append(variant)
                if fuel == "gasoline" and not hybrid:
                    variants_out.append({**variant, "fuel": "lpg", "official": None, "cycle": None,
                                         "real": round(real * LPG_FACTOR, 1), "derived": True})
            if not variants_out:
                continue
            variants_out.sort(key=lambda item: (item["fuel"], item["cc"], item["hp"]))
            entry = {
                "name": model,
                "tank": curated_tanks.get(model) or estimate_tank([item["cc"] for item in variants_out]),
                "variants": variants_out,
            }
            if is_curated:
                entry["popular"] = True
            else:
                entry["tankEstimated"] = True
            models_out.append(entry)
        models_out.sort(key=lambda item: (not item.get("popular"), item["name"]))
        if models_out:
            makes_out.append({"name": make, "type": "car", "models": models_out})
        for display in curated_tanks:
            found = next((item for item in models_out if item["name"] == display), None)
            report.append((make, display, len(found["variants"]) if found else 0, curated_hits[(make, display)]))

    for make, models in MOTORCYCLES.items():
        makes_out.append({
            "name": make, "type": "motorcycle",
            "models": [{"name": name, "tank": tank, "popular": True,
                        "variants": [{"fuel": "gasoline", "cc": cc, "real": litres, "official": None, "cycle": None}]}
                       for name, cc, litres, tank in models],
        })

    makes_out.sort(key=lambda item: (item["type"] != "car", item["name"]))
    car_makes = [item for item in makes_out if item["type"] == "car"]
    catalog = {
        "meta": {
            "generated": date.today().isoformat(),
            "source": "EEA CO2 emissions from new passenger cars (2010-2022); curated tanks and motorcycles",
            "realWorldFactor": REAL_WORLD_FACTOR,
            "lpgFactor": LPG_FACTOR,
            "lpgTank": LPG_TANK_LITRES,
            "counts": {
                "makes": len(makes_out),
                "models": sum(len(item["models"]) for item in makes_out),
                "variants": sum(len(model["variants"]) for item in makes_out for model in item["models"]),
            },
        },
        "makes": makes_out,
    }

    missing = [f"{make} {model}" for make, model, variants, _rows in report if not variants]
    print(f"raw rows: {raw_rows:,}")
    print(f"car makes: {len(car_makes)}, models: {sum(len(item['models']) for item in car_makes)}, "
          f"variants: {sum(len(model['variants']) for item in car_makes for model in item['models'])}")
    print(f"curated models found: {len(report) - len(missing)}/{len(report)}")
    if missing:
        print("curated models with no data:", ", ".join(missing))
    return catalog


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--offline", action="store_true", help="build from cached responses only")
    arguments = parser.parse_args()
    catalog = build(arguments.offline)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
