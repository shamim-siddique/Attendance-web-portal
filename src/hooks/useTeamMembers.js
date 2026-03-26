import { useState, useEffect } from "react";
import { getTeamMembers } from "../api/services/team.service";

export function useTeamMembers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeamMembers();
      // API returns { success, data, meta } - extract data array
      const users = res.data.data || res.data || [];

      // Map to expected frontend field names for backwards compatibility
      const mappedData = users.map((user) => ({
        ...user,
        // Map new field names to legacy names used in UI
        username: user.fullName,
        manager_name: user.manager?.fullName || "—",
        is_active: user.isActive,
        // roles are already in the response (uppercase: ADMIN, MANAGER, EMPLOYEE)
      }));

      setData(mappedData);
    } catch (e) {
      setError(
        e.response?.data?.error?.message ||
          e.response?.data?.message ||
          "Failed to load members",
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
