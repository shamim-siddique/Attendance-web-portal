import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import { useAuth } from "../../context/AuthContext";
import { useTeamMembers } from "../../hooks/useTeamMembers";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Users } from "lucide-react";

const roleVariant = (role) => {
  const normalizedRole = role?.toUpperCase();
  return normalizedRole === "ADMIN"
    ? "rose"
    : normalizedRole === "MANAGER"
      ? "violet"
      : "indigo";
};

export function TeamMembersPage() {
  const { isAdmin, user } = useAuth();
  const { data: members, loading, error } = useTeamMembers();
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter out the logged-in user from the members list
  const filteredMembers = useMemo(() => {
    if (!user || !members) return members;
    return members.filter((member) => {
      // Filter by ID if available, otherwise by email
      if (user.userId && member.id) {
        return member.id !== user.userId;
      }
      // Fallback to email comparison
      return member.email !== user.email;
    });
  }, [members, user]);

  const SortIcon = ({ column }) => {
    const sorted = column.getIsSorted();
    if (sorted === "asc")
      return (
        <ChevronUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      );
    if (sorted === "desc")
      return (
        <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      );
    return (
      <ChevronsUpDown className="w-4 h-4 text-gray-500 dark:text-slate-500" />
    );
  };

  const columnHelper = createColumnHelper();
  const columnCount = isAdmin ? 5 : 4;
  const columns = useMemo(
    () =>
      [
        columnHelper.accessor("username", {
          header: ({ column }) => (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
            >
              Member <SortIcon column={column} />
            </button>
          ),
          enableSorting: true,
          cell: ({ row }) => (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                {row.original.username?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {row.original.username}
              </span>
            </div>
          ),
        }),
        columnHelper.accessor("email", {
          header: ({ column }) => (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
            >
              Email <SortIcon column={column} />
            </button>
          ),
          enableSorting: true,
          cell: ({ getValue }) => (
            <span className="text-gray-600 dark:text-slate-400 text-sm">
              {getValue()}
            </span>
          ),
          meta: { hideOnMobile: true },
        }),
        columnHelper.accessor("roles", {
          header: "Roles",
          cell: ({ getValue }) => (
            <div className="flex flex-wrap gap-1">
              {(getValue() || []).map((r) => (
                <Badge key={r} variant={roleVariant(r)}>
                  {r}
                </Badge>
              ))}
            </div>
          ),
        }),
        isAdmin
          ? columnHelper.accessor("manager_name", {
              header: "Reports To",
              cell: ({ getValue }) => getValue() || "—",
              meta: { hideOnLg: true },
            })
          : null,
        columnHelper.accessor("is_active", {
          header: ({ column }) => (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
            >
              Status <SortIcon column={column} />
            </button>
          ),
          enableSorting: true,
          cell: ({ getValue }) => (
            <Badge variant={getValue() ? "emerald" : "slate"}>
              {getValue() ? "Active" : "Inactive"}
            </Badge>
          ),
        }),
      ].filter(Boolean),
    [columnHelper, isAdmin],
  );

  const table = useReactTable({
    data: filteredMembers,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const activeCount = filteredMembers.filter((m) => m.is_active).length;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Team Members
        </h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
          {isAdmin
            ? "All users across the organization."
            : "Your team hierarchy."}
        </p>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-gray-600 dark:text-slate-400 text-sm">
          {filteredMembers.length} members total · {activeCount} active
        </p>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-800"
            >
              {[...Array(columnCount)].map((_, j) => (
                <div
                  key={j}
                  className="h-6 flex-1 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : filteredMembers.length === 0 ? (
          <EmptyState icon={Users} title="No team members found." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-gray-200 dark:border-slate-800"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={`
                            text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500 px-4 py-3
                            ${header.column.columnDef.meta?.hideOnMobile === true ? "hidden md:table-cell" : ""}
                            ${header.column.columnDef.meta?.hideOnLg === true ? "hidden lg:table-cell" : ""}
                          `}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                      className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`
                            px-4 py-3 text-gray-900 dark:text-white text-sm
                            ${cell.column.columnDef.meta?.hideOnMobile === true ? "hidden md:table-cell" : ""}
                            ${cell.column.columnDef.meta?.hideOnLg === true ? "hidden lg:table-cell " : ""}
                          `}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-600 dark:text-slate-400 text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </span>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
