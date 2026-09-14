-- =============================================================================
-- SupplyShield AI — Benchmark Synthetic Dataset Seed Script
-- Sources & Distributions Grounded In:
-- 1. Kaggle DataCo Global Supply Chain Dataset
-- 2. NOAA Storm Events Database
-- 3. WHO & FDA Cold-Chain Quality Guidelines (2°C - 8°C Biologics & Vaccines)
-- 4. UNCTAD Maritime Logistics Benchmarks
-- =============================================================================

-- ── 1. CARRIERS ─────────────────────────────────────────────────────────────
INSERT INTO carriers (id, code, name, contact_email, is_active, created_at_utc)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'MAERSK', 'Maersk Ocean Line', 'ops@maersk.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000002', 'MSC', 'Mediterranean Shipping Co', 'support@msc.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000003', 'DHL', 'DHL Global Forwarding', 'dispatch@dhl.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000004', 'FEDEX', 'FedEx Freight Logistics', 'freight@fedex.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000005', 'KN', 'Kuehne + Nagel Logistics', 'ocean@kuehne-nagel.com', TRUE, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000006', 'SCHENKER', 'DB Schenker Logistics', 'coldchain@dbschenker.com', TRUE, NOW() - INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;

-- ── 2. ROUTES ───────────────────────────────────────────────────────────────
INSERT INTO routes (id, name, origin, destination, estimated_hours, carrier_code, is_active, created_at_utc)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'Shanghai - Rotterdam Express', 'Port of Shanghai, CN', 'Port of Rotterdam, NL', 672, 'MAERSK', TRUE, NOW() - INTERVAL '40 days'),
  ('20000000-0000-0000-0000-000000000002', 'Mumbai - Dubai - Hamburg Pharma Lane', 'JNPT Mumbai, IN', 'Hamburg Port, DE', 480, 'DHL', TRUE, NOW() - INTERVAL '40 days'),
  ('20000000-0000-0000-0000-000000000003', 'Los Angeles - Chicago Rail-Road', 'Port of LA, US', 'Chicago Logistics Hub, US', 72, 'FEDEX', TRUE, NOW() - INTERVAL '40 days'),
  ('20000000-0000-0000-0000-000000000004', 'Singapore - Frankfurt Air Freight', 'Changi Airport, SG', 'Frankfurt CargoCity, DE', 24, 'SCHENKER', TRUE, NOW() - INTERVAL '40 days'),
  ('20000000-0000-0000-0000-000000000005', 'Busan - Long Beach Transpacific', 'Port of Busan, KR', 'Long Beach Terminal, US', 384, 'MSC', TRUE, NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- ── 3. ROUTE SEGMENTS ───────────────────────────────────────────────────────
INSERT INTO route_segments (id, route_id, sequence_order, from_location, to_location, transport_mode, estimated_hours)
VALUES
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 1, 'Port of Shanghai', 'Strait of Malacca', 'Sea', 96),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 2, 'Strait of Malacca', 'Suez Canal', 'Sea', 240),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 3, 'Suez Canal', 'Port of Rotterdam', 'Sea', 336),

  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 1, 'JNPT Mumbai', 'Jebel Ali Dubai', 'Sea', 72),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 2, 'Jebel Ali Dubai', 'Frankfurt Hub', 'Air', 18),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000002', 3, 'Frankfurt Hub', 'Hamburg Port', 'Road', 10),

  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 1, 'Port of LA', 'Barstow Rail Yard', 'Road', 6),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000003', 2, 'Barstow Rail Yard', 'Chicago Intermodal', 'Rail', 66)
ON CONFLICT (id) DO NOTHING;

-- ── 4. FLEET VEHICLES ───────────────────────────────────────────────────────
INSERT INTO vehicles (id, asset_code, asset_type, status, capacity_kg, current_location, last_seen_at_utc, carrier_id, created_at_utc)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'TRK-COLD-101', 'Refrigerated Heavy Truck', 'Idle', 22000.00, 'Rotterdam Distribution Center, NL', NOW() - INTERVAL '12 minutes', '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000002', 'TRK-COLD-102', 'Temperature-Controlled Van', 'Available', 8500.00, 'Frankfurt CargoCenter, DE', NOW() - INTERVAL '5 minutes', '10000000-0000-0000-0000-000000000003', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000003', 'TRK-DRY-201', 'Dry Freight Trailer', 'InUse', 28000.00, 'Chicago Terminal 4, US', NOW() - INTERVAL '20 minutes', '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000004', 'TRK-COLD-103', 'Deep Freeze Reefer', 'Idle', 24000.00, 'Jebel Ali Free Zone, AE', NOW() - INTERVAL '8 minutes', '10000000-0000-0000-0000-000000000005', NOW() - INTERVAL '30 days'),
  ('30000000-0000-0000-0000-000000000005', 'TRK-DRY-202', 'Heavy Hauler', 'Available', 32000.00, 'Port of Long Beach, US', NOW() - INTERVAL '30 minutes', '10000000-0000-0000-0000-000000000002', NOW() - INTERVAL '30 days')
ON CONFLICT (asset_code) DO NOTHING;

-- ── 5. DISRUPTIONS ──────────────────────────────────────────────────────────
INSERT INTO disruptions (id, title, disruption_type, severity, affected_region, description, started_at_utc, is_active, created_at_utc)
VALUES
  ('40000000-0000-0000-0000-000000000001', 'Typhoon Malakas - East China Sea Gale Warning', 'Weather', 'Critical', 'East China Sea / Taiwan Strait', 'Category 4 equivalent storm causing port closures at Ningbo-Zhoushan and Shanghai. Vessel diversions required.', NOW() - INTERVAL '18 hours', TRUE, NOW() - INTERVAL '18 hours'),
  ('40000000-0000-0000-0000-000000000002', 'Rotterdam Port Berth Congestion', 'PortCongestion', 'High', 'Port of Rotterdam, Maasvlakte', 'Automated container terminal labor slowdown resulting in 36-hour average berth waiting times.', NOW() - INTERVAL '2 days', TRUE, NOW() - INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000003', 'Suez Southbound Convoy Transit Delay', 'CarrierIssue', 'Medium', 'Suez Canal, Egypt', 'Grounding incident on single-lane segment creating 14-hour transit backlog for southbound vessels.', NOW() - INTERVAL '8 hours', TRUE, NOW() - INTERVAL '8 hours'),
  ('40000000-0000-0000-0000-000000000004', 'European Rail Freight Strike', 'Other', 'High', 'North Rhine-Westphalia Rail Corridor', 'Cross-border rail union strike affecting container freight between Germany and Netherlands.', NOW() - INTERVAL '12 hours', TRUE, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- ── 6. SHIPMENTS ────────────────────────────────────────────────────────────
INSERT INTO shipments (id, tracking_number, origin, destination, carrier_code, status, priority, estimated_arrival_utc, is_cold_chain, route_id, risk_score, created_at_utc, updated_at_utc)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'SHP-2026-EU8821', 'Shanghai, CN', 'Rotterdam, NL', 'MAERSK', 'AtRisk', 'Critical', NOW() + INTERVAL '14 days', FALSE, '20000000-0000-0000-0000-000000000001', 0.8850, NOW() - INTERVAL '10 days', NOW()),
  ('50000000-0000-0000-0000-000000000002', 'SHP-2026-BIO9942', 'Mumbai, IN', 'Hamburg, DE', 'DHL', 'AtRisk', 'Critical', NOW() + INTERVAL '4 days', TRUE, '20000000-0000-0000-0000-000000000002', 0.9400, NOW() - INTERVAL '6 days', NOW()),
  ('50000000-0000-0000-0000-000000000003', 'SHP-2026-US4419', 'Los Angeles, US', 'Chicago, US', 'FEDEX', 'InTransit', 'Medium', NOW() + INTERVAL '2 days', FALSE, '20000000-0000-0000-0000-000000000003', 0.2200, NOW() - INTERVAL '1 day', NOW()),
  ('50000000-0000-0000-0000-000000000004', 'SHP-2026-MED7730', 'Singapore, SG', 'Frankfurt, DE', 'SCHENKER', 'InTransit', 'High', NOW() + INTERVAL '16 hours', TRUE, '20000000-0000-0000-0000-000000000004', 0.3150, NOW() - INTERVAL '18 hours', NOW()),
  ('50000000-0000-0000-0000-000000000005', 'SHP-2026-PAC3312', 'Busan, KR', 'Long Beach, US', 'MSC', 'Delayed', 'High', NOW() + INTERVAL '7 days', FALSE, '20000000-0000-0000-0000-000000000005', 0.6400, NOW() - INTERVAL '8 days', NOW())
ON CONFLICT (tracking_number) DO NOTHING;

-- ── 7. SHIPMENT DISRUPTIONS ─────────────────────────────────────────────────
INSERT INTO shipment_disruptions (id, shipment_id, disruption_id, estimated_delay_hours, impact_notes, created_at_utc)
VALUES
  (gen_random_uuid(), '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 48, 'Vessel anchored off Zhoushan awaiting typhoon passage. ETA pushed by 48h.', NOW() - INTERVAL '16 hours'),
  (gen_random_uuid(), '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 36, 'Secondary delay anticipated at destination terminal berth.', NOW() - INTERVAL '12 hours'),
  (gen_random_uuid(), '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 14, 'Suez northbound transit delay risking cold-chain buffer expiry.', NOW() - INTERVAL '6 hours')
ON CONFLICT (shipment_id, disruption_id) DO NOTHING;

-- ── 8. SENSORS (WHO 2°C - 8°C Standards) ────────────────────────────────────
INSERT INTO sensors (id, sensor_code, shipment_id, min_temp_celsius, max_temp_celsius, last_reading_celsius, last_reading_at_utc, status, current_excursion_severity, created_at_utc)
VALUES
  ('60000000-0000-0000-0000-000000000001', 'SEN-VACC-001', '50000000-0000-0000-0000-000000000002', 2.00, 8.00, 9.80, NOW() - INTERVAL '5 minutes', 'Excursion', 'Critical', NOW() - INTERVAL '6 days'),
  ('60000000-0000-0000-0000-000000000002', 'SEN-PHARM-002', '50000000-0000-0000-0000-000000000004', 2.00, 8.00, 4.30, NOW() - INTERVAL '10 minutes', 'Normal', 'Low', NOW() - INTERVAL '18 hours')
ON CONFLICT (sensor_code) DO NOTHING;

-- ── 9. COLD CHAIN ALERT ─────────────────────────────────────────────────────
INSERT INTO cold_chain_alerts (id, sensor_id, shipment_id, severity, excursion_peak_celsius, allowed_min_celsius, allowed_max_celsius, excursion_start_utc, duration_minutes, is_acknowledged, created_at_utc)
VALUES
  (gen_random_uuid(), '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'Critical', 9.80, 2.00, 8.00, NOW() - INTERVAL '225 minutes', 225, FALSE, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- ── 10. RECOVERY RECOMMENDATIONS ────────────────────────────────────────────
INSERT INTO recovery_recommendations (id, shipment_id, recommendation_type, title, rationale, severity, confidence, proposed_vehicle_id, estimated_time_saving_minutes, estimated_cost_delta_usd, requires_approval, created_at_utc)
VALUES
  (gen_random_uuid(), '50000000-0000-0000-0000-000000000002', 'FleetRedeploy', 'Deploy Idle Reefer TRK-COLD-103 at Jebel Ali Hub', 'Active cold-chain excursion (9.8°C peak) threatens biologic integrity. Available reefer asset TRK-COLD-103 is staged 14km away at Jebel Ali and can intercept cargo within 45 minutes to restore 4°C environment.', 'Critical', 0.9450, '30000000-0000-0000-0000-000000000004', 720, 1450.00, TRUE, NOW() - INTERVAL '25 minutes'),
  (gen_random_uuid(), '50000000-0000-0000-0000-000000000001', 'Reroute', 'Reroute via Southern Malacca Channel', 'Typhoon Malakas winds exceed vessel safe tolerance. Southern corridor bypass avoids gale radius with minimal fuel consumption penalty.', 'High', 0.8900, NULL, 1440, 3200.00, TRUE, NOW() - INTERVAL '50 minutes')
ON CONFLICT (id) DO NOTHING;

-- ── 11. DECISION AUDIT ──────────────────────────────────────────────────────
INSERT INTO decision_audits (id, operator_id, action_type, target_entity_type, target_entity_id, description, status, approved_at_utc, applied_at_utc, before_state_json, after_state_json)
VALUES
  (gen_random_uuid(), 'OPERATOR-CHEN-04', 'REROUTE_APPROVED', 'Shipment', '50000000-0000-0000-0000-000000000001', 'Operator approved alternative southern channel bypass following Typhoon Malakas alert notification.', 'Approved', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '55 minutes', '{"status": "Delayed", "risk_score": 0.885, "route_id": "20000000-0000-0000-0000-000000000001"}', '{"status": "Rerouted", "risk_score": 0.420, "alternative_route_id": "20000000-0000-0000-0000-000000000005"}')
ON CONFLICT (id) DO NOTHING;
