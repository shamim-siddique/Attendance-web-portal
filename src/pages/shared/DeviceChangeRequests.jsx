import { useState, useMemo } from 'react'
import {
    Smartphone,
    Check,
    X,
    XCircle,
    Loader2,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown
} from 'lucide-react'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    createColumnHelper,
    flexRender
} from '@tanstack/react-table'
import { useDeviceChangeRequests } from '../../hooks/useDeviceChangeRequests'
import { approveDeviceChangeRequest, rejectDeviceChangeRequest } from '../../api/services/team.service'
import { formatDate } from '../../utils/dateUtils'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'

const statusVariant = {
    pending: 'amber',
    approved: 'emerald',
    rejected: 'rose'
}
const statusLabel = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
}

export function DeviceChangeRequests() {
    const { data: requests, loading, refetch } = useDeviceChangeRequests()
    const [approvingId, setApprovingId] = useState(null)
    const [rejectTarget, setRejectTarget] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [rejectError, setRejectError] = useState('')
    const [rejectLoading, setRejectLoading] = useState(false)
    const [toast, setToast] = useState(null)

    const SortIcon = ({ column }) => {
        const sorted = column.getIsSorted()
        if (sorted === 'asc') return <ChevronUp className="w-4 h-4 text-indigo-400" />
        if (sorted === 'desc') return <ChevronDown className="w-4 h-4 text-indigo-400" />
        return <ChevronsUpDown className="w-4 h-4 text-slate-500" />
    }

    const columnHelper = createColumnHelper()
    const columns = useMemo(
        () => [
            columnHelper.accessor('user.username', {
                id: 'employee',
                header: ({ column }) => (
                    <button
                        type="button"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center gap-1 hover:text-slate-300"
                    >
                        Employee <SortIcon column={column} />
                    </button>
                ),
                cell: ({ row }) => {
                    const user = row.original.user || {}
                    return (
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                                    {user.username?.charAt(0)?.toUpperCase() ?? '?'}
                                </div>
                                <span className="font-medium text-white">{user.username || 'Unknown'}</span>
                            </div>
                            <p className="text-slate-400 text-xs mt-0.5">{user.email || ''}</p>
                        </div>
                    )
                }
            }),
            columnHelper.accessor('old_device_id', {
                header: 'Old Device ID',
                cell: ({ getValue }) => (
                    <span className="text-slate-400 truncate max-w-[120px] block" title={getValue()}>
                        {getValue() || '—'}
                    </span>
                )
            }),
            columnHelper.accessor('new_device_id', {
                header: 'New Device ID',
                cell: ({ getValue }) => (
                    <span className="text-slate-300 truncate max-w-[120px] block font-mono text-xs" title={getValue()}>
                        {getValue() || '—'}
                    </span>
                )
            }),
            columnHelper.accessor('reason', {
                header: 'Reason',
                cell: ({ getValue }) => (
                    <span className="max-w-xs truncate block text-slate-400" title={getValue()}>
                        {getValue() || '—'}
                    </span>
                ),
                meta: { hideOnMobile: true }
            }),
            columnHelper.accessor('created_at', {
                header: ({ column }) => (
                    <button
                        type="button"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center gap-1 hover:text-slate-300"
                    >
                        Requested Date <SortIcon column={column} />
                    </button>
                ),
                cell: ({ getValue }) => formatDate(getValue()?.slice(0, 10))
            }),
            columnHelper.accessor('status', {
                header: ({ column }) => (
                    <button
                        type="button"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="flex items-center gap-1 hover:text-slate-300"
                    >
                        Status <SortIcon column={column} />
                    </button>
                ),
                cell: ({ getValue }) => (
                    <Badge variant={statusVariant[getValue()] || 'slate'}>
                        {statusLabel[getValue()] ?? getValue()}
                    </Badge>
                )
            }),
            columnHelper.display({
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const r = row.original
                    if (r.status !== 'pending') {
                        if (r.status === 'approved') {
                            return <span className="text-emerald-400 text-xs">Approved</span>
                        }
                        return (
                            <span title={r.reviewComment || ''} className="text-rose-400 text-xs cursor-help">
                                Rejected
                            </span>
                        )
                    }

                    const isApproving = approvingId === r.id
                    return (
                        <div className="flex items-center gap-1">
                            {isApproving ? (
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleApprove(r.id)}
                                        disabled={approvingId != null}
                                        className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                                        title="Approve"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRejectTarget(r)
                                            setRejectionReason('')
                                            setRejectError('')
                                        }}
                                        disabled={approvingId != null}
                                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 disabled:opacity-50"
                                        title="Reject"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    )
                }
            })
        ],
        [columnHelper, SortIcon, approvingId]
    )

    const table = useReactTable({
        data: requests || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: { pagination: { pageSize: 15 } }
    })

    const handleApprove = async (requestId) => {
        setApprovingId(requestId)
        try {
            await approveDeviceChangeRequest(requestId)
            refetch()
            setToast({ type: 'success', message: 'Device change approved successfully.' })
            setTimeout(() => setToast(null), 3000)
        } catch (err) {
            setToast({
                type: 'error',
                message: err.response?.data?.message || 'Failed to approve request.'
            })
        } finally {
            setApprovingId(null)
        }
    }

    const handleRejectSubmit = async () => {
        if (!rejectTarget) return
        const reason = rejectionReason.trim()
        if (!reason) {
            setRejectError('Rejection comment is required.')
            return
        }
        setRejectLoading(true)
        setRejectError('')
        try {
            await rejectDeviceChangeRequest(rejectTarget.id, reason)
            setRejectTarget(null)
            setRejectionReason('')
            refetch()
            setToast({ type: 'success', message: 'Device change request rejected.' })
            setTimeout(() => setToast(null), 3000)
        } catch (err) {
            setRejectError(
                err.response?.data?.message || 'Failed to reject request.'
            )
        } finally {
            setRejectLoading(false)
        }
    }

    return (
        <div className="space-y-6 flex-1 w-full max-w-full overflow-hidden p-6 mx-auto">
            <header>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-7 h-7 text-indigo-400" />
                    Device Change Requests
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                    Review and manage device reset requests from mobile users.
                </p>
            </header>

            {toast && (
                <div
                    className={`rounded-xl px-4 py-3 ${toast.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                        }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden w-full">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 border-b border-slate-800">
                            {[...Array(6)].map((_, j) => (
                                <div
                                    key={j}
                                    className="h-6 flex-1 bg-slate-700/50 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    ))
                ) : !requests || requests.length === 0 ? (
                    <EmptyState
                        icon={Smartphone}
                        title="No device change requests pending."
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="border-b border-slate-800 bg-slate-900/50">
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className={`text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 py-3 whitespace-nowrap ${header.column.columnDef.meta?.hideOnMobile ? 'hidden md:table-cell' : ''
                                                        }`}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
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
                                            className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className={`px-4 py-3 text-white text-sm align-middle ${cell.column.columnDef.meta?.hideOnMobile ? 'hidden md:table-cell' : ''
                                                        }`}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={!!rejectTarget}
                onClose={() => {
                    setRejectTarget(null)
                    setRejectionReason('')
                    setRejectError('')
                }}
                title="Reject Device Change Request"
                subtitle={
                    rejectTarget
                        ? `${rejectTarget.user?.username || 'Unknown'} · ${rejectTarget.new_device_id}`
                        : ''
                }
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setRejectTarget(null)
                                setRejectionReason('')
                                setRejectError('')
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
                            Reject Request
                        </Button>
                    </>
                }
            >
                {rejectTarget && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium shrink-0">
                                {rejectTarget.user?.username?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>
                            <div>
                                <p className="font-medium text-white">{rejectTarget.user?.username || 'Unknown'}</p>
                                <p className="text-slate-400 text-sm">
                                    {rejectTarget.reason ? `${rejectTarget.reason}` : 'No reason provided'}
                                </p>
                            </div>
                        </div>
                        {rejectError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm">
                                {rejectError}
                            </div>
                        )}
                        <Input
                            label="Rejection Comment"
                            placeholder="Please provide a reason for rejecting this device change request..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            error={!rejectionReason.trim() && rejectError ? 'Rejection reason is required.' : undefined}
                        />
                    </div>
                )}
            </Modal>
        </div>
    )
}
