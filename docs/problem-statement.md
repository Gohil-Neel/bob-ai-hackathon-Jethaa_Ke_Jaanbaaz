# SupplyShield AI — Problem Statement

## Background

Global supply chains operate across thousands of shipments, dozens of carriers, and hundreds of routes simultaneously. When disruptions occur — storms, port congestion, customs delays, road closures — supply-chain operators must rapidly understand which shipments are affected, assess risk, identify alternatives, and take action. For temperature-sensitive cargo (pharmaceuticals, food, biologics), cold-chain integrity must be monitored continuously or product loss becomes irreversible.

## The Problem

Supply-chain operations teams face a fragmented, reactive intelligence challenge across five critical areas:

### 1. Disruption Detection is Slow
By the time an operator learns that a typhoon is affecting the East China Sea corridor, dozens of shipments may already be delayed with no visibility into which are most critical. Today this is a manual, email-driven process that takes 30–60 minutes per incident.

### 2. Risk Assessment is Manual
Determining which shipments are "at risk" requires cross-referencing carrier data, route maps, shipment priority, cargo sensitivity, and live weather signals — a process done manually today. Operators lack a single deterministic risk score that aggregates these signals in real time.

### 3. Cold-Chain Monitoring is Reactive
Temperature excursions are often detected at delivery when product is already compromised. There is no real-time classification of excursion severity (MEDIUM / HIGH / CRITICAL), no actionable escalation path, and no audit trail that connects an excursion to a carrier action.

### 4. Fleet Visibility is Siloed
Idle vehicles and containers that could be redeployed sit unused because no centralised system connects disruption-affected shipments to available nearby fleet assets. Operators have no ranked redeployment candidates with capacity and compatibility data.

### 5. AI Explanations are Ungrounded
Existing AI tools that touch supply-chain data often generate plausible-sounding but invented recommendations — referencing shipment IDs, routes, or ETAs that do not exist in the operator's actual system. In an enterprise operations context, a hallucinated recommendation can cause a major logistics or cold-chain failure.

## Who is Affected

**Primary users:** Supply-chain operations managers and logistics coordinators at mid-to-large enterprises managing 50+ concurrent shipments across multiple carriers and regions (e.g., Maersk, DHL, FedEx, MSC, Kuehne+Nagel routes).

**Secondary users:** Cold-chain compliance officers monitoring pharmaceutical and food shipments (WHO 2°C–8°C biologics threshold, deep-freeze pharmaceuticals) for temperature integrity.

## Why It Matters — Quantified

| Pain Point | Business Impact |
|---|---|
| Missed disruption affecting a critical pharmaceutical shipment | Six-figure product loss, possible regulatory recall |
| Manual risk assessment per major disruption event | 1–3 operator hours lost per incident |
| Cold-chain excursion detected at delivery (too late) | Regulatory action, cargo write-off |
| Idle fleet assets not surfaced for redeployment | Daily carrying cost of idle refrigerated vehicles |
| AI hallucinating a nonexistent reroute | Operator trust loss; wrong action applied |

## Why Existing Solutions Fall Short

| Existing Approach | Gap |
|---|---|
| Carrier portals (e.g. Maersk Track) | Show location, not risk; no cross-carrier view |
| Generic dashboards (PowerBI, Tableau) | Aggregate data but require manual analysis to derive recommendations |
| AI chatbots (generic LLMs) | Generate recommendations without grounding in verified operational data — dangerous in logistics |
| Cold-chain monitoring tools | Detect excursions but do not classify severity by rule or generate actionable next steps |
| ERPs / TMS systems | Contain the data but have no intelligence layer to surface risk or generate grounded recommendations |

## The Opportunity

SupplyShield AI addresses all five gaps simultaneously by combining:
- Real-time disruption detection and risk scoring (deterministic — not AI)
- Rule-based cold-chain severity classification (MEDIUM / HIGH / CRITICAL)
- Fleet redeployment candidate ranking
- IBM watsonx.ai grounded explanations — Granite receives only verified backend facts and cannot invent operational data
- A human-confirmation gate before any consequential action is applied
- An immutable `DecisionAudit` record for every approved operator action

This is the intelligence layer that carrier portals, ERPs, and generic AI tools do not provide.
