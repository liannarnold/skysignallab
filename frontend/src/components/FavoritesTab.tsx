import { useState, useEffect, useCallback } from 'react'
import { IconCopy, IconStar, IconStarFilled, IconTrash, IconLoader2 } from '@tabler/icons-react'
import Topbar from './Topbar'
import { favoritesApi } from '../services/api'

interface FavoritesTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

interface Favorite {
  id: string
  signal_id: string
  frequency: number
  mode: string
  description: string
  category: string
  notes?: string
  created_at: string
}

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
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await favoritesApi.getAll()
      setFavorites(data || [])
    } catch (err) {
      setError('Failed to load favorites')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const removeFavorite = async (id: string) => {
    try {
      await favoritesApi.remove(id)
      setFavorites(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      console.error('Failed to remove favorite', err)
    }
  }

  const copyFrequency = (frequency: number) => {
    navigator.clipboard.writeText(`${frequency.toFixed(4)} MHz`)
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar
        title="Favorites"
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-text-secondary">
            <IconLoader2 size={20} className="animate-spin" />
            <span>Loading favorites...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-error">
            {error}
          </div>
        ) : favorites.length === 0 ? (
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Notes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((favorite, idx) => (
                  <tr
                    key={favorite.id}
                    className={`border-b hover:bg-elevated/30 transition-colors ${idx === favorites.length - 1 ? 'border-b-0' : ''}`}
                    style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary">{favorite.frequency.toFixed(4)} MHz</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getModeColor(favorite.mode)}`} style={{ borderRadius: '99px' }}>
                        {favorite.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{favorite.category}</td>
                    <td className="px-4 py-3 text-text-primary text-sm">{favorite.description}</td>
                    <td className="px-4 py-3 text-text-tertiary text-sm italic">
                      {favorite.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => copyFrequency(favorite.frequency)}
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
                          onClick={() => removeFavorite(favorite.id)}
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