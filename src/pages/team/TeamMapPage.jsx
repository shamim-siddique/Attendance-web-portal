import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, Navigation, Calendar, User, MapPin } from 'lucide-react'
import { LocationMap } from '../../components/ui/Map'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../utils/dateUtils'

export function TeamMapPage() {
  const [searchParams] = useSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const user = searchParams.get('user')
  const date = searchParams.get('date')

  const [tileLayer, setTileLayer] = useState('satellite')
  const [customLat, setCustomLat] = useState(lat || '')
  const [customLng, setCustomLng] = useState(lng || '')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleSetCustomLocation = () => {
    if (customLat && customLng) {
      const newUrl = `/team/map?lat=${customLat}&lng=${customLng}&user=${user || 'Custom'}&date=${date || new Date().toISOString().split('T')[0]}`
      window.history.pushState({}, '', newUrl)
      window.location.reload()
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCustomLat(latitude.toString())
          setCustomLng(longitude.toString())
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Could not get your location')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  if (!lat || !lng) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Location Not Found</h2>
          <p className="text-slate-400 mb-4">No location data available</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">User Location</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-slate-400 mt-1">
                  {user && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {decodeURIComponent(user)}
                    </div>
                  )}
                  {date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(date)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  showCustomInput
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Set Location
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <LocationMap 
              latitude={lat} 
              longitude={lng} 
              height="600px"
              showControls={true}
              defaultLayer={tileLayer}
            />
          </div>
          
          {showCustomInput && (
            <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set Custom Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="28.613939"
                    className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    placeholder="77.209021"
                    className="w-full bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSetCustomLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Set Location
                </Button>
                <Button variant="outline" onClick={handleUseCurrentLocation}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Quick Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { name: 'Delhi', lat: '28.613939', lng: '77.209021' },
                    { name: 'Mumbai', lat: '19.076090', lng: '72.877426' },
                    { name: 'Bangalore', lat: '12.971599', lng: '77.594563' },
                    { name: 'Chennai', lat: '13.082680', lng: '80.270718' }
                  ].map((city) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        setCustomLat(city.lat)
                        setCustomLng(city.lng)
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Coordinates</h3>
              <p className="text-gray-900 dark:text-white font-mono">
                {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">External Maps</h3>
              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/@${lat},${lng},18z/data=!3m1!1e3`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                >
                  Google Maps
                </a>
                <span className="text-slate-600">|</span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=18`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm underline"
                >
                  OpenStreetMap
                </a>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Quick Actions</h3>
              <button
                onClick={() => navigator.clipboard.writeText(`${lat}, ${lng}`)}
                className="text-indigo-400 hover:text-indigo-300 text-sm underline"
              >
                Copy Coordinates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
