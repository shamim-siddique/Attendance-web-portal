import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CreateUserPage } from './pages/users/CreateUserPage'
import { UserLocationsPage } from './pages/users/UserLocationsPage'
import { TeamMembersPage } from './pages/team/TeamMembersPage'
import { TeamAttendancePage } from './pages/team/TeamAttendancePage'
import { TeamAnalyticsPage } from './pages/team/TeamAnalyticsPage'
import { LeaveRequestsPage } from './pages/leaves/LeaveRequestsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users/create" element={<CreateUserPage />} />
          <Route path="/users/locations" element={<UserLocationsPage />} />
          <Route path="/team/members" element={<TeamMembersPage />} />
          <Route path="/team/attendance" element={<TeamAttendancePage />} />
          <Route path="/team/analytics" element={<TeamAnalyticsPage />} />
          <Route path="/team/leaves" element={<LeaveRequestsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
