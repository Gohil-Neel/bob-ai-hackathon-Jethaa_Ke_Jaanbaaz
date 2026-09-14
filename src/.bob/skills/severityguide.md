# SupplyShield AI — Severity & Risk Guide

## Purpose

This document defines the application's internal operational severity language.

Important: these labels are application classifications. They must not be presented as legal or regulatory classifications unless the project has a documented, applicable regulatory source and the implementation actually follows it.

The problem statement specifically asks the solution to detect cold-chain temperature excursions and classify their regulatory severity before delivery. fileciteturn3file5

---

# 1. Severity Levels

Use four application levels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Each level must be accompanied by text, not only color.

---

# 2. General Operational Severity

## LOW

Meaning:

- limited operational impact,
- no immediate intervention required,
- monitoring is sufficient.

UI:

```text
LOW
Monitor
```

## MEDIUM

Meaning:

- meaningful operational deviation,
- intervention may be useful,
- should be reviewed.

UI:

```text
MEDIUM
Review
```

## HIGH

Meaning:

- significant operational risk,
- likely to affect delivery, cost, or cargo,
- action should be considered promptly.

UI:

```text
HIGH
Action Recommended
```

## CRITICAL

Meaning:

- severe or time-sensitive risk,
- immediate operator attention,
- potential major delivery/cargo/operational consequence.

UI:

```text
CRITICAL
Immediate Attention
```

---

# 3. Cold-Chain Severity Engine

Do not let the AI decide the fundamental severity.

Use deterministic application rules first.

Concept:

```text
Temperature within allowed range
→ NORMAL

Temperature outside range
→ calculate excursion duration and magnitude

Short / limited excursion
→ MEDIUM

Longer or materially significant excursion
→ HIGH

Extreme or prolonged excursion
→ CRITICAL
```

The actual thresholds must be configurable per shipment/product/sensor policy where the data supports that distinction.

Example configuration:

```json
{
  "min_temperature": 2,
  "max_temperature": 8,
  "warning_duration_minutes": 15,
  "high_duration_minutes": 60,
  "critical_duration_minutes": 120
}
```

These numbers are an example application configuration, NOT a universal regulatory standard.

---

# 4. Excursion Calculation

For each reading:

```text
temperature < min_temperature
OR
temperature > max_temperature
```

then mark the reading as outside range.

Calculate:

```text
excursion_start
excursion_end
duration
maximum_deviation
average_deviation
number_of_readings
```

Example:

```text
Allowed: 2–8°C

09:00 8.4°C
09:15 9.1°C
09:30 9.7°C
09:45 10.4°C
```

Output:

```text
Excursion detected
Duration: 45 minutes
Peak: 10.4°C
```

Then apply the configured policy.

---

# 5. Missing Sensor Data

Missing readings must not automatically be classified as safe.

Use:

```text
DATA GAP
```

when readings are missing beyond the configured expected interval.

Example:

```text
Last reading: 09:00
Expected interval: 15 min
No reading through 10:00

Status:
DATA GAP
```

This is operationally different from:

```text
NORMAL
```

---

# 6. Recovery

If temperature returns within the allowed range:

```text
Excursion
→ Recovery
```

Keep the excursion history.

Do not erase the alert simply because the current temperature is normal.

Display:

```text
Current: NORMAL
Previous excursion: HIGH
Duration: 45 min
Recovered: 10:00
```

---

# 7. Shipment Risk

Shipment risk can combine:

```text
Disruption severity
+
Shipment priority
+
Expected delay
+
Cargo value
+
Cold-chain state
+
Route risk
```

Do not blindly sum these values.

Use a documented scoring model.

Example conceptual model:

```text
risk_score =
    disruption_component
  + priority_component
  + delay_component
  + cold_chain_component
  + route_component
```

Normalize the result before mapping it to a severity level.

---

# 8. Recommendation Confidence

Confidence is separate from severity.

Example:

```text
Severity: HIGH
Confidence: 92%
```

means:

- the operational situation is high risk,
- the system is highly confident in its calculation.

Do not interpret:

```text
Confidence = severity
```

They are different concepts.

---

# 9. AI Confidence

AI confidence should not replace deterministic evidence.

Use:

```text
Evidence confidence
```

where possible.

If AI cannot confidently answer:

```text
Insufficient data to make a reliable recommendation.
```

is preferable to fabricated certainty.

---

# 10. UI Severity Rules

Use semantic visual indicators:

```text
CRITICAL → red
HIGH → orange
MEDIUM → yellow
LOW → green
```

Always pair with:

```text
label
icon/status
```

Do not rely on color alone.

---

# 11. Alert Escalation

Conceptual flow:

```text
NORMAL
   ↓
OUT OF RANGE
   ↓
MEDIUM
   ↓
HIGH
   ↓
CRITICAL
```

Escalation depends on:

```text
duration
magnitude
shipment policy
data quality
```

Do not automatically escalate solely because one reading is slightly outside range unless the configured policy says so.

---

# 12. Severity Display Format

Preferred:

```text
CRITICAL
2h 18m excursion
Peak: 11.2°C
Allowed: 2–8°C
Action: Immediate review
```

Not:

```text
RED!!!
```

---

# 13. Regulatory Language Guardrail

When the UI or AI discusses "regulatory severity":

1. identify the relevant product/shipment policy,
2. identify the applicable regulation/source,
3. apply only supported rules,
4. show the basis,
5. distinguish application severity from regulatory classification.

If no supported regulatory rule is available:

```text
Regulatory classification unavailable.
Application severity: HIGH.
Reason: excursion exceeded configured operational threshold.
```

Never invent a regulation.

---

# 14. Severity Testing

Test at least:

```text
[ ] Normal reading
[ ] Boundary reading
[ ] Slight excursion
[ ] Short excursion
[ ] Long excursion
[ ] Extreme excursion
[ ] Recovery
[ ] Missing readings
[ ] Multiple excursions
[ ] Sensor failure
```

The exact thresholds are implementation parameters and must be documented with their source/assumption.
