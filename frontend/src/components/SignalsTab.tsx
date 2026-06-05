import { useState, useEffect, useCallback } from 'react'
import { IconSearch, IconPlus, IconCopy, IconStar, IconStarFilled, IconChevronLeft, IconChevronRight, IconLoader2 } from '@tabler/icons-react'
import Topbar from './Topbar'
import { signalsApi, favoritesApi } from '../services/api'

interface SignalsTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

interface Signal {
  id: string
  frequency: number
  mode: string
  category: string
  description: string
  band?: string
  created_at: string
}

interface Favorite {
  id: string
  signal_id: string
  frequency: number
  mode: string
  description: string
  category: string
  notes?: string
}

const categories = ['All', 'HAM', 'Weather', 'Aviation', 'Marine', 'Emergency', 'CB', 'Broadcast']
const PAGE_SIZE = 8

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

export default function SignalsTab({ sidebarExpanded, setSidebarExpanded }: SignalsTabProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch signals from API
  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const filters = activeCategory !== 'All' ? { category: activeCategory } : {}
      const data = await signalsApi.getAll(filters)
      setSignals(data || [])
      setCurrentPage(1)
    } catch (err) {
      setError('Failed to load signals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  // Fetch favorites from API
  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const data = await favoritesApi.getAll()
      setFavorites(data || [])
    } catch (err) {
      console.error('Failed to load favorites', err)
    }
  }, [])

  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorited = (signalId: string) =>
    favorites.some(f => f.signal_id === signalId)

  const getFavoriteId = (signalId: string) =>
    favorites.find(f => f.signal_id === signalId)?.id

  const toggleFavorite = async (signal: Signal) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please log in to save favorites')
      return
    }
    try {
      if (isFavorited(signal.id)) {
        const favId = getFavoriteId(signal.id)
        if (favId) {
          await favoritesApi.remove(favId)
          setFavorites(prev => prev.filter(f => f.id !== favId))
        }
      } else {
        const result = await favoritesApi.add(signal.id)
        setFavorites(prev => [...prev, { ...result, signal_id: signal.id, frequency: signal.frequency, mode: signal.mode, description: signal.description, category: signal.category }])
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err)
    }
  }

  const copyFrequency = (frequency: number) => {
    navigator.clipboard.writeText(`${frequency.toFixed(4)} MHz`)
  }

  // Client-side search filter
  const filteredSignals = signals.filter(signal =>
    searchQuery === '' ||
    signal.frequency.toString().includes(searchQuery) ||
    signal.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredSignals.length / PAGE_SIZE))
  const paginatedSignals = filteredSignals.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar
        title="Signals"
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        rightContent={
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-page-bg rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <IconPlus size={16} />
            Add signal
          </button>
        }
      >
        <div className="relative flex-1 max-w-md">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search frequency or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-elevated rounded-lg text-sm text-text-primary placeholder:text-text-tertiary border focus:outline-none focus:border-border-emphasis"
            style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
          />
        </div>
      </Topbar>

      {/* Category Filters */}
      <div className="px-4 py-3 flex gap-2 flex-wrap border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-page-bg'
                : 'bg-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-text-secondary">
            <IconLoader2 size={20} className="animate-spin" />
            <span>Loading signals...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-error">
            {error}
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
                {paginatedSignals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary text-sm">
                      No signals found
                    </td>
                  </tr>
                ) : (
                  paginatedSignals.map((signal, idx) => (
                    <tr
                      key={signal.id}
                      className={`border-b hover:bg-elevated/30 transition-colors ${idx === paginatedSignals.length - 1 ? 'border-b-0' : ''}`}
                      style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-primary">{signal.frequency.toFixed(4)} MHz</span>
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
                            onClick={() => copyFrequency(signal.frequency)}
                            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
                            aria-label="Copy frequency"
                          >
                            <IconCopy size={16} />
                          </button>
                          <button
                            onClick={() => toggleFavorite(signal)}
                            className="p-1.5 rounded-lg hover:bg-elevated transition-colors"
                            aria-label="Toggle favorite"
                          >
                            {isFavorited(signal.id) ? (
                              <IconStarFilled size={16} className="text-primary" />
                            ) : (
                              <IconStar size={16} className="text-text-secondary hover:text-primary" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
        <span className="text-sm text-text-secondary">
          Showing {paginatedSignals.length} of {filteredSignals.length} signals
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <IconChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? 'bg-primary text-page-bg'
                  : 'hover:bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 3 && <span className="text-text-tertiary px-1">...</span>}
          {totalPages > 3 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                currentPage === totalPages
                  ? 'bg-primary text-page-bg'
                  : 'hover:bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {totalPages}
            </button>
          )}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}