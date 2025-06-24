import os
import hashlib
import requests
import smtplib
import json
import traceback
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from permit_payload import EncinitasSearchPayload
from jsonschema import validate, ValidationError
from dateutil.parser import parse as parse_date  # Optional if needed elsewhere
from math import radians, cos, sin, asin, sqrt
import sys
# ────────────────────────────────────────────────
# Environment Configuration ───────────────────────
# ────────────────────────────────────────────────
class EnvConfig:
    """
    Loads and validates required environment variables and exits if any are missing.
    """
    REQUIRED_VARS = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_KEY",
        "OPENAI_API_KEY",
        "MAPBOX_API_KEY",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASS",
        "SMTP_FROM_EMAIL",
        "FROM_NAME",
        
    ]

    def __init__(self):
        # Load .env files
        load_dotenv()
        load_dotenv(".env.local", override=True)

        missing = []
        for var in self.REQUIRED_VARS:
            if not os.getenv(var):
                missing.append(var)

        if missing:
            print(f"❌ Missing required environment variables: {', '.join(missing)}")
            sys.exit(1)

        # Store values as attributes
        for var in self.REQUIRED_VARS:
            setattr(self, var, os.getenv(var))

# Instantiate configuration (will exit if env vars are missing)
config = EnvConfig()
# ────────────────────────────────────────────────
# Runtime flags & feature toggles  ───────────────
# ────────────────────────────────────────────────
DISABLE_EMAILS: bool = False   # Skip SMTP if True (dev / testing)
REPROCESS_ALL: bool = False  # Ignore latest_issue_date and re‑pull 90 d of data

# ────────────────────────────────────────────────
# Geospatial constants for Encinitas  ────────────
# ────────────────────────────────────────────────
#   west_lon, south_lat, east_lon, north_lat
ENCINITAS_BBOX: tuple[float, float, float, float] = (
    -117.35, 33.00,   # ↖ bottom‑left
    -117.23, 33.12    # ↗ top‑right
)
# City centroid (≈ Moonlight Beach)
ENCINITAS_CENTER: tuple[float, float] = (33.045, -117.292)
MAX_DISTANCE_KM: int = 15  # Reject any geocode > 15 km from center



def in_bbox(lat: float, lon: float, bbox: tuple = ENCINITAS_BBOX) -> bool:
    """Return True if (lat, lon) is inside the configured bounding box."""
    west, south, east, north = bbox
    return south <= lat <= north and west <= lon <= east


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great‑circle distance between two WGS‑84 points (km)."""
    R = 6371.0  # Earth radius km
    dlat, dlon = map(radians, (lat2 - lat1, lon2 - lon1))
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * R * asin(sqrt(a))


class SupabaseService:
    def __init__(self, subabase_url, service_key):
        url = subabase_url
        key = service_key
        self.client: Client = create_client(url, key)

    def get_subscriptions(self):
        return self.client.table("subscriptions").select("*").execute().data

    def get_existing_hash(self, permit_number):
        return self.client.table("permits").select("*").eq("permit_number", permit_number).execute().data

    def insert_permit(self, payload):
        return self.client.table("permits").insert(payload).execute()

    def update_permit(self, permit_number, payload):
        return self.client.table("permits").update(payload).eq("permit_number", permit_number).execute()

    def mark_alert_sent(self, permit_number):
        return self.client.table("permits").update({"alert_sent": True}).eq("permit_number", permit_number).execute()
    
    def delete_old_permits(self, days_old=90):
        cutoff_date = (datetime.utcnow() - timedelta(days=days_old)).date().isoformat()
        print(f"🧹 Deleting permits older than {cutoff_date}")
        try:
            result = self.client.table("permits") \
                .delete() \
                .lt("issue_date", cutoff_date) \
                .execute()
            print(f"🗑️ Deleted {len(result.data)} old permits")
        except Exception as e:
            print(f"❌ Failed to delete old permits: {e}")
            traceback.print_exc()

    def get_latest_issue_date(self):
        try:
            result = self.client.table("permits").select("issue_date").order("issue_date", desc=True).limit(1).execute()
            latest = result.data[0]["issue_date"] if result.data else None
            print(f"🕐 Latest issue_date in DB: {latest}")
            return latest
        except Exception as e:
            print(f"❌ Could not fetch latest issue date: {e}")
            return None
        
    def delete_permit(self, permit_number: str):
        """Hard‑delete a permit row if its data is no longer valid."""
        return (
            self.client.table("permits")
            .delete()
            .eq("permit_number", permit_number)
            .execute()
        )
    

class PermitAI:
    @staticmethod
    def enrich(record):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        DEFAULTS = {
            "urgency": "medium",
            "value": "medium",
            "recommended_roles": [],
            "guide_json": {},
            "reasoning_summary": "",
            "estimated_value_per_role": {},
            "lead_price": 0,
            "needs_more_permits": False,
            "next_steps": "",
        }

        base_prompt = (
            f"You are a construction and real estate industry expert. Analyze this permit data and determine urgency, value, and recommended roles. Respond in JSON format:\n"
            f"Description: {record.get('Description')}\n"
            f"Type: {record.get('CaseType')}\n"
            f"Project: {record.get('ProjectName')}\n"
            "Include 'real_estate_agent' in recommended_roles if applicable. Provide a concise reasoning_summary explaining your recommendations."
        )

        detailed_prompt_template = (
            "You previously recommended these roles: {roles}. Respond in JSON format and for each role provide:\n"
            "  • guide_json.<role>.guide: 3-4 actionable steps specific to that role.\n"
            "  • guide_json.<role>.details: a 1-2 sentence explanation of the role's responsibilities.\n"
            "Assign a numeric USD estimate for each role’s total project cost in estimated_value_per_role. Ensure completeness and accuracy."
        )

        user_msg_base = {"role": "user", "content": base_prompt}

        try:
            response_base = client.chat.completions.create(
                model="gpt-4.1",
                messages=[{"role": "system", "content": "You are a helpful assistant. Respond strictly in JSON."}, user_msg_base],
                temperature=0.0,
                max_tokens=512
            )

            content_base = response_base.choices[0].message.content
            parsed_base = json.loads(content_base.strip()) if content_base else {}

            roles = parsed_base.get("recommended_roles", [])

            if not roles:
                print("❌ No roles recommended, skipping detailed enrichment.")
                return DEFAULTS

            detailed_prompt = detailed_prompt_template.format(roles=', '.join(roles))
            user_msg_detailed = {"role": "user", "content": detailed_prompt}

            response_detailed = client.chat.completions.create(
                model="gpt-4.1",
                messages=[{"role": "system", "content": "You are a helpful assistant. Respond strictly in JSON."}, user_msg_detailed],
                temperature=0.0,
                max_tokens=1024
            )

            content_detailed = response_detailed.choices[0].message.content
            parsed_detailed = json.loads(content_detailed.strip()) if content_detailed else {}

            parsed = {**DEFAULTS, **parsed_base, **parsed_detailed}

            schema = {
                "type": "object",
                "properties": {
                    "urgency": {"type": "string"},
                    "value": {"type": "string"},
                    "recommended_roles": {"type": "array"},
                    "guide_json": {"type": "object"},
                    "reasoning_summary": {"type": "string"},
                    "estimated_value_per_role": {"type": "object"},
                    "lead_price": {"type": "number"},
                    "needs_more_permits": {"type": "boolean"},
                    "next_steps": {"type": "string"}
                },
                "required": list(DEFAULTS.keys())
            }
            validate(instance=parsed, schema=schema)

            parsed["lead_price"] = min(parsed.get("lead_price", 0), 500)

            with open("permit_ai_response.json", "w") as f:
                json.dump(parsed, f, indent=2)

            print(f"✅ PermitAI.enrich response: {parsed}")
            return parsed

        except ValidationError as ve:
            print(f"❌ Schema validation error in PermitAI.enrich: {ve}")
            traceback.print_exc()
            return DEFAULTS
        except json.JSONDecodeError as je:
            print(f"❌ JSON decode error in PermitAI.enrich: {je}")
            traceback.print_exc()
            return DEFAULTS
        except Exception as e:
            print(f"❌ Unexpected error in PermitAI.enrich: {e}")
            traceback.print_exc()
            return DEFAULTS

class Geocoder:
    """Wrapper around Mapbox Geocoding with Encinitas safeguards."""
    def __init__(self, mapbox_api_key):
        self.mapbox_api_key = mapbox_api_key

    def geocode_address(self, address):
        token = self.mapbox_api_key
        if not token:
            print("⚠️ No MAPBOX_API_KEY found")
            return None, None

        # Normalise address string
        address_str = (
            address.get("FullAddress") if isinstance(address, dict) else str(address)
        ).strip()
        if not address_str:
            print("⚠️ Empty address string; skipping geocode")
            return None, None

        # Build request with bbox restriction
        bbox = ",".join(map(str, ENCINITAS_BBOX))  # lon,lat,lon,lat
        url = (
            "https://api.mapbox.com/geocoding/v5/mapbox.places/"
            f"{requests.utils.quote(address_str)}.json?access_token={token}"
            f"&bbox={bbox}&types=address&limit=1"
        )

        try:
            data = requests.get(url, timeout=6).json()
            features = data.get("features", [])
            if not features:
                print(f"ℹ️ No geocode candidates for '{address_str}'")
                return None, None

            lon, lat = features[0]["center"]  # safe: list is non‑empty
            relevance = features[0].get("relevance", 0.0)

            # Final validation gates
            if relevance < 0.8:
                return None, None
            if not in_bbox(lat, lon):
                return None, None
            if haversine_km(lat, lon, *ENCINITAS_CENTER) > MAX_DISTANCE_KM:
                return None, None

            return lat, lon
        except Exception as exc:
            print(f"❌ Geocoding failed for '{address_str}': {exc}")
            return None, None

class PermitNotifier:
    def __init__(self, host, port, user, password, from_name, from_email):
        self.smtp_host = host
        self.smtp_port = port
        self.smtp_user = user
        self.smtp_pass = password
        self.from_name = from_name or "Encinitas Permits"
        self.from_email = from_email 

    def send(self, email, record):
        if DISABLE_EMAILS:
            print(f"🚫 Email sending disabled. Skipping email to {email}")
            return

        msg = MIMEText(
            f"""New permit matched your subscription:
                Address: {record.get("address")}
                Description: {record.get("description")}
                Type: {record.get("CaseType")}
                Status: {record.get("status")}
                Issued: {record.get("issue_date")}
                Guide: {record.get("guide")}
                Lead Price: ${record.get("lead_price", "TBD")}
                Link: https://portal.encinitasca.gov/CustomerSelfService"""
        )
        msg["Subject"] = "🚨 New Permit Alert"
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = email

        try:
            print(f"📤 Connecting to SMTP server {self.smtp_host}:{self.smtp_port}...")
            server = smtplib.SMTP_SSL(self.smtp_host, self.smtp_port)
            server.login(self.smtp_user, self.smtp_pass)
            server.send_message(msg)
            server.quit()
            print(f"✅ Sent alert to {email}")
        except Exception as e:
            print(f"❌ Email failed for {email}: {e}")
            traceback.print_exc()

class PermitHasher:
    @staticmethod
    def compute(record):
        fields = [record.get(k) for k in ["CaseNumber", "CaseStatus", "IssueDate", "FinalDate", "Description"]]
        return hashlib.md5("".join(str(f or "") for f in fields).encode()).hexdigest()


class PermitProcessor:
    def __init__(self, supabase, notifier, mapbox_api_key):
        self.geocoder = Geocoder(mapbox_api_key)
        self.supabase = supabase
        self.notifier = notifier

    # ────────────────────────────────────────────────────
    # Internal helper
    # ────────────────────────────────────────────────────
    def _skip(self, permit_number: str, reason: str, existing):
        """Log skip reason and delete stale row if it exists."""
        print(f"⛔ Skipping permit {permit_number} – {reason}")
        if existing:
            print("🗑️  Removing stale permit from database …")
            self.supabase.delete_permit(permit_number)
        return "skipped"

    def upsert(self, record):
        permit_number = record.get("CaseNumber")
        if not permit_number:
            return self._skip(permit_number, "no permit number", None)

        description = (record.get("Description") or "").strip()
        if not description:
            return self._skip(permit_number, "no description", None)

        hash_val = PermitHasher.compute(record)
        existing = self.supabase.get_existing_hash(permit_number)

        ai_data = PermitAI.enrich(record)
        if not ai_data:
            return self._skip(permit_number, "AI enrichment failed", existing)

        hotness_score = (3 if ai_data.get("urgency") == "high" else 2 if ai_data.get("urgency") == "medium" else 1)
        hotness_score += (3 if ai_data.get("value") == "high" else 2 if ai_data.get("value") == "medium" else 1)

        address = record.get("Address")
        if not address:
            return self._skip(permit_number, "no address", existing)

        

        lat, lon = self.geocoder.geocode_address(address)
        if lat is None or lon is None:
            return self._skip(permit_number, "geocode failed", existing)
        
        
        roles = ai_data.get("recommended_roles") or []
        if not isinstance(roles, list):
            roles = [roles] if roles else []
        roles = [r.lower() for r in roles if isinstance(r, str)]

        payload = {
            "address": address,
            "latitude": lat,
            "longitude": lon,
            "permit_number": permit_number,
            "status": record.get("CaseStatus"),
            "issue_date": record.get("IssueDate"),
            "description": record.get("Description"),
            "raw_hash": hash_val,
            "urgency": ai_data.get("urgency"),
            "project_value": ai_data.get("value"),
            "recommended_roles": roles,
            "guide_json": {role: f"Strategy for {role.title()}: {ai_data.get('guide')}" for role in roles},
            "hotness": hotness_score,
            "alert_sent": False,
            "reasoning_summary": ai_data.get("reasoning_summary"),
            "estimated_value_per_role": ai_data.get("estimated_value_per_role"),
            "lead_price": ai_data.get("lead_price"),
            "needs_more_permits": ai_data.get("needs_more_permits", False),
            "next_steps": ai_data.get("next_steps", ""),
        }

        for role in roles:
            guide = f"Strategy for {role.title()}: {ai_data.get('guide')}"
            payload["guide_json"][role] = guide

        if existing:
            existing = existing[0]
            missing_fields = any(existing.get(k) is None for k in ["urgency", "project_value", "recommended_roles", "estimated_value_per_role"])
            if existing["raw_hash"] != hash_val or missing_fields:
                self.supabase.update_permit(permit_number, payload)
                return "updated"
            return "unchanged"
        else:
            self.supabase.insert_permit(payload)
            return "new"

    def match_subscriptions(self, record):
        if record.get("alert_sent"):
            print(f"🔕 Alert already sent for {record.get('permit_number')}")
            return

        subs = self.supabase.get_subscriptions()
        roles = record.get("recommended_roles") or []
        roles = [r.lower() for r in roles if isinstance(r, str)]

        print(f"📋 Record roles: {roles}")

        for sub in subs:
            match_value = sub["match_value"].lower()
            match_type = sub.get("match_type", "").lower()

            print(f"🧩 Checking if '{match_value}' in roles {roles} for match_type {match_type}")

            if match_type == "role" and match_value in roles:
                record_copy = record.copy()
                guide_json = record.get("guide_json", {})
                record_copy["guide_json"] = guide_json.get(match_value, "")
                print(f"📧 Match found for {sub['email']}, sending alert...")
                self.notifier.send(sub["email"], record_copy)
                self.supabase.mark_alert_sent(record.get("permit_number"))
                print(f"✅ Sent to {sub['email']} for role match: {match_value}")
                break

class PermitFetcher:
    def __init__(self, processor):
        self.processor = processor
        self.supabase = processor.supabase
        self.payload_builder = EncinitasSearchPayload()
        self.url = "https://portal.encinitasca.gov/customerselfservice/api/energov/search/search"
        self.headers = {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=utf-8",
            "Origin": "https://portal.encinitasca.gov",
            "Referer": "https://portal.encinitasca.gov/CustomerSelfService",
            "Tyler-Tenant-Culture": "en-US",
            "Tyler-TenantUrl": "Encinitascaenergovprod",
            "tenantId": "4",
            "User-Agent": "Mozilla/5.0"
        }

    def fetch(self):
        if REPROCESS_ALL:
            start_date = datetime.utcnow() - timedelta(days=90)
        else:
            latest_date = self.supabase.get_latest_issue_date()
            start_date = datetime.fromisoformat(latest_date).date() if latest_date else datetime.utcnow() - timedelta(days=90)
        end_date = datetime.utcnow()
        page_number = 1
        total_processed = 0
        while True:
            try:
                self.payload_builder.set_date_range(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
                self.payload_builder.sort_by("IssueDate", ascending=False)
                self.payload_builder.set_page_info(page_size=10, page_number=page_number)

                payload = self.payload_builder.to_dict()
                response = requests.post(self.url, headers=self.headers, json=payload)
                results = response.json().get("Result", {}).get("EntityResults", [])

                for record in results:
                    result = self.processor.upsert(record)
                    print(f"➡️ {record.get('CaseNumber')}: {result}")
                    if result in ["new", "updated"]:
                        enriched_record = self.processor.supabase.get_existing_hash(record.get("CaseNumber"))[0]
                        self.processor.match_subscriptions(enriched_record)
                    total_processed += 1

                if len(results) < 10:
                    break
                page_number += 1
            except Exception as e:
                print("❌ Error during fetch:", e)
                traceback.print_exc()

        print(f"✅ Fetched and processed {total_processed} permits")

if __name__ == "__main__":
    supabase = SupabaseService(
        subabase_url=config.NEXT_PUBLIC_SUPABASE_URL,
        service_key=config.SUPABASE_SERVICE_KEY
    )
    notifier = PermitNotifier(
        host=config.SMTP_HOST,
        port=int(config.SMTP_PORT),
        user=config.SMTP_USER,
        password=config.SMTP_PASS,
        from_email=config.SMTP_FROM_EMAIL,
        from_name=config.FROM_NAME
    )
    processor = PermitProcessor(
        supabase, 
        notifier, 
        config.MAPBOX_API_KEY
    )
    fetcher = PermitFetcher(processor)
    supabase.delete_old_permits(days_old=90)  # 🧹 Cleanup step
    fetcher.fetch()
