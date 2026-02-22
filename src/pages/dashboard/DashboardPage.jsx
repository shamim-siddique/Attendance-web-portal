import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ArrowRight,
  CalendarCheck,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getTeamMembers, getTeamAnalytics } from '../../api/services/team.service'
import { getTeamLeaves } from '../../api/services/leave.service'
import { approveLeave, rejectLeave } from '../../api/services/leave.service'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/dateUtils'
import { getToday, getFirstDayOfMonth } from '../../utils/dateUtils'

export function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const today = getToday()
  const firstDayOfMonth = getFirstDayOfMonth()

  const [members, setMembers] = useState([])
  const [analytics, setAnalytics] = useState({ members: [], aggregate: {} })
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast] = useState(null)

  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening'
  const fullDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const portalLabel = isAdmin ? 'Admin' : 'Manager'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [membersRes, analyticsRes, leavesRes] = await Promise.all([
          getTeamMembers(),
          getTeamAnalytics(firstDayOfMonth, today),
          getTeamLeaves(firstDayOfMonth, today, 'pending')
        ])
        setMembers(membersRes.data)
        setAnalytics(analyticsRes.data)
        setPendingLeaves(leavesRes.data)
      } catch (e) {
        setToast({ type: 'error', message: e.response?.data?.message || 'Failed to load dashboard' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [firstDayOfMonth, today])

  const handleApprove = async (leaveId) => {
    setApprovingId(leaveId)
    try {
      await approveLeave(leaveId)
      setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId))
      setToast({ type: 'success', message: 'Leave approved successfully.' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to approve.' })
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (leaveId) => {
    if (!rejectReason.trim()) return
    setRejectingId(leaveId)
    try {
      await rejectLeave(leaveId, rejectReason.trim())
      setPendingLeaves((prev) => prev.filter((l) => l.id !== leaveId))
      setRejectReason('')
      setRejectingId(null)
      setToast({ type: 'success', message: 'Leave rejected.' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to reject.' })
    } finally {
      setRejectingId(null)
    }
  }

  const previewLeaves = pendingLeaves.slice(0, 5)
  const agg = analytics.aggregate || {}

  return (
    <div className="space-y-8">
      {toast && (
        <div
          className={`rounded-xl px-4 py-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          {toast.message}
        </div>
      )}

      <header>
        <h2 className="text-2xl font-bold text-white">
          Good {greeting}, {firstName}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {portalLabel} Portal · {fullDate}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Team Members"
          value={loading ? '—' : members.length}
          sub="In your hierarchy"
          icon={Users}
          iconBg="indigo"
          loading={loading}
        />
        <StatCard
          label="Avg Attendance"
          value={
            loading
              ? '—'
              : agg.avg_attendance_percentage != null
                ? `${Number(agg.avg_attendance_percentage).toFixed(1)}%`
                : '—'
          }
          sub="This month"
          icon={TrendingUp}
          iconBg="emerald"
          loading={loading}
        />
        <StatCard
          label="Present Days"
          value={loading ? '—' : (agg.total_present ?? '—')}
          sub="Across team, this month"
          icon={CheckCircle2}
          iconBg="blue"
          loading={loading}
        />
        <StatCard
          label="Absent Days"
          value={loading ? '—' : (agg.total_absent ?? '—')}
          sub="Across team, this month"
          icon={XCircle}
          iconBg="rose"
          loading={loading}
        />
        <StatCard
          label="Pending Leaves"
          value={loading ? '—' : pendingLeaves.length}
          sub="Awaiting your approval"
          icon={ClipboardList}
          iconBg="amber"
          loading={loading}
          onClick={() => navigate('/team/leaves')}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Pending Leave Requests
          </h3>
          <Link
            to="/team/leaves"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {previewLeaves.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No pending leave requests."
            />
          ) : (
            <ul className="divide-y divide-slate-800">
              {previewLeaves.map((leave) => (
                <li
                  key={leave.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-slate-800/50"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                    {leave.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">{leave.name}</p>
                    <p className="text-slate-500 text-xs">
                      {formatDate(leave.date)}
                      {leave.reason ? ` · ${leave.reason}` : ''}
                    </p>
                  </div>
                  {rejectingId === leave.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Rejection reason..."
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm w-40"
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(leave.id)}
                        loading={rejectingId === leave.id}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRejectingId(null)
                          setRejectReason('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleApprove(leave.id)}
                        disabled={approvingId != null}
                        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(leave.id)}
                        disabled={approvingId != null}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              title: 'Team Members',
              desc: 'View your full team hierarchy',
              to: '/team/members'
            },
            {
              icon: CalendarCheck,
              title: 'Attendance',
              desc: 'Review and manage attendance',
              to: '/team/attendance'
            },
            {
              icon: BarChart3,
              title: 'Analytics',
              desc: 'Performance insights',
              to: '/team/analytics'
            },
            {
              icon: ClipboardList,
              title: 'Leave Requests',
              desc: 'Approve or reject leaves',
              to: '/team/leaves'
            }
          ].map(({ icon: Icon, title, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex items-start justify-between"
            >
              <div>
                <Icon className="w-8 h-8 text-indigo-400 mb-2" />
                <h4 className="font-medium text-white">{title}</h4>
                <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
