-- =============================================================================
-- SupplyShield AI — Supabase GitHub CI/CD Migration
-- Migration Name: 20260914000000_initial_schema.sql
-- Description: Creates all 14 tables, indexes, constraints, and relationships
--              automatically when pushed to the connected GitHub repository branch.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. CARRIERS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT uq_carriers_code UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS ix_carriers_is_active ON carriers(is_active);

-- ── 2. ROUTES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    estimated_hours INT NOT NULL,
    carrier_code VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS ix_routes_is_active ON routes(is_active);
CREATE INDEX IF NOT EXISTS ix_routes_origin_destination ON routes(origin, destination);

-- ── 3. ROUTE SEGMENTS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL,
    sequence_order INT NOT NULL,
    from_location VARCHAR(200) NOT NULL,
    to_location VARCHAR(200) NOT NULL,
    transport_mode VARCHAR(50) NOT NULL,
    estimated_hours INT NOT NULL,
    CONSTRAINT fk_route_segments_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_route_segments_route_seq ON route_segments(route_id, sequence_order);

-- ── 4. VEHICLES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_code VARCHAR(50) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    capacity_kg NUMERIC(10, 2) NOT NULL,
    current_location VARCHAR(200) NOT NULL,
    last_seen_at_utc TIMESTAMPTZ,
    carrier_id UUID,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT uq_vehicles_asset_code UNIQUE (asset_code),
    CONSTRAINT fk_vehicles_carrier FOREIGN KEY (carrier_id) REFERENCES carriers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS ix_vehicles_carrier_id ON vehicles(carrier_id);

-- ── 5. SHIPMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(50) NOT NULL,
    origin VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    carrier_code VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    estimated_arrival_utc TIMESTAMPTZ,
    is_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    route_id UUID,
    risk_score NUMERIC(5, 4),
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    updated_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT uq_shipments_tracking_number UNIQUE (tracking_number),
    CONSTRAINT fk_shipments_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS ix_shipments_priority ON shipments(priority);
CREATE INDEX IF NOT EXISTS ix_shipments_carrier_code ON shipments(carrier_code);
CREATE INDEX IF NOT EXISTS ix_shipments_is_cold_chain ON shipments(is_cold_chain);
CREATE INDEX IF NOT EXISTS ix_shipments_route_id ON shipments(route_id);

-- ── 6. DISRUPTIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disruptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    disruption_type VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    affected_region VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    started_at_utc TIMESTAMPTZ NOT NULL,
    resolved_at_utc TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS ix_disruptions_type ON disruptions(disruption_type);
CREATE INDEX IF NOT EXISTS ix_disruptions_severity ON disruptions(severity);
CREATE INDEX IF NOT EXISTS ix_disruptions_is_active ON disruptions(is_active);

-- ── 7. SHIPMENT DISRUPTIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment_disruptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL,
    disruption_id UUID NOT NULL,
    estimated_delay_hours INT,
    impact_notes VARCHAR(1000),
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT uq_shipment_disruptions UNIQUE (shipment_id, disruption_id),
    CONSTRAINT fk_sd_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_sd_disruption FOREIGN KEY (disruption_id) REFERENCES disruptions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_sd_shipment_id ON shipment_disruptions(shipment_id);
CREATE INDEX IF NOT EXISTS ix_sd_disruption_id ON shipment_disruptions(disruption_id);

-- ── 8. VEHICLE ASSIGNMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL,
    shipment_id UUID NOT NULL,
    assigned_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    released_at_utc TIMESTAMPTZ,
    notes VARCHAR(500),
    CONSTRAINT fk_va_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    CONSTRAINT fk_va_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_va_vehicle_shipment ON vehicle_assignments(vehicle_id, shipment_id);

-- ── 9. SENSORS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_code VARCHAR(50) NOT NULL,
    shipment_id UUID NOT NULL,
    min_temp_celsius NUMERIC(6, 2) NOT NULL,
    max_temp_celsius NUMERIC(6, 2) NOT NULL,
    last_reading_celsius NUMERIC(6, 2),
    last_reading_at_utc TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL,
    current_excursion_severity VARCHAR(50),
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT uq_sensors_sensor_code UNIQUE (sensor_code),
    CONSTRAINT fk_sensors_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_sensors_shipment_id ON sensors(shipment_id);
CREATE INDEX IF NOT EXISTS ix_sensors_status ON sensors(status);

-- ── 10. SENSOR READINGS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id UUID NOT NULL,
    temperature_celsius NUMERIC(6, 2) NOT NULL,
    recorded_at_utc TIMESTAMPTZ NOT NULL,
    is_excursion BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_readings_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_sensor_readings_sensor_time ON sensor_readings(sensor_id, recorded_at_utc);
CREATE INDEX IF NOT EXISTS ix_sensor_readings_is_excursion ON sensor_readings(is_excursion);

-- ── 11. COLD CHAIN ALERTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cold_chain_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id UUID NOT NULL,
    shipment_id UUID NOT NULL,
    severity VARCHAR(50) NOT NULL,
    excursion_peak_celsius NUMERIC(6, 2) NOT NULL,
    allowed_min_celsius NUMERIC(6, 2) NOT NULL,
    allowed_max_celsius NUMERIC(6, 2) NOT NULL,
    excursion_start_utc TIMESTAMPTZ NOT NULL,
    excursion_end_utc TIMESTAMPTZ,
    duration_minutes INT,
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at_utc TIMESTAMPTZ,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT fk_cca_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
    CONSTRAINT fk_cca_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_cca_severity ON cold_chain_alerts(severity);
CREATE INDEX IF NOT EXISTS ix_cca_is_acknowledged ON cold_chain_alerts(is_acknowledged);
CREATE INDEX IF NOT EXISTS ix_cca_shipment_id ON cold_chain_alerts(shipment_id);

-- ── 12. RECOVERY RECOMMENDATIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS recovery_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    rationale VARCHAR(2000) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    confidence NUMERIC(5, 4),
    proposed_route_id UUID,
    proposed_carrier_code VARCHAR(50),
    proposed_vehicle_id UUID,
    estimated_time_saving_minutes INT,
    estimated_cost_delta_usd NUMERIC(12, 2),
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT fk_rec_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_rec_shipment_id ON recovery_recommendations(shipment_id);
CREATE INDEX IF NOT EXISTS ix_rec_type ON recovery_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS ix_rec_severity ON recovery_recommendations(severity);

-- ── 13. DECISION AUDITS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decision_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id VARCHAR(200) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_entity_type VARCHAR(100) NOT NULL,
    target_entity_id UUID NOT NULL,
    description VARCHAR(2000) NOT NULL,
    status VARCHAR(50) NOT NULL,
    approved_at_utc TIMESTAMPTZ NOT NULL,
    applied_at_utc TIMESTAMPTZ,
    before_state_json TEXT,
    after_state_json TEXT
);

CREATE INDEX IF NOT EXISTS ix_audit_action_type ON decision_audits(action_type);
CREATE INDEX IF NOT EXISTS ix_audit_target ON decision_audits(target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS ix_audit_status ON decision_audits(status);
CREATE INDEX IF NOT EXISTS ix_audit_approved_at ON decision_audits(approved_at_utc);

-- ── 14. MODEL PREDICTIONS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    context_type VARCHAR(50) NOT NULL,
    context_entity_id UUID NOT NULL,
    prediction_type VARCHAR(100) NOT NULL,
    score NUMERIC(8, 6) NOT NULL,
    raw_output_json TEXT,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT (NOW() AT TIME ZONE 'UTC')
);

CREATE INDEX IF NOT EXISTS ix_pred_context ON model_predictions(context_type, context_entity_id);
CREATE INDEX IF NOT EXISTS ix_pred_model ON model_predictions(model_name);
