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

  Calendar,

  UserPlus,

  MapPin,

  Smartphone,

  X

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

  { to: '/holidays', icon: Calendar, label: 'Holidays' },

  { to: '/users/create', icon: UserPlus, label: 'Create User' },

  { to: '/users/locations', icon: MapPin, label: 'Locations' }

]



export function Sidebar({ open, onClose }) {

  const { isAdmin, isManager } = useAuth()

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

          w-70 md:w-16 lg:w-60

          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800

          flex flex-col

          transform transition-transform duration-200 ease-out

          md:translate-x-0

          ${open ? 'translate-x-0' : '-translate-x-full'}

        `}

      >

        {/* Top: Logo + role + close button */}

        <div className="p-4 border-b border-gray-200 dark:border-slate-800 shrink-0">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">

                <Building2 className="w-4 h-4 text-white" />

              </div>

              <span className="text-gray-900 dark:text-white font-semibold truncate hidden lg:inline">

                AttendanceOS

              </span>

            </div>

            <Button

              onClick={onClose}

              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"

              aria-label="Close sidebar"

            >

              <X className="w-5 h-5" />

            </Button>

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

        <nav className="flex-1 py-4 px-2">

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

                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'

                }

                md:justify-center lg:justify-start`

              }

            >

              <Icon className="w-5 h-5 shrink-0" />

              <span className=" max-w-[767px]:flex md:hidden lg:inline">{label}</span>

            </NavLink>

          ))}

        </nav>

      </aside>

    </>

  )

}

