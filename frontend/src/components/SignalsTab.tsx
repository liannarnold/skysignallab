import { useState, useEffect, useCallback, Fragment } from 'react'
import { IconSearch, IconPlus, IconCopy, IconStar, IconStarFilled, IconChevronLeft, IconChevronRight, IconLoader2, IconAdjustmentsHorizontal } from '@tabler/icons-react'
import Topbar from './Topbar'
import { signalsApi, favoritesApi } from '../services/api'
import { getSdrSettings } from '../utils/sdrSettings'

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
const PAGE_SIZE_OPTIONS = [15, 30, 50, 100]
const DEFAULT_PAGE_SIZE = 15
const PAGE_SIZE_KEY = 'signalsPageSize'

// Page buttons: always first + last, plus a window around the current page, with gaps as '…'
const getPageItems = (current: number, total: number): (number | '…')[] => {
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const items: (number | '…')[] = []
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) items.push('…')
    items.push(page)
  })
  return items
}

// Remembered per browser; falls back to the default if storage is unavailable or the value is stale
const loadPageSize = () => {
  try {
    const saved = Number(localStorage.getItem(PAGE_SIZE_KEY))
    return PAGE_SIZE_OPTIONS.includes(saved) ? saved : DEFAULT_PAGE_SIZE
  } catch {
    return DEFAULT_PAGE_SIZE
  }
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

export default function SignalsTab({ sidebarExpanded, setSidebarExpanded }: SignalsTabProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(loadPageSize)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
  const changePageSize = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    try {
      localStorage.setItem(PAGE_SIZE_KEY, String(size))
    } catch {
      // Storage unavailable (e.g. private window) — setting just won't persist
    }
  }

  const totalPages = Math.max(1, Math.ceil(filteredSignals.length / pageSize))
  const paginatedSignals = filteredSignals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
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
                  paginatedSignals.map((signal, idx) => {
                    const sdr = expandedId === signal.id ? getSdrSettings(signal.frequency, signal.mode) : null
                    return (
                    <Fragment key={signal.id}>
                    <tr
                      className={`border-b hover:bg-elevated/30 transition-colors ${idx === paginatedSignals.length - 1 && !sdr ? 'border-b-0' : ''}`}
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
                            onClick={() => setExpandedId(expandedId === signal.id ? null : signal.id)}
                            className={`p-1.5 rounded-lg hover:bg-elevated transition-colors ${sdr ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                            aria-label="SDR++ settings"
                            title="SDR++ settings"
                          >
                            <IconAdjustmentsHorizontal size={16} />
                          </button>
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
                    {sdr && (
                      <tr
                        className={`border-b bg-elevated/20 ${idx === paginatedSignals.length - 1 ? 'border-b-0' : ''}`}
                        style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
                      >
                        <td colSpan={5} className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                            <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">SDR++</span>
                            <span className="text-text-secondary">Demod <span className="font-mono text-text-primary">{sdr.demod}</span></span>
                            <span className="text-text-secondary">Bandwidth <span className="font-mono text-text-primary">{sdr.bandwidthKhz} kHz</span></span>
                            <span className="text-text-secondary">Squelch <span className="font-mono text-text-primary">{sdr.squelch ? 'On' : 'Off'}</span></span>
                          </div>
                          {sdr.notes.length > 0 && (
                            <ul className="mt-2 space-y-0.5 text-xs text-text-secondary list-disc pl-4">
                              {sdr.notes.map(note => <li key={note}>{note}</li>)}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            Showing {paginatedSignals.length} of {filteredSignals.length} signals
          </span>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Per page
            <select
              value={pageSize}
              onChange={e => changePageSize(Number(e.target.value))}
              className="px-2 py-1 rounded-lg text-sm focus:outline-none"
              style={{ background: '#0b0f1a', border: '0.5px solid #1c2440', color: '#c8d4f0' }}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <IconChevronLeft size={16} />
          </button>
          {getPageItems(currentPage, totalPages).map((item, i) =>
            item === '…' ? (
              <span key={`gap-${i}`} className="text-text-tertiary px-1">…</span>
            ) : (
              <button
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                  currentPage === item
                    ? 'bg-primary text-page-bg'
                    : 'hover:bg-elevated text-text-secondary hover:text-text-primary'
                }`}
              >
                {item}
              </button>
            )
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