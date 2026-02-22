import { useState, useEffect } from 'react'
import { User, Mail, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getTeamMembers } from '../../api/services/team.service'
import { createUser } from '../../api/services/user.service'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' }
]

export function CreateUserPage() {
  const { isAdmin } = useAuth()
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedManagerId, setSelectedManagerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(true)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) {
        setMembersLoading(false)
        return
      }
      try {
        const res = await getTeamMembers()
        setMembers(res.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load managers')
      } finally {
        setMembersLoading(false)
      }
    }
    load()
  }, [isAdmin])

  const managerOptions = members.filter(
    (m) => m.roles?.includes('manager') || m.roles?.includes('admin')
  )
  const visibleRoleOptions = isAdmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r.value !== 'admin')

  const toggleRole = (value) => {
    setSelectedRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (selectedRoles.length === 0) {
      setError('Select at least one role.')
      return
    }
    setLoading(true)
    try {
      const payload = { name: name.trim(), email: email.trim(), roles: selectedRoles }
      if (isAdmin && selectedManagerId) payload.manager_id = selectedManagerId
      await createUser(payload)
      setSuccess(name.trim())
      setName('')
      setEmail('')
      setSelectedRoles([])
      setSelectedManagerId('')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Create User</h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin
            ? 'Create and assign employees, managers, or admins. Assign a reporting manager.'
            : 'Create employees or managers. New users will be placed under your hierarchy.'}
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

      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-7 space-y-5"
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
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Assign Roles
          </label>
          <p className="text-slate-500 text-xs mb-2">
            Select one or more roles. At least one is required.
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleRoleOptions.map(({ value, label }) => {
              const active = selectedRoles.includes(value)
              const colorClass =
                value === 'admin'
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : value === 'manager'
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-indigo-600 border-indigo-500 text-white'
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleRole(value)}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                    ${active ? colorClass : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500'}
                  `}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {isAdmin && (
          <div>
            <label
              htmlFor="manager-select"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Reporting Manager
            </label>
            <select
              id="manager-select"
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">— Select a manager —</option>
              <option value="">None (top-level)</option>
              {managerOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
            <p className="text-slate-500 text-xs mt-1">
              The new user will report directly to this person.
            </p>
          </div>
        )}

        {!isAdmin && (
          <div className="flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 text-indigo-300 text-sm">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Users you create will be automatically placed under your hierarchy.</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </div>
  )
}
