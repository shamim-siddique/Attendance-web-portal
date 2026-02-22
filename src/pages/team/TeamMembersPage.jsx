import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'
import { useAuth } from '../../context/AuthContext'
import { useTeamMembers } from '../../hooks/useTeamMembers'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Users } from 'lucide-react'

const roleVariant = (role) =>
  role === 'admin' ? 'rose' : role === 'manager' ? 'violet' : 'indigo'

export function TeamMembersPage() {
  const { isAdmin } = useAuth()
  const { data: members, loading, error } = useTeamMembers()
  const [globalFilter, setGlobalFilter] = useState('')

  const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted()
    if (sorted === 'asc') return <ChevronUp className="w-4 h-4 text-indigo-400" />
    if (sorted === 'desc') return <ChevronDown className="w-4 h-4 text-indigo-400" />
    return <ChevronsUpDown className="w-4 h-4 text-slate-500" />
  }

  const columnHelper = createColumnHelper()
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Member <SortIcon column={column} />
          </button>
        ),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {row.original.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <span className="font-medium text-white">{row.original.name}</span>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Email <SortIcon column={column} />
          </button>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <span className="text-slate-400 text-sm">{getValue()}</span>
        ),
        meta: { hideOnMobile: true }
      }),
      columnHelper.accessor('roles', {
        header: 'Roles',
        cell: ({ getValue }) => (
          <div className="flex flex-wrap gap-1">
            {(getValue() || []).map((r) => (
              <Badge key={r} variant={roleVariant(r)}>
                {r}
              </Badge>
            ))}
          </div>
        )
      }),
      columnHelper.accessor('manager_name', {
        header: 'Reports To',
        cell: ({ getValue }) => getValue() || '—',
        meta: { hideOnLg: true }
      }),
      columnHelper.accessor('is_active', {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1 hover:text-slate-300"
          >
            Status <SortIcon column={column} />
          </button>
        ),
        enableSorting: true,
        cell: ({ getValue }) => (
          <Badge variant={getValue() ? 'emerald' : 'slate'}>
            {getValue() ? 'Active' : 'Inactive'}
          </Badge>
        )
      })
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: members,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const activeCount = members.filter((m) => m.is_active).length

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Team Members</h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin
            ? 'All users across the organization.'
            : 'Your team hierarchy.'}
        </p>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-slate-400 text-sm">
          {members.length} members total · {activeCount} active
        </p>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-slate-800">
              {[...Array(5)].map((_, j) => (
                <div
                  key={j}
                  className="h-6 flex-1 bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members found."
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
                          className={`
                            text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3
                            ${header.column.columnDef.meta?.hideOnMobile === true ? 'hidden md:table-cell' : ''}
                            ${header.column.columnDef.meta?.hideOnLg === true ? 'hidden lg:table-cell' : ''}
                          `}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
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
                          className={`
                            px-4 py-3 text-sm
                            ${cell.column.columnDef.meta?.hideOnMobile === true ? 'hidden md:table-cell' : ''}
                            ${cell.column.columnDef.meta?.hideOnLg === true ? 'hidden lg:table-cell' : ''}
                          `}
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
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
