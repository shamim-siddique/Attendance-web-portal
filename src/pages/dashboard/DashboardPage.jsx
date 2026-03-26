// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Users,
//   TrendingUp,
//   CheckCircle2,
//   XCircle,
//   ClipboardList,
//   ArrowRight,
//   CalendarCheck,
//   BarChart3,
// } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import {
//   getTeamMembers,
//   getTeamAnalytics,
// } from "../../api/services/team.service";
// import { getTeamLeaves } from "../../api/services/leave.service";
// import { StatCard } from "../../components/ui/StatCard";
// import { getToday, getFirstDayOfMonth } from "../../utils/dateUtils";

// export function DashboardPage() {
//   const { user, isAdmin } = useAuth();
//   const navigate = useNavigate();
//   const firstDayOfMonth = getFirstDayOfMonth();
//   const endDate = getToday();

//   const [members, setMembers] = useState([]);
//   const [analytics, setAnalytics] = useState({ aggregate: {} });
//   const [leaveCounts, setLeaveCounts] = useState({ pending: 0, total: 0 });
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState(null);

//   // Get display name from JWT - could be fullName, name, or email
//   const displayName =
//     user?.fullName || user?.name || user?.email?.split("@")[0] || "there";
//   const firstName = displayName.split(" ")[0];
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
//   const fullDate = new Date().toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
//   const portalLabel = isAdmin ? "Admin" : "Manager";
//   const roleLabel = isAdmin ? "Admin" : "Manager";
//   const avatarLetter = displayName.charAt(0)?.toUpperCase() || "?";

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const [membersRes, analyticsRes, pendingLeavesRes, totalLeavesRes] =
//           await Promise.all([
//           getTeamMembers(),
//           getTeamAnalytics(firstDayOfMonth, endDate),
//           getTeamLeaves(firstDayOfMonth, endDate, "pending"),
//           getTeamLeaves(firstDayOfMonth, endDate),
//         ]);

//         // Extract data from { success, data, meta } response structure
//         const membersData = membersRes.data.data || membersRes.data || [];
//         const analyticsMeta = analyticsRes.data.meta || {};
//         const pendingLeavesMeta = pendingLeavesRes.data.meta || {};
//         const totalLeavesMeta = totalLeavesRes.data.meta || {};

//         setMembers(membersData);
//         // Build analytics object from meta.aggregate
//         setAnalytics({
//           aggregate: {
//             average_attendance_percentage:
//               analyticsMeta.aggregate?.attendancePercentage,
//             present_days: analyticsMeta.aggregate?.presentDays ?? 0,
//             absent_days: analyticsMeta.aggregate?.absentDays ?? 0,
//             holiday_days: analyticsMeta.aggregate?.holidayDays ?? 0,
//           },
//         });
//         setLeaveCounts({
//           pending: pendingLeavesMeta.total ?? 0,
//           total: totalLeavesMeta.total ?? 0,
//         });
//       } catch (e) {
//         setToast({
//           type: "error",
//           message:
//             e.response?.data?.error?.message || "Failed to load dashboard",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, [firstDayOfMonth, endDate]);
//   const agg = analytics.aggregate || {};
//   const activeMembersCount = members.filter(
//     (member) => member.isActive !== false,
//   ).length;

//   return (
//     <div className="space-y-8">
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

//       <header>
//         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//           Good {greeting}, {firstName}
//         </h2>
//         <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
//           {portalLabel} Portal · {fullDate}
//         </p>
//       </header>

//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         <StatCard
//           label="Total Team Members"
//           value={loading ? "—" : members.length}
//           sub="In your hierarchy"
//           icon={Users}
//           iconBg="indigo"
//           loading={loading}
//         />
//         <StatCard
//           label="Avg Attendance"
//           value={
//             loading
//               ? "—"
//               : agg.average_attendance_percentage != null
//                 ? `${Number(agg.average_attendance_percentage).toFixed(1)}%`
//                 : "—"
//           }
//           sub="This month"
//           icon={TrendingUp}
//           iconBg="emerald"
//           loading={loading}
//         />
//         <StatCard
//           label="Present Days"
//           value={loading ? "—" : (agg.present_days ?? "—")}
//           sub="Across team, this month"
//           icon={CheckCircle2}
//           iconBg="blue"
//           loading={loading}
//         />
//         <StatCard
//           label="Absent Days"
//           value={loading ? "—" : (agg.absent_days ?? "—")}
//           sub="Across team, this month"
//           icon={XCircle}
//           iconBg="rose"
//           loading={loading}
//         />
//         <StatCard
//           label="Holidays"
//           value={loading ? "—" : (agg.holiday_days ?? "—")}
//           sub="Across team, this month"
//           icon={CalendarCheck}
//           iconBg="indigo"
//           loading={loading}
//         />
//         <StatCard
//           label="Pending Leaves"
//           value={loading ? "—" : leaveCounts.pending}
//           sub="Awaiting your approval"
//           icon={ClipboardList}
//           iconBg="amber"
//           loading={loading}
//           onClick={() => navigate("/team/leaves")}
//         />
//       </section>

//       <section className="space-y-4">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//           {portalLabel} Profile
//         </h3>
//         <div className="rounded-[32px] border border-slate-800 bg-slate-950 px-6 py-7 text-white shadow-[0_24px_80px_-36px_rgba(15,23,42,0.95)] sm:px-8">
//           <div className="flex flex-col gap-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//               <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-4xl font-bold shadow-[0_20px_45px_-20px_rgba(99,102,241,0.95)]">
//                 {avatarLetter}
//               </div>
//               <div className="min-w-0">
//                 <h4 className="truncate text-3xl font-semibold tracking-tight">
//                   {displayName}
//                 </h4>
//                 <p className="mt-1 truncate text-lg text-slate-300">
//                   {user?.email || "—"}
//                 </p>
//                 <div className="mt-4 flex flex-wrap items-center gap-3">
//                   <span className="rounded-full bg-violet-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(139,92,246,0.95)]">
//                     {roleLabel}
//                   </span>
//                   <span className="text-base text-slate-400">Active</span>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//               <div className="rounded-[24px] border border-slate-800 bg-slate-800/80 px-6 py-7 text-center">
//                 <p className="text-5xl font-semibold tracking-tight">
//                   {loading ? "—" : members.length}
//                 </p>
//                 <p className="mt-3 text-lg text-slate-300">Team Members</p>
//               </div>
//               <div className="rounded-[24px] border border-slate-800 bg-slate-800/80 px-6 py-7 text-center">
//                 <p className="text-5xl font-semibold tracking-tight">
//                   {loading ? "—" : activeMembersCount}
//                 </p>
//                 <p className="mt-3 text-lg text-slate-300">Active Members</p>
//               </div>
//               <div className="rounded-[24px] border border-slate-800 bg-slate-800/80 px-6 py-7 text-center">
//                 <p className="text-5xl font-semibold tracking-tight">
//                   {loading ? "—" : leaveCounts.total}
//                 </p>
//                 <p className="mt-3 text-lg text-slate-300">Total Leaves</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section>
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//           Quick Actions
//         </h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[
//             {
//               icon: Users,
//               title: "Team Members",
//               desc: "View your full team hierarchy",
//               to: "/team/members",
//             },
//             {
//               icon: CalendarCheck,
//               title: "Attendance",
//               desc: "Review and manage attendance",
//               to: "/team/attendance",
//             },
//             {
//               icon: BarChart3,
//               title: "Analytics",
//               desc: "Performance insights",
//               to: "/team/analytics",
//             },
//             {
//               icon: ClipboardList,
//               title: "Leave Requests",
//               desc: "Approve or reject leaves",
//               to: "/team/leaves",
//             },
//           ].map(({ icon: Icon, title, desc, to }) => (
//             <Link
//               key={to}
//               to={to}
//               className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-slate-700 transition-all flex items-start justify-between"
//             >
//               <div>
//                 <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
//                 <h4 className="font-medium text-gray-900 dark:text-white">
//                   {title}
//                 </h4>
//                 <p className="text-gray-500 dark:text-slate-500 text-sm mt-0.5">
//                   {desc}
//                 </p>
//               </div>
//               <ArrowRight className="w-5 h-5 text-gray-500 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
//             </Link>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ArrowRight,
  CalendarCheck,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getTeamMembers,
  getTeamAnalytics,
} from "../../api/services/team.service";
import { getTeamLeaves } from "../../api/services/leave.service";
import { StatCard } from "../../components/ui/StatCard";
import { getToday, getFirstDayOfMonth } from "../../utils/dateUtils";

export function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const firstDayOfMonth = getFirstDayOfMonth();
  const endDate = getToday();

  const [members, setMembers] = useState([]);
  const [analytics, setAnalytics] = useState({ aggregate: {} });
  const [leaveCounts, setLeaveCounts] = useState({ pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Get display name from JWT - could be fullName, name, or email
  const displayName =
    user?.fullName || user?.name || user?.email?.split("@")[0] || "there";
  const firstName = displayName.split(" ")[0].replace(".", " ");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const fullDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const portalLabel = isAdmin ? "Admin" : "Manager";
  const roleLabel = isAdmin ? "Admin" : "Manager";
  const avatarLetter = displayName.charAt(0)?.toUpperCase() || "?";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [membersRes, analyticsRes, pendingLeavesRes, totalLeavesRes] =
          await Promise.all([
          getTeamMembers(),
          getTeamAnalytics(firstDayOfMonth, endDate),
          getTeamLeaves(firstDayOfMonth, endDate, "pending"),
          getTeamLeaves(firstDayOfMonth, endDate),
        ]);

        // Extract data from { success, data, meta } response structure
        const membersData = membersRes.data.data || membersRes.data || [];
        const analyticsMeta = analyticsRes.data.meta || {};
        const pendingLeavesMeta = pendingLeavesRes.data.meta || {};
        const totalLeavesMeta = totalLeavesRes.data.meta || {};

        setMembers(membersData);
        // Build analytics object from meta.aggregate
        setAnalytics({
          aggregate: {
            average_attendance_percentage:
              analyticsMeta.aggregate?.attendancePercentage,
            present_days: analyticsMeta.aggregate?.presentDays ?? 0,
            absent_days: analyticsMeta.aggregate?.absentDays ?? 0,
            holiday_days: analyticsMeta.aggregate?.holidayDays ?? 0,
          },
        });
        setLeaveCounts({
          pending: pendingLeavesMeta.total ?? 0,
          total: totalLeavesMeta.total ?? 0,
        });
      } catch (e) {
        setToast({
          type: "error",
          message:
            e.response?.data?.error?.message || "Failed to load dashboard",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [firstDayOfMonth, endDate]);
  const agg = analytics.aggregate || {};
  const activeMembersCount = members.filter(
    (member) => member.isActive !== false,
  ).length;

  return (
    <div className="space-y-8">
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

      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {greeting}, {firstName}
        </h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
          {portalLabel} Portal · {fullDate}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Team Members"
          value={loading ? "—" : members.length}
          sub="In your hierarchy"
          icon={Users}
          iconBg="indigo"
          loading={loading}
        />
        <StatCard
          label="Avg Attendance"
          value={
            loading
              ? "—"
              : agg.average_attendance_percentage != null
                ? `${Number(agg.average_attendance_percentage).toFixed(1)}%`
                : "—"
          }
          sub="This month"
          icon={TrendingUp}
          iconBg="emerald"
          loading={loading}
        />
        <StatCard
          label="Present Days"
          value={loading ? "—" : (agg.present_days ?? "—")}
          sub="Across team, this month"
          icon={CheckCircle2}
          iconBg="blue"
          loading={loading}
        />
        <StatCard
          label="Absent Days"
          value={loading ? "—" : (agg.absent_days ?? "—")}
          sub="Across team, this month"
          icon={XCircle}
          iconBg="rose"
          loading={loading}
        />
        <StatCard
          label="Holidays"
          value={loading ? "—" : (agg.holiday_days ?? "—")}
          sub="Across team, this month"
          icon={CalendarCheck}
          iconBg="indigo"
          loading={loading}
        />
        <StatCard
          label="Pending Leaves"
          value={loading ? "—" : leaveCounts.pending}
          sub="Awaiting your approval"
          icon={ClipboardList}
          iconBg="amber"
          loading={loading}
          onClick={() => navigate("/team/leaves")}
        />
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {portalLabel} Profile
        </h3>
        <div className="rounded-[32px] border border-gray-200 bg-white px-6 py-7 text-gray-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 text-3xl font-bold shadow-[0_20px_45px_-20px_rgba(99,102,241,0.95)]">
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-2xl font-semibold leading-normal">
                  {displayName}
                </h4>
                <p className="mt-0 truncate text-base leading-none text-gray-600 dark:text-slate-300">
                  {user?.email || "—"}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-violet-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(139,92,246,0.95)]">
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-3 py-5 text-center dark:border-slate-800 dark:bg-slate-800/80">
                <p className="text-3xl font-semibold tracking-tight">
                  {loading ? "—" : members.length}
                </p>
                <p className="mt-3 text-base text-gray-600 dark:text-slate-300">Team Members</p>
              </div>
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-6 text-center dark:border-slate-800 dark:bg-slate-800/80">
                <p className="text-3xl font-semibold tracking-tight">
                  {loading ? "—" : activeMembersCount}
                </p>
                <p className="mt-3 text-base text-gray-600 dark:text-slate-300">Active Members</p>
              </div>
              <div className="rounded-[24px] border border-gray-200 bg-gray-50 px-5 py-6 text-center dark:border-slate-800 dark:bg-slate-800/80">
                <p className="text-3xl font-semibold tracking-tight">
                  {loading ? "—" : leaveCounts.total}
                </p>
                <p className="mt-3 text-base text-gray-600 dark:text-slate-300">Total Leaves</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              title: "Team Members",
              desc: "View your full team",
              to: "/team/members",
            },
            {
              icon: CalendarCheck,
              title: "Attendance",
              desc: "Review and manage attendance",
              to: "/team/attendance",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              desc: "Performance insights",
              to: "/team/analytics",
            },
            {
              icon: ClipboardList,
              title: "Leave Requests",
              desc: "Approve or reject leaves",
              to: "/team/leaves",
            },
          ].map(({ icon: Icon, title, desc, to }) => (
            <Link
              key={to}
              to={to}
              className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-slate-700 transition-all flex items-start justify-between"
            >
              <div>
                <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {title}
                </h4>
                <p className="text-gray-500 dark:text-slate-500 text-sm mt-0.5">
                  {desc}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
