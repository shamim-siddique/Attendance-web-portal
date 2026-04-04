import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ThemeProvider } from './context/ThemeContext'

import { ProtectedRoute } from './components/auth/ProtectedRoute'

import { Layout } from './components/layout/Layout'

import { LoginPage } from './pages/auth/LoginPage'

import { DashboardPage } from './pages/dashboard/DashboardPage'

import { UserLocationsPage } from './pages/users/UserLocationsPage'

import { TeamMembersPage } from './pages/team/TeamMembersPage'

import { TeamAttendancePage } from './pages/team/TeamAttendancePage'

import { TeamAnalyticsPage } from './pages/team/TeamAnalyticsPage'

import { TeamMapPage } from './pages/team/TeamMapPage'

import { LeaveRequestsPage } from './pages/leaves/LeaveRequestsPage'

import { DeviceChangeRequests } from './pages/shared/DeviceChangeRequests'

import { HolidayManagementPage } from './pages/holidays/HolidayManagementPage'



export default function App() {

  return (

    <ThemeProvider>

      <BrowserRouter>

        <Routes>

          <Route path="/login" element={<LoginPage />} />



          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/users/locations" element={<UserLocationsPage />} />

            <Route path="/team/members" element={<TeamMembersPage />} />

            <Route path="/team/attendance" element={<TeamAttendancePage />} />

            <Route path="/team/analytics" element={<TeamAnalyticsPage />} />

            <Route path="/team/map" element={<TeamMapPage />} />

            <Route path="/team/leaves" element={<LeaveRequestsPage />} />

            <Route path="/team/device-change-requests" element={<DeviceChangeRequests />} />

            <Route path="/holidays" element={<HolidayManagementPage />} />

          </Route>



          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>

      </BrowserRouter>

    </ThemeProvider>

  )

}

