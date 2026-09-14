# SupplyShield AI — UI/UX Design Specification

## 1. Product Experience

SupplyShield AI is an operations command center.

The experience should communicate:

```text
Awareness → Prioritization → Explanation → Decision → Approval → Action → Audit
```

The user should not need to navigate through many pages to understand an active operational crisis.

---

# 2. Design Personality

The visual language should be:

- dark
- enterprise
- operational
- high-information
- precise
- calm under pressure
- action-oriented

Avoid:

- generic SaaS dashboard appearance
- excessive gradients
- oversized decorative cards
- unnecessary animation
- visual clutter
- fake live indicators
- meaningless charts

---

# 3. Application Shell

Recommended layout:

```text
┌───────────────────────────────────────────────────────────────┐
│ Logo / Product        Page title        System status / User │
├──────────────┬────────────────────────────────────────────────┤
│              │                                                │
│ Navigation   │                  Main workspace                │
│              │                                                │
│ Command      │                                                │
│ Center       │                                                │
│ Shipments    │                                                │
│ Disruptions  │                                                │
│ Fleet        │                                                │
│ Cold Chain   │                                                │
│ Alerts       │                                                │
│ AI Insights  │                                                │
│ Simulation   │                                                │
│ Reports      │                                                │
│ Settings     │                                                │
│              │                                                │
└──────────────┴────────────────────────────────────────────────┘
```

---

# 4. Navigation

Primary navigation:

```text
Command Center
Shipments
Disruptions
Fleet
Cold Chain
Alerts
AI Insights
What-If Simulation
Reports
Settings
```

The Command Center is the default landing page.

Use clear active-state indication.

---

# 5. Command Center

## Goal

Answer:

```text
What is happening?
What is most urgent?
What is affected?
What should I investigate?
```

## Layout

```text
Header
  ↓
KPI row
  ↓
Map + active disruption panel
  ↓
Critical shipments + critical actions
  ↓
Cold-chain alerts + fleet opportunities
```

---

# 6. KPI Cards

Required conceptual KPIs:

```text
Total Shipments
Active Disruptions
At-Risk Shipments
Cold Chain Alerts
Idle Fleet Assets
```

Each KPI should show:

```text
Label
Current value
Optional trend/change
Status
```

Do not use fake trends if historical data does not exist.

---

# 7. Live Map

Map should communicate operational state, not merely geography.

Show:

```text
Shipment routes
Disruption locations
Blocked routes
Fleet locations
```

Interactions:

```text
hover → compact summary
click → detail panel
filter → focus selected entity
```

Provide a list/table alternative for precise selection.

---

# 8. Disruption Detail

When a disruption is selected:

```text
Disruption name
Type
Severity
Status
Location
Start time
Expected end
Affected routes
Affected shipments
Critical shipments
Cargo value at risk
Recommended action
```

Use an action-oriented panel.

Example:

```text
NH-48 FLOODING
HIGH
ACTIVE

17 shipments affected
4 critical

Recommended:
Evaluate Route C for critical shipments
```

---

# 9. Shipment Detail

Display:

```text
Shipment ID
Origin
Destination
Carrier
Priority
Status
Risk
Cargo value
ETA
Current route
Alternative routes
Fleet assignment
Cold-chain state
Related disruption
AI insight
```

Actions:

```text
View simulation
Review recommendation
Approve action
```

Do not make destructive actions visually easy to trigger accidentally.

---

# 10. Risk Indicators

Use consistent semantic levels:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

Recommended semantic colors:

```text
Critical → red
High → orange
Medium → yellow
Low → green
```

Always use text labels.

---

# 11. Cold-Chain Screen

Main view:

```text
Sensor / shipment selector
Current temperature
Allowed range
Severity
Excursion duration
Last reading
Temperature chart
Alert history
AI explanation
```

Temperature chart:

```text
temperature
   |
10 |              /
 8 |-------------/---- allowed maximum
 6 |       _____/
 4 |______/
 2 |------------------- allowed minimum
   +------------------------ time
```

The chart must make the allowed range visually understandable.

---

# 12. Fleet Screen

Show:

```text
Asset
Type
Location
Capacity
Status
Available at
Current shipment
Potential matches
```

Idle assets should be easy to identify.

Potential redeployment should show:

```text
Asset
Candidate shipment
Distance/proximity
Capacity fit
Availability
Reason
Confidence
```

---

# 13. AI Insight Panel

AI should appear as an assistant to the operator, not as an authoritative replacement.

Preferred structure:

```text
AI INSIGHT

Situation
[short explanation]

Evidence
• 17 shipments affected
• 4 are critical
• Route B has high risk

Recommendation
[short action]

Expected impact
[delay/cost/risk]

Confidence
92%
```

Always make it clear which information comes from system data and which is generated explanation.

---

# 14. What-If Simulation

The simulation screen should compare two plans.

```text
CURRENT PLAN            ALTERNATIVE PLAN
────────────────        ─────────────────
Route B                 Route C
ETA 21:20               ETA 22:50
₹20,000                 ₹23,600
Risk: Low               Risk: Medium

             IMPACT
        +1h 30m delay
        +₹3,600 cost
        Risk increases
```

Then:

```text
[Review Recommendation]
[Apply Alternative]
```

Apply must require confirmation.

---

# 15. Confirmation Dialog

For consequential action:

```text
Confirm Reroute

Shipment: SHP-0172
Current: Route B
New: Route C

Impact:
+1h 30m ETA
+₹3,600 cost
Risk: Medium

Reason:
Active disruption on current route.

[Cancel] [Confirm Reroute]
```

Do not use vague confirmation text such as:

```text
Are you sure?
```

---

# 16. Tables

Tables must support:

```text
search
filter
sort
pagination where needed
row selection
detail navigation
```

Risk/status should be visible without opening each row.

Avoid excessively wide tables.

Prioritize operational fields.

---

# 17. Loading States

Use meaningful loading states:

```text
Loading active disruptions...
Loading shipment risk...
Calculating alternatives...
Generating AI insight...
```

Do not show fake data while loading.

---

# 18. Empty States

Examples:

```text
No active disruptions.

No cold-chain excursions detected.

No idle fleet currently available.

No shipments match the selected filters.
```

Empty states should explain what the state means.

---

# 19. Error States

Examples:

```text
Unable to load disruption data.
Retry

AI insight unavailable.
Operational data is still available.

Simulation failed.
Try again.
```

Never hide errors by silently displaying stale/fake values.

---

# 20. Real-Time Language

Only use:

```text
LIVE
REAL-TIME
CONNECTED
```

when the application actually supports the corresponding behavior.

If using simulated sensor streaming, label it appropriately, for example:

```text
SIMULATED SENSOR STREAM
```

Do not imply a production IoT connection that does not exist.

---

# 21. Typography

Use a clear hierarchy:

```text
Page title
Section heading
Card title
Body
Metadata
Caption
```

Operational identifiers such as shipment IDs can use a compact/high-legibility treatment.

Do not use tiny text for critical information.

---

# 22. Spacing

Use a consistent spacing system.

Suggested base unit:

```text
4px
```

Common spacing:

```text
4
8
12
16
24
32
```

Avoid random spacing values throughout the application.

---

# 23. Components

Build reusable components:

```text
AppShell
Sidebar
TopBar
KpiCard
RiskBadge
StatusBadge
FilterBar
DataTable
MapPanel
DetailDrawer
AlertCard
AiInsightCard
RecommendationCard
TemperatureChart
SimulationComparison
ConfirmationDialog
```

---

# 24. Accessibility

Ensure:

- keyboard navigation
- visible focus states
- readable contrast
- semantic buttons
- descriptive labels
- non-color status indicators
- accessible tables
- accessible dialogs
- meaningful error messages

---

# 25. Responsive Behavior

Desktop is the primary command-center target.

Still support:

```text
tablet
smaller laptop
narrow screens
```

On narrow screens:

```text
Sidebar → collapsible
Map → reduced height
KPI cards → wrap
Two-column panels → stack
```

Do not simply shrink desktop UI until it becomes unreadable.

---

# 26. Animation

Use animation only when it communicates state.

Good:

```text
new alert appearing
panel opening
simulation comparison transition
sensor update indicator
```

Avoid:

```text
constant pulsing
decorative motion
large page transitions
```

Operational software should feel stable.

---

# 27. UX Golden Path

The most important journey is:

```text
Command Center
   ↓
Disruption
   ↓
Affected Shipment
   ↓
Recommendation
   ↓
AI Explanation
   ↓
What-If Simulation
   ↓
Confirmation
   ↓
Action
   ↓
Audit
```

This flow must be fast and understandable.

---

# 28. Design Validation

Before considering a screen complete:

```text
[ ] Real data connected
[ ] Clear hierarchy
[ ] Critical information visible
[ ] Risk understandable
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Keyboard/accessibility considered
[ ] Responsive behavior
[ ] No unnecessary decoration
[ ] Action is clear
[ ] Consequential action has confirmation
```
