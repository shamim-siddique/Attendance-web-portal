// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Calendar,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   MapPinned,
//   PencilLine,
// } from "lucide-react";
// import { useTeamAttendance } from "../../hooks/useTeamAttendance";
// import {
//   deleteRegularization,
//   overrideAttendance,
// } from "../../api/services/team.service";
// import { Badge } from "../../components/ui/Badge";
// import { Button } from "../../components/ui/Button";
// import { EmptyState } from "../../components/ui/EmptyState";
// import { Input } from "../../components/ui/Input";
// import { Modal } from "../../components/ui/Modal";
// import {
//   formatDate,
//   formatMinutes,
//   formatTime,
//   getFirstDayOfMonth,
//   getToday,
//   toDatetimeLocal,
// } from "../../utils/dateUtils";

// const STATUS_OPTIONS = [
//   { value: "all", label: "All Status" },
//   { value: "present", label: "Present" },
//   { value: "halfDay", label: "Half Day" },
//   { value: "absent", label: "Absent" },
//   { value: "regularized", label: "Regularized" },
// ];

// const STATUS_LABELS = {
//   present: "Present",
//   halfDay: "Half Day",
//   absent: "Absent",
//   working: "Working",
//   onLeave: "Leave",
//   holiday: "Holiday",
//   weeklyOff: "Weekly Off",
// };

// const STATUS_VARIANTS = {
//   present: "emerald",
//   halfDay: "amber",
//   absent: "rose",
//   working: "indigo",
//   onLeave: "blue",
//   holiday: "violet",
//   weeklyOff: "slate",
// };

// const FLAG_LABELS = {
//   regularized: "Regularized",
//   missingPunchIn: "Missing punch in",
//   missingPunchOut: "Missing punch out",
// };

// const getErrorMessage = (error, fallback) =>
//   error.response?.data?.error?.message ||
//   error.response?.data?.message ||
//   fallback;

// const deriveOverrideStatus = (record) => {
//   if (record?.regularization?.overrideStatus) {
//     return record.regularization.overrideStatus;
//   }

//   switch (record?.attendance_state) {
//     case "present":
//       return "PRESENT";
//     case "halfDay":
//       return "HALF_DAY";
//     default:
//       return "ABSENT";
//   }
// };

// const canRegularizeRecord = (record, today) =>
//   record?.day_type === "workingDay" && record?.punch_date < today;

// const getMapLink = (record) => {
//   const params = new URLSearchParams({
//     lat: String(record.latitude),
//     lng: String(record.longitude),
//     user: record.username || "Unknown User",
//     date: record.punch_date || "",
//   });

//   return `/team/map?${params.toString()}`;
// };

// export function TeamAttendancePage() {
//   const today = getToday();
//   const defaultStartDate = getFirstDayOfMonth();
//   const defaultEndDate = today;

//   const [draftStartDate, setDraftStartDate] = useState(defaultStartDate);
//   const [draftEndDate, setDraftEndDate] = useState(defaultEndDate);
//   const [draftStatus, setDraftStatus] = useState("all");
//   const [filters, setFilters] = useState({
//     startDate: defaultStartDate,
//     endDate: defaultEndDate,
//     status: "all",
//     page: 1,
//     limit: 20,
//   });

//   const { data: attendance, meta, loading, error, refetch } = useTeamAttendance({
//     startDate: filters.startDate,
//     endDate: filters.endDate,
//     status: filters.status === "all" ? undefined : filters.status,
//     page: filters.page,
//     limit: filters.limit,
//   });

//   const [regularizationTarget, setRegularizationTarget] = useState(null);
//   const [overrideStatus, setOverrideStatus] = useState("PRESENT");
//   const [overridePunchIn, setOverridePunchIn] = useState("");
//   const [overridePunchOut, setOverridePunchOut] = useState("");
//   const [overrideReason, setOverrideReason] = useState("");
//   const [regularizationError, setRegularizationError] = useState("");
//   const [savingRegularization, setSavingRegularization] = useState(false);
//   const [deletingRegularization, setDeletingRegularization] = useState(false);
//   const [toast, setToast] = useState(null);

//   const invalidDateRange = draftStartDate && draftEndDate && draftStartDate > draftEndDate;
//   const currentPage = meta?.page ?? filters.page;
//   const totalPages = meta?.totalPages ?? 0;
//   const totalRecords = meta?.total ?? 0;
//   const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * filters.limit + 1;
//   const rangeEnd =
//     totalRecords === 0 ? 0 : Math.min(currentPage * filters.limit, totalRecords);
//   const rangeNote = meta?.range?.futureDatesTrimmed
//     ? `Future dates were trimmed to ${formatDate(meta.range.endDate)}.`
//     : null;

//   useEffect(() => {
//     if (!toast) return undefined;

//     const timer = window.setTimeout(() => setToast(null), 3000);
//     return () => window.clearTimeout(timer);
//   }, [toast]);

//   const handleApplyFilters = () => {
//     if (invalidDateRange) return;

//     setFilters((current) => ({
//       ...current,
//       startDate: draftStartDate,
//       endDate: draftEndDate,
//       status: draftStatus,
//       page: 1,
//     }));
//   };

//   const handleStatusChange = (nextStatus) => {
//     setDraftStatus(nextStatus);
//     setFilters((current) => ({
//       ...current,
//       status: nextStatus,
//       page: 1,
//     }));
//   };

//   const handlePageChange = (nextPage) => {
//     setFilters((current) => ({
//       ...current,
//       page: nextPage,
//     }));
//   };

//   const openRegularizationModal = (record) => {
//     setRegularizationTarget(record);
//     setOverrideStatus(deriveOverrideStatus(record));
//     setOverridePunchIn(toDatetimeLocal(record.punch_in));
//     setOverridePunchOut(toDatetimeLocal(record.punch_out));
//     setOverrideReason(record.regularization?.reason || "");
//     setRegularizationError("");
//   };

//   const closeRegularizationModal = () => {
//     setRegularizationTarget(null);
//     setOverrideStatus("PRESENT");
//     setOverridePunchIn("");
//     setOverridePunchOut("");
//     setOverrideReason("");
//     setRegularizationError("");
//     setSavingRegularization(false);
//     setDeletingRegularization(false);
//   };

//   const handleSaveRegularization = async (event) => {
//     event.preventDefault();

//     if (!regularizationTarget?.user_id || !regularizationTarget?.punch_date) {
//       return;
//     }

//     const trimmedReason = overrideReason.trim();
//     if (!trimmedReason) {
//       setRegularizationError("Reason is required.");
//       return;
//     }

//     setSavingRegularization(true);
//     setRegularizationError("");

//     try {
//       const payload = {
//         overrideStatus,
//         reason: trimmedReason,
//       };

//       if (overridePunchIn) {
//         payload.overridePunchInAt = new Date(overridePunchIn).toISOString();
//       }

//       if (overridePunchOut) {
//         payload.overridePunchOutAt = new Date(overridePunchOut).toISOString();
//       }

//       await overrideAttendance(
//         regularizationTarget.user_id,
//         regularizationTarget.punch_date,
//         payload,
//       );

//       closeRegularizationModal();
//       await refetch();
//       setToast({ type: "success", message: "Attendance override saved." });
//     } catch (err) {
//       setRegularizationError(
//         getErrorMessage(err, "Failed to save attendance override."),
//       );
//     } finally {
//       setSavingRegularization(false);
//     }
//   };

//   const handleDeleteRegularization = async () => {
//     if (!regularizationTarget?.regularization) return;

//     setDeletingRegularization(true);
//     setRegularizationError("");

//     try {
//       await deleteRegularization(
//         regularizationTarget.user_id,
//         regularizationTarget.punch_date,
//       );

//       closeRegularizationModal();
//       await refetch();
//       setToast({ type: "success", message: "Attendance override removed." });
//     } catch (err) {
//       setRegularizationError(
//         getErrorMessage(err, "Failed to remove attendance override."),
//       );
//     } finally {
//       setDeletingRegularization(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <header>
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Team Attendance
//         </h2>
//         <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
//           View and manage attendance records. Override incorrect entries as needed.
//         </p>
//       </header>

//       {toast && (
//         <div
//           className={`rounded-xl px-4 py-3 ${
//             toast.type === "success"
//               ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
//               : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
//           }`}
//         >
//           {toast.message}
//         </div>
//       )}

//       {error && (
//         <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
//           Error: {error}
//         </div>
//       )}

//       <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
//         <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_220px_auto]">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
//               Start Date
//             </label>
//             <input
//               type="date"
//               value={draftStartDate}
//               onChange={(event) => setDraftStartDate(event.target.value)}
//               className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
//               End Date
//             </label>
//             <input
//               type="date"
//               value={draftEndDate}
//               onChange={(event) => setDraftEndDate(event.target.value)}
//               className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
//               Status
//             </label>
//             <select
//               value={draftStatus}
//               onChange={(event) => handleStatusChange(event.target.value)}
//               className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
//             >
//               {STATUS_OPTIONS.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-end">
//             <Button
//               onClick={handleApplyFilters}
//               loading={loading}
//               disabled={invalidDateRange}
//               className="w-full lg:w-auto"
//             >
//               <Filter className="w-4 h-4" />
//               Apply
//             </Button>
//           </div>
//         </div>

//         {invalidDateRange && (
//           <p className="text-xs text-rose-400">
//             Start date must be on or before end date.
//           </p>
//         )}

//         {rangeNote && (
//           <p className="text-xs text-gray-500 dark:text-slate-500">{rangeNote}</p>
//         )}
//       </section>

//       <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
//         {loading ? (
//           [...Array(8)].map((_, index) => (
//             <div
//               key={index}
//               className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-800"
//             >
//               {[...Array(9)].map((__, skeletonIndex) => (
//                 <div
//                   key={skeletonIndex}
//                   className="h-6 flex-1 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"
//                 />
//               ))}
//             </div>
//           ))
//         ) : attendance.length === 0 ? (
//           <EmptyState
//             icon={Calendar}
//             title="No attendance records found."
//             description="Try adjusting the selected date range or status filter."
//           />
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="min-w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/70">
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Member
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Date
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Punch In
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Punch Out
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Work Hours
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Status
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Location
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Action
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                       Reason
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {attendance.map((record) => {
//                     const canRegularize = canRegularizeRecord(record, today);
//                     const hasLocation =
//                       record.latitude != null && record.longitude != null;

//                     return (
//                       <tr
//                         key={record.id}
//                         className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
//                       >
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
//                               {record.username?.charAt(0)?.toUpperCase() || "?"}
//                             </div>
//                             <div className="min-w-0">
//                               <p className="font-medium text-gray-900 dark:text-white">
//                                 {record.username}
//                               </p>
//                               <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
//                                 {record.email}
//                               </p>
//                             </div>
//                           </div>
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
//                           {formatDate(record.punch_date)}
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
//                           {formatTime(record.punch_in)}
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
//                           {formatTime(record.punch_out)}
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
//                           {formatMinutes(record.work_minutes)}
//                         </td>

//                         <td className="px-4 py-3">
//                           <Badge
//                             variant={
//                               STATUS_VARIANTS[record.attendance_state] || "slate"
//                             }
//                           >
//                             {STATUS_LABELS[record.attendance_state] ||
//                               record.attendance_state}
//                           </Badge>
//                         </td>

//                         <td className="px-4 py-3 text-sm">
//                           {hasLocation ? (
//                             <Link
//                               to={getMapLink(record)}
//                               className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
//                             >
//                               <MapPinned className="w-4 h-4" />
//                               View Map
//                             </Link>
//                           ) : (
//                             <span className="text-gray-400 dark:text-slate-500">
//                               No map
//                             </span>
//                           )}
//                         </td>

//                         <td className="px-4 py-3">
//                           <Button
//                             variant={record.regularization ? "secondary" : "outline"}
//                             size="sm"
//                             onClick={() => openRegularizationModal(record)}
//                             disabled={!canRegularize}
//                             title={
//                               canRegularize
//                                 ? "Override attendance"
//                                 : "Only past working days can be overridden"
//                             }
//                           >
//                             <PencilLine className="w-4 h-4" />
//                             {record.regularization ? "Edit Override" : "Override"}
//                           </Button>
//                         </td>

//                         <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
//                           {record.regularization?.reason ? (
//                             <p
//                               className="max-w-[280px] truncate"
//                               title={record.regularization.reason}
//                             >
//                               {record.regularization.reason}
//                             </p>
//                           ) : (
//                             <span>—</span>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-800">
//               <p className="text-sm text-gray-600 dark:text-slate-400">
//                 Showing {rangeStart}-{rangeEnd} of {totalRecords} records
//               </p>

//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage <= 1 || loading}
//                   className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronLeft className="w-5 h-5" />
//                 </button>

//                 <span className="text-sm text-gray-600 dark:text-slate-400">
//                   Page {currentPage} of {Math.max(totalPages, 1)}
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage >= totalPages || totalPages === 0 || loading}
//                   className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronRight className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </section>

//       <Modal
//         isOpen={Boolean(regularizationTarget)}
//         onClose={closeRegularizationModal}
//         title={
//           regularizationTarget
//             ? `Override ${regularizationTarget.username}`
//             : "Override Attendance"
//         }
//         subtitle={
//           regularizationTarget
//             ? `Adjust attendance for ${formatDate(regularizationTarget.punch_date)}`
//             : "Adjust attendance for the selected record."
//         }
//         footer={
//           <>
//             {regularizationTarget?.regularization && (
//               <Button
//                 variant="danger"
//                 onClick={handleDeleteRegularization}
//                 loading={deletingRegularization}
//               >
//                 Remove Override
//               </Button>
//             )}

//             <Button variant="ghost" onClick={closeRegularizationModal}>
//               Cancel
//             </Button>

//             <Button
//               type="submit"
//               form="attendance-override-form"
//               loading={savingRegularization}
//             >
//               Save Override
//             </Button>
//           </>
//         }
//       >
//         <form
//           id="attendance-override-form"
//           onSubmit={handleSaveRegularization}
//           className="space-y-4"
//         >
//           <div className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-3">
//             <p className="text-xs text-gray-500 dark:text-slate-500">Current Status</p>
//             <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
//               {STATUS_LABELS[regularizationTarget?.attendance_state] ||
//                 regularizationTarget?.attendance_state ||
//                 "Unknown"}
//             </p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
//               Override Status
//             </label>
//             <select
//               value={overrideStatus}
//               onChange={(event) => setOverrideStatus(event.target.value)}
//               className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
//             >
//               <option value="PRESENT">Present</option>
//               <option value="HALF_DAY">Half Day</option>
//               <option value="ABSENT">Absent</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Input
//               label="Override Punch In"
//               type="datetime-local"
//               value={overridePunchIn}
//               onChange={(event) => setOverridePunchIn(event.target.value)}
//             />
//             <Input
//               label="Override Punch Out"
//               type="datetime-local"
//               value={overridePunchOut}
//               onChange={(event) => setOverridePunchOut(event.target.value)}
//             />
//           </div>

//           <Input
//             label="Reason"
//             rows={3}
//             required
//             value={overrideReason}
//             onChange={(event) => setOverrideReason(event.target.value)}
//             placeholder="Explain why this attendance entry is being overridden."
//           />

//           {regularizationError && (
//             <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
//               {regularizationError}
//             </div>
//           )}
//         </form>
//       </Modal>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPinned,
  PencilLine,
} from "lucide-react";
import { useTeamAttendance } from "../../hooks/useTeamAttendance";
import {
  deleteRegularization,
  overrideAttendance,
} from "../../api/services/team.service";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import {
  formatDate,
  formatMinutes,
  formatTime,
  getFirstDayOfMonth,
  getToday,
  toDatetimeLocal,
} from "../../utils/dateUtils";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "present", label: "Present" },
  { value: "halfDay", label: "Half Day" },
  { value: "absent", label: "Absent" },
  { value: "regularized", label: "Regularized" },
];

const STATUS_LABELS = {
  present: "Present",
  halfDay: "Half Day",
  absent: "Absent",
  working: "Working",
  onLeave: "Leave",
  holiday: "Holiday",
  weeklyOff: "Weekly Off",
};

const STATUS_VARIANTS = {
  present: "emerald",
  halfDay: "amber",
  absent: "rose",
  working: "indigo",
  onLeave: "blue",
  holiday: "violet",
  weeklyOff: "slate",
};

const FLAG_LABELS = {
  regularized: "Regularized",
  missingPunchIn: "Missing punch in",
  missingPunchOut: "Missing punch out",
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  fallback;

const deriveOverrideStatus = (record) => {
  if (record?.regularization?.overrideStatus) {
    return record.regularization.overrideStatus;
  }

  switch (record?.attendance_state) {
    case "present":
      return "PRESENT";
    case "halfDay":
      return "HALF_DAY";
    default:
      return "ABSENT";
  }
};

const canRegularizeRecord = (record, today) =>
  record?.day_type === "workingDay" && record?.punch_date < today;

const getMapLink = (record) => {
  const params = new URLSearchParams({
    lat: String(record.latitude),
    lng: String(record.longitude),
    user: record.username || "Unknown User",
    date: record.punch_date || "",
  });

  return `/team/map?${params.toString()}`;
};

export function TeamAttendancePage() {
  const today = getToday();
  const defaultStartDate = getFirstDayOfMonth();
  const defaultEndDate = today;

  const [draftStartDate, setDraftStartDate] = useState(defaultStartDate);
  const [draftEndDate, setDraftEndDate] = useState(defaultEndDate);
  const [draftStatus, setDraftStatus] = useState("all");
  const [filters, setFilters] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    status: "all",
    page: 1,
    limit: 20,
  });

  const { data: attendance, meta, loading, error, refetch } = useTeamAttendance({
    startDate: filters.startDate,
    endDate: filters.endDate,
    status: filters.status === "all" ? undefined : filters.status,
    page: filters.page,
    limit: filters.limit,
  });

  const [regularizationTarget, setRegularizationTarget] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState("PRESENT");
  const [overridePunchIn, setOverridePunchIn] = useState("");
  const [overridePunchOut, setOverridePunchOut] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [regularizationError, setRegularizationError] = useState("");
  const [savingRegularization, setSavingRegularization] = useState(false);
  const [deletingRegularization, setDeletingRegularization] = useState(false);
  const [toast, setToast] = useState(null);

  const invalidDateRange = draftStartDate && draftEndDate && draftStartDate > draftEndDate;
  const currentPage = meta?.page ?? filters.page;
  const totalPages = meta?.totalPages ?? 0;
  const totalRecords = meta?.total ?? 0;
  const rangeStart = totalRecords === 0 ? 0 : (currentPage - 1) * filters.limit + 1;
  const rangeEnd =
    totalRecords === 0 ? 0 : Math.min(currentPage * filters.limit, totalRecords);
  const rangeNote = meta?.range?.futureDatesTrimmed
    ? `Future dates were trimmed to ${formatDate(meta.range.endDate)}.`
    : null;

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleApplyFilters = () => {
    if (invalidDateRange) return;

    setFilters((current) => ({
      ...current,
      startDate: draftStartDate,
      endDate: draftEndDate,
      status: draftStatus,
      page: 1,
    }));
  };

  const handleStatusChange = (nextStatus) => {
    setDraftStatus(nextStatus);
    setFilters((current) => ({
      ...current,
      status: nextStatus,
      page: 1,
    }));
  };

  const handlePageChange = (nextPage) => {
    setFilters((current) => ({
      ...current,
      page: nextPage,
    }));
  };

  const openRegularizationModal = (record) => {
    setRegularizationTarget(record);
    setOverrideStatus(deriveOverrideStatus(record));
    setOverridePunchIn(toDatetimeLocal(record.punch_in));
    setOverridePunchOut(toDatetimeLocal(record.punch_out));
    setOverrideReason(record.regularization?.reason || "");
    setRegularizationError("");
  };

  const closeRegularizationModal = () => {
    setRegularizationTarget(null);
    setOverrideStatus("PRESENT");
    setOverridePunchIn("");
    setOverridePunchOut("");
    setOverrideReason("");
    setRegularizationError("");
    setSavingRegularization(false);
    setDeletingRegularization(false);
  };

  const handleSaveRegularization = async (event) => {
    event.preventDefault();

    if (!regularizationTarget?.user_id || !regularizationTarget?.punch_date) {
      return;
    }

    const trimmedReason = overrideReason.trim();
    if (!trimmedReason) {
      setRegularizationError("Reason is required.");
      return;
    }

    setSavingRegularization(true);
    setRegularizationError("");

    try {
      const payload = {
        overrideStatus,
        reason: trimmedReason,
      };

      if (overridePunchIn) {
        payload.overridePunchInAt = new Date(overridePunchIn).toISOString();
      }

      if (overridePunchOut) {
        payload.overridePunchOutAt = new Date(overridePunchOut).toISOString();
      }

      await overrideAttendance(
        regularizationTarget.user_id,
        regularizationTarget.punch_date,
        payload,
      );

      closeRegularizationModal();
      await refetch();
      setToast({ type: "success", message: "Attendance override saved." });
    } catch (err) {
      setRegularizationError(
        getErrorMessage(err, "Failed to save attendance override."),
      );
    } finally {
      setSavingRegularization(false);
    }
  };

  const handleDeleteRegularization = async () => {
    if (!regularizationTarget?.regularization) return;

    setDeletingRegularization(true);
    setRegularizationError("");

    try {
      await deleteRegularization(
        regularizationTarget.user_id,
        regularizationTarget.punch_date,
      );

      closeRegularizationModal();
      await refetch();
      setToast({ type: "success", message: "Attendance override removed." });
    } catch (err) {
      setRegularizationError(
        getErrorMessage(err, "Failed to remove attendance override."),
      );
    } finally {
      setDeletingRegularization(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Team Attendance
        </h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
          View and manage attendance records. Override incorrect entries as needed.
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

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
          Error: {error}
        </div>
      )}

      <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_220px_auto]">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={draftStartDate}
              onChange={(event) => setDraftStartDate(event.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={draftEndDate}
              onChange={(event) => setDraftEndDate(event.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-500 mb-1">
              Status
            </label>
            <select
              value={draftStatus}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleApplyFilters}
              loading={loading}
              disabled={invalidDateRange}
              className="w-full lg:w-auto"
            >
              <Filter className="w-4 h-4" />
              Apply
            </Button>
          </div>
        </div>

        {invalidDateRange && (
          <p className="text-xs text-rose-400">
            Start date must be on or before end date.
          </p>
        )}

        {rangeNote && (
          <p className="text-xs text-gray-500 dark:text-slate-500">{rangeNote}</p>
        )}
      </section>

      <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(8)].map((_, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-800"
            >
              {[...Array(9)].map((__, skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className="h-6 flex-1 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No attendance records found."
            description="Try adjusting the selected date range or status filter."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/70">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Member
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Punch In
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Punch Out
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Work Hours
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                      Reason
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record) => {
                    const canRegularize = canRegularizeRecord(record, today);
                    const hasLocation =
                      record.latitude != null && record.longitude != null;

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                              {record.username?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {record.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
                                {record.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(record.punch_date)}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                          {formatTime(record.punch_in)}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                          {formatTime(record.punch_out)}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                          {formatMinutes(record.work_minutes)}
                        </td>

                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              STATUS_VARIANTS[record.attendance_state] || "slate"
                            }
                          >
                            {STATUS_LABELS[record.attendance_state] ||
                              record.attendance_state}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {hasLocation ? (
                            <Link
                              to={getMapLink(record)}
                              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              <MapPinned className="w-4 h-4" />
                              View Map
                            </Link>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">
                              No map
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <Button
                            variant={record.regularization ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => openRegularizationModal(record)}
                            disabled={!canRegularize}
                            title={
                              canRegularize
                                ? "Override attendance"
                                : "Only past working days can be overridden"
                            }
                          >
                            <PencilLine className="w-4 h-4" />
                            {record.regularization ? "Edit Override" : "Override"}
                          </Button>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                          {record.regularization?.reason ? (
                            <p
                              className="max-w-[280px] truncate"
                              title={record.regularization.reason}
                            >
                              {record.regularization.reason}
                            </p>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-800">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Showing {rangeStart}-{rangeEnd} of {totalRecords} records
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-600 dark:text-slate-400">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || totalPages === 0 || loading}
                  className="p-2 rounded-lg text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        isOpen={Boolean(regularizationTarget)}
        onClose={closeRegularizationModal}
        title={
          regularizationTarget
            ? `Override ${regularizationTarget.username}`
            : "Override Attendance"
        }
        subtitle={
          regularizationTarget
            ? `Adjust attendance for ${formatDate(regularizationTarget.punch_date)}`
            : "Adjust attendance for the selected record."
        }
        footer={
          <>
            {regularizationTarget?.regularization && (
              <Button
                variant="danger"
                onClick={handleDeleteRegularization}
                loading={deletingRegularization}
              >
                Remove Override
              </Button>
            )}

            <Button variant="ghost" onClick={closeRegularizationModal}>
              Cancel
            </Button>

            <Button
              type="submit"
              form="attendance-override-form"
              loading={savingRegularization}
            >
              Save Override
            </Button>
          </>
        }
      >
        <form
          id="attendance-override-form"
          onSubmit={handleSaveRegularization}
          className="space-y-4"
        >
          <div className="rounded-xl border border-gray-200 dark:border-slate-800 px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-slate-500">Current Status</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {STATUS_LABELS[regularizationTarget?.attendance_state] ||
                regularizationTarget?.attendance_state ||
                "Unknown"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
              Override Status
            </label>
            <select
              value={overrideStatus}
              onChange={(event) => setOverrideStatus(event.target.value)}
              className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
            >
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Override Punch In"
              type="datetime-local"
              value={overridePunchIn}
              onChange={(event) => setOverridePunchIn(event.target.value)}
            />
            <Input
              label="Override Punch Out"
              type="datetime-local"
              value={overridePunchOut}
              onChange={(event) => setOverridePunchOut(event.target.value)}
            />
          </div>

          <Input
            label="Reason"
            rows={3}
            required
            value={overrideReason}
            onChange={(event) => setOverrideReason(event.target.value)}
            placeholder="Explain why this attendance entry is being overridden."
          />

          {regularizationError && (
            <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {regularizationError}
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
