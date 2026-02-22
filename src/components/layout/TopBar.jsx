import { useLocation } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const pathTitles = {
  '/dashboard': 'Dashboard',
  '/team/members': 'Team Members',
  '/team/attendance': 'Attendance',
  '/team/analytics': 'Analytics',
  '/team/leaves': 'Leave Requests',
  '/users/create': 'Create User',
  '/users/locations': 'Locations'
}

function getPageTitle(pathname) {
  return pathTitles[pathname] ?? 'Dashboard'
}

export function TopBar({ onMenuClick }) {
  const location = useLocation()
  const { user, isAdmin, isManager, logout } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 shrink-0">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h1 className="flex-1 text-lg font-semibold text-white truncate">
        {getPageTitle(location.pathname)}
      </h1>

      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
          {initial}
        </div>
        <span className="text-slate-300 text-sm font-medium hidden sm:inline truncate max-w-[120px]">
          {user?.name}
        </span>
        {isAdmin && <Badge variant="rose">Admin</Badge>}
        {!isAdmin && isManager && <Badge variant="violet">Manager</Badge>}
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
