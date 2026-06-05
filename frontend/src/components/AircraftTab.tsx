import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { IconPlus, IconMinus, IconCurrentLocation, IconX } from '@tabler/icons-react'
import Topbar from './Topbar'
import 'leaflet/dist/leaflet.css'

interface AircraftTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

const aircraftData = [
  { id: 'AAL302', type: 'commercial', lat: 32.85, lng: -93.45, rotation: 45, airline: 'American Airlines', model: 'Boeing 737-800', route: 'Dallas → Atlanta', altitude: 14500, speed: 320, heading: 45, icao: 'A3F2B1', status: 'Climbing' },
  { id: 'DAL1582', type: 'commercial', lat: 32.35, lng: -93.95, rotation: 90, airline: 'Delta Air Lines', model: 'Airbus A321', route: 'Houston → Nashville', altitude: 35000, speed: 485, heading: 85, icao: 'AB2C3D', status: 'Cruising' },
  { id: 'SWA2341', type: 'commercial', lat: 33.05, lng: -92.85, rotation: 180, airline: 'Southwest Airlines', model: 'Boeing 737 MAX 8', route: 'Phoenix → Miami', altitude: 38000, speed: 502, heading: 135, icao: 'AC4D5E', status: 'Cruising' },
  { id: 'UAL892', type: 'commercial', lat: 32.45, lng: -92.65, rotation: 270, airline: 'United Airlines', model: 'Boeing 777-200', route: 'Los Angeles → Chicago', altitude: 39000, speed: 510, heading: 60, icao: 'AD6E7F', status: 'Cruising' },
  { id: 'BKSD01', type: 'military', lat: 32.50, lng: -93.66, rotation: 0, airline: 'USAF', model: 'B-52H Stratofortress', route: 'Barksdale AFB', altitude: 25000, speed: 380, heading: 0, icao: 'MIL001', status: 'Training' },
  { id: 'BKSD02', type: 'military', lat: 32.55, lng: -93.70, rotation: 45, airline: 'USAF', model: 'KC-135 Stratotanker', route: 'Barksdale AFB', altitude: 28000, speed: 420, heading: 45, icao: 'MIL002', status: 'Refueling' },
  { id: 'AAL1205', type: 'commercial', lat: 32.75, lng: -94.15, rotation: 120, airline: 'American Airlines', model: 'Boeing 787-9', route: 'New York → Dallas', altitude: 41000, speed: 520, heading: 240, icao: 'AE8F9G', status: 'Descending' },
  { id: 'N4523K', type: 'commercial', lat: 32.20, lng: -93.25, rotation: 315, airline: 'Private', model: 'Cessna 172', route: 'Local Flight', altitude: 5500, speed: 110, heading: 315, icao: 'N4523K', status: 'VFR' },
  { id: 'SKW5421', type: 'commercial', lat: 33.15, lng: -93.75, rotation: 200, airline: 'SkyWest Airlines', model: 'CRJ-700', route: 'Denver → Shreveport', altitude: 32000, speed: 445, heading: 160, icao: 'AF1G2H', status: 'Descending' },
  { id: 'BKSD03', type: 'military', lat: 32.48, lng: -93.62, rotation: 90, airline: 'USAF', model: 'T-38 Talon', route: 'Barksdale AFB', altitude: 15000, speed: 450, heading: 90, icao: 'MIL003', status: 'Training' },
  { id: 'JBU1892', type: 'commercial', lat: 32.60, lng: -92.45, rotation: 225, airline: 'JetBlue Airways', model: 'Airbus A320', route: 'Boston → Houston', altitude: 36000, speed: 475, heading: 225, icao: 'AG3H4I', status: 'Cruising' },
  { id: 'ASA231', type: 'commercial', lat: 32.10, lng: -93.85, rotation: 30, airline: 'Alaska Airlines', model: 'Boeing 737-900', route: 'Seattle → New Orleans', altitude: 37000, speed: 480, heading: 130, icao: 'AH5I6J', status: 'Cruising' },
]

// Barksdale AFB coordinates
const BARKSDALE_CENTER: [number, number] = [32.5012, -93.6627]

// Create custom aircraft icons
const createAircraftIcon = (color: string, rotation: number) => {
  return L.divIcon({
    className: 'aircraft-icon',
    html: `<div style="transform: rotate(${rotation}deg); color: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L8 8H4L6 12L4 16H8L12 22L16 16H20L18 12L20 8H16L12 2Z"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Map controls component
function MapControls({ onZoomIn, onZoomOut, onCenter }: { onZoomIn: () => void, onZoomOut: () => void, onCenter: () => void }) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
      <button 
        onClick={onZoomIn}
        className="p-2 bg-surface rounded-lg border text-text-secondary hover:text-text-primary transition-colors" 
        style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '8px' }}
      >
        <IconPlus size={18} />
      </button>
      <button 
        onClick={onZoomOut}
        className="p-2 bg-surface rounded-lg border text-text-secondary hover:text-text-primary transition-colors" 
        style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '8px' }}
      >
        <IconMinus size={18} />
      </button>
      <button 
        onClick={onCenter}
        className="p-2 bg-surface rounded-lg border text-text-secondary hover:text-text-primary transition-colors" 
        style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '8px' }}
      >
        <IconCurrentLocation size={18} />
      </button>
    </div>
  )
}

// Component to handle map operations
function MapController({ mapRef }: { mapRef: React.MutableRefObject<L.Map | null> }) {
  const map = useMap()
  
  useEffect(() => {
    mapRef.current = map
  }, [map, mapRef])
  
  return null
}

export default function AircraftTab({ sidebarExpanded, setSidebarExpanded }: AircraftTabProps) {
  const [selectedAircraft, setSelectedAircraft] = useState<typeof aircraftData[0] | null>(aircraftData[0])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const mapRef = { current: null as L.Map | null }

  const handleAircraftClick = (aircraft: typeof aircraftData[0]) => {
    setSelectedAircraft(aircraft)
    setDrawerOpen(true)
  }

  const handleZoomIn = () => {
    mapRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    mapRef.current?.zoomOut()
  }

  const handleCenter = () => {
    mapRef.current?.setView(BARKSDALE_CENTER, 9)
  }

  const getAircraftColor = (aircraft: typeof aircraftData[0]) => {
    if (selectedAircraft?.id === aircraft.id) return '#facc15' // selected - yellow
    if (aircraft.type === 'military') return '#60a5fa' // military - blue
    return '#fb923c' // commercial - orange
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar 
        title="Aircraft" 

        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      >
        <div className="flex items-center gap-2 px-3 py-1 bg-success-bg rounded-lg text-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-success">Live — {aircraftData.length} aircraft</span>
        </div>
        <div className="px-3 py-1 bg-elevated rounded-lg text-sm text-text-secondary">
          Updated 2s ago
        </div>
      </Topbar>

      {/* Map Area */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={BARKSDALE_CENTER}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapController mapRef={mapRef} />
          
          {/* Dark map tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Barksdale AFB Zone */}
          <Circle
            center={BARKSDALE_CENTER}
            radius={30000}
            pathOptions={{
              color: '#fb923c',
              fillColor: '#fb923c',
              fillOpacity: 0.1,
              dashArray: '10, 10',
              weight: 2
            }}
          />

          {/* Aircraft Markers */}
          {aircraftData.map(aircraft => (
            <Marker
              key={aircraft.id}
              position={[aircraft.lat, aircraft.lng]}
              icon={createAircraftIcon(getAircraftColor(aircraft), aircraft.rotation)}
              eventHandlers={{
                click: () => handleAircraftClick(aircraft)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{aircraft.id}</strong><br/>
                  {aircraft.airline}<br/>
                  {aircraft.model}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Controls */}
        <MapControls 
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut} 
          onCenter={handleCenter} 
        />

        {/* Legend */}
        <div 
          className="absolute bottom-4 left-4 p-3 bg-surface rounded-xl border z-[1000]"
          style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}
        >
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-text-secondary">Commercial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-military" />
              <span className="text-text-secondary">Military</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-selected" />
              <span className="text-text-secondary">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-dashed border-primary/50" />
              <span className="text-text-secondary">Barksdale zone</span>
            </div>
          </div>
        </div>

        {/* Aircraft Detail Drawer */}
        {drawerOpen && selectedAircraft && (
          <div 
            className="absolute bottom-0 left-0 right-0 bg-surface border-t p-4 z-[1000] animate-in slide-in-from-bottom duration-300"
            style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="font-mono text-2xl text-primary font-semibold">{selectedAircraft.id}</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <div className="text-xs text-text-tertiary mb-1">Altitude</div>
                <div className="text-lg font-semibold text-text-primary">{selectedAircraft.altitude.toLocaleString()} ft</div>
              </div>
              <div className="p-3 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <div className="text-xs text-text-tertiary mb-1">Speed</div>
                <div className="text-lg font-semibold text-text-primary">{selectedAircraft.speed} kts</div>
              </div>
              <div className="p-3 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <div className="text-xs text-text-tertiary mb-1">Heading</div>
                <div className="text-lg font-semibold text-text-primary">{selectedAircraft.heading.toString().padStart(3, '0')}°</div>
              </div>
              <div className="p-3 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <div className="text-xs text-text-tertiary mb-1">ICAO</div>
                <div className="text-lg font-semibold font-mono text-text-primary">{selectedAircraft.icao}</div>
              </div>
            </div>

            {/* Meta Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-elevated rounded-full text-sm text-text-secondary" style={{ borderRadius: '99px' }}>
                {selectedAircraft.airline}
              </span>
              <span className="px-3 py-1 bg-elevated rounded-full text-sm text-text-secondary" style={{ borderRadius: '99px' }}>
                {selectedAircraft.model}
              </span>
              <span className="px-3 py-1 bg-elevated rounded-full text-sm text-text-secondary" style={{ borderRadius: '99px' }}>
                {selectedAircraft.route}
              </span>
              <span className="px-3 py-1 bg-primary/20 rounded-full text-sm text-primary" style={{ borderRadius: '99px' }}>
                {selectedAircraft.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
