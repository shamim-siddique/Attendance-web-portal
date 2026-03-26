// import { useEffect, useMemo, useState } from "react";
// import {
//   Calendar,
//   History,
//   Pencil,
//   Plus,
//   Trash2,
// } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import {
//   createHoliday,
//   deleteHoliday,
//   getHolidayHistory,
//   getHolidays,
//   updateHoliday,
// } from "../../api/services/holiday.service";
// import { StatCard } from "../../components/ui/StatCard";
// import { Button } from "../../components/ui/Button";
// import { Badge } from "../../components/ui/Badge";
// import { Modal } from "../../components/ui/Modal";
// import { Input } from "../../components/ui/Input";
// import { EmptyState } from "../../components/ui/EmptyState";
// import { DateRangePicker } from "../../components/ui/DateRangePicker";
// import { formatDate, getToday } from "../../utils/dateUtils";

// const emptyForm = {
//   title: "",
//   description: "",
//   startDate: "",
//   endDate: "",
//   reason: "",
// };

// const historyBadgeVariant = {
//   CREATED: "emerald",
//   UPDATED: "amber",
//   DELETED: "rose",
// };

// const getApiData = (response) => response.data?.data ?? response.data ?? [];

// const getErrorMessage = (error, fallback) =>
//   error.response?.data?.error?.message ||
//   error.response?.data?.message ||
//   fallback;

// const formatHolidayRange = (holiday) => {
//   const start = holiday.startDate?.slice(0, 10);
//   const end = holiday.endDate?.slice(0, 10);
//   if (!start || !end) return "—";
//   if (start === end) return formatDate(start);
//   return `${formatDate(start)} to ${formatDate(end)}`;
// };

// export function HolidayManagementPage() {
//   const { isAdmin } = useAuth();
//   const today = getToday();
//   const currentYear = today.slice(0, 4);

//   const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
//   const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
//   const [includeDeleted, setIncludeDeleted] = useState(false);

//   const [holidays, setHolidays] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [toast, setToast] = useState(null);

//   const [formMode, setFormMode] = useState(null);
//   const [editingHoliday, setEditingHoliday] = useState(null);
//   const [formValues, setFormValues] = useState(emptyForm);
//   const [formError, setFormError] = useState("");
//   const [formLoading, setFormLoading] = useState(false);

//   const [deleteTarget, setDeleteTarget] = useState(null);
//   const [deleteReason, setDeleteReason] = useState("");
//   const [deleteError, setDeleteError] = useState("");
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const [historyTarget, setHistoryTarget] = useState(null);
//   const [historyItems, setHistoryItems] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const [historyError, setHistoryError] = useState("");

//   const loadHolidays = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await getHolidays({ startDate, endDate, includeDeleted });
//       setHolidays(getApiData(response));
//     } catch (err) {
//       setError(getErrorMessage(err, "Failed to load holidays."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadHolidays();
//   }, [includeDeleted]);

//   const activeCount = useMemo(
//     () => holidays.filter((holiday) => !holiday.isDeleted).length,
//     [holidays],
//   );
//   const deletedCount = useMemo(
//     () => holidays.filter((holiday) => holiday.isDeleted).length,
//     [holidays],
//   );
//   const upcomingCount = useMemo(
//     () =>
//       holidays.filter(
//         (holiday) =>
//           !holiday.isDeleted && holiday.startDate?.slice(0, 10) > today,
//       ).length,
//     [holidays, today],
//   );

//   const resetFormState = () => {
//     setFormMode(null);
//     setEditingHoliday(null);
//     setFormValues(emptyForm);
//     setFormError("");
//     setFormLoading(false);
//   };

//   const openCreateModal = () => {
//     setFormMode("create");
//     setEditingHoliday(null);
//     setFormValues({
//       ...emptyForm,
//       startDate,
//       endDate,
//     });
//     setFormError("");
//   };

//   const openEditModal = (holiday) => {
//     setFormMode("edit");
//     setEditingHoliday(holiday);
//     setFormValues({
//       title: holiday.title || "",
//       description: holiday.description || "",
//       startDate: holiday.startDate?.slice(0, 10) || "",
//       endDate: holiday.endDate?.slice(0, 10) || "",
//       reason: "",
//     });
//     setFormError("");
//   };

//   const closeDeleteModal = () => {
//     setDeleteTarget(null);
//     setDeleteReason("");
//     setDeleteError("");
//     setDeleteLoading(false);
//   };

//   const openHistoryModal = async (holiday) => {
//     setHistoryTarget(holiday);
//     setHistoryItems([]);
//     setHistoryError("");
//     setHistoryLoading(true);
//     try {
//       const response = await getHolidayHistory(holiday.id);
//       setHistoryItems(getApiData(response));
//     } catch (err) {
//       setHistoryError(getErrorMessage(err, "Failed to load holiday history."));
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   const handleSubmitForm = async (event) => {
//     event.preventDefault();
//     setFormError("");

//     const title = formValues.title.trim();
//     const description = formValues.description.trim();

//     if (!title) {
//       setFormError("Title is required.");
//       return;
//     }
//     if (!formValues.startDate || !formValues.endDate) {
//       setFormError("Start and end dates are required.");
//       return;
//     }
//     if (formValues.startDate > formValues.endDate) {
//       setFormError("Start date must be before or equal to end date.");
//       return;
//     }
//     if (formMode === "edit" && !formValues.reason.trim()) {
//       setFormError("Reason is required when updating a holiday.");
//       return;
//     }

//     setFormLoading(true);
//     try {
//       if (formMode === "create") {
//         await createHoliday({
//           title,
//           description: description || undefined,
//           startDate: formValues.startDate,
//           endDate: formValues.endDate,
//         });
//         setToast({ type: "success", message: "Holiday created." });
//       } else if (editingHoliday) {
//         await updateHoliday(editingHoliday.id, {
//           title,
//           description: description || null,
//           startDate: formValues.startDate,
//           endDate: formValues.endDate,
//           reason: formValues.reason.trim(),
//         });
//         setToast({ type: "success", message: "Holiday updated." });
//       }

//       resetFormState();
//       await loadHolidays();
//     } catch (err) {
//       setFormError(getErrorMessage(err, "Failed to save holiday."));
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleDeleteHoliday = async () => {
//     const reason = deleteReason.trim();
//     if (!deleteTarget) return;
//     if (!reason) {
//       setDeleteError("Reason is required to delete a holiday.");
//       return;
//     }

//     setDeleteLoading(true);
//     setDeleteError("");
//     try {
//       await deleteHoliday(deleteTarget.id, { reason });
//       closeDeleteModal();
//       setToast({ type: "success", message: "Holiday deleted." });
//       await loadHolidays();
//     } catch (err) {
//       setDeleteError(getErrorMessage(err, "Failed to delete holiday."));
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   const visibleHolidays = holidays;

//   return (
//     <div className="space-y-6">
//       <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
//             <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
//             Holiday Management
//           </h2>
//           <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
//             Review upcoming holidays and maintain the holiday calendar.
//           </p>
//         </div>
//         {isAdmin && (
//           <Button onClick={openCreateModal}>
//             <Plus className="w-4 h-4" />
//             Add Holiday
//           </Button>
//         )}
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
//           {error}
//         </div>
//       )}

//       <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
//         <DateRangePicker
//           startDate={startDate}
//           endDate={endDate}
//           onStartChange={setStartDate}
//           onEndChange={setEndDate}
//           onApply={loadHolidays}
//           loading={loading}
//         />
//         <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
//           <input
//             type="checkbox"
//             checked={includeDeleted}
//             onChange={(event) => setIncludeDeleted(event.target.checked)}
//             className="rounded border-gray-300 dark:border-slate-700"
//           />
//           Include deleted holidays
//         </label>
//       </div>

//       <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <StatCard
//           label="Active Holidays"
//           value={loading ? "—" : activeCount}
//           icon={Calendar}
//           iconBg="indigo"
//           loading={loading}
//         />
//         <StatCard
//           label="Upcoming"
//           value={loading ? "—" : upcomingCount}
//           icon={Plus}
//           iconBg="emerald"
//           loading={loading}
//         />
//         <StatCard
//           label="Deleted"
//           value={loading ? "—" : deletedCount}
//           icon={Trash2}
//           iconBg="rose"
//           loading={loading}
//         />
//       </section>

//       <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
//         {loading ? (
//           [...Array(5)].map((_, index) => (
//             <div
//               key={index}
//               className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-800"
//             >
//               {[...Array(5)].map((__, skeletonIndex) => (
//                 <div
//                   key={skeletonIndex}
//                   className="h-6 flex-1 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"
//                 />
//               ))}
//             </div>
//           ))
//         ) : visibleHolidays.length === 0 ? (
//           <EmptyState icon={Calendar} title="No holidays found for this period." />
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200 dark:border-slate-800">
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                     Title
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                     Date Range
//                   </th>
//                   <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                     Description
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                     Status
//                   </th>
//                   <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                     Updated
//                   </th>
//                   <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {visibleHolidays.map((holiday) => {
//                   const hasStarted = holiday.startDate?.slice(0, 10) <= today;
//                   const canMutate = isAdmin && !holiday.isDeleted && !hasStarted;

//                   return (
//                     <tr
//                       key={holiday.id}
//                       className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150"
//                     >
//                       <td className="px-4 py-3">
//                         <div>
//                           <p className="font-medium text-gray-900 dark:text-white">
//                             {holiday.title}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-slate-500">
//                             Created by {holiday.createdBy?.fullName || "—"}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
//                         {formatHolidayRange(holiday)}
//                       </td>
//                       <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600 dark:text-slate-400 max-w-sm">
//                         {holiday.description || "—"}
//                       </td>
//                       <td className="px-4 py-3">
//                         <Badge variant={holiday.isDeleted ? "slate" : "emerald"}>
//                           {holiday.isDeleted ? "Deleted" : "Active"}
//                         </Badge>
//                       </td>
//                       <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
//                         {holiday.updatedAt
//                           ? formatDate(holiday.updatedAt)
//                           : formatDate(holiday.createdAt)}
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center justify-end gap-2">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => openHistoryModal(holiday)}
//                           >
//                             <History className="w-4 h-4" />
//                             History
//                           </Button>
//                           {isAdmin && (
//                             <>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => openEditModal(holiday)}
//                                 disabled={!canMutate}
//                                 title={
//                                   canMutate
//                                     ? "Edit holiday"
//                                     : "Started or deleted holidays cannot be edited"
//                                 }
//                               >
//                                 <Pencil className="w-4 h-4" />
//                                 Edit
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => setDeleteTarget(holiday)}
//                                 disabled={!canMutate}
//                                 title={
//                                   canMutate
//                                     ? "Delete holiday"
//                                     : "Started or deleted holidays cannot be deleted"
//                                 }
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                                 Delete
//                               </Button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <Modal
//         isOpen={Boolean(formMode)}
//         onClose={resetFormState}
//         title={formMode === "create" ? "Add Holiday" : "Edit Holiday"}
//         subtitle={
//           formMode === "create"
//             ? "Create a new holiday for the organization."
//             : "Update a future holiday and record the reason."
//         }
//         footer={
//           <>
//             <Button variant="ghost" onClick={resetFormState}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               form="holiday-form"
//               loading={formLoading}
//             >
//               {formMode === "create" ? "Create Holiday" : "Save Changes"}
//             </Button>
//           </>
//         }
//       >
//         <form id="holiday-form" onSubmit={handleSubmitForm} className="space-y-4">
//           <Input
//             label="Title"
//             value={formValues.title}
//             onChange={(event) =>
//               setFormValues((current) => ({
//                 ...current,
//                 title: event.target.value,
//               }))
//             }
//             placeholder="Independence Day"
//             required
//           />
//           <Input
//             label="Description"
//             value={formValues.description}
//             onChange={(event) =>
//               setFormValues((current) => ({
//                 ...current,
//                 description: event.target.value,
//               }))
//             }
//             placeholder="Optional notes"
//             rows={3}
//           />
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <Input
//               label="Start Date"
//               type="date"
//               value={formValues.startDate}
//               onChange={(event) =>
//                 setFormValues((current) => ({
//                   ...current,
//                   startDate: event.target.value,
//                 }))
//               }
//               required
//             />
//             <Input
//               label="End Date"
//               type="date"
//               value={formValues.endDate}
//               onChange={(event) =>
//                 setFormValues((current) => ({
//                   ...current,
//                   endDate: event.target.value,
//                 }))
//               }
//               required
//             />
//           </div>
//           {formMode === "edit" && (
//             <Input
//               label="Reason"
//               value={formValues.reason}
//               onChange={(event) =>
//                 setFormValues((current) => ({
//                   ...current,
//                   reason: event.target.value,
//                 }))
//               }
//               placeholder="Explain why this holiday changed"
//               rows={3}
//               required
//             />
//           )}
//           {formError && (
//             <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
//               {formError}
//             </div>
//           )}
//         </form>
//       </Modal>

//       <Modal
//         isOpen={Boolean(deleteTarget)}
//         onClose={closeDeleteModal}
//         title="Delete Holiday"
//         subtitle={
//           deleteTarget
//             ? `Delete ${deleteTarget.title} and store the deletion reason.`
//             : ""
//         }
//         footer={
//           <>
//             <Button variant="ghost" onClick={closeDeleteModal}>
//               Cancel
//             </Button>
//             <Button
//               variant="danger"
//               onClick={handleDeleteHoliday}
//               loading={deleteLoading}
//             >
//               Delete Holiday
//             </Button>
//           </>
//         }
//       >
//         <div className="space-y-4">
//           <Input
//             label="Reason"
//             value={deleteReason}
//             onChange={(event) => setDeleteReason(event.target.value)}
//             placeholder="Why is this holiday being removed?"
//             rows={3}
//             required
//           />
//           {deleteError && (
//             <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
//               {deleteError}
//             </div>
//           )}
//         </div>
//       </Modal>

//       <Modal
//         isOpen={Boolean(historyTarget)}
//         onClose={() => {
//           setHistoryTarget(null);
//           setHistoryItems([]);
//           setHistoryError("");
//           setHistoryLoading(false);
//         }}
//         title={historyTarget ? `${historyTarget.title} History` : "Holiday History"}
//         subtitle="Audit trail for changes made to this holiday."
//       >
//         {historyLoading ? (
//           <div className="space-y-3">
//             {[...Array(3)].map((_, index) => (
//               <div
//                 key={index}
//                 className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"
//               />
//             ))}
//           </div>
//         ) : historyError ? (
//           <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
//             {historyError}
//           </div>
//         ) : historyItems.length === 0 ? (
//           <EmptyState icon={History} title="No history entries found." />
//         ) : (
//           <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
//             {historyItems.map((item) => (
//               <div
//                 key={item.id}
//                 className="rounded-2xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950/40"
//               >
//                 <div className="flex items-center justify-between gap-3 flex-wrap">
//                   <Badge
//                     variant={historyBadgeVariant[item.changeType] || "indigo"}
//                   >
//                     {item.changeType}
//                   </Badge>
//                   <span className="text-xs text-gray-500 dark:text-slate-500">
//                     {formatDate(item.changedAt)}
//                   </span>
//                 </div>
//                 <p className="mt-2 text-sm text-gray-900 dark:text-white">
//                   {item.reason}
//                 </p>
//                 <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
//                   Changed by {item.changedBy?.fullName || "—"}
//                 </p>
//                 {(item.snapshotAfter || item.snapshotBefore) && (
//                   <div className="mt-3 text-xs text-gray-600 dark:text-slate-400 space-y-1">
//                     {item.snapshotBefore && (
//                       <p>
//                         Before: {item.snapshotBefore.title} (
//                         {item.snapshotBefore.startDate} to{" "}
//                         {item.snapshotBefore.endDate})
//                       </p>
//                     )}
//                     {item.snapshotAfter && (
//                       <p>
//                         After: {item.snapshotAfter.title} (
//                         {item.snapshotAfter.startDate} to{" "}
//                         {item.snapshotAfter.endDate})
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  History,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  createHoliday,
  deleteHoliday,
  getHolidayHistory,
  getHolidays,
  updateHoliday,
} from "../../api/services/holiday.service";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { DateRangePicker } from "../../components/ui/DateRangePicker";
import { formatDate, getToday } from "../../utils/dateUtils";

const emptyForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  reason: "",
};

const historyBadgeVariant = {
  CREATED: "emerald",
  UPDATED: "amber",
  DELETED: "rose",
};

const getApiData = (response) => response.data?.data ?? response.data ?? [];

const getErrorMessage = (error, fallback) =>
  error.response?.data?.error?.message ||
  error.response?.data?.message ||
  fallback;

const formatHolidayRange = (holiday) => {
  const start = holiday.startDate?.slice(0, 10);
  const end = holiday.endDate?.slice(0, 10);
  if (!start || !end) return "—";
  if (start === end) return formatDate(start);
  return `${formatDate(start)} to ${formatDate(end)}`;
};

export function HolidayManagementPage() {
  const { isAdmin } = useAuth();
  const today = getToday();
  const currentYear = today.slice(0, 4);

  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formMode, setFormMode] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHolidays({ startDate, endDate, includeDeleted });
      setHolidays(getApiData(response));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load holidays."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, [includeDeleted]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const activeCount = useMemo(
    () => holidays.filter((holiday) => !holiday.isDeleted).length,
    [holidays],
  );
  const deletedCount = useMemo(
    () => holidays.filter((holiday) => holiday.isDeleted).length,
    [holidays],
  );
  const upcomingCount = useMemo(
    () =>
      holidays.filter(
        (holiday) =>
          !holiday.isDeleted && holiday.startDate?.slice(0, 10) > today,
      ).length,
    [holidays, today],
  );

  const resetFormState = () => {
    setFormMode(null);
    setEditingHoliday(null);
    setFormValues(emptyForm);
    setFormError("");
    setFormLoading(false);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setEditingHoliday(null);
    setFormValues({
      ...emptyForm,
      startDate,
      endDate,
    });
    setFormError("");
  };

  const openEditModal = (holiday) => {
    setFormMode("edit");
    setEditingHoliday(holiday);
    setFormValues({
      title: holiday.title || "",
      description: holiday.description || "",
      startDate: holiday.startDate?.slice(0, 10) || "",
      endDate: holiday.endDate?.slice(0, 10) || "",
      reason: "",
    });
    setFormError("");
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteReason("");
    setDeleteError("");
    setDeleteLoading(false);
  };

  const openHistoryModal = async (holiday) => {
    setHistoryTarget(holiday);
    setHistoryItems([]);
    setHistoryError("");
    setHistoryLoading(true);
    try {
      const response = await getHolidayHistory(holiday.id);
      setHistoryItems(getApiData(response));
    } catch (err) {
      setHistoryError(getErrorMessage(err, "Failed to load holiday history."));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    setFormError("");

    const title = formValues.title.trim();
    const description = formValues.description.trim();

    if (!title) {
      setFormError("Title is required.");
      return;
    }
    if (!formValues.startDate || !formValues.endDate) {
      setFormError("Start and end dates are required.");
      return;
    }
    if (formValues.startDate > formValues.endDate) {
      setFormError("Start date must be before or equal to end date.");
      return;
    }
    if (formMode === "edit" && !formValues.reason.trim()) {
      setFormError("Reason is required when updating a holiday.");
      return;
    }

    setFormLoading(true);
    try {
      if (formMode === "create") {
        await createHoliday({
          title,
          description: description || undefined,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
        });
        setToast({ type: "success", message: "Holiday created." });
      } else if (editingHoliday) {
        await updateHoliday(editingHoliday.id, {
          title,
          description: description || null,
          startDate: formValues.startDate,
          endDate: formValues.endDate,
          reason: formValues.reason.trim(),
        });
        setToast({ type: "success", message: "Holiday updated." });
      }

      resetFormState();
      await loadHolidays();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save holiday."));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHoliday = async () => {
    const reason = deleteReason.trim();
    if (!deleteTarget) return;
    if (!reason) {
      setDeleteError("Reason is required to delete a holiday.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteHoliday(deleteTarget.id, { reason });
      closeDeleteModal();
      setToast({ type: "success", message: "Holiday deleted." });
      await loadHolidays();
    } catch (err) {
      setDeleteError(getErrorMessage(err, "Failed to delete holiday."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const visibleHolidays = holidays;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Holiday Management
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
            Review upcoming holidays and maintain the holiday calendar.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            Add Holiday
          </Button>
        )}
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
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onApply={loadHolidays}
          loading={loading}
        />
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(event) => setIncludeDeleted(event.target.checked)}
            className="rounded border-gray-300 dark:border-slate-700"
          />
          Include deleted holidays
        </label>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Holidays"
          value={loading ? "—" : activeCount}
          icon={Calendar}
          iconBg="indigo"
          loading={loading}
        />
        <StatCard
          label="Upcoming"
          value={loading ? "—" : upcomingCount}
          icon={Plus}
          iconBg="emerald"
          loading={loading}
        />
        <StatCard
          label="Deleted"
          value={loading ? "—" : deletedCount}
          icon={Trash2}
          iconBg="rose"
          loading={loading}
        />
      </section>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          [...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 border-b border-gray-200 dark:border-slate-800"
            >
              {[...Array(5)].map((__, skeletonIndex) => (
                <div
                  key={skeletonIndex}
                  className="h-6 flex-1 bg-gray-100 dark:bg-slate-700 rounded animate-pulse"
                />
              ))}
            </div>
          ))
        ) : visibleHolidays.length === 0 ? (
          <EmptyState icon={Calendar} title="No holidays found for this period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                    Date Range
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleHolidays.map((holiday) => {
                  const hasStarted = holiday.startDate?.slice(0, 10) <= today;
                  const canMutate = isAdmin && !holiday.isDeleted && !hasStarted;

                  return (
                    <tr
                      key={holiday.id}
                      className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {holiday.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-500">
                            Created by {holiday.createdBy?.fullName || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-slate-300">
                        {formatHolidayRange(holiday)}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600 dark:text-slate-400 max-w-sm">
                        {holiday.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={holiday.isDeleted ? "slate" : "emerald"}>
                          {holiday.isDeleted ? "Deleted" : "Active"}
                        </Badge>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                        {holiday.updatedAt
                          ? formatDate(holiday.updatedAt)
                          : formatDate(holiday.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openHistoryModal(holiday)}
                          >
                            <History className="w-4 h-4" />
                            History
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(holiday)}
                                disabled={!canMutate}
                                title={
                                  canMutate
                                    ? "Edit holiday"
                                    : "Started or deleted holidays cannot be edited"
                                }
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteTarget(holiday)}
                                disabled={!canMutate}
                                title={
                                  canMutate
                                    ? "Delete holiday"
                                    : "Started or deleted holidays cannot be deleted"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(formMode)}
        onClose={resetFormState}
        title={formMode === "create" ? "Add Holiday" : "Edit Holiday"}
        subtitle={
          formMode === "create"
            ? "Create a new holiday for the organization."
            : "Update a future holiday and record the reason."
        }
        footer={
          <>
            <Button variant="ghost" onClick={resetFormState}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="holiday-form"
              loading={formLoading}
            >
              {formMode === "create" ? "Create Holiday" : "Save Changes"}
            </Button>
          </>
        }
      >
        <form id="holiday-form" onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Title"
            value={formValues.title}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Independence Day"
            required
          />
          <Input
            label="Description"
            value={formValues.description}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Optional notes"
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formValues.startDate}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formValues.endDate}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              required
            />
          </div>
          {formMode === "edit" && (
            <Input
              label="Reason"
              value={formValues.reason}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
              placeholder="Explain why this holiday changed"
              rows={3}
              required
            />
          )}
          {formError && (
            <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {formError}
            </div>
          )}
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title="Delete Holiday"
        subtitle={
          deleteTarget
            ? `Delete ${deleteTarget.title} and store the deletion reason.`
            : ""
        }
        footer={
          <>
            <Button variant="ghost" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteHoliday}
              loading={deleteLoading}
            >
              Delete Holiday
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Reason"
            value={deleteReason}
            onChange={(event) => setDeleteReason(event.target.value)}
            placeholder="Why is this holiday being removed?"
            rows={3}
            required
          />
          {deleteError && (
            <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {deleteError}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(historyTarget)}
        onClose={() => {
          setHistoryTarget(null);
          setHistoryItems([]);
          setHistoryError("");
          setHistoryLoading(false);
        }}
        title={historyTarget ? `${historyTarget.title} History` : "Holiday History"}
        subtitle="Audit trail for changes made to this holiday."
      >
        {historyLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-16 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : historyError ? (
          <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
            {historyError}
          </div>
        ) : historyItems.length === 0 ? (
          <EmptyState icon={History} title="No history entries found." />
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Badge
                    variant={historyBadgeVariant[item.changeType] || "indigo"}
                  >
                    {item.changeType}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    {formatDate(item.changedAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-900 dark:text-white">
                  {item.reason}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                  Changed by {item.changedBy?.fullName || "—"}
                </p>
                {(item.snapshotAfter || item.snapshotBefore) && (
                  <div className="mt-3 text-xs text-gray-600 dark:text-slate-400 space-y-1">
                    {item.snapshotBefore && (
                      <p>
                        Before: {item.snapshotBefore.title} (
                        {item.snapshotBefore.startDate} to{" "}
                        {item.snapshotBefore.endDate})
                      </p>
                    )}
                    {item.snapshotAfter && (
                      <p>
                        After: {item.snapshotAfter.title} (
                        {item.snapshotAfter.startDate} to{" "}
                        {item.snapshotAfter.endDate})
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
