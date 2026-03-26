import { useState, useEffect } from "react";
import { getTeamAnalytics, getTeamMembers } from "../api/services/team.service";

export function useTeamAnalytics(startDate, endDate) {
  const [data, setData] = useState({ team_members: [], aggregate: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both analytics data and team members data
      const [analyticsRes, membersRes] = await Promise.all([
        getTeamAnalytics(startDate, endDate),
        getTeamMembers()
      ]);
      
      // Process analytics data
      const items = analyticsRes.data.data || analyticsRes.data || [];
      const meta = analyticsRes.data.meta || {};

      // Get team members with roles
      const teamMembersData = membersRes.data.data || membersRes.data || [];
      const employeesMap = new Map();
      
      // Create a map of employee IDs for quick lookup
      teamMembersData.forEach(member => {
        if (member.roles && member.roles.some(role => 
          typeof role === 'string' ? role.toLowerCase() === 'employee' : 
          (role.name && role.name.toLowerCase() === 'employee')
        )) {
          employeesMap.set(member.id, true);
        }
      });

      // Map to format compatible with the frontend, filtering by employee role
      const team_members = items
        .filter(item => item.user?.id && employeesMap.has(item.user.id))
        .map((item) => ({
          id: item.user?.id,
          name: item.user?.fullName,
          email: item.user?.email,
          summary: {
            present_days: item.summary?.presentDays ?? 0,
            half_days: item.summary?.halfDays ?? 0,
            absent_days: item.summary?.absentDays ?? 0,
            leave_days: item.summary?.leaveDays ?? 0,
            total_work_minutes: item.summary?.totalWorkedMinutes ?? 0,
          },
          work_hours: {
            total_minutes: item.summary?.totalWorkedMinutes ?? 0,
          },
          attendance_percentage: item.summary?.attendancePercentage,
        }));

      // Map aggregate from meta
      const aggregate = {
        average_attendance_percentage: meta.aggregate?.attendancePercentage,
        present_days: meta.aggregate?.presentDays ?? 0,
        half_days: meta.aggregate?.halfDays ?? 0,
        absent_days: meta.aggregate?.absentDays ?? 0,
        leave_days: meta.aggregate?.leaveDays ?? 0,
        total_work_minutes: meta.aggregate?.totalWorkedMinutes ?? 0,
      };

      setData({ team_members, aggregate });
    } catch (e) {
      setError(
        e.response?.data?.error?.message ||
          e.response?.data?.message ||
          "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
}
