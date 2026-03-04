// import { useState, useEffect } from 'react'
// import { MapPin, Search, UserX, Loader2 } from 'lucide-react'
// import { getTeamMembers } from '../../api/services/team.service'
// import { getUserLocation, setUserLocation } from '../../api/services/user.service'
// import { Input } from '../../components/ui/Input'
// import { Button } from '../../components/ui/Button'
// import { Badge } from '../../components/ui/Badge'
// import { EmptyState } from '../../components/ui/EmptyState'
// import { formatDate } from '../../utils/dateUtils'

// export function UserLocationsPage() {
//   const [members, setMembers] = useState([])
//   const [loadingMembers, setLoadingMembers] = useState(true)
//   const [search, setSearch] = useState('')
//   const [selectedId, setSelectedId] = useState(null)
//   const [locationExists, setLocationExists] = useState(false)
//   const [locationLoading, setLocationLoading] = useState(false)
//   const [locationSetIds, setLocationSetIds] = useState(new Set())
//   const [latitude, setLatitude] = useState('')
//   const [longitude, setLongitude] = useState('')
//   const [radius, setRadius] = useState('')
//   const [updatedAt, setUpdatedAt] = useState(null)
//   const [updatedBy, setUpdatedBy] = useState(null)
//   const [saveLoading, setSaveLoading] = useState(false)
//   const [success, setSuccess] = useState(null)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const load = async () => {
//       setLoadingMembers(true)
//       try {
//         const res = await getTeamMembers()
//         setMembers(res.data)
//       } catch (e) {
//         setError(e.response?.data?.message || 'Failed to load members')
//       } finally {
//         setLoadingMembers(false)
//       }
//     }
//     load()
//   }, [])

//   useEffect(() => {
//     if (!selectedId) {
//       setLocationExists(false)
//       setLatitude('')
//       setLongitude('')
//       setRadius('')
//       setUpdatedAt(null)
//       setUpdatedBy(null)
//       setLocationLoading(false)
//       return
//     }
//     setLocationLoading(true)
//     setError(null)
//     getUserLocation(selectedId)
//       .then((res) => {
//         const d = res.data
//         setLocationExists(true)
//         setLatitude(String(d.latitude ?? ''))
//         setLongitude(String(d.longitude ?? ''))
//         setRadius(String(d.radius ?? ''))
//         setUpdatedAt(d.updated_at ?? null)
//         setUpdatedBy(d.updated_by ?? null)
//         setLocationSetIds((prev) => new Set(prev).add(selectedId))
//       })
//       .catch((err) => {
//         if (err.response?.status === 404) {
//           setLocationExists(false)
//           setLatitude('')
//           setLongitude('')
//           setRadius('')
//           setUpdatedAt(null)
//           setUpdatedBy(null)
//           setLocationSetIds((prev) => {
//             const next = new Set(prev)
//             next.delete(selectedId)
//             return next
//           })
//         } else {
//           setError(err.response?.data?.message || 'Failed to load location')
//         }
//       })
//       .finally(() => setLocationLoading(false))
//   }, [selectedId])

//   const filteredMembers = members.filter(
//     (m) =>
//       !search.trim() ||
//       m.name?.toLowerCase().includes(search.toLowerCase()) ||
//       m.email?.toLowerCase().includes(search.toLowerCase())
//   )
//   const selectedMember = members.find((m) => m.id === selectedId)

//   const handleSave = async (e) => {
//     e.preventDefault()
//     if (!selectedId) return
//     const lat = parseFloat(latitude)
//     const lng = parseFloat(longitude)
//     const rad = parseInt(radius, 10)
//     if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(rad) || rad < 1) {
//       setError('Please enter valid latitude, longitude, and radius (min 1m).')
//       return
//     }
//     setSaveLoading(true)
//     setError(null)
//     try {
//       await setUserLocation(selectedId, {
//         latitude: lat,
//         longitude: lng,
//         radius: rad
//       })
//       setLocationExists(true)
//       setUpdatedAt(new Date().toISOString())
//       setLocationSetIds((prev) => new Set(prev).add(selectedId))
//       setSuccess(`Location updated for ${selectedMember?.name}.`)
//       setTimeout(() => setSuccess(null), 3000)
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to save location.')
//     } finally {
//       setSaveLoading(false)
//     }
//   }

//   return (
//     <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] gap-0 -m-4 lg:-m-8">
//       <aside className="w-full md:w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
//         <div className="p-4 border-b border-slate-800">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//             <input
//               type="text"
//               placeholder="Search members..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
//             />
//           </div>
//         </div>
//         <div className="flex-1 overflow-y-auto">
//           {loadingMembers ? (
//             [...Array(5)].map((_, i) => (
//               <div
//                 key={i}
//                 className="p-4 border-b border-slate-800 animate-pulse flex items-center gap-3"
//               >
//                 <div className="w-10 h-10 rounded-full bg-slate-700" />
//                 <div className="flex-1">
//                   <div className="h-4 w-24 bg-slate-700 rounded" />
//                   <div className="h-3 w-32 bg-slate-700 rounded mt-2" />
//                 </div>
//               </div>
//             ))
//           ) : filteredMembers.length === 0 ? (
//             <div className="p-8 text-center">
//               <EmptyState icon={UserX} title="No members found" />
//             </div>
//           ) : (
//             filteredMembers.map((m) => (
//               <button
//                 key={m.id}
//                 type="button"
//                 onClick={() => setSelectedId(m.id)}
//                 className={`
//                   w-full p-4 flex items-center gap-3 text-left border-b border-slate-800
//                   hover:bg-slate-800/50 transition-colors
//                   ${selectedId === m.id ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500 border-b-slate-800' : ''}
//                 `}
//               >
//                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium shrink-0">
//                   {m.name?.charAt(0)?.toUpperCase() ?? '?'}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-white truncate">{m.name}</p>
//                   <p className="text-slate-500 text-xs truncate">{m.email}</p>
//                 </div>
//                 {locationSetIds.has(m.id) && (
//                   <Badge variant="emerald" className="shrink-0">
//                     Location Set
//                   </Badge>
//                 )}
//               </button>
//             ))
//           )}
//         </div>
//       </aside>

//       <div className="flex-1 overflow-y-auto p-4 lg:p-8">
//         {success && (
//           <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3">
//             {success}
//           </div>
//         )}
//         {error && (
//           <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
//             {error}
//           </div>
//         )}

//         {!selectedId ? (
//           <div className="flex flex-col items-center justify-center py-24 text-center">
//             <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
//               <MapPin className="w-8 h-8 text-slate-600" />
//             </div>
//             <h3 className="text-white font-medium mb-2">Select a team member</h3>
//             <p className="text-slate-400 text-sm max-w-xs">
//               Choose a member to view or set their geo-fence location.
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
//                 {selectedMember?.name?.trim()?.[0]?.toUpperCase() ||
//                   selectedMember?.email?.trim()?.[0]?.toUpperCase() ||
//                   "?"}
//               </div>
//               <div>
//                 <p className="font-semibold text-white">{selectedMember?.name}</p>
//                 <p className="text-slate-400 text-sm">{selectedMember?.email}</p>
//                 <div className="flex items-center gap-2 mt-1">
//                   {locationExists ? (
//                     <Badge variant="emerald">Location Set</Badge>
//                   ) : (
//                     <Badge variant="slate">No Location</Badge>
//                   )}
//                   {updatedAt && (
//                     <span className="text-slate-500 text-xs">
//                       Last updated: {formatDate(updatedAt.slice(0, 10))}
//                       {updatedBy && (
//                         <span className="ml-1">
//                           · Updated by: {String(updatedBy).slice(0, 8)}…
//                         </span>
//                       )}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {locationLoading ? (
//               <div className="space-y-4 max-w-md">
//                 <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
//                 <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
//                 <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
//               </div>
//             ) : (
//               <form onSubmit={handleSave} className="max-w-xl space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Input
//                     label="Latitude"
//                     type="number"
//                     step="any"
//                     placeholder="19.0760"
//                     value={latitude}
//                     onChange={(e) => setLatitude(e.target.value)}
//                   />
//                   <Input
//                     label="Longitude"
//                     type="number"
//                     step="any"
//                     placeholder="72.8777"
//                     value={longitude}
//                     onChange={(e) => setLongitude(e.target.value)}
//                   />
//                 </div>
//                 <Input
//                   label="Radius (meters)"
//                   type="number"
//                   step="1"
//                   min="1"
//                   placeholder="200"
//                   value={radius}
//                   onChange={(e) => setRadius(e.target.value)}
//                   hint="Employees must be within this radius to punch in from the mobile app."
//                 />
//                 <Button
//                   type="submit"
//                   variant="primary"
//                   loading={saveLoading}
//                   disabled={saveLoading}
//                 >
//                   {saveLoading ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <MapPin className="w-4 h-4" />
//                   )}
//                   {locationExists ? 'Update Location' : 'Set Location'}
//                 </Button>
//               </form>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

import { useState, useEffect } from 'react'
import { MapPin, Search, UserX, Loader2 } from 'lucide-react'
import { getTeamMembers } from '../../api/services/team.service'
import { getUserLocation, setUserLocation } from '../../api/services/user.service'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate } from '../../utils/dateUtils'

export function UserLocationsPage() {
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [locationExists, setLocationExists] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationSetIds, setLocationSetIds] = useState(new Set())
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [radius, setRadius] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [updatedBy, setUpdatedBy] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoadingMembers(true)
      try {
        const res = await getTeamMembers()
        setMembers(res.data)
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load members')
      } finally {
        setLoadingMembers(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setLocationExists(false)
      setLatitude('')
      setLongitude('')
      setRadius('')
      setUpdatedAt(null)
      setUpdatedBy(null)
      setLocationLoading(false)
      return
    }
    setLocationLoading(true)
    setError(null)
    getUserLocation(selectedId)
      .then((res) => {
        const d = res.data
        setLocationExists(true)
        setLatitude(String(d.latitude ?? ''))
        setLongitude(String(d.longitude ?? ''))
        setRadius(String(d.radius ?? ''))
        setUpdatedAt(d.updated_at ?? null)
        setUpdatedBy(d.updated_by ?? null)
        setLocationSetIds((prev) => new Set(prev).add(selectedId))
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setLocationExists(false)
          setLatitude('')
          setLongitude('')
          setRadius('')
          setUpdatedAt(null)
          setUpdatedBy(null)
          setLocationSetIds((prev) => {
            const next = new Set(prev)
            next.delete(selectedId)
            return next
          })
        } else {
          setError(err.response?.data?.message || 'Failed to load location')
        }
      })
      .finally(() => setLocationLoading(false))
  }, [selectedId])

  const filteredMembers = members.filter(
    (m) =>
      !search.trim() ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  )
  const selectedMember = members.find((m) => m.id === selectedId)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!selectedId) return
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const rad = parseInt(radius, 10)
    if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(rad) || rad < 1) {
      setError('Please enter valid latitude, longitude, and radius (min 1m).')
      return
    }
    setSaveLoading(true)
    setError(null)
    try {
      await setUserLocation(selectedId, {
        latitude: lat,
        longitude: lng,
        radius: rad
      })
      setLocationExists(true)
      setUpdatedAt(new Date().toISOString())
      setLocationSetIds((prev) => new Set(prev).add(selectedId))
      const currentMember = members.find((m) => m.id === selectedId)
      setSuccess(`Location updated for ${currentMember?.name || 'selected member'}.`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save location.')
    } finally {
      setSaveLoading(false)
    }
  }

  const getInitial = (name, email) =>
    name?.trim()?.[0]?.toUpperCase() ||
    email?.trim()?.[0]?.toUpperCase() ||
    "?";

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] gap-0 -m-4 lg:-m-8">
      <aside className="w-full md:w-80 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-minimal">
          {loadingMembers ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 border-b border-slate-800 animate-pulse flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-700" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-slate-700 rounded" />
                  <div className="h-3 w-32 bg-slate-700 rounded mt-2" />
                </div>
              </div>
            ))
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState icon={UserX} title="No members found" />
            </div>
          ) : (
            filteredMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedId(m.id)}
                className={`
                  w-full p-4 flex items-center gap-3 text-left border-b border-slate-800
                  hover:bg-slate-800/50 transition-colors
                  ${selectedId === m.id ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500 border-b-slate-800' : ''}
                `}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium shrink-0">
                  {getInitial(m.name, m.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate">{m.name}</p>
                  <p className="text-white text-xs truncate">{m.email}</p>
                </div>
                {locationSetIds.has(m.id) && (
                  <Badge variant="emerald" className="shrink-0">
                    Location Set
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {!selectedId ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-medium mb-2">Select a team member</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Choose a member to view or set their geo-fence location.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                {selectedMember?.name?.trim()?.[0]?.toUpperCase() ||
                  selectedMember?.email?.trim()?.[0]?.toUpperCase() ||
                  "?"}
              </div>
              <div>
                <p className="font-semibold text-white">{selectedMember?.name}</p>
                <p className="text-slate-400 text-sm">{selectedMember?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {locationExists ? (
                    <Badge variant="emerald">Location Set</Badge>
                  ) : (
                    <Badge variant="slate">No Location</Badge>
                  )}
                  {updatedAt && (
                    <span className="text-slate-500 text-xs">
                      Last updated: {formatDate(updatedAt.slice(0, 10))}
                      {updatedBy && (
                        <span className="ml-1">
                          · Updated by: {String(updatedBy).slice(0, 8)}…
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {locationLoading ? (
              <div className="space-y-4 max-w-md">
                <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-800 rounded-xl animate-pulse" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="max-w-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    placeholder="19.0760"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    placeholder="72.8777"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
                <Input
                  label="Radius (meters)"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="200"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  hint="Employees must be within this radius to punch in from the mobile app."
                />
                <Button
                  type="submit"
                  variant="primary"
                  loading={saveLoading}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {locationExists ? 'Update Location' : 'Set Location'}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
