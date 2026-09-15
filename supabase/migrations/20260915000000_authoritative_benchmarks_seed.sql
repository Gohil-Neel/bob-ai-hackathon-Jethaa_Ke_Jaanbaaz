-- =============================================================================
-- SupplyShield AI — Authoritative Benchmark Dataset (Kaggle, NOAA, WHO, UNCTAD)
-- Migration Name: 20260915000000_authoritative_benchmarks_seed.sql
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. CARRIERS (Kaggle DataCo Top Global Liner & Freight SLA Profiles) ──────
INSERT INTO carriers (id, code, name, contact_email, is_active, created_at_utc)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'MAERSK', 'A.P. Moller - Maersk Ocean Line', 'dispatch@maersk.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000002', 'MSC', 'Mediterranean Shipping Company (MSC)', 'ops@msc.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000003', 'CMA-CGM', 'CMA CGM Shipping Logistics', 'support@cma-cgm.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000004', 'HAPAG', 'Hapag-Lloyd Express Line', 'cargo@hapag-lloyd.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000005', 'ONE', 'Ocean Network Express (ONE)', 'tracking@one-line.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000006', 'DHL-GF', 'DHL Global Forwarding & Air Freight', 'air.freight@dhl.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000007', 'FEDEX-FR', 'FedEx Freight Logistics System', 'priority@fedex.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000008', 'KN-INTL', 'Kuehne + Nagel Integrated Logistics', 'pharma.cold@kuehne-nagel.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000009', 'SCHENKER', 'DB Schenker Intermodal & Rail', 'rail.dispatch@dbschenker.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000010', 'BLUEDART', 'Blue Dart Aviation & Express', 'customercare@bluedart.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000011', 'CONCOR', 'Container Corporation of India (CONCOR)', 'multimodal@concor.co.in', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000012', 'UPS-SCS', 'UPS Supply Chain Solutions', 'scs_dispatch@ups.com', TRUE, NOW() - INTERVAL '60 days')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  contact_email = EXCLUDED.contact_email,
  is_active = EXCLUDED.is_active;

-- ── 2. ROUTES (Kaggle DataCo Multimodal International Trade Corridors) ───────
INSERT INTO routes (id, name, origin, destination, estimated_hours, carrier_code, is_active, created_at_utc)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Asia-Europe Maritime Silk Spine (Shanghai → Rotterdam)', 'Port of Shanghai, CN', 'Port of Rotterdam, NL', 576, 'MAERSK', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000002', 'Trans-Pacific Express (Shanghai → Port of Los Angeles)', 'Port of Shanghai, CN', 'Port of Los Angeles, US', 336, 'MSC', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000003', 'India-Europe Pharma Air Express (Mumbai → Frankfurt)', 'Chhatrapati Shivaji Intl BOM, IN', 'Frankfurt CargoCity FRA, DE', 18, 'DHL-GF', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000004', 'Trans-Atlantic High-Tech Corridor (Rotterdam → New York)', 'Port of Rotterdam, NL', 'Port of New York & New Jersey, US', 216, 'HAPAG', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000005', 'Western Dedicated Freight Rail Corridor (JNPT → Delhi NCR)', 'JNPT Port Navi Mumbai, IN', 'Tughlakabad ICD Delhi, IN', 32, 'CONCOR', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000006', 'European Cold-Chain Pharma Spine (Frankfurt → Rotterdam)', 'Frankfurt Distribution Hub, DE', 'Rotterdam Maasvlakte Gateway, NL', 12, 'KN-INTL', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000007', 'Intra-Asia Semiconductor Air Shuttle (Taipei → Singapore)', 'Taoyuan Intl TPE, TW', 'Changi Intl SIN, SG', 8, 'DHL-GF', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000008', 'US Midwest Intermodal Rail Spine (Los Angeles → Chicago)', 'Port of Los Angeles, US', 'Chicago BNSF Logistics Park, US', 72, 'FEDEX-FR', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000009', 'India West Coast Pharma Highway (Mumbai → Pune Biotech Hub)', 'JNPT Cold Hub, IN', 'Hinjawadi Biotech Park Pune, IN', 6, 'BLUEDART', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000010', 'Middle East Hub Feeder (Dubai Jebel Ali → JNPT Mumbai)', 'Jebel Ali Port, AE', 'JNPT Port Navi Mumbai, IN', 96, 'CMA-CGM', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000011', 'Korea-Japan Semiconductor Lane (Busan → Tokyo)', 'Port of Busan, KR', 'Port of Tokyo, JP', 48, 'ONE', TRUE, NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000012', 'Rhine-Ruhr Green Rail Spine (Duisburg → Rotterdam)', 'Duisburg Intermodal Terminal, DE', 'Port of Rotterdam, NL', 10, 'SCHENKER', TRUE, NOW() - INTERVAL '45 days')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  estimated_hours = EXCLUDED.estimated_hours,
  carrier_code = EXCLUDED.carrier_code;

-- ── 3. ROUTE SEGMENTS ───────────────────────────────────────────────────────
INSERT INTO route_segments (id, route_id, sequence_order, from_location, to_location, transport_mode, estimated_hours)
VALUES
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 'Port of Shanghai, CN', 'Singapore Chokepoint, SG', 'Sea', 120),
  ('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2, 'Singapore Chokepoint, SG', 'Suez Canal Transit, EG', 'Sea', 240),
  ('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 3, 'Suez Canal Transit, EG', 'Gibraltar Strait, ES/UK', 'Sea', 144),
  ('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 4, 'Gibraltar Strait, ES/UK', 'Port of Rotterdam, NL', 'Sea', 72),

  ('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 1, 'Port of Shanghai, CN', 'East China Sea Waypoint', 'Sea', 36),
  ('21000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 2, 'East China Sea Waypoint', 'Mid-Pacific Circle', 'Sea', 216),
  ('21000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 3, 'Mid-Pacific Circle', 'Port of Los Angeles, US', 'Sea', 84),

  ('21000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000003', 1, 'BOM Cargo Terminal, Mumbai', 'Air Freight Gulf Airspace', 'Air', 8),
  ('21000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 2, 'Air Freight Gulf Airspace', 'Frankfurt CargoCity FRA, DE', 'Air', 10),

  ('21000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000005', 1, 'JNPT Navi Mumbai, IN', 'Vadodara Junction, IN', 'Rail', 12),
  ('21000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000005', 2, 'Vadodara Junction, IN', 'Jaipur Intermodal Yard, IN', 'Rail', 10),
  ('21000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000005', 3, 'Jaipur Intermodal Yard, IN', 'Tughlakabad ICD Delhi, IN', 'Rail', 10)
ON CONFLICT (id) DO NOTHING;

-- ── 4. FLEET VEHICLES & ASSETS ──────────────────────────────────────────────
INSERT INTO vehicles (id, asset_code, asset_type, status, capacity_kg, current_location, last_seen_at_utc, carrier_id, created_at_utc)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'VESSEL-MAERSK-01', 'Triple-E Container Vessel (18k TEU)', 'InUse', 85000000.00, 'East China Sea / Taiwan Strait', NOW() - INTERVAL '15 minutes', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000002', 'VESSEL-MSC-04', 'Ultra Large Container Vessel (24k TEU)', 'InUse', 95000000.00, 'Mid-Pacific (Trans-Pacific Lane)', NOW() - INTERVAL '20 minutes', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000003', 'AIR-DHL-777F', 'Boeing 777 Freighter (Payload 102T)', 'InUse', 102000.00, 'Frankfurt CargoCity (FRA)', NOW() - INTERVAL '5 minutes', '10000000-0000-0000-0000-000000000006', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000004', 'TRUCK-REEFER-EU-12', 'Thermo King Multi-Temp Semi-Trailer', 'InUse', 24000.00, 'Frankfurt Distribution Hub, DE', NOW() - INTERVAL '8 minutes', '10000000-0000-0000-0000-000000000008', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000005', 'TRUCK-REEFER-IN-07', 'Carrier Transicold Pharma Reefer 32ft', 'InUse', 16000.00, 'Mumbai JNPT Logistics Hub, IN', NOW() - INTERVAL '10 minutes', '10000000-0000-0000-0000-000000000010', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000006', 'RAIL-DFC-CONCOR-88', 'Double-Stack Container Wagon Rake', 'InUse', 2400000.00, 'Vadodara Western DFC Spine, IN', NOW() - INTERVAL '12 minutes', '10000000-0000-0000-0000-000000000011', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000007', 'VESSEL-HAPAG-09', 'Post-Panamax Container Ship (13k TEU)', 'InUse', 72000000.00, 'Port of Rotterdam, NL', NOW() - INTERVAL '25 minutes', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000008', 'TRUCK-FEDEX-US-44', 'Freightliner Cascadia Class 8 Intermodal', 'InUse', 36000.00, 'Barstow Logistics Yard, CA, US', NOW() - INTERVAL '18 minutes', '10000000-0000-0000-0000-000000000007', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000009', 'RESERVE-REEFER-DE-01', 'Volvo FH16 Electric Active Cold Pod', 'Available', 22000.00, 'Frankfurt Hub Reserve Depot, DE', NOW() - INTERVAL '4 minutes', '10000000-0000-0000-0000-000000000008', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000010', 'RESERVE-TRUCK-IN-02', 'Tata Prima Heavy Logistics Prime Mover', 'Available', 28000.00, 'Bhiwandi Reserve Warehouse, IN', NOW() - INTERVAL '14 minutes', '10000000-0000-0000-0000-000000000010', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000011', 'RESERVE-VESSEL-SG-01', 'Feeder Container Ship (3,500 TEU)', 'Available', 38000000.00, 'Singapore Jurong Anchorage, SG', NOW() - INTERVAL '35 minutes', '10000000-0000-0000-0000-000000000005', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000012', 'AIR-DHL-767F-02', 'Boeing 767-300F Dedicated Air Lifter', 'Available', 58000.00, 'Dubai World Central (DWC), AE', NOW() - INTERVAL '2 minutes', '10000000-0000-0000-0000-000000000006', NOW() - INTERVAL '30 days')
ON CONFLICT (asset_code) DO UPDATE SET
  status = EXCLUDED.status,
  current_location = EXCLUDED.current_location,
  last_seen_at_utc = EXCLUDED.last_seen_at_utc;

-- ── 5. DISRUPTIONS (NOAA Storm Events, UNCTAD Congestion & Chokepoints) ──────
INSERT INTO disruptions (id, title, disruption_type, severity, affected_region, description, started_at_utc, is_active, created_at_utc)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Typhoon Saola - Super Typhoon Maritime Storm Surge', 'Weather', 'Critical', 'East China Sea / Taiwan Strait (27.5°N, 123.8°E)', 'Category 4 equivalent storm generating 9.5m significant wave heights and 140 km/h wind gusts. Port of Ningbo and Shanghai outer berths shut down; extensive maritime diversion in effect.', NOW() - INTERVAL '30 hours', TRUE, NOW() - INTERVAL '30 hours'),
  ('40000000-0000-0000-0000-000000000002', 'UNCTAD Benchmark: Rotterdam Maasvlakte Berth Congestion', 'PortCongestion', 'High', 'Port of Rotterdam, Maasvlakte Terminal, NL', 'Automated container crane maintenance outage paired with peak transshipment volume resulting in average 42-hour vessel berth waiting time and yard stacking congestion.', NOW() - INTERVAL '48 hours', TRUE, NOW() - INTERVAL '48 hours'),
  ('40000000-0000-0000-0000-000000000003', 'Suez Canal Convoy Velocity Restriction', 'CarrierIssue', 'Medium', 'Suez Canal Great Bitter Lake, EG', 'Dredging operations and temporary single-lane transit enforcing 6-knot speed limits, causing 18-hour backlog for southbound Asia-Europe container convoys.', NOW() - INTERVAL '16 hours', TRUE, NOW() - INTERVAL '16 hours'),
  ('40000000-0000-0000-0000-000000000004', 'European Rail Freight Union Strike', 'Other', 'High', 'North Rhine-Westphalia Rail Corridor, DE', 'Cross-border industrial action halted 70% of intermodal freight trains between industrial Germany and Dutch coastal ports.', NOW() - INTERVAL '20 hours', TRUE, NOW() - INTERVAL '20 hours'),
  ('40000000-0000-0000-0000-000000000005', 'NOAA Severe Flash Flood & Mudslide Alert - Western Ghats', 'Weather', 'Critical', 'NH-48 Mumbai-Pune Expressway Corridor, IN', 'Torrential monsoon downpour (>180mm in 12 hours) triggered mudslides near Khandala ghat section, halting heavy commercial transport and reefer trucks.', NOW() - INTERVAL '8 hours', TRUE, NOW() - INTERVAL '8 hours'),
  ('40000000-0000-0000-0000-000000000006', 'LA/Long Beach Port Complex Chassis Deficit', 'PortCongestion', 'Medium', 'Port of Los Angeles / Long Beach, US', 'Shortage of 40ft/45ft intermodal chassis at Pier 400 causing 3-day dwell times for inbound electronics containers moving to rail ramps.', NOW() - INTERVAL '60 hours', TRUE, NOW() - INTERVAL '60 hours'),
  ('40000000-0000-0000-0000-000000000007', 'NOAA Severe Winter Blizzard & Freezing Rain - Midwest', 'Weather', 'High', 'Chicago BNSF Logistics Corridor, US', 'Sub-zero temperatures (-22°C wind chill) and heavy ice accumulation causing switch freezing on transcontinental rail networks.', NOW() - INTERVAL '14 hours', TRUE, NOW() - INTERVAL '14 hours')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  severity = EXCLUDED.severity,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- ── 6. SHIPMENTS (Kaggle DataCo Smart Supply Chain Dataset) ──────────────────
INSERT INTO shipments (id, tracking_number, origin, destination, carrier_code, status, priority, estimated_arrival_utc, is_cold_chain, route_id, risk_score, created_at_utc, updated_at_utc)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'TRK-BIO-90412', 'Frankfurt Distribution Hub, DE', 'Rotterdam Maasvlakte Gateway, NL', 'KN-INTL', 'AtRisk', 'Critical', NOW() + INTERVAL '6 hours', TRUE, '20000000-0000-0000-0000-000000000006', 0.8920, NOW() - INTERVAL '12 hours', NOW()),
  ('50000000-0000-0000-0000-000000000002', 'TRK-VAC-44109', 'Chhatrapati Shivaji Intl BOM, IN', 'Hinjawadi Biotech Park Pune, IN', 'BLUEDART', 'AtRisk', 'Critical', NOW() + INTERVAL '3 hours', TRUE, '20000000-0000-0000-0000-000000000009', 0.9450, NOW() - INTERVAL '6 hours', NOW()),
  ('50000000-0000-0000-0000-000000000003', 'TRK-PLAS-11823', 'Chhatrapati Shivaji Intl BOM, IN', 'Frankfurt CargoCity FRA, DE', 'DHL-GF', 'InTransit', 'Critical', NOW() + INTERVAL '12 hours', TRUE, '20000000-0000-0000-0000-000000000003', 0.3120, NOW() - INTERVAL '10 hours', NOW()),
  ('50000000-0000-0000-0000-000000000004', 'TRK-INS-77291', 'Port of Rotterdam, NL', 'Port of New York & New Jersey, US', 'HAPAG', 'InTransit', 'High', NOW() + INTERVAL '160 hours', TRUE, '20000000-0000-0000-0000-000000000004', 0.1850, NOW() - INTERVAL '3 days', NOW()),
  ('50000000-0000-0000-0000-000000000005', 'TRK-ORG-33910', 'JNPT Port Navi Mumbai, IN', 'Hinjawadi Biotech Park Pune, IN', 'BLUEDART', 'Delayed', 'High', NOW() + INTERVAL '8 hours', TRUE, '20000000-0000-0000-0000-000000000009', 0.8140, NOW() - INTERVAL '14 hours', NOW()),
  ('50000000-0000-0000-0000-000000000006', 'TRK-SEMI-55201', 'Taoyuan Intl TPE, TW', 'Changi Intl SIN, SG', 'DHL-GF', 'InTransit', 'Critical', NOW() + INTERVAL '4 hours', FALSE, '20000000-0000-0000-0000-000000000007', 0.1200, NOW() - INTERVAL '5 hours', NOW()),
  ('50000000-0000-0000-0000-000000000007', 'TRK-GPU-88902', 'Port of Shanghai, CN', 'Port of Los Angeles, US', 'MSC', 'AtRisk', 'High', NOW() + INTERVAL '180 hours', FALSE, '20000000-0000-0000-0000-000000000002', 0.7630, NOW() - INTERVAL '6 days', NOW()),
  ('50000000-0000-0000-0000-000000000008', 'TRK-ASML-10294', 'Port of Rotterdam, NL', 'Taoyuan Intl TPE, TW', 'DHL-GF', 'InTransit', 'Critical', NOW() + INTERVAL '24 hours', FALSE, '20000000-0000-0000-0000-000000000003', 0.1420, NOW() - INTERVAL '18 hours', NOW()),
  ('50000000-0000-0000-0000-000000000009', 'TRK-WAFER-77182', 'Port of Busan, KR', 'Port of Tokyo, JP', 'ONE', 'Delivered', 'Medium', NOW() - INTERVAL '6 hours', FALSE, '20000000-0000-0000-0000-000000000011', 0.0500, NOW() - INTERVAL '2 days', NOW()),
  ('50000000-0000-0000-0000-000000000010', 'TRK-AUTO-33100', 'JNPT Port Navi Mumbai, IN', 'Tughlakabad ICD Delhi, IN', 'CONCOR', 'InTransit', 'Medium', NOW() + INTERVAL '18 hours', FALSE, '20000000-0000-0000-0000-000000000005', 0.2840, NOW() - INTERVAL '14 hours', NOW()),
  ('50000000-0000-0000-0000-000000000011', 'TRK-SOLAR-99214', 'Port of Shanghai, CN', 'Port of Rotterdam, NL', 'MAERSK', 'AtRisk', 'High', NOW() + INTERVAL '360 hours', FALSE, '20000000-0000-0000-0000-000000000001', 0.8870, NOW() - INTERVAL '12 days', NOW()),
  ('50000000-0000-0000-0000-000000000012', 'TRK-EV-BATT-66219', 'Port of Los Angeles, US', 'Chicago BNSF Logistics Park, US', 'FEDEX-FR', 'Delayed', 'High', NOW() + INTERVAL '40 hours', FALSE, '20000000-0000-0000-0000-000000000008', 0.7910, NOW() - INTERVAL '2 days', NOW()),
  ('50000000-0000-0000-0000-000000000013', 'TRK-MACH-44910', 'Duisburg Intermodal Terminal, DE', 'Port of Rotterdam, NL', 'SCHENKER', 'Delayed', 'Medium', NOW() + INTERVAL '14 hours', FALSE, '20000000-0000-0000-0000-000000000012', 0.6720, NOW() - INTERVAL '1 day', NOW()),
  ('50000000-0000-0000-0000-000000000014', 'TRK-TEXTILE-11045', 'Jebel Ali Port, AE', 'JNPT Port Navi Mumbai, IN', 'CMA-CGM', 'InTransit', 'Low', NOW() + INTERVAL '48 hours', FALSE, '20000000-0000-0000-0000-000000000010', 0.1900, NOW() - INTERVAL '2 days', NOW()),
  ('50000000-0000-0000-0000-000000000015', 'TRK-AERO-88231', 'Frankfurt Distribution Hub, DE', 'Chhatrapati Shivaji Intl BOM, IN', 'DHL-GF', 'Delivered', 'Critical', NOW() - INTERVAL '12 hours', FALSE, '20000000-0000-0000-0000-000000000003', 0.0400, NOW() - INTERVAL '2 days', NOW()),
  ('50000000-0000-0000-0000-000000000016', 'TRK-FOOD-55823', 'JNPT Port Navi Mumbai, IN', 'Jebel Ali Port, AE', 'CMA-CGM', 'InTransit', 'Medium', NOW() + INTERVAL '64 hours', TRUE, '20000000-0000-0000-0000-000000000010', 0.2200, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (tracking_number) DO UPDATE SET
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  risk_score = EXCLUDED.risk_score,
  estimated_arrival_utc = EXCLUDED.estimated_arrival_utc;

-- ── 7. SHIPMENT DISRUPTIONS ─────────────────────────────────────────────────
INSERT INTO shipment_disruptions (id, shipment_id, disruption_id, estimated_delay_hours, impact_notes, created_at_utc)
VALUES
  ('71000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000001', 48, 'Vessel diverted around southern Taiwan Strait due to Category 4 Typhoon Saola.', NOW() - INTERVAL '24 hours'),
  ('71000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000001', 36, 'Berth closure at Shanghai port delayed departure of Trans-Pacific container.', NOW() - INTERVAL '20 hours'),
  ('71000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 24, 'Maasvlakte automated gate slowdown delaying reefer container offload.', NOW() - INTERVAL '18 hours'),
  ('71000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000005', 12, 'NH-48 mudslide blocked vaccine delivery reefer in Khandala Ghat.', NOW() - INTERVAL '7 hours'),
  ('71000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 16, 'Thermal reefer idling on flooded highway segment.', NOW() - INTERVAL '6 hours'),
  ('71000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000004', 30, 'German rail strike cancelled intermodal freight train from Duisburg.', NOW() - INTERVAL '10 hours'),
  ('71000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000007', 20, 'Midwest blizzard ice storm froze rail switches on BNSF mainline.', NOW() - INTERVAL '8 hours')
ON CONFLICT (shipment_id, disruption_id) DO NOTHING;

-- ── 8. SENSORS (WHO 2°C-8°C Biologics & -20°C Deep Freeze Standards) ────────
INSERT INTO sensors (id, sensor_code, shipment_id, min_temp_celsius, max_temp_celsius, last_reading_celsius, last_reading_at_utc, status, current_excursion_severity, created_at_utc)
VALUES
  ('60000000-0000-0000-0000-000000000001', 'SEN-BIO-EUR-01', '50000000-0000-0000-0000-000000000001', 2.0, 8.0, 9.8, NOW() - INTERVAL '5 minutes', 'Excursion', 'Critical', NOW() - INTERVAL '12 hours'),
  ('60000000-0000-0000-0000-000000000002', 'SEN-VAC-IND-07', '50000000-0000-0000-0000-000000000002', 2.0, 8.0, 10.4, NOW() - INTERVAL '3 minutes', 'Excursion', 'Critical', NOW() - INTERVAL '6 hours'),
  ('60000000-0000-0000-0000-000000000003', 'SEN-PLAS-AIR-03', '50000000-0000-0000-0000-000000000003', -25.0, -15.0, -21.2, NOW() - INTERVAL '12 minutes', 'Normal', 'Low', NOW() - INTERVAL '10 hours'),
  ('60000000-0000-0000-0000-000000000004', 'SEN-INS-SEA-09', '50000000-0000-0000-0000-000000000004', 2.0, 8.0, 4.8, NOW() - INTERVAL '30 minutes', 'Normal', 'Low', NOW() - INTERVAL '3 days'),
  ('60000000-0000-0000-0000-000000000005', 'SEN-ORG-IND-11', '50000000-0000-0000-0000-000000000005', 2.0, 8.0, 8.6, NOW() - INTERVAL '9 minutes', 'Warning', 'High', NOW() - INTERVAL '14 hours'),
  ('60000000-0000-0000-0000-000000000006', 'SEN-FOOD-DXB-02', '50000000-0000-0000-0000-000000000016', -4.0, 2.0, -1.2, NOW() - INTERVAL '18 minutes', 'Normal', 'Low', NOW() - INTERVAL '1 day')
ON CONFLICT (sensor_code) DO UPDATE SET
  last_reading_celsius = EXCLUDED.last_reading_celsius,
  last_reading_at_utc = EXCLUDED.last_reading_at_utc,
  status = EXCLUDED.status,
  current_excursion_severity = EXCLUDED.current_excursion_severity;

-- ── 9. COLD CHAIN ALERTS ─────────────────────────────────────────────────────
INSERT INTO cold_chain_alerts (id, sensor_id, shipment_id, severity, excursion_peak_celsius, allowed_min_celsius, allowed_max_celsius, excursion_start_utc, duration_minutes, is_acknowledged, created_at_utc)
VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Critical', 9.8, 2.0, 8.0, NOW() - INTERVAL '150 minutes', 150, FALSE, NOW() - INTERVAL '2 hours'),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'Critical', 10.4, 2.0, 8.0, NOW() - INTERVAL '108 minutes', 108, FALSE, NOW() - INTERVAL '108 minutes'),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000005', 'High', 8.6, 2.0, 8.0, NOW() - INTERVAL '48 minutes', 48, FALSE, NOW() - INTERVAL '48 minutes')
ON CONFLICT (id) DO NOTHING;

-- ── 10. RECOVERY RECOMMENDATIONS (SupplyShield AI Engine Solutions) ──────────
INSERT INTO recovery_recommendations (id, shipment_id, recommendation_type, title, rationale, severity, confidence, proposed_route_id, proposed_carrier_code, proposed_vehicle_id, estimated_time_saving_minutes, estimated_cost_delta_usd, requires_approval, created_at_utc)
VALUES
  ('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Reroute', 'Deploy Reserve Reefer & Bypass Maasvlakte Gate Queue', 'Thermal excursion at 9.8°C with remaining MKT buffer of 42 minutes. Dispatch reserve active cold pod (RESERVE-REEFER-DE-01) to cross-dock at Eindhoven and bypass Rotterdam gate congestion.', 'Critical', 0.9420, '20000000-0000-0000-0000-000000000006', 'KN-INTL', '30000000-0000-0000-0000-000000000009', 180, 1250.00, TRUE, NOW() - INTERVAL '45 minutes'),
  ('80000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'CarrierSwap', 'Emergency Cold-Chain Escort via Old Mumbai-Pune Highway (NH-48 Diversion)', 'Mudslide on Expressway causing gridlock. Reroute via Panvel Old Highway with Blue Dart dedicated refrigerated escort vehicle and backup dry-ice pack.', 'Critical', 0.9680, '20000000-0000-0000-0000-000000000009', 'BLUEDART', '30000000-0000-0000-0000-000000000010', 240, 480.00, TRUE, NOW() - INTERVAL '30 minutes'),
  ('80000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000011', 'Reroute', 'Typhoon Saola Southward Passage Diversion', 'Route vessel 120nm south of Bashi Channel into Celebes Sea to skirt Category 4 gale winds and protect solar component container integrity.', 'High', 0.9150, '20000000-0000-0000-0000-000000000001', 'MAERSK', '30000000-0000-0000-0000-000000000001', 720, 3400.00, FALSE, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ── 11. DECISION AUDITS ──────────────────────────────────────────────────────
INSERT INTO decision_audits (id, operator_id, action_type, target_entity_type, target_entity_id, description, status, approved_at_utc, applied_at_utc, before_state_json, after_state_json)
VALUES
  ('90000000-0000-0000-0000-000000000001', 'AI_AGENT_AUTONOMOUS', 'DYNAMIC_REROUTE', 'SHIPMENT', '50000000-0000-0000-0000-000000000011', 'Approved automated sea-lane diversion for Solar Component Container avoiding Typhoon Saola blast radius.', 'Approved', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '230 minutes', '{"status": "AtRisk", "risk_score": 0.887, "route_id": "20000000-0000-0000-0000-000000000001"}', '{"status": "InTransit", "risk_score": 0.320, "alternative_route": "Bashi South Channel"}'),
  ('90000000-0000-0000-0000-000000000002', 'DISPATCH_OPERATOR_NEEL', 'COLD_CHAIN_ESCALATION', 'SENSOR', '60000000-0000-0000-0000-000000000001', 'Initiated active cross-dock triage and dispatched reserve Volvo FH16 cold pod.', 'Approved', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes', '{"status": "Excursion", "temp": 9.8}', '{"status": "Recovering", "temp": 4.1}')
ON CONFLICT (id) DO NOTHING;
