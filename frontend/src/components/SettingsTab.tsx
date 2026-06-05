import { useState } from 'react'
import { IconMapPin, IconPalette, IconDownload, IconUpload } from '@tabler/icons-react'
import Topbar from './Topbar'

interface SettingsTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
  accentColor: string
  setAccentColor: (value: string) => void
}

export default function SettingsTab({ sidebarExpanded, setSidebarExpanded, accentColor, setAccentColor }: SettingsTabProps) {
  const [location, setLocation] = useState('Bossier City, LA')

  const accentColors = [
    '#fb923c', // Orange (default)
    '#4ade80', // Green
    '#60a5fa', // Blue
    '#f472b6', // Pink
    '#a78bfa', // Purple
    '#fbbf24', // Yellow
  ]

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar 
        title="Settings" 

        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl space-y-6">
          {/* Location */}
          <div className="bg-surface rounded-xl border p-4" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <IconMapPin size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Location</h3>
                <p className="text-sm text-text-secondary">Used for local repeaters and band conditions</p>
              </div>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 bg-elevated rounded-lg text-text-primary border focus:outline-none focus:border-border-emphasis"
              style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '8px' }}
            />
          </div>

          {/* Accent Color */}
          <div className="bg-surface rounded-xl border p-4" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <IconPalette size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Accent Color</h3>
                <p className="text-sm text-text-secondary">Customize the app appearance</p>
              </div>
            </div>
            <div className="flex gap-3">
              {accentColors.map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    accentColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color, borderRadius: '99px' }}
                />
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-surface rounded-xl border p-4" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <IconDownload size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Data Management</h3>
                <p className="text-sm text-text-secondary">Export or import your signals as a CSV file</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors" style={{ borderRadius: '8px' }}>
                <IconDownload size={18} />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors" style={{ borderRadius: '8px' }}>
                <IconUpload size={18} />
                Import CSV
              </button>
            </div>
          </div>

          {/* Version */}
          <div className="text-center text-sm text-text-tertiary py-4">
            SkySignalLab v1.0.0 • SDR Companion
          </div>
        </div>
      </div>
    </div>
  )
}
