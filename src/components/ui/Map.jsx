import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    name: 'Street'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://esri.com">Esri</a>',
    name: 'Satellite'
  }
}

export function LocationMap({ latitude, longitude, height = '200px', showControls = true, defaultLayer = 'street' }) {
  const [tileLayer, setTileLayer] = useState(defaultLayer)

  if (!latitude || !longitude) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-500 text-sm" style={{ height }}>
        No location data
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700" style={{ height }}>
        <MapContainer
          center={[parseFloat(latitude), parseFloat(longitude)]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={showControls}
        >
          <TileLayer
            url={TILE_LAYERS[tileLayer].url}
            attribution={TILE_LAYERS[tileLayer].attribution}
          />
          <Marker position={[parseFloat(latitude), parseFloat(longitude)]}>
            <Popup>
              <div className="text-xs">
                <div className="font-semibold">User Location</div>
                <div>{parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      {showControls && (
        <div className="flex gap-2">
          {Object.entries(TILE_LAYERS).map(([key, layer]) => (
            <button
              key={key}
              onClick={() => setTileLayer(key)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                tileLayer === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CompactLocationMap({ latitude, longitude }) {
  if (!latitude || !longitude) {
    return <span className="text-gray-600 dark:text-slate-500">—</span>
  }
  
  return (
    <div className="space-y-1">
      <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-slate-700" style={{ height: '120px' }}>
        <MapContainer
          center={[parseFloat(latitude), parseFloat(longitude)]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution=""
          />
          <Marker position={[parseFloat(latitude), parseFloat(longitude)]} />
        </MapContainer>
      </div>
      <div className="text-xs text-gray-600 dark:text-slate-400 text-center">
        {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
      </div>
    </div>
  )
}
