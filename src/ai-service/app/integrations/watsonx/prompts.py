"""
SupplyShield AI — Logistics Prompt Builders

Builds IBM Granite prompts from verified structured facts only.

Rules:
  - Every field used in a prompt comes from the verified facts dict — never from
    free-form text or user input.
  - Unknown / missing fields are rendered as "N/A" to prevent prompt injection.
  - Output format is plain English suitable for a logistics operator dashboard.
"""
from __future__ import annotations

from typing import Any, Dict


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe(facts: Dict[str, Any], key: str, default: str = "N/A") -> str:
    """Return a string-safe fact value, falling back to `default`."""
    val = facts.get(key)
    if val is None or str(val).strip() == "":
        return default
    return str(val).strip()


def _system_block() -> str:
    return (
        "You are SupplyShield AI, an expert logistics risk analyst assistant. "
        "You provide concise, grounded analysis based ONLY on the verified facts below. "
        "Do NOT invent shipment IDs, ETAs, costs, sensor values, or carrier names. "
        "If information is missing, say so. "
        "Keep your response under 200 words and use plain English.\n\n"
    )


# ---------------------------------------------------------------------------
# Prompt builders — one per context type
# ---------------------------------------------------------------------------

def build_shipment_prompt(facts: Dict[str, Any]) -> str:
    """
    Builds a prompt explaining a shipment's current risk status.

    Expected facts keys (all optional — missing keys render as N/A):
        tracking_number, origin, destination, carrier, status, priority,
        risk_score, is_cold_chain, estimated_arrival_utc,
        active_disruptions (list of disruption titles)
    """
    disruptions = facts.get("active_disruptions") or []
    disruption_text = (
        "\n".join(f"  - {d}" for d in disruptions)
        if disruptions
        else "  None reported"
    )

    return (
        f"{_system_block()}"
        f"### Shipment Risk Analysis\n\n"
        f"Tracking Number : {_safe(facts, 'tracking_number')}\n"
        f"Origin          : {_safe(facts, 'origin')}\n"
        f"Destination     : {_safe(facts, 'destination')}\n"
        f"Carrier         : {_safe(facts, 'carrier')}\n"
        f"Status          : {_safe(facts, 'status')}\n"
        f"Priority        : {_safe(facts, 'priority')}\n"
        f"Risk Score      : {_safe(facts, 'risk_score')} / 1.0\n"
        f"Cold Chain      : {_safe(facts, 'is_cold_chain')}\n"
        f"Est. Arrival    : {_safe(facts, 'estimated_arrival_utc')}\n\n"
        f"Active disruptions affecting this shipment:\n{disruption_text}\n\n"
        f"### Task\n"
        f"Explain the current risk level for this shipment, identify the primary risk drivers "
        f"from the disruptions listed, and recommend the single most important operator action.\n\n"
        f"### Analysis\n"
    )


def build_disruption_prompt(facts: Dict[str, Any]) -> str:
    """
    Builds a prompt analysing a logistics disruption and its operational impact.

    Expected facts keys:
        title, disruption_type, severity, affected_region, description,
        started_at_utc, affected_shipment_count, affected_shipments (list)
    """
    shipments = facts.get("affected_shipments") or []
    shipment_text = (
        "\n".join(f"  - {s}" for s in shipments[:10])  # cap at 10 for prompt length
        if shipments
        else "  None identified"
    )

    return (
        f"{_system_block()}"
        f"### Disruption Impact Analysis\n\n"
        f"Title           : {_safe(facts, 'title')}\n"
        f"Type            : {_safe(facts, 'disruption_type')}\n"
        f"Severity        : {_safe(facts, 'severity')}\n"
        f"Affected Region : {_safe(facts, 'affected_region')}\n"
        f"Started         : {_safe(facts, 'started_at_utc')}\n"
        f"Description     : {_safe(facts, 'description')}\n\n"
        f"Affected shipments ({_safe(facts, 'affected_shipment_count', '0')} total):\n"
        f"{shipment_text}\n\n"
        f"### Task\n"
        f"Summarise the operational impact of this disruption on the affected shipments, "
        f"estimate downstream logistics risk, and recommend prioritised recovery actions "
        f"for the operator.\n\n"
        f"### Analysis\n"
    )


def build_cold_chain_prompt(facts: Dict[str, Any]) -> str:
    """
    Builds a prompt for a cold-chain temperature excursion event.

    Expected facts keys:
        sensor_id, shipment_tracking_number, current_temp_c, min_threshold_c,
        max_threshold_c, excursion_severity, excursion_duration_minutes,
        cargo_description, last_reading_utc
    """
    return (
        f"{_system_block()}"
        f"### Cold-Chain Excursion Analysis\n\n"
        f"Sensor ID          : {_safe(facts, 'sensor_id')}\n"
        f"Shipment           : {_safe(facts, 'shipment_tracking_number')}\n"
        f"Current Temp       : {_safe(facts, 'current_temp_c')} °C\n"
        f"Safe Range         : {_safe(facts, 'min_threshold_c')} °C – "
        f"{_safe(facts, 'max_threshold_c')} °C\n"
        f"Excursion Severity : {_safe(facts, 'excursion_severity')}\n"
        f"Duration           : {_safe(facts, 'excursion_duration_minutes')} minutes\n"
        f"Cargo              : {_safe(facts, 'cargo_description')}\n"
        f"Last Reading UTC   : {_safe(facts, 'last_reading_utc')}\n\n"
        f"### Task\n"
        f"Explain the risk posed by this temperature excursion to the cargo, "
        f"assess whether the excursion is still ongoing, and state the most urgent "
        f"corrective action the operator should take right now.\n\n"
        f"### Analysis\n"
    )


def build_reroute_prompt(facts: Dict[str, Any]) -> str:
    """
    Builds a prompt recommending a reroute for a disrupted shipment.

    Expected facts keys:
        tracking_number, current_route_name, origin, destination, carrier,
        risk_score, disruption_titles (list), alternative_routes (list of dicts
        with keys: name, carrier, eta_delta_hours, cost_delta_usd, risk_score)
    """
    disruptions = facts.get("disruption_titles") or []
    disruption_text = (
        "\n".join(f"  - {d}" for d in disruptions)
        if disruptions
        else "  None"
    )

    alternatives = facts.get("alternative_routes") or []
    if alternatives:
        alt_lines = []
        for i, alt in enumerate(alternatives[:5], start=1):
            eta_d = alt.get("eta_delta_hours", "N/A")
            cost_d = alt.get("cost_delta_usd", "N/A")
            r = alt.get("risk_score", "N/A")
            alt_lines.append(
                f"  {i}. {alt.get('name','N/A')} via {alt.get('carrier','N/A')} "
                f"| ETA delta: {eta_d}h | Cost delta: ${cost_d} | Risk: {r}"
            )
        alt_text = "\n".join(alt_lines)
    else:
        alt_text = "  No alternatives available"

    return (
        f"{_system_block()}"
        f"### Reroute Recommendation\n\n"
        f"Shipment        : {_safe(facts, 'tracking_number')}\n"
        f"Current Route   : {_safe(facts, 'current_route_name')}\n"
        f"Origin          : {_safe(facts, 'origin')}\n"
        f"Destination     : {_safe(facts, 'destination')}\n"
        f"Carrier         : {_safe(facts, 'carrier')}\n"
        f"Current Risk    : {_safe(facts, 'risk_score')} / 1.0\n\n"
        f"Active disruptions:\n{disruption_text}\n\n"
        f"Alternative routes evaluated:\n{alt_text}\n\n"
        f"### Task\n"
        f"Recommend whether the shipment should be rerouted, and if so which alternative "
        f"is best given the trade-off between risk reduction, ETA impact, and cost. "
        f"Explain your reasoning in plain language for the operator.\n\n"
        f"### Recommendation\n"
    )


def build_risk_score_explanation_prompt(facts: Dict[str, Any]) -> str:
    """
    Builds a prompt explaining a computed ML risk score.

    Expected facts keys:
        tracking_number, ml_risk_score, feature_contributions (dict),
        model_version
    """
    contributions = facts.get("feature_contributions") or {}
    contrib_lines = "\n".join(
        f"  {k}: {v}" for k, v in list(contributions.items())[:10]
    ) or "  Not available"

    return (
        f"{_system_block()}"
        f"### ML Risk Score Explanation\n\n"
        f"Shipment      : {_safe(facts, 'tracking_number')}\n"
        f"Risk Score    : {_safe(facts, 'ml_risk_score')} / 1.0\n"
        f"Model Version : {_safe(facts, 'model_version')}\n\n"
        f"Top feature contributions to this score:\n{contrib_lines}\n\n"
        f"### Task\n"
        f"Explain in plain English why this shipment received this risk score, "
        f"focusing on the top contributing factors that the operator can act on.\n\n"
        f"### Explanation\n"
    )
