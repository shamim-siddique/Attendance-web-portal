import { NavLink } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  Shield,
  LayoutDashboard,
  Users,
  CalendarCheck,
  BarChart3,
  ClipboardList,
  UserPlus,
  MapPin,
  LogOut,
  Smartphone
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/team/members', icon: Users, label: 'Team Members' },
  { to: '/team/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/team/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/team/leaves', icon: ClipboardList, label: 'Leave Requests' },
  { to: '/team/device-change-requests', icon: Smartphone, label: 'Device Requests' },
  { to: '/users/create', icon: UserPlus, label: 'Create User' },
  { to: '/users/locations', icon: MapPin, label: 'Locations' }
]

export function Sidebar({ open, onClose }) {
  const { user, isAdmin, isManager, logout } = useAuth()
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 md:w-16 lg:w-60
          bg-slate-900 border-r border-slate-800
          flex flex-col
          transform transition-transform duration-200 ease-out
          md:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Top: Logo + role */}
        <div className="p-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold truncate hidden lg:inline">
              AttendanceOS
            </span>
          </div>
          <div className="mt-3 hidden lg:block">
            {isAdmin && (
              <Badge variant="rose" className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Admin
              </Badge>
            )}
            {!isAdmin && isManager && (
              <Badge variant="violet" className="inline-flex items-center gap-1">
                <Shield className="w-3 h-3" /> Manager
              </Badge>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onClose()}
              title={label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
                md:justify-center lg:justify-start`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-3 hidden lg:flex">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-center md:justify-center lg:justify-start"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
