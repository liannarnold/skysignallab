import { useState, useRef, useEffect } from 'react'
import { IconStar, IconCopy, IconPlayerPlayFilled, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import Topbar from './Topbar'

interface FmAmTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

const genres = ['All', 'Pop', 'Rock', 'Country', 'News', 'Talk', 'Gospel', 'Sports']

const fmStations = [
  { frequency: '98.1', station: 'KBTT', location: 'Bossier City, LA', nowPlaying: 'The Weeknd — Blinding Lights', genre: 'Pop' },
  { frequency: '94.5', station: 'KXKS', location: 'Bossier City, LA', nowPlaying: 'Luke Combs — Fast Car', genre: 'Country' },
  { frequency: '101.7', station: 'KRMD', location: 'Shreveport, LA', nowPlaying: 'Morgan Wallen — Last Night', genre: 'Country' },
  { frequency: '96.5', station: 'KQHN', location: 'Shreveport, LA', nowPlaying: 'Foo Fighters — Everlong', genre: 'Rock' },
  { frequency: '89.9', station: 'KDAQ', location: 'Shreveport, LA', nowPlaying: 'NPR Morning Edition', genre: 'News' },
]

const amStations = [
  { frequency: '1130', station: 'KWKH', location: 'Shreveport, LA', nowPlaying: 'The Rush Limbaugh Show', genre: 'Talk' },
  { frequency: '710', station: 'KEEL', location: 'Shreveport, LA', nowPlaying: 'ESPN Radio Live', genre: 'Sports' },
]

export default function FmAmTab({ sidebarExpanded, setSidebarExpanded }: FmAmTabProps) {
  const [band, setBand] = useState<'FM' | 'AM'>('FM')
  const [frequency, setFrequency] = useState(98.1)
  const [activeGenre, setActiveGenre] = useState('All')
  const [isFavorite, setIsFavorite] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const fmMin = 87.9
  const fmMax = 107.9
  const amMin = 530
  const amMax = 1700

  const min = band === 'FM' ? fmMin : amMin
  const max = band === 'FM' ? fmMax : amMax
  const step = band === 'FM' ? 0.2 : 10

  useEffect(() => {
    setFrequency(band === 'FM' ? 98.1 : 1130)
  }, [band])

  const stations = band === 'FM' ? fmStations : amStations
  const currentStation = stations.find(s => parseFloat(s.frequency) === frequency)

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newFreq = min + percent * (max - min)
    const snapped = Math.round(newFreq / step) * step
    setFrequency(Math.max(min, Math.min(max, snapped)))
  }

  const adjustFrequency = (delta: number) => {
    const newFreq = frequency + delta
    setFrequency(Math.max(min, Math.min(max, Math.round(newFreq / step) * step)))
  }

  const filteredStations = stations.filter(s => 
    activeGenre === 'All' || s.genre === activeGenre
  )

  const copyFrequency = () => {
    navigator.clipboard.writeText(`${frequency} ${band === 'FM' ? 'MHz FM' : 'kHz AM'}`)
  }

  const percent = ((frequency - min) / (max - min)) * 100

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
            {currentStation && (
              <>
                <div className="text-lg text-text-primary mt-2">
                  {currentStation.station} — {currentStation.location}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Now playing: {currentStation.nowPlaying}
                </div>
              </>
            )}
          </div>

          {/* Band Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setBand('FM')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                band === 'FM' 
                  ? 'bg-primary text-page-bg' 
                  : 'bg-elevated text-text-secondary hover:text-text-primary'
              }`}
              style={{ borderRadius: '8px' }}
            >
              FM
            </button>
            <button
              onClick={() => setBand('AM')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                band === 'AM' 
                  ? 'bg-primary text-page-bg' 
                  : 'bg-elevated text-text-secondary hover:text-text-primary'
              }`}
              style={{ borderRadius: '8px' }}
            >
              AM
            </button>
          </div>

          {/* Frequency Slider */}
          <div className="mb-6">
            <div 
              ref={sliderRef}
              onClick={handleSliderClick}
              className="relative h-12 bg-elevated rounded-lg cursor-pointer overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              {/* Track */}
              <div 
                className="absolute inset-y-0 left-0 bg-primary/20"
                style={{ width: `${percent}%` }}
              />
              
              {/* Thumb */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-primary"
                style={{ left: `calc(${percent}% - 2px)` }}
              />

              {/* Scale Marks */}
              <div className="absolute inset-x-4 bottom-1 flex justify-between">
                {band === 'FM' ? (
                  <>
                    <span className="text-xs text-text-tertiary">87.9</span>
                    <span className="text-xs text-text-tertiary">92</span>
                    <span className="text-xs text-text-tertiary">96</span>
                    <span className="text-xs text-text-tertiary">100</span>
                    <span className="text-xs text-text-tertiary">104</span>
                    <span className="text-xs text-text-tertiary">107.9</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-text-tertiary">530</span>
                    <span className="text-xs text-text-tertiary">800</span>
                    <span className="text-xs text-text-tertiary">1100</span>
                    <span className="text-xs text-text-tertiary">1400</span>
                    <span className="text-xs text-text-tertiary">1700</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => adjustFrequency(-step * 5)}
              className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <IconChevronsLeft size={20} />
            </button>
            <button
              onClick={() => adjustFrequency(-step)}
              className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              className="p-3 rounded-lg bg-primary text-page-bg transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <IconPlayerPlayFilled size={20} />
            </button>
            <button
              onClick={() => adjustFrequency(step)}
              className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <IconChevronRight size={20} />
            </button>
            <button
              onClick={() => adjustFrequency(step * 5)}
              className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <IconChevronsRight size={20} />
            </button>
            
            <div className="w-px h-8 bg-border-subtle mx-2" />
            
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-elevated text-text-secondary hover:text-text-primary'
              }`}
              style={{ borderRadius: '8px' }}
            >
              <IconStar size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={copyFrequency}
              className="p-2 rounded-lg bg-elevated text-text-secondary hover:text-text-primary transition-colors"
              style={{ borderRadius: '8px' }}
            >
              <IconCopy size={20} />
            </button>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                activeGenre === genre
                  ? 'bg-primary text-page-bg'
                  : 'bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Station List */}
        <div 
          className="bg-surface rounded-xl border overflow-hidden"
          style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Station</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Now Playing</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Genre</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStations.map((station, idx) => {
                const isActive = parseFloat(station.frequency) === frequency
                return (
                  <tr 
                    key={station.frequency}
                    onClick={() => setFrequency(parseFloat(station.frequency))}
                    className={`border-b cursor-pointer transition-colors ${
                      idx === filteredStations.length - 1 ? 'border-b-0' : ''
                    } ${isActive ? 'bg-primary/10' : 'hover:bg-elevated/30'}`}
                    style={{ 
                      borderColor: isActive ? 'var(--accent-color)' : '#1c2440', 
                      borderWidth: '0.5px',
                      borderLeftWidth: isActive ? '2px' : '0.5px'
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary">{station.frequency} {band === 'FM' ? 'MHz' : 'kHz'}</span>
                    </td>
                    <td className="px-4 py-3 text-text-primary text-sm">{station.station}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        <span className="text-text-secondary">{station.nowPlaying}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-elevated text-text-secondary" style={{ borderRadius: '99px' }}>
                        {station.genre}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(`${station.frequency} ${band === 'FM' ? 'MHz FM' : 'kHz AM'}`)
                        }}
                        className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
                      >
                        <IconCopy size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
