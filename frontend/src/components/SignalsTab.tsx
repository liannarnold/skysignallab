import { useState } from 'react'
import { IconSearch, IconPlus, IconCopy, IconStar, IconStarFilled, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import Topbar from './Topbar'

interface SignalsTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

const categories = ['All', 'HAM', 'Weather', 'Aviation', 'Marine', 'Emergency', 'CB', 'Broadcast']

const signalsData = [
  { frequency: '162.4000', unit: 'MHz', mode: 'NFM', category: 'Weather', description: 'NOAA Weather Radio', favorited: true },
  { frequency: '121.5000', unit: 'MHz', mode: 'AM', category: 'Aviation', description: 'Emergency Frequency', favorited: false },
  { frequency: '156.8000', unit: 'MHz', mode: 'NFM', category: 'Marine', description: 'VHF Channel 16', favorited: false },
  { frequency: '144.2000', unit: 'MHz', mode: 'USB', category: 'HAM', description: '2m SSB Calling', favorited: true },
  { frequency: '146.5200', unit: 'MHz', mode: 'FM', category: 'HAM', description: '2m Simplex Calling', favorited: false },
  { frequency: '27.1850', unit: 'MHz', mode: 'AM', category: 'CB', description: 'CB Radio Channel 19', favorited: false },
  { frequency: '460.5250', unit: 'MHz', mode: 'NFM', category: 'Emergency', description: 'Police Primary Dispatch', favorited: false },
  { frequency: '88.5000', unit: 'MHz', mode: 'FM', category: 'Broadcast', description: 'Local FM Public Radio', favorited: false },
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

export default function SignalsTab({ sidebarExpanded, setSidebarExpanded }: SignalsTabProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<Record<string, boolean>>(
    Object.fromEntries(signalsData.map(s => [s.frequency, s.favorited]))
  )
  const [currentPage, setCurrentPage] = useState(1)

  const toggleFavorite = (frequency: string) => {
    setFavorites(prev => ({ ...prev, [frequency]: !prev[frequency] }))
  }

  const copyFrequency = (frequency: string, unit: string) => {
    navigator.clipboard.writeText(`${frequency} ${unit}`)
  }

  const filteredSignals = signalsData.filter(signal => {
    const matchesCategory = activeCategory === 'All' || signal.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      signal.frequency.includes(searchQuery) || 
      signal.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
              {filteredSignals.map((signal, idx) => (
                <tr 
                  key={signal.frequency} 
                  className={`border-b hover:bg-elevated/30 transition-colors ${idx === filteredSignals.length - 1 ? 'border-b-0' : ''}`}
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
                        onClick={() => toggleFavorite(signal.frequency)}
                        className="p-1.5 rounded-lg hover:bg-elevated transition-colors"
                        aria-label="Toggle favorite"
                      >
                        {favorites[signal.frequency] ? (
                          <IconStarFilled size={16} className="text-primary" />
                        ) : (
                          <IconStar size={16} className="text-text-secondary hover:text-primary" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
        <span className="text-sm text-text-secondary">Showing {filteredSignals.length} of 247 signals</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary disabled:opacity-50"
            disabled={currentPage === 1}
          >
            <IconChevronLeft size={16} />
          </button>
          {[1, 2, 3].map(page => (
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
          <span className="text-text-tertiary px-1">...</span>
          <button
            onClick={() => setCurrentPage(31)}
            className={`w-8 h-8 rounded-lg text-sm transition-colors ${
              currentPage === 31
                ? 'bg-primary text-page-bg'
                : 'hover:bg-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            31
          </button>
          <button 
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
