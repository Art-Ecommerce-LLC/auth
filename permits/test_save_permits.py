import os
import sys
import smtplib
import hashlib
import json
import logging
import traceback
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import aiohttp
import asyncio
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
from permit_payload import EncinitasSearchPayload
from tqdm.asyncio import tqdm as async_tqdm
from urllib.parse import quote_plus

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout
)

# Load environment
load_dotenv()
load_dotenv(".env.local", override=True)

# Clients
CLIENT = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
SUPABASE = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)
MAPBOX_KEY = os.getenv("MAPBOX_API_KEY")

# API constants
HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8",
    "Origin": "https://portal.encinitasca.gov",
    "Referer": "https://portal.encinitasca.gov/CustomerSelfService",
    "Tyler-Tenant-Culture": "en-US",
    "Tyler-TenantUrl": "Encinitascaenergovprod",
    "tenantId": "4",
    "User-Agent": "Mozilla/5.0"
}

# Geospatial helper
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, sin, cos, asin, sqrt
    R = 6371.0
    dlat, dlon = map(radians, (lat2-lat1, lon2-lon1))
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    return 2*R*asin(sqrt(a))

# Geocode address via Mapbox
def clean_content_markdown(s: str) -> str:
    # Strip markdown fences if present
    if s.startswith("```"):
        lines = s.splitlines()
        # Drop first and last fence lines
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        return "\n".join(lines)
    return s

async def geocode(address: str) -> Dict[str, float]:
    if not isinstance(address, str):
        logging.error(f"Expected address as string, got: {type(address)}")
        return {}
    try:
        encoded = quote_plus(address)
    except Exception as e:
        logging.error(f"Encoding address failed: {e}")
        return {}
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{encoded}.json"
    params = {
        "access_token": MAPBOX_KEY,
        "bbox": ",".join(map(str, (-117.35, 33.00, -117.23, 33.12))),
        "types": "address",
        "limit": 1
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params, timeout=10) as r:
                r.raise_for_status()
                data = await r.json()
        feats = data.get("features", [])
        if not feats:
            return {}
        lon, lat = feats[0]["center"]
        # Validate distance
        if haversine_km(lat, lon, 33.045, -117.292) > 15:
            return {}
        return {"latitude": lat, "longitude": lon}
    except Exception as e:
        logging.error(f"Geocode failed for '{address}': {e}")
        return {}

# Enrich permit via GPT
def enrich(record: Dict[str, Any]) -> Dict[str, Any]:
    prompt = (
        f"You are a construction and real estate expert. Perm Description: {record.get('Description')}\n"
        "Return JSON with keys: urgency, recommended_roles, estimated_value_per_role, lead_price, needs_more_permits, next_steps, guide_by_role."
    )
    try:
        resp = CLIENT.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        content = resp.choices[0].message.content.strip()
        content = clean_content_markdown(content)
        data = json.loads(content)
        # Cap lead_price
        data['lead_price'] = min(data.get('lead_price', 0), 500)
        return data
    except json.JSONDecodeError as jde:
        logging.error(f"JSON decode error for GPT content: {jde}. Raw: {content!r}")
    except Exception as e:
        logging.error(f"Failed to enrich record {record.get('CaseNumber')}: {e}")
    # Fallback default
    return {
        "urgency": "low",
        "recommended_roles": [],
        "estimated_value_per_role": {},
        "lead_price": 0,
        "needs_more_permits": False,
        "next_steps": "",
        "guide_by_role": {}
    }

# Upsert permit to Supabase
def upsert_permit(payload: Dict[str, Any]) -> None:
    num = payload.get('permit_number')
    payload['alert_sent'] = False
    raw_hash = hashlib.md5((num + payload.get('description','')).encode()).hexdigest()
    # Check existing hash
    res = SUPABASE.table("permits").select("raw_hash").eq("permit_number", num).execute()
    existing = (res.data[0]['raw_hash'] if res.data else None)
    if existing != raw_hash:
        try:
            up = SUPABASE.table("permits").upsert({**payload, 'raw_hash': raw_hash}).execute()
            if hasattr(up, 'error') and up.error:
                logging.error(f"Supabase upsert error for {num}: {up.error}")
            else:
                logging.info(f"Upsert succeeded for permit {num}")
        except Exception as e:
            logging.error(f"Exception during upsert for {num}: {e}")

# Process single record
def process_one(record: Dict[str, Any], sem: asyncio.Semaphore) -> None:
    async def task():
        geo = await geocode(record.get('AddressDisplay',''))
        ai = enrich(record)
        payload = {
            **geo,
            'permit_number': record.get('CaseNumber'),
            'issue_date': record.get('IssueDate'),
            'description': record.get('Description'),
            **{k: ai.get(k) for k in ('urgency','recommended_roles','estimated_value_per_role','lead_price','needs_more_permits','next_steps')},
            'guide_json': ai.get('guide_by_role', {})
        }
        print(f"Processing permit: {payload['permit_number']} -> {payload}")
        upsert_permit(payload)
    return asyncio.create_task(task())

# Main pipeline
async def main():
    payload = EncinitasSearchPayload()
    payload.set_date_range("2025-06-01", "2025-06-15")
    payload.set_page_info(10, 1)
    payload.sort_by("IssueDate", False)

    # Fetch records
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://portal.encinitasca.gov/customerselfservice/api/energov/search/search",
            json=payload.to_dict(),
            headers=HEADERS,
            timeout=10
        ) as r:
            r.raise_for_status()
            data = await r.json()
    recs = data.get("Result", {}).get("EntityResults", [])
    if not recs:
        logging.warning("No records returned.")
        return

    # Process batch
    sem = asyncio.Semaphore(3)
    tasks = [process_one(r, sem) for r in recs[:10]]
    for f in async_tqdm(asyncio.as_completed(tasks), total=len(tasks), desc="Processing Test Batch"):
        try:
            await f
        except Exception:
            pass

if __name__ == "__main__":
    asyncio.run(main())
