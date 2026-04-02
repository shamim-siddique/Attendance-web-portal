import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ClipboardList,
  Filter,
  Check,
  X,
  XCircle,
  Loader2,
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
import { useLeaveRequests } from "../../hooks/useLeaveRequests";
import { approveLeave, rejectLeave } from "../../api/services/leave.service";
import { formatDate } from "../../utils/dateUtils";
import { getFirstDayOfMonth, getToday } from "../../utils/dateUtils";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { DateRangePicker } from "../../components/ui/DateRangePicker";
import { Input } from "../../components/ui/Input";

const statusVariant = {
  pending: "amber",
  approved: "emerald",
  rejected: "rose",
};
const statusLabel = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function LeaveRequestsPage() {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getToday());
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    data: leaves,
    loading,
    refetch,
  } = useLeaveRequests(startDate, endDate, statusFilter);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const pendingCount = useMemo(
    () => leaves.filter((l) => l.status === "pending").length,
    [leaves],
  );
  const approvedCount = useMemo(
    () => leaves.filter((l) => l.status === "approved").length,
    [leaves],
  );
  const rejectedCount = useMemo(
    () => leaves.filter((l) => l.status === "rejected").length,
    [leaves],
  );

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
  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
          >
            Employee <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                {row.original.username?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {row.original.username}
              </span>
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-xs mt-0.5">
              {row.original.email}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("leave_date", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
          >
            Date <SortIcon column={column} />
          </button>
        ),
        cell: ({ row }) => {
          const startDate = row.original.start_date;
          const endDate = row.original.end_date;
          
          if (startDate === endDate) {
            return formatDate(startDate);
          }
          
          return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        },
      }),
      columnHelper.accessor("reason", {
        header: "Reason",
        cell: ({ getValue }) => (
          <span className="max-w-xs truncate block text-gray-600 dark:text-slate-400">
            {getValue() || "—"}
          </span>
        ),
        meta: { hideOnMobile: true },
      }),
      columnHelper.accessor("created_at", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
          >
            Applied On <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => formatDate(getValue()?.slice(0, 10)),
        meta: { hideOnLg: true },
      }),
      columnHelper.accessor("status", {
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-300"
          >
            Status <SortIcon column={column} />
          </button>
        ),
        cell: ({ getValue }) => (
          <Badge variant={statusVariant[getValue()] || "slate"}>
            {statusLabel[getValue()] ?? getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("approved_by_name", {
        header: "Actioned By",
        cell: ({ getValue }) => getValue() || "—",
        meta: { hideOnLg: true },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const r = row.original;
          if (r.status !== "pending") {
            if (r.status === "approved") {
              return (
                <span className="text-emerald-600 dark:text-emerald-400 text-xs">
                  Approved
                </span>
              );
            }
            return (
              <span
                title={r.rejection_reason || ""}
                className="text-rose-600 dark:text-rose-400 text-xs cursor-help"
              >
                Rejected
              </span>
            );
          }
          const isApproving = approvingId === r.id;
          return (
            <div className="flex items-center gap-1">
              {isApproving ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleApprove(r.id)}
                    disabled={approvingId != null}
                    className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectTarget(r);
                      setRejectionReason("");
                      setRejectError("");
                    }}
                    disabled={approvingId != null}
                    className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [columnHelper, SortIcon, approvingId],
  );

  const table = useReactTable({
    data: leaves,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const handleApprove = async (leaveId) => {
    setApprovingId(leaveId);
    try {
      await approveLeave(leaveId);
      refetch();
      setToast({ type: "success", message: "Leave approved successfully." });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to approve.",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      setRejectError("Rejection reason is required.");
      return;
    }
    setRejectLoading(true);
    setRejectError("");
    try {
      await rejectLeave(rejectTarget.id, reason);
      setRejectTarget(null);
      setRejectionReason("");
      refetch();
      setToast({ type: "success", message: "Leave rejected." });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setRejectError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to reject leave.",
      );
    } finally {
      setRejectLoading(false);
    }
  };

  const handleApplyDates = () => refetch(); // This will use the current startDate, endDate, and statusFilter values

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Leave Requests
        </h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
          Review and action leave requests from your team.
        </p>
      </header>

      {toast && (
        <div
          className={`rounded-xl px-4 py-3 ${
            toast.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 mb-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onApply={handleApplyDates}
          loading={loading}
        />
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <label className="text-gray-600 dark:text-slate-400 text-sm">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <p className="text-amber-600 dark:text-amber-400 font-semibold">
            {pendingCount}
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-xs">Pending</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {approvedCount}
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-xs">Approved</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            {rejectedCount}
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-xs">Rejected</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-800"
            >
              {[...Array(7)].map((_, j) => (
                <div
                  key={j}
                  className="h-6 flex-1 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No leave requests found for this period."
          />
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
                          className={`text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500 px-4 py-3 ${
                            header.column.columnDef.meta?.hideOnMobile
                              ? "hidden md:table-cell"
                              : ""
                          } ${
                            header.column.columnDef.meta?.hideOnLg
                              ? "hidden lg:table-cell"
                              : ""
                          }`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                      className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`px-4 py-3 text-gray-900 dark:text-white text-sm ${
                            cell.column.columnDef.meta?.hideOnMobile
                              ? "hidden md:table-cell"
                              : ""
                          } ${
                            cell.column.columnDef.meta?.hideOnLg
                              ? "hidden lg:table-cell"
                              : ""
                          }`}
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <Button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </Button>
              <span className="text-slate-400 text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount() || 1}
              </span>
              <Button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </Button>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectionReason("");
          setRejectError("");
        }}
        title="Reject Leave Request"
        subtitle={
          rejectTarget
            ? `${rejectTarget.username} · ${
                rejectTarget.start_date === rejectTarget.end_date
                  ? formatDate(rejectTarget.start_date)
                  : `${formatDate(rejectTarget.start_date)} - ${formatDate(rejectTarget.end_date)}`
              }`
            : ""
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setRejectTarget(null);
                setRejectionReason("");
                setRejectError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              loading={rejectLoading}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="w-4 h-4" />
              Reject Leave
            </Button>
          </>
        }
      >
        {rejectTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {rejectTarget.username?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-medium text-white">
                  {rejectTarget.username}
                </p>
                <p className="text-slate-400 text-sm">
                  {rejectTarget.start_date === rejectTarget.end_date
                    ? formatDate(rejectTarget.start_date)
                    : `${formatDate(rejectTarget.start_date)} - ${formatDate(rejectTarget.end_date)}`
                  }
                  {rejectTarget.reason ? ` · ${rejectTarget.reason}` : ""}
                </p>
              </div>
            </div>
            {rejectError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm">
                {rejectError}
              </div>
            )}
            <Input
              label="Rejection Reason"
              placeholder="Please provide a reason for rejecting this leave request..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              error={
                !rejectionReason.trim() && rejectError
                  ? "Rejection reason is required."
                  : undefined
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
