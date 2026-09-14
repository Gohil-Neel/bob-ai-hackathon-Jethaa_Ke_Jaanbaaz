import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '../layouts/AppShell';
import DashboardPage from '../pages/DashboardPage';
import ShipmentsPage from '../pages/ShipmentsPage';
import ShipmentDetailPage from '../pages/ShipmentDetailPage';
import DisruptionsPage from '../pages/DisruptionsPage';
import DisruptionDetailPage from '../pages/DisruptionDetailPage';
import FleetPage from '../pages/FleetPage';
import ColdChainPage from '../pages/ColdChainPage';
import AlertsPage from '../pages/AlertsPage';
import AIInsightsPage from '../pages/AIInsightsPage';
import SimulationsPage from '../pages/SimulationsPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import CarriersPage from '../pages/CarriersPage';
import RoutesPage from '../pages/RoutesPage';
import CompliancePage from '../pages/CompliancePage';
import MapPage from '../pages/MapPage';
import InventoryPage from '../pages/InventoryPage';
import SuppliersPage from '../pages/SuppliersPage';
import IntegrationsPage from '../pages/IntegrationsPage';
import UsersPage from '../pages/UsersPage';
import NotificationsPage from '../pages/NotificationsPage';
import AuditPage from '../pages/AuditPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Default redirect */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Primary routes */}
        <Route path="/dashboard"           element={<DashboardPage />} />
        <Route path="/map"                 element={<MapPage />} />
        <Route path="/shipments"           element={<ShipmentsPage />} />
        <Route path="/shipments/:id"       element={<ShipmentDetailPage />} />
        <Route path="/disruptions"         element={<DisruptionsPage />} />
        <Route path="/disruptions/:id"     element={<DisruptionDetailPage />} />
        <Route path="/fleet"               element={<FleetPage />} />
        <Route path="/cold-chain"          element={<ColdChainPage />} />
        <Route path="/alerts"              element={<AlertsPage />} />
        <Route path="/ai-insights"         element={<AIInsightsPage />} />
        <Route path="/simulations"         element={<SimulationsPage />} />
        <Route path="/routes"              element={<RoutesPage />} />
        <Route path="/carriers"            element={<CarriersPage />} />
        <Route path="/suppliers"           element={<SuppliersPage />} />
        <Route path="/inventory"           element={<InventoryPage />} />
        <Route path="/compliance"          element={<CompliancePage />} />
        <Route path="/reports"             element={<ReportsPage />} />
        <Route path="/audit"               element={<AuditPage />} />
        <Route path="/integrations"        element={<IntegrationsPage />} />
        <Route path="/users"               element={<UsersPage />} />
        <Route path="/notifications"       element={<NotificationsPage />} />
        <Route path="/settings"            element={<SettingsPage />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
