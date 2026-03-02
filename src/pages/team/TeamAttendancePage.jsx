import { useState, useEffect, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit2,
  Filter,
  Save
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'
import { useTeamAttendance } from '../../hooks/useTeamAttendance'
import { overrideAttendance } from '../../api/services/team.service'
import { formatDate, formatTime, toDatetimeLocal } from '../../utils/dateUtils'
import { getFirstDayOfMonth, getToday } from '../../utils/dateUtils'
import { StatCard } from '../../components/ui/StatCard'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { LocationMap, CompactLocationMap } from '../../components/ui/Map'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { CalendarX } from 'lucide-react'

const statusVariant = {
  present: 'emerald',
  half: 'amber',
  absent: 'rose',
  leave: 'blue'
}
const statusLabel = {
  present: 'Present',
  half: 'Half Day',
  absent: 'Absent',
  leave: 'Leave'
}

export function TeamAttendancePage() {
  const [startDate, setStartDate] = useState('2026-01-01')  // Start of year
  const [endDate, setEndDate] = useState('2026-12-31')      // End of year
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: attendance, loading, error, refetch } = useTeamAttendance(startDate, endDate)
  const [overrideRecord, setOverrideRecord] = useState(null)
  const [overridePunchIn, setOverridePunchIn] = useState('')
  const [overridePunchOut, setOverridePunchOut] = useState('')
  const [overrideStatus, setOverrideStatus] = useState('present')
  const [overrideLoading, setOverrideLoading] = useState(false)
  const [overrideError, setOverrideError] = useState(null)
  const [toast, setToast] = useState(null)

  const filteredData = useMemo(() => {
    if (!attendance) return []
    if (statusFilter === 'all') return attendance
    return attendance.filter((r) => r.status === statusFilter)
  }, [attendance, statusFilter])

  const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted()
    if (sorted === 'asc') return <ChevronUp className="w-4 h-4 text-indigo-400" />
    if (sorted === 'desc') return <ChevronDown className="w-4 h-4 text-indigo-400" />
    return <ChevronsUpDown className="w-4 h-4 text-slate-500" />
  }

  const columnHelper = createColumnHelper()
  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Member <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {row.original.username?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <span className="font-medium text-white">{row.original.username}</span>
              <p className="text-slate-400 text-xs mt-0.5">{row.original.email}</p>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('punch_date', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Date <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => formatDate(getValue())
      }),
      columnHelper.accessor('punch_in', {
        header: 'Punch In',
        cell: ({ getValue }) => formatTime(getValue()),
        meta: { hideOnMobile: true }
      }),
      columnHelper.accessor('punch_out', {
        header: 'Punch Out',
        cell: ({ getValue }) => formatTime(getValue()),
        meta: { hideOnMobile: true }
      }),
      columnHelper.accessor('work_minutes', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Work Hours <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => {
          const m = getValue()
          if (m == null) return '—'
          return Math.floor(m / 60) + 'h ' + (m % 60) + 'm'
        },
        meta: { hideOnLg: true }
      }),
      columnHelper.accessor('status', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Status <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => (
          <Badge variant={statusVariant[getValue()] || 'slate'}>
            {statusLabel[getValue()] ?? getValue()}
          </Badge>
        )
      }),
      columnHelper.accessor('latitude', {
        header: 'Location',
        cell: ({ row }) => {
          const { latitude, longitude, username, punch_date } = row.original
          if (!latitude || !longitude) {
            return <span className="text-slate-500">—</span>
          }
          return (
            <a
              href={`/team/map?lat=${latitude}&lng=${longitude}&user=${encodeURIComponent(username)}&date=${punch_date}`}
              className="text-indigo-400 hover:text-indigo-300 underline text-sm"
            >
              View Map
            </a>
          )
        },
        meta: { hideOnMd: true }
      }),
      columnHelper.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) => {
          const isLeave = row.original.status === 'leave'
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOverrideRecord(row.original)}
              disabled={isLeave}
              title={isLeave ? 'Cannot override leave status' : 'Override'}
            >
              <Edit2 className="w-4 h-4" />
              Override
            </Button>
          )
        }
      })
    ],
    [columnHelper, SortIcon]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  })

  useEffect(() => {
    if (overrideRecord) {
      setOverridePunchIn(toDatetimeLocal(overrideRecord.punch_in))
      setOverridePunchOut(toDatetimeLocal(overrideRecord.punch_out))
      setOverrideStatus(
        overrideRecord.status === 'leave' ? 'present' : overrideRecord.status
      )
      setOverrideError(null)
    }
  }, [overrideRecord])

  const handleApplyDates = () => {
    refetch()
  }

  const handleSaveOverride = async () => {
    if (!overrideRecord) return
    setOverrideLoading(true)
    setOverrideError(null)
    try {
      await overrideAttendance({
        userId: overrideRecord.user_id,
        date: overrideRecord.punch_date,
        punch_in: overridePunchIn
          ? new Date(overridePunchIn).toISOString()
          : null,
        punch_out: overridePunchOut
          ? new Date(overridePunchOut).toISOString()
          : null,
        status: overrideStatus
      })
      setOverrideRecord(null)
      refetch()
      setToast({ type: 'success', message: 'Attendance updated.' })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setOverrideError(
        err.response?.data?.message || 'Failed to save override.'
      )
    } finally {
      setOverrideLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Team Attendance</h2>
        <p className="text-slate-400 text-sm mt-1">
          View and manage attendance records. Override incorrect entries as
          needed.
        </p>
      </header>

      {toast && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3">
          {toast.message}
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
          Error: {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onApply={handleApplyDates}
          loading={loading}
        />
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <label className="text-slate-400 text-sm">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="half">Half Day</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-slate-800">
              {[...Array(7)].map((_, j) => (
                <div
                  key={j}
                  className="h-6 flex-1 bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No attendance records found for this period."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-slate-800">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={`text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 ${header.column.columnDef.meta?.hideOnMobile
                              ? 'hidden md:table-cell'
                              : ''
                            } ${header.column.columnDef.meta?.hideOnLg
                              ? 'hidden lg:table-cell'
                              : ''
                            }`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-4 py-3 text-white text-sm ${cell.column.columnDef.meta?.hideOnMobile
                              ? 'hidden md:table-cell'
                              : ''
                            } ${cell.column.columnDef.meta?.hideOnLg
                              ? 'hidden lg:table-cell'
                              : ''
                            }`}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-slate-400 text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount() || 1}
              </span>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={!!overrideRecord}
        onClose={() => setOverrideRecord(null)}
        title="Override Attendance"
        subtitle={
          overrideRecord
            ? `${overrideRecord.username} · ${formatDate(overrideRecord.punch_date)}`
            : ''
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setOverrideRecord(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveOverride}
              loading={overrideLoading}
              disabled={overrideLoading}
            >
              <Save className="w-4 h-4" />
              Save Override
            </Button>
          </>
        }
      >
        {overrideRecord && (
          <div className="space-y-4">
            {overrideError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm">
                {overrideError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Punch In
              </label>
              <input
                type="datetime-local"
                value={overridePunchIn}
                onChange={(e) => setOverridePunchIn(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Punch Out
              </label>
              <input
                type="datetime-local"
                value={overridePunchOut}
                onChange={(e) => setOverridePunchOut(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="present">Present</option>
                <option value="half">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
