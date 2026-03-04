import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Download
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
import { useTeamAnalytics } from '../../hooks/useTeamAnalytics'
import { getFirstDayOfMonth, getToday } from '../../utils/dateUtils'
import { exportToCSV } from '../../utils/csvUtils'
import { EmptyState } from '../../components/ui/EmptyState'
import { DateRangePicker } from '../../components/ui/DateRangePicker'
import { Button } from '../../components/ui/Button'
import { StatCard } from '../../components/ui/StatCard'

export function TeamAnalyticsPage() {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth())
  const [endDate, setEndDate] = useState(getToday())
  const { data, loading, refetch } = useTeamAnalytics(startDate, endDate)
  const members = data.team_members || []
  const aggregate = data.aggregate || {}

  const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted()
    if (sorted === 'asc') return <ChevronUp className="w-4 h-4 text-indigo-400" />
    if (sorted === 'desc') return <ChevronDown className="w-4 h-4 text-indigo-400" />
    return <ChevronsUpDown className="w-4 h-4 text-slate-500" />
  }

  const columnHelper = createColumnHelper()
  const columns = useMemo(
    () => [
      columnHelper.accessor((r) => r.name, {
        id: 'member',
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
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                {row.original.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <span className="font-medium text-white">{row.original.name}</span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{row.original.email}</p>
          </div>
        )
      }),
      columnHelper.accessor('summary.present_days', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Present <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-emerald-400">{getValue() ?? 0}</span>
        )
      }),
      columnHelper.accessor('summary.half_days', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Half Days <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-amber-400">{getValue() ?? 0}</span>
        ),
        meta: { hideOnMobile: true }
      }),
      columnHelper.accessor('summary.absent_days', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Absent <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium text-rose-400">{getValue() ?? 0}</span>
        )
      }),
      columnHelper.accessor('work_hours.total_hours', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Work Hours <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) =>
          getValue() != null ? `${Number(getValue()).toFixed(1)}h` : '—',
        meta: { hideOnMobile: true }
      }),
      columnHelper.accessor('attendance_percentage', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Attendance % <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => {
          const pct = getValue()
          if (pct == null) return '—'
          const n = Number(pct)
          const barColor =
            n >= 80 ? 'bg-emerald-500' : n >= 50 ? 'bg-amber-500' : 'bg-rose-500'
          const textColor =
            n >= 80 ? 'text-emerald-400' : n >= 50 ? 'text-amber-400' : 'text-rose-400'
          return (
            <div className="flex items-center gap-2 min-w-25">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${Math.min(100, n)}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${textColor} shrink-0`}>
                {n.toFixed(1)}%
              </span>
            </div>
          )
        }
      })
    ],
    [columnHelper, SortIcon]
  )

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const handleApplyDates = () => refetch() // This will use the current startDate and endDate values

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Present Days',
      'Half Days',
      'Absent Days',
      'Work Hours',
      'Attendance %'
    ]
    const rows = members.map((m) => [
      m.name,
      m.email,
      m.summary?.present_days ?? 0,
      m.summary?.half_days ?? 0,
      m.summary?.absent_days ?? 0,
      m.work_hours?.total_hours != null ? Number(m.work_hours.total_hours).toFixed(1) : 0,
      m.attendance_percentage != null
        ? Number(m.attendance_percentage).toFixed(1)
        : 0
    ])
    const today = getToday()
    exportToCSV(headers, rows, `team-analytics-${today}.csv`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Team Analytics
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Attendance performance breakdown.
          </p>
        </div>
        <Button variant="secondary" onClick={handleExportCSV}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onApply={handleApplyDates}
          loading={loading}
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Avg Attendance Rate"
          value={
            aggregate.average_attendance_percentage != null
              ? `${Number(aggregate.average_attendance_percentage).toFixed(1)}%`
              : '—'
          }
          icon={TrendingUp}
          iconBg="indigo"
          loading={loading}
        />
        <StatCard
          label="Total Present"
          value={aggregate.present_days ?? '—'}
          icon={CheckCircle2}
          iconBg="emerald"
          loading={loading}
        />
        <StatCard
          label="Total Half Days"
          value={aggregate.half_days ?? '—'}
          icon={Clock}
          iconBg="amber"
          loading={loading}
        />
        <StatCard
          label="Total Absent"
          value={aggregate.absent_days ?? '—'}
          icon={XCircle}
          iconBg="rose"
          loading={loading}
        />
      </section>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-slate-800">
              {[...Array(6)].map((_, j) => (
                <div
                  key={j}
                  className="h-6 flex-1 bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : members.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No analytics data for this period."
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
    </div>
  )
}
