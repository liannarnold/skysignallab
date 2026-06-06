import { useState, useRef, useEffect, useCallback } from 'react'
import { IconStar, IconStarFilled, IconCopy, IconPlayerPlayFilled, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconLoader2 } from '@tabler/icons-react'
import Topbar from './Topbar'
import { signalsApi, favoritesApi } from '../services/api'

interface FmAmTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

interface Station {
  id: string
  frequency: number
  description: string
  category: string
  mode: string
}

// Fallback local stations if database has none
const fallbackStations: Station[] = [
  { id: 'fb1', frequency: 98.1, description: 'KBTT — Bossier City', category: 'Broadcast', mode: 'FM' },
  { id: 'fb2', frequency: 94.5, description: 'KXKS — Bossier City', category: 'Broadcast', mode: 'FM' },
  { id: 'fb3', frequency: 101.7, description: 'KRMD — Shreveport', category: 'Broadcast', mode: 'FM' },
  { id: 'fb4', frequency: 96.5, description: 'KQHN — Shreveport', category: 'Broadcast', mode: 'FM' },
  { id: 'fb5', frequency: 89.9, description: 'KDAQ — Shreveport (NPR)', category: 'Broadcast', mode: 'FM' },
  { id: 'fb6', frequency: 1130, description: 'KWKH — Shreveport', category: 'Broadcast', mode: 'AM' },
  { id: 'fb7', frequency: 710, description: 'KEEL — Shreveport', category: 'Broadcast', mode: 'AM' },
]

const genres = ['All', 'Pop', 'Rock', 'Country', 'News', 'Talk', 'Gospel', 'Sports']

export default function FmAmTab({ sidebarExpanded, setSidebarExpanded }: FmAmTabProps) {
  const [band, setBand] = useState<'FM' | 'AM'>('FM')
  const [frequency, setFrequency] = useState(98.1)
  const [activeGenre, setActiveGenre] = useState('All')
  const [stations, setStations] = useState<Station[]>(fallbackStations)
  const [favorites, setFavorites] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)

  const fmMin = 87.9, fmMax = 107.9
  const amMin = 530, amMax = 1700
  const min = band === 'FM' ? fmMin : amMin
  const max = band === 'FM' ? fmMax : amMax
  const step = band === 'FM' ? 0.2 : 10

  useEffect(() => {
    setFrequency(band === 'FM' ? 98.1 : 1130)
  }, [band])

  // Fetch broadcast signals from API
  const fetchStations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await signalsApi.getAll({ category: 'Broadcast' })
      if (data && data.length > 0) {
        setStations(data)
      } else {
        setStations(fallbackStations)
      }
    } catch (err) {
      console.error('Failed to fetch stations', err)
      setStations(fallbackStations)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const data = await favoritesApi.getAll()
      const favMap: Record<string, string> = {}
      ;(data || []).forEach((f: { signal_id: string; id: string }) => {
        favMap[f.signal_id] = f.id
      })
      setFavorites(favMap)
    } catch (err) {
      console.error('Failed to fetch favorites', err)
    }
  }, [])

  useEffect(() => {
    fetchStations()
    fetchFavorites()
  }, [fetchStations, fetchFavorites])

  const toggleFavorite = async (station: Station) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      if (favorites[station.id]) {
        await favoritesApi.remove(favorites[station.id])
        setFavorites(prev => {
          const next = { ...prev }
          delete next[station.id]
          return next
        })
      } else {
        const result = await favoritesApi.add(station.id)
        setFavorites(prev => ({ ...prev, [station.id]: result.id }))
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err)
    }
  }

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newFreq = min + percent * (max - min)
    const snapped = Math.round(newFreq / step) * step
    setFrequency(Math.max(min, Math.min(max, parseFloat(snapped.toFixed(1)))))
  }

  const adjustFrequency = (delta: number) => {
    const newFreq = frequency + delta
    const snapped = Math.round(newFreq / step) * step
    setFrequency(Math.max(min, Math.min(max, parseFloat(snapped.toFixed(1)))))
  }

  const filteredStations = stations.filter(s => {
    const matchesBand = band === 'FM' ? s.frequency < 500 : s.frequency >= 500
    return matchesBand
  })

  const currentStation = filteredStations.find(s => Math.abs(s.frequency - frequency) < 0.1)
  const percent = ((frequency - min) / (max - min)) * 100

  const copyFrequency = () => {
    navigator.clipboard.writeText(`${frequency} ${band === 'FM' ? 'MHz FM' : 'kHz AM'}`)
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar
        title="FM / AM"
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      <div className="flex-1 overflow-auto p-4">
        {/* Tuner Card */}
        <div
          className="bg-surface rounded-xl border p-6 mb-6"
          style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}
        >
          {/* Frequency Display */}
          <div className="text-center mb-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-mono text-6xl font-semibold text-primary">
                {band === 'FM' ? frequency.toFixed(1) : frequency}
              </span>
              <span className="text-xl text-text-secondary">
                {band === 'FM' ? 'MHz FM' : 'kHz AM'}
              </span>
            </div>
            {currentStation ? (
              <>
                <div className="text-lg text-text-primary mt-2">{currentStation.description}</div>
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  RDS metadata available with SDR kit
                </div>
              </>
            ) : (
              <div className="text-text-tertiary text-sm mt-2">Tune to a station</div>
            )}
          </div>

          {/* Band Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            {(['FM', 'AM'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  band === b ? 'bg-primary text-page-bg' : 'bg-elevated text-text-secondary hover:text-text-primary'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Frequency Slider */}
          <div className="mb-6">
            <div
              ref={sliderRef}
              onClick={handleSliderClick}
              className="relative h-12 bg-elevated rounded-lg cursor-pointer overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="absolute inset-y-0 left-0 bg-primary/20" style={{ width: `${percent}%` }} />
              <div className="absolute top-0 bottom-0 w-1 bg-primary" style={{ left: `calc(${percent}% - 2px)` }} />
              <div className="absolute inset-x-4 bottom-1 flex justify-between">
                {band === 'FM'
                  ? ['87.9', '92', '96', '100', '104', '107.9'].map(m => (
                      <span key={m} className="text-xs text-text-tertiary">{m}</span>
                    ))
                  : ['530', '800', '1100', '1400', '1700'].map(m => (
                      <span key={m} className="text-xs text-text-tertiary">{m}</span>
                    ))
                }
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => adjustFrequency(-step * 5)} className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"><IconChevronsLeft size={20} /></button>
            <button onClick={() => adjustFrequency(-step)} className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"><IconChevronLeft size={20} /></button>
            <button className="p-3 rounded-lg bg-primary text-page-bg transition-colors"><IconPlayerPlayFilled size={20} /></button>
            <button onClick={() => adjustFrequency(step)} className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"><IconChevronRight size={20} /></button>
            <button onClick={() => adjustFrequency(step * 5)} className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"><IconChevronsRight size={20} /></button>
            <div className="w-px h-8 bg-border-subtle mx-2" />
            <button
              onClick={() => currentStation && toggleFavorite(currentStation)}
              className={`p-2 rounded-lg transition-colors ${currentStation && favorites[currentStation.id] ? 'bg-primary/20 text-primary' : 'bg-elevated text-text-secondary hover:text-text-primary'}`}
            >
              {currentStation && favorites[currentStation.id]
                ? <IconStarFilled size={20} />
                : <IconStar size={20} />
              }
            </button>
            <button onClick={copyFrequency} className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"><IconCopy size={20} /></button>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                activeGenre === genre ? 'bg-primary text-page-bg' : 'bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Station List */}
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-text-secondary">
            <IconLoader2 size={20} className="animate-spin" />
            <span>Loading stations...</span>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border overflow-hidden" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Station</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Now Playing</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map((station, idx) => {
                  const isActive = Math.abs(station.frequency - frequency) < 0.1
                  return (
                    <tr
                      key={station.id}
                      onClick={() => setFrequency(station.frequency)}
                      className={`border-b cursor-pointer transition-colors ${idx === filteredStations.length - 1 ? 'border-b-0' : ''} ${isActive ? 'bg-primary/10' : 'hover:bg-elevated/30'}`}
                      style={{
                        borderColor: isActive ? 'var(--accent-color)' : '#1c2440',
                        borderWidth: '0.5px',
                        borderLeftWidth: isActive ? '2px' : '0.5px',
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-primary">
                          {station.frequency < 500 ? `${station.frequency.toFixed(1)} MHz` : `${station.frequency} kHz`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-primary text-sm">{station.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          <span className="text-text-tertiary italic text-xs">
                            {isActive ? 'RDS with SDR kit' : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(`${station.frequency < 500 ? station.frequency.toFixed(1) + ' MHz FM' : station.frequency + ' kHz AM'}`) }}
                            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
                          >
                            <IconCopy size={16} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); toggleFavorite(station) }}
                            className="p-1.5 rounded-lg hover:bg-elevated transition-colors"
                          >
                            {favorites[station.id]
                              ? <IconStarFilled size={16} className="text-primary" />
                              : <IconStar size={16} className="text-text-secondary" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}