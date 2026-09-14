# SupplyShield AI Severity & Risk Guide

## Severity
Use:
- NORMAL
- LOW
- MEDIUM
- HIGH
- CRITICAL

## Cold Chain
Separate:
Configured deterministic rule → excursion detection → severity → optional ML anomaly score → watsonx.ai explanation.

AI is not the source of truth for threshold breaches.

Example application configuration:
```json
{
  "min_temperature": 2,
  "max_temperature": 8,
  "warning_duration_minutes": 15,
  "high_duration_minutes": 60,
  "critical_duration_minutes": 120
}
```

These are example application settings, NOT universal regulatory standards.

Evaluate readings using configured shipment/sensor limits, excursion duration and recovery. Missing telemetry is a data gap, not automatically an excursion.

## ML
ML may detect unusual behavior, but deterministic configured rules decide threshold status. Store model/version information for persisted predictions.

## Risk
Risk may consider disruption impact, delay, priority, cargo value, cold-chain exposure and route risk. Prototype weights are application choices, not industry standards.

## AI Guardrails
AI must not invent operational facts, regulatory requirements, sensor values or completed actions. AI explains verified results.

## UI
Always combine severity text/icon with visual styling. Do not rely on color alone.

NORMAL = informational
LOW = monitor
MEDIUM = attention
HIGH = action required
CRITICAL = immediate operational attention

## Tests
Cover normal readings, boundaries, short/long excursions, recovery, data gaps, multiple excursions, invalid relationships and severity transitions.
