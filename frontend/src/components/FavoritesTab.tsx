import { useState } from 'react'
import { IconCopy, IconStar, IconStarFilled, IconTrash } from '@tabler/icons-react'
import Topbar from './Topbar'

interface FavoritesTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

const favoriteSignals = [
  { frequency: '162.4000', unit: 'MHz', mode: 'NFM', category: 'Weather', description: 'NOAA Weather Radio' },
  { frequency: '144.2000', unit: 'MHz', mode: 'USB', category: 'HAM', description: '2m SSB Calling' },
  { frequency: '98.1', unit: 'MHz FM', mode: 'FM', category: 'Broadcast', description: 'KBTT — Bossier City, LA' },
  { frequency: '146.940', unit: 'MHz', mode: 'FM', category: 'HAM', description: 'W5SLA Repeater' },
]

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'NFM': return 'bg-elevated text-text-secondary'
    case 'AM': return 'bg-warning-bg text-warning'
    case 'FM': return 'bg-success-bg text-success'
    case 'USB': return 'bg-[#1a1a2e] text-primary'
    case 'LSB': return 'bg-[#1a2a1a] text-success'
    default: return 'bg-elevated text-text-secondary'
  }
}

export default function FavoritesTab({ sidebarExpanded, setSidebarExpanded }: FavoritesTabProps) {
  const [favorites, setFavorites] = useState(favoriteSignals)

  const removeFavorite = (frequency: string) => {
    setFavorites(prev => prev.filter(f => f.frequency !== frequency))
  }

  const copyFrequency = (frequency: string, unit: string) => {
    navigator.clipboard.writeText(`${frequency} ${unit}`)
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar 
        title="Favorites" 

        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      <div className="flex-1 overflow-auto p-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <IconStar size={48} className="text-text-tertiary mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">No favorites yet</h2>
            <p className="text-text-secondary text-sm">Star signals to add them to your favorites</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border overflow-hidden" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((signal, idx) => (
                  <tr 
                    key={signal.frequency}
                    className={`border-b hover:bg-elevated/30 transition-colors ${idx === favorites.length - 1 ? 'border-b-0' : ''}`}
                    style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary">{signal.frequency} {signal.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getModeColor(signal.mode)}`} style={{ borderRadius: '99px' }}>
                        {signal.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{signal.category}</td>
                    <td className="px-4 py-3 text-text-primary text-sm">{signal.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyFrequency(signal.frequency, signal.unit)}
                          className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
                          aria-label="Copy frequency"
                        >
                          <IconCopy size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-elevated transition-colors"
                          aria-label="Favorited"
                        >
                          <IconStarFilled size={16} className="text-primary" />
                        </button>
                        <button
                          onClick={() => removeFavorite(signal.frequency)}
                          className="p-1.5 rounded-lg hover:bg-error-bg transition-colors text-text-secondary hover:text-error"
                          aria-label="Remove from favorites"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
