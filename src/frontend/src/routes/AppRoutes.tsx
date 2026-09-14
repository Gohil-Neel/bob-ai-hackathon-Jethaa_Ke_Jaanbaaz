import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from '../layouts/AppShell'
import DashboardPage from '../pages/DashboardPage'
import ShipmentsPage from '../pages/ShipmentsPage'
import ShipmentDetailPage from '../pages/ShipmentDetailPage'
import DisruptionsPage from '../pages/DisruptionsPage'
import DisruptionDetailPage from '../pages/DisruptionDetailPage'
import FleetPage from '../pages/FleetPage'
import ColdChainPage from '../pages/ColdChainPage'
import AlertsPage from '../pages/AlertsPage'
import AIInsightsPage from '../pages/AIInsightsPage'
import SimulationsPage from '../pages/SimulationsPage'
import ReportsPage from '../pages/ReportsPage'
import SettingsPage from '../pages/SettingsPage'
import { RoutesPage } from '../pages/RoutesPage'
import { AuditPage } from '../pages/AuditPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Primary routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/shipments/:id" element={<ShipmentDetailPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/disruptions" element={<DisruptionsPage />} />
        <Route path="/disruptions/:id" element={<DisruptionDetailPage />} />
        <Route path="/cold-chain" element={<ColdChainPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/ai-insights" element={<AIInsightsPage />} />
        <Route path="/simulations" element={<SimulationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
