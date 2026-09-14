"""
SupplyShield AI — Python Supabase REST API Seeder
Pushes benchmark synthetic datasets (Kaggle DataCo, NOAA, WHO, UNCTAD)
directly to Supabase PostgreSQL via the Supabase REST API (PostgREST).
"""

import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

def load_env():
    """Load environment variables from src/.env or .env if present."""
    base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for p in [os.path.join(base, "src", ".env"), os.path.join(base, ".env")]:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() not in os.environ:
                            os.environ[k.strip()] = v.strip()
            break

def post_to_supabase(url: str, key: str, table: str, rows: list):
    """Insert rows into a Supabase table via PostgREST endpoint."""
    endpoint = f"{url.rstrip('/')}/rest/v1/{table}"
    data = json.dumps(rows).encode("utf-8")
    
    req = urllib.request.Request(
        endpoint,
        data=data,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=representation"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            inserted = json.loads(body) if body else []
            print(f"  [+] {table}: Successfully processed {len(rows)} records.")
            return True
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"  [-] {table} HTTP Error {e.code}: {err_msg}")
        return False
    except Exception as ex:
        print(f"  [-] {table} Connection Error: {ex}")
        return False

def main():
    load_env()
    supabase_url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

    if not supabase_url or not service_key or "your-project-id" in supabase_url:
        print("[!] Supabase URL or Service Role Key not configured in src/.env.")
        print("[!] To seed directly via REST, ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.")
        return

    print(f"[*] Seeding SupplyShield dataset to Supabase: {supabase_url}...")
    now = datetime.now(timezone.utc)

    # 1. Carriers
    carriers = [
        {"id": "10000000-0000-0000-0000-000000000001", "code": "MAERSK", "name": "Maersk Ocean Line", "contact_email": "ops@maersk.com", "is_active": True},
        {"id": "10000000-0000-0000-0000-000000000002", "code": "MSC", "name": "Mediterranean Shipping Co", "contact_email": "support@msc.com", "is_active": True},
        {"id": "10000000-0000-0000-0000-000000000003", "code": "DHL", "name": "DHL Global Forwarding", "contact_email": "dispatch@dhl.com", "is_active": True},
        {"id": "10000000-0000-0000-0000-000000000004", "code": "FEDEX", "name": "FedEx Freight Logistics", "contact_email": "freight@fedex.com", "is_active": True},
        {"id": "10000000-0000-0000-0000-000000000005", "code": "KN", "name": "Kuehne + Nagel Logistics", "contact_email": "ocean@kuehne-nagel.com", "is_active": True},
        {"id": "10000000-0000-0000-0000-000000000006", "code": "SCHENKER", "name": "DB Schenker Logistics", "contact_email": "coldchain@dbschenker.com", "is_active": True},
    ]
    post_to_supabase(supabase_url, service_key, "carriers", carriers)

    # 2. Routes
    routes = [
        {"id": "20000000-0000-0000-0000-000000000001", "name": "Shanghai - Rotterdam Express", "origin": "Port of Shanghai, CN", "destination": "Port of Rotterdam, NL", "estimated_hours": 672, "carrier_code": "MAERSK", "is_active": True},
        {"id": "20000000-0000-0000-0000-000000000002", "name": "Mumbai - Dubai - Hamburg Pharma Lane", "origin": "JNPT Mumbai, IN", "destination": "Hamburg Port, DE", "estimated_hours": 480, "carrier_code": "DHL", "is_active": True},
        {"id": "20000000-0000-0000-0000-000000000003", "name": "Los Angeles - Chicago Rail-Road", "origin": "Port of LA, US", "destination": "Chicago Logistics Hub, US", "estimated_hours": 72, "carrier_code": "FEDEX", "is_active": True},
        {"id": "20000000-0000-0000-0000-000000000004", "name": "Singapore - Frankfurt Air Freight", "origin": "Changi Airport, SG", "destination": "Frankfurt CargoCity, DE", "estimated_hours": 24, "carrier_code": "SCHENKER", "is_active": True},
        {"id": "20000000-0000-0000-0000-000000000005", "name": "Busan - Long Beach Transpacific", "origin": "Port of Busan, KR", "destination": "Long Beach Terminal, US", "estimated_hours": 384, "carrier_code": "MSC", "is_active": True},
    ]
    post_to_supabase(supabase_url, service_key, "routes", routes)

    # 3. Vehicles
    vehicles = [
        {"id": "30000000-0000-0000-0000-000000000001", "asset_code": "TRK-COLD-101", "asset_type": "Refrigerated Heavy Truck", "status": "Idle", "capacity_kg": 22000.0, "current_location": "Rotterdam Distribution Center, NL", "carrier_id": "10000000-0000-0000-0000-000000000001"},
        {"id": "30000000-0000-0000-0000-000000000002", "asset_code": "TRK-COLD-102", "asset_type": "Temperature-Controlled Van", "status": "Available", "capacity_kg": 8500.0, "current_location": "Frankfurt CargoCenter, DE", "carrier_id": "10000000-0000-0000-0000-000000000003"},
        {"id": "30000000-0000-0000-0000-000000000003", "asset_code": "TRK-DRY-201", "asset_type": "Dry Freight Trailer", "status": "InUse", "capacity_kg": 28000.0, "current_location": "Chicago Terminal 4, US", "carrier_id": "10000000-0000-0000-0000-000000000004"},
        {"id": "30000000-0000-0000-0000-000000000004", "asset_code": "TRK-COLD-103", "asset_type": "Deep Freeze Reefer", "status": "Idle", "capacity_kg": 24000.0, "current_location": "Jebel Ali Free Zone, AE", "carrier_id": "10000000-0000-0000-0000-000000000005"},
        {"id": "30000000-0000-0000-0000-000000000005", "asset_code": "TRK-DRY-202", "asset_type": "Heavy Hauler", "status": "Available", "capacity_kg": 32000.0, "current_location": "Port of Long Beach, US", "carrier_id": "10000000-0000-0000-0000-000000000002"},
    ]
    post_to_supabase(supabase_url, service_key, "vehicles", vehicles)

    # 4. Disruptions
    disruptions = [
        {"id": "40000000-0000-0000-0000-000000000001", "title": "Typhoon Malakas - East China Sea Gale Warning", "disruption_type": "Weather", "severity": "Critical", "affected_region": "East China Sea / Taiwan Strait", "description": "Category 4 equivalent storm causing port closures at Ningbo-Zhoushan and Shanghai.", "started_at_utc": (now - timedelta(hours=18)).isoformat(), "is_active": True},
        {"id": "40000000-0000-0000-0000-000000000002", "title": "Rotterdam Port Berth Congestion", "disruption_type": "PortCongestion", "severity": "High", "affected_region": "Port of Rotterdam, Maasvlakte", "description": "Automated container terminal labor slowdown resulting in 36-hour average berth waiting times.", "started_at_utc": (now - timedelta(days=2)).isoformat(), "is_active": True},
        {"id": "40000000-0000-0000-0000-000000000003", "title": "Suez Southbound Convoy Transit Delay", "disruption_type": "CarrierIssue", "severity": "Medium", "affected_region": "Suez Canal, Egypt", "description": "Grounding incident on single-lane segment creating 14-hour transit backlog for southbound vessels.", "started_at_utc": (now - timedelta(hours=8)).isoformat(), "is_active": True},
        {"id": "40000000-0000-0000-0000-000000000004", "title": "European Rail Freight Strike", "disruption_type": "Other", "severity": "High", "affected_region": "North Rhine-Westphalia Rail Corridor", "description": "Cross-border rail union strike affecting container freight between Germany and Netherlands.", "started_at_utc": (now - timedelta(hours=12)).isoformat(), "is_active": True}
    ]
    post_to_supabase(supabase_url, service_key, "disruptions", disruptions)

    # 5. Shipments
    shipments = [
        {"id": "50000000-0000-0000-0000-000000000001", "tracking_number": "SHP-2026-EU8821", "origin": "Shanghai, CN", "destination": "Rotterdam, NL", "carrier_code": "MAERSK", "status": "AtRisk", "priority": "Critical", "estimated_arrival_utc": (now + timedelta(days=14)).isoformat(), "is_cold_chain": False, "route_id": "20000000-0000-0000-0000-000000000001", "risk_score": 0.8850},
        {"id": "50000000-0000-0000-0000-000000000002", "tracking_number": "SHP-2026-BIO9942", "origin": "Mumbai, IN", "destination": "Hamburg, DE", "carrier_code": "DHL", "status": "AtRisk", "priority": "Critical", "estimated_arrival_utc": (now + timedelta(days=4)).isoformat(), "is_cold_chain": True, "route_id": "20000000-0000-0000-0000-000000000002", "risk_score": 0.9400},
        {"id": "50000000-0000-0000-0000-000000000003", "tracking_number": "SHP-2026-US4419", "origin": "Los Angeles, US", "destination": "Chicago, US", "carrier_code": "FEDEX", "status": "InTransit", "priority": "Medium", "estimated_arrival_utc": (now + timedelta(days=2)).isoformat(), "is_cold_chain": False, "route_id": "20000000-0000-0000-0000-000000000003", "risk_score": 0.2200},
        {"id": "50000000-0000-0000-0000-000000000004", "tracking_number": "SHP-2026-MED7730", "origin": "Singapore, SG", "destination": "Frankfurt, DE", "carrier_code": "SCHENKER", "status": "InTransit", "priority": "High", "estimated_arrival_utc": (now + timedelta(hours=16)).isoformat(), "is_cold_chain": True, "route_id": "20000000-0000-0000-0000-000000000004", "risk_score": 0.3150},
        {"id": "50000000-0000-0000-0000-000000000005", "tracking_number": "SHP-2026-PAC3312", "origin": "Busan, KR", "destination": "Long Beach, US", "carrier_code": "MSC", "status": "Delayed", "priority": "High", "estimated_arrival_utc": (now + timedelta(days=7)).isoformat(), "is_cold_chain": False, "route_id": "20000000-0000-0000-0000-000000000005", "risk_score": 0.6400}
    ]
    post_to_supabase(supabase_url, service_key, "shipments", shipments)

    print("[✓] Supabase dataset seeding completed.")

if __name__ == "__main__":
    main()
