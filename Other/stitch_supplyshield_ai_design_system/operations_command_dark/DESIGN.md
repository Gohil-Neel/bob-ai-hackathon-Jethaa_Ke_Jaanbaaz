---
name: Operations Command Dark
colors:
  surface: '#0f141b'
  surface-dim: '#0f141b'
  surface-bright: '#343942'
  surface-container-lowest: '#090e16'
  surface-container-low: '#171c23'
  surface-container: '#1b2027'
  surface-container-high: '#252a32'
  surface-container-highest: '#30353d'
  on-surface: '#dee2ed'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dee2ed'
  inverse-on-surface: '#2c3139'
  outline: '#8d90a0'
  outline-variant: '#424655'
  surface-tint: '#b3c5ff'
  primary: '#b3c5ff'
  on-primary: '#002a76'
  primary-container: '#2f6df6'
  on-primary-container: '#ffffff'
  inverse-primary: '#0054d8'
  secondary: '#bec7d7'
  on-secondary: '#28313e'
  secondary-container: '#3e4755'
  on-secondary-container: '#adb6c6'
  tertiary: '#bac7dd'
  on-tertiary: '#243142'
  tertiary-container: '#6a778b'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b3c5ff'
  on-primary-fixed: '#00174a'
  on-primary-fixed-variant: '#003ea6'
  secondary-fixed: '#dae3f4'
  secondary-fixed-dim: '#bec7d7'
  on-secondary-fixed: '#131c28'
  on-secondary-fixed-variant: '#3e4755'
  tertiary-fixed: '#d6e3fa'
  tertiary-fixed-dim: '#bac7dd'
  on-tertiary-fixed: '#0f1c2c'
  on-tertiary-fixed-variant: '#3b485a'
  background: '#0f141b'
  on-background: '#dee2ed'
  surface-variant: '#30353d'
  bg-app: '#080d14'
  bg-sidebar: '#0b111a'
  bg-surface: '#101722'
  bg-surface-raised: '#141d29'
  bg-surface-hover: '#192333'
  border-subtle: '#243142'
  border-strong: '#334155'
  text-primary: '#f3f6fa'
  text-secondary: '#a8b3c2'
  text-muted: '#6f7d8f'
  text-disabled: '#4b5868'
  primary-hover: '#4a7ff7'
  primary-soft: rgba(47, 109, 246, 0.16)
  risk-critical: '#ef4444'
  risk-high: '#f97316'
  risk-medium: '#f59e0b'
  risk-low: '#22c55e'
  status-info: '#38bdf8'
typography:
  kpi-val:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  page-title:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  section-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  card-title:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-default:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-cell:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
  badge-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers a high-stakes, mission-critical operations intelligence environment. Built for enterprise supply chain control towers, logistics operators, and disruption analysts, the interface emphasizes authoritative calm, rapid visual triage, and unflinching operational precision. 

The aesthetic is anchored in **Tactical Dark Minimalism**:
- **High-Density Utility:** Prioritizes dense analytical information, real-time spatial cartography, telemetry charts, and structured data grids over decorative white space.
- **Zero Ambiguity:** Strict separation of operational risk states from brand accents ensures actionable anomalies are identified within milliseconds.
- **Controlled Elevation:** Structural visual grouping relies on layered dark slate surfaces and disciplined 1px hairline borders rather than heavy blur techniques or decorative drop shadows.
- **AI Co-Pilot Integration:** Algorithmic disruption predictions, what-if scenarios, and confidence scores are embedded directly into transactional workflows with verified confirmation checkpoints.

## Colors

The palette operates under strict enterprise control rules:
- **Primary Accent (`#2f6df6`):** Dedicated exclusively to non-hazardous interactive elements, focus states, primary triggers, and map selections.
- **Reserved Status Semantics:** The hues red (`#ef4444`), orange (`#f97316`), amber (`#f59e0b`), and emerald (`#22c55e`) are restricted entirely to operational risk classifications and system health. They must never appear in decorative backgrounds, illustrations, or non-status buttons.
- **Surface Layering:** Depth is mapped sequentially from `#080d14` (canvas canvas) to `#0b111a` (navigation rails), `#101722` (primary workspace cards), `#141d29` (elevated panels/popovers), and `#192333` (table and row active hover fills).
- **Subtle Partitioning:** Contours use low-glare dividers (`#243142`) to retain visual order across multi-panel interfaces under low-light control room conditions.

## Typography

The typographic hierarchy uses **Inter** throughout, tuned for maximum screen legibility and numeric readability:
- **Tabular Figures:** Any context showing telemetry, quantities, timestamps, delta percentages, or geographic coordinates must enforce `font-variant-numeric: tabular-nums`. This prevents layout shifts during live data polling.
- **Micro Scales:** Dense data tables and visual KPI charts utilize sizes between 11px and 13px with tight, clean line-height ratios.
- **Hierarchy Signaling:** Headings lean on weight (Semibold 600) rather than oversized dimensions to conserve vertical screen space for high-density command consoles.

## Layout & Spacing

The layout is built around an 8px modular baseline, augmented with a 4px micro-substep:
- **Canvas Anatomy:** Uses an persistent utility navigation rail (220–240px wide on desktop; 64px compact icon mode), fixed-height contextual top bar (56px), and a fluid multi-column operational grid.
- **Dense Grid Rhythms:** Interior dashboard card gap is set to `12px` (`0.75rem`), moving to `16px` (`1rem`) between divergent functional sections. Canvas padding maintains a compact `20px` baseline.
- **Adaptive Breakpoints:**
  - **Desktop (≥ 1280px):** Multi-pane monitoring view; simultaneous visibility of GIS routing map, live disruption stream, and telemetry analytics.
  - **Tablet (768px – 1279px):** Sidebar collapses to persistent icon rail; secondary simulation drawers overlay modally over the primary map canvas.
  - **Mobile (< 768px):** Linear stacked sequence; full data tables collapse into compact key-value summary cards.

## Elevation & Depth

This system avoids decorative ambient glow, heavy blur filters, or bright dropped highlights:
- **Tonal Stepping:** Surfaces establish visual elevation strictly through dark-value transitions: background (`#080d14`), standard panel container (`#101722`), raised drawer or modal container (`#141d29`).
- **Low-Contrast Outlines:** Every container is structured with a crisp `1px solid #243142` boundary line. Hover states elevate with border transitions to `#334155` and a slight fill shift to `#192333`.
- **Overlays & Drawers:** High-priority inspection dialogs and popovers use a compact, non-colored drop shadow (`0 8px 24px rgba(0, 0, 0, 0.6)`) bounded by a `#334155` border to separate from underlying map tiles and live charts.
- **Map & Route Highlights:** Selected active entities use a focused `2px solid #2f6df6` ring with a subtle, tight outer halo (`0 0 0 3px rgba(47, 109, 246, 0.25)`).

## Shapes

The interface embraces a precise, disciplined shape language optimized for technical density:
- **Card Containers & Panels:** Built with a clean `8px` corner radius (`rounded-lg` token sets at `0.5rem` / 8px).
- **Controls & Form Fields:** Action buttons, search fields, date pickers, and segment controls use a compact `6px` radius (`0.375rem`) to maintain compact click targets without consuming excessive interface area.
- **Badges & Severity Pills:** Retain a fully rounded geometry (`9999px`) to create clear shape contrast against rectangular data cards and layout frames.
- **Separators & Tracks:** Visual progression bars and sensor boundary strips use square or hairline rounded caps (`2px`).

## Components

### Buttons
- **Primary:** Background `#2f6df6`, text `#f3f6fa`, font size 13px, weight 500, radius 6px, padding `6px 14px`. Hover: `#4a7ff7`.
- **Secondary / Action Outline:** Background transparent, border `1px solid #243142`, text `#f3f6fa`. Hover: background `#192333`, border `#334155`.
- **Destructive:** Background `rgba(239, 68, 68, 0.12)`, border `1px solid #ef4444`, text `#ef4444`. Hover: background `#ef4444`, text `#ffffff`.

### Risk & Status Badges
- **Geometry:** Height 20px–22px, border radius 9999px, padding `2px 8px`, typography 11px Medium with tabular figures.
- **Styling Matrix:**
  - *Critical:* Background `rgba(239, 68, 68, 0.14)`, text `#ef4444`, border `1px solid rgba(239, 68, 68, 0.3)`.
  - *High:* Background `rgba(249, 115, 22, 0.14)`, text `#f97316`, border `1px solid rgba(249, 115, 22, 0.3)`.
  - *Medium:* Background `rgba(245, 158, 11, 0.14)`, text `#f59e0b`, border `1px solid rgba(245, 158, 11, 0.3)`.
  - *Low / Normal:* Background `rgba(34, 197, 94, 0.14)`, text `#22c55e`, border `1px solid rgba(34, 197, 94, 0.3)`.
- **Rule:** Every badge must feature text alongside an optional status dot or trend glyph—never color alone.

### Data Tables
- **Container:** Background `#101722`, border `1px solid #243142`, border-radius 8px.
- **Header:** Height 36px, background `#0b111a`, text `#6f7d8f`, 11px uppercase tracking.
- **Rows:** Height 40px, border-bottom `1px solid #141d29`, typography 12px tabular. Hover fills `#192333`.
- **Critical Cell Highlights:** Flagged with a 2px vertical indicator bar along the leading edge rather than high-contrast row background fills.

### Cards & KPI Tiles
- **Structure:** Background `#101722`, border `1px solid #243142`, internal padding `12px 16px`, radius 8px.
- **KPI Metrics:** Metric value (26px, weight 600, tabular), label (12px, `#a8b3c2`), trend indicator (11px, icon + text).

### Form Inputs & Search Fields
- **Base:** Background `#080d14`, border `1px solid #243142`, text `#f3f6fa`, placeholder `#6f7d8f`, radius 6px, height 32px, padding `0 10px`.
- **Focus:** Border `1px solid #2f6df6`, box-shadow `0 0 0 1px #2f6df6`.

### AI Co-Pilot & Simulation Panels
- **Container:** Background `#141d29`, border `1px solid #334155`, radius 8px.
- **Message Bubbles:** User prompts `#192333`; AI recommendations framed in `#101722` with a leading 2px `#2f6df6` accent line.
- **Confidence & Evidence Tags:** Displayed as compact pills (10px, background `#080d14`, border `1px solid #243142`, text `#a8b3c2`).