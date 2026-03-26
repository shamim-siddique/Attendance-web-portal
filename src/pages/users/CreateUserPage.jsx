import { useState, useEffect } from "react";
import { User, Mail, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTeamMembers } from "../../api/services/team.service";
import { createUser } from "../../api/services/user.service";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Admin" },
];

export function CreateUserPage() {
  const { isAdmin, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) {
        setMembersLoading(false);
        return;
      }
      try {
        const res = await getTeamMembers();
        // API returns { success, data, meta } - extract data array
        const usersData = res.data.data || res.data || [];
        setMembers(usersData);
      } catch (e) {
        setError(
          e.response?.data?.error?.message ||
            e.response?.data?.message ||
            "Failed to load managers",
        );
      } finally {
        setMembersLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  // Filter for managers/admins using uppercase role names
  const managerOptions = members.filter(
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (selectedRoles.length === 0) {
      setError("Select at least one role.");
      return;
    }

    // Validate role selection
    const hasAdmin = selectedRoles.includes("ADMIN");

    // Only admins can assign admin role
    if (hasAdmin && !isAdmin) {
      setError("Only admins can assign admin role.");
      return;
    }

    // Filter roles based on permissions
    let finalRoles = selectedRoles;
    if (!isAdmin) {
      finalRoles = finalRoles.filter((role) => role !== "ADMIN");
    }

    setLoading(true);
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

      setSuccess(name.trim());
      setName("");
      setEmail("");
      setSelectedRoles([]);
      setSelectedManagerId("");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Failed to create user.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center space-y-6 px-4">
      <header className="max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create User
        </h2>
        <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
          {isAdmin
            ? "Create and assign employees, managers, or admins. Assign a reporting manager."
            : "Create employees or managers. New users will be placed under your hierarchy."}
        </p>
      </header>

      {success && (
        <div className="flex items-center justify-between gap-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            User {success} has been created successfully.
          </span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="p-1 rounded hover:bg-emerald-500/20"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex w-full max-w-xl flex-col items-center space-y-4">
        {error && (
          <div className="flex w-full items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-7 space-y-5"
        >
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Company Email"
            type="email"
            placeholder="john@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
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
              <label
                htmlFor="manager-select"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5"
              >
                Reporting Manager
              </label>
              <select
                id="manager-select"
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
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                Users you create will be automatically placed under your
                hierarchy.
              </p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </div>
    </div>
  );
}
