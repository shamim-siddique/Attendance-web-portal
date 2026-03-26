import { useState, useEffect } from "react";
import { getTeamAttendance } from "../api/services/team.service";

const mapAttendanceRecord = (item) => ({
  id: `${item.user?.id || "unknown"}-${item.date || "unknown"}`,
  user_id: item.user?.id,
  username: item.user?.fullName,
  email: item.user?.email,
  punch_date: item.date,
  punch_in: item.punchInAt,
  punch_out: item.punchOutAt,
  work_minutes: item.workedMinutes,
  attendance_state: item.attendanceState,
  day_type: item.dayType,
  latitude: item.location?.latitude ?? null,
  longitude: item.location?.longitude ?? null,
  flags: item.flags || [],
  holiday: item.holiday || null,
  leaveRequest: item.leaveRequest || null,
  regularization: item.regularization || null,
  raw: item,
});

export function useTeamAttendance({
  startDate,
  endDate,
  status,
  page = 1,
  limit = 20,
}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeamAttendance({
        startDate,
        endDate,
        status,
        page,
        limit,
      });
      const items = res.data.data || res.data || [];
      const metaInfo = res.data.meta || null;
      const debugPayload = {
        request: { startDate, endDate, status, page, limit },
        response: res.data,
      };

      window.__attendanceApiDebug = debugPayload;
      console.warn("Attendance API response", debugPayload);

      setData(items.map(mapAttendanceRecord));
      setMeta(metaInfo);
    } catch (e) {
      setData([]);
      setMeta(null);
      const debugErrorPayload = {
        request: { startDate, endDate, status, page, limit },
        error: e.response?.data || e,
      };

      window.__attendanceApiDebug = debugErrorPayload;
      console.error("Attendance API error", debugErrorPayload);
      setError(
        e.response?.data?.error?.message ||
          e.response?.data?.message ||
          "Failed to load attendance",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [startDate, endDate, status, page, limit]);

  return { data, meta, loading, error, refetch: fetch };
}
