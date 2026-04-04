import { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  UserPlus,
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
import { getTeamMembers } from "../../api/services/team.service";
import { createUser } from "../../api/services/user.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Users } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

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
  const { data: members, loading, error, refetch } = useTeamMembers();
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [membersForManager, setMembersForManager] = useState([]);
  const [createSuccess, setCreateSuccess] = useState(null);
  const [createError, setCreateError] = useState(null);

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

  // Load members for manager selection
  const loadMembersForManager = async () => {
    if (!isAdmin) return;
    try {
      const res = await getTeamMembers();
      const usersData = res.data.data || res.data || [];
      setMembersForManager(usersData);
    } catch (e) {
      console.error("Failed to load members for manager selection:", e);
    }
  };

  // Filter for managers/admins using uppercase role names
  const managerOptions = membersForManager.filter(
    (m) => m.roles?.includes("MANAGER") || m.roles?.includes("ADMIN"),
  );

  const visibleRoleOptions = isAdmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value !== "ADMIN");

  const toggleRole = (value) => {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value],
    );
  };

  const handleCreateUser = async () => {
    setCreateError(null);
    if (selectedRoles.length === 0) {
      setCreateError("Select at least one role.");
      return;
    }

    // Validate role selection
    const hasAdmin = selectedRoles.includes("ADMIN");

    // Only admins can assign admin role
    if (hasAdmin && !isAdmin) {
      setCreateError("Only admins can assign admin role.");
      return;
    }

    // Filter roles based on permissions
    let finalRoles = selectedRoles;
    if (!isAdmin) {
      finalRoles = finalRoles.filter((role) => role !== "ADMIN");
    }

    setCreateLoading(true);
    try {
      // Use new API field names: fullName, managerUserId
      const payload = {
        fullName: name.trim(),
        email: email.trim(),
        roles: finalRoles,
      };

      // Add managerUserId based on user role
      if (isAdmin) {
        if (selectedManagerId) {
          payload.managerUserId = selectedManagerId;
        }
      } else {
        // Non-admins: new users report to them
        payload.managerUserId = user?.sub || user?.id;
      }

      await createUser(payload);
      
      setCreateSuccess(name.trim());
      setName("");
      setEmail("");
      setSelectedRoles([]);
      setSelectedManagerId("");
      setIsCreateModalOpen(false);
      refetch(); // Refresh the team members list
      setTimeout(() => setCreateSuccess(null), 4000);
    } catch (err) {
      setCreateError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to create user.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const openCreateModal = () => {
    setCreateError(null);
    setCreateSuccess(null);
    setName("");
    setEmail("");
    setSelectedRoles([]);
    setSelectedManagerId("");
    setIsCreateModalOpen(true);
    loadMembersForManager();
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
              {isAdmin
                ? "All users across the organization."
                : "Your team hierarchy."}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </header>

      {createSuccess && (
        <div className="flex items-center justify-between gap-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3">
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 shrink-0" />
            User {createSuccess} has been created successfully.
          </span>
          <button
            type="button"
            onClick={() => setCreateSuccess(null)}
            className="p-1 rounded hover:bg-emerald-500/20"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

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

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create User"
        subtitle={
          isAdmin
            ? "Create and assign employees, managers, or admins. Assign a reporting manager."
            : "Create employees or managers. New users will be placed under your hierarchy."
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateUser}
              loading={createLoading}
              disabled={createLoading}
            >
              {createLoading ? "Creating..." : "Create User"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
              <Users className="w-5 h-5 shrink-0" />
              <p>{createError}</p>
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <Input
            label="Company Email"
            type="email"
            placeholder="john@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Assign Roles
            </label>
            <p className="text-gray-500 dark:text-slate-500 text-xs mb-2">
              Select one or more roles. At least one is required.
            </p>
            <div className="flex flex-wrap gap-2">
              {visibleRoleOptions.map(({ value, label }) => {
                const active = selectedRoles.includes(value);
                const colorClass =
                  value === "ADMIN"
                    ? "bg-rose-600 border-rose-500 text-white"
                    : value === "MANAGER"
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-indigo-600 border-indigo-500 text-white";
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleRole(value)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                      ${active ? colorClass : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-400 border-gray-300 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-500"}
                    `}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Reporting Manager
              </label>
              <select
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
                className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="">— Select a manager —</option>
                <option value="">None (top-level)</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName || m.username} ({m.email})
                  </option>
                ))}
              </select>
              <p className="text-gray-500 dark:text-slate-500 text-xs mt-1">
                The new user will report directly to this person.
              </p>
            </div>
          )}

          {!isAdmin && (
            <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-600 dark:text-indigo-300 text-sm">
              <Users className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                Users you create will be automatically placed under your
                hierarchy.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
