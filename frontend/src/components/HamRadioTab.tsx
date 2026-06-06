import { useState, useEffect, useCallback } from 'react'
import { IconMapPin, IconChevronRight, IconChevronLeft, IconLoader2 } from '@tabler/icons-react'
import Topbar from './Topbar'
import { externalApi } from '../services/api'

interface HamRadioTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

interface BandCondition {
  band: string
  time: string
  condition: string
}

interface Repeater {
  callsign: string
  frequency: string
  offset: string
  pl: string
  band: string
  location: string
}

const frequencies = [
  { frequency: '3.885', unit: 'MHz', mode: 'LSB', description: '75m Phone Net', band: '80m', type: 'HF' },
  { frequency: '7.290', unit: 'MHz', mode: 'LSB', description: '40m Traffic Net', band: '40m', type: 'HF' },
  { frequency: '14.300', unit: 'MHz', mode: 'USB', description: 'Maritime Mobile Service', band: '20m', type: 'HF' },
  { frequency: '21.340', unit: 'MHz', mode: 'USB', description: '15m Calling', band: '15m', type: 'HF' },
  { frequency: '28.400', unit: 'MHz', mode: 'USB', description: '10m SSB Calling', band: '10m', type: 'HF' },
  { frequency: '144.200', unit: 'MHz', mode: 'USB', description: '2m SSB Calling', band: '2m', type: 'VHF' },
  { frequency: '146.520', unit: 'MHz', mode: 'FM', description: '2m National Simplex', band: '2m', type: 'VHF' },
  { frequency: '446.000', unit: 'MHz', mode: 'FM', description: '70cm National Simplex', band: '70cm', type: 'UHF' },
  { frequency: '432.100', unit: 'MHz', mode: 'USB', description: '70cm SSB Calling', band: '70cm', type: 'UHF' },
]

const bandPlan = [
  { band: '160m', range: '1.800 - 2.000 MHz', modes: 'CW, Data, SSB' },
  { band: '80m', range: '3.500 - 4.000 MHz', modes: 'CW, Data, SSB' },
  { band: '40m', range: '7.000 - 7.300 MHz', modes: 'CW, Data, SSB' },
  { band: '20m', range: '14.000 - 14.350 MHz', modes: 'CW, Data, SSB' },
  { band: '15m', range: '21.000 - 21.450 MHz', modes: 'CW, Data, SSB' },
  { band: '10m', range: '28.000 - 29.700 MHz', modes: 'CW, Data, SSB, FM' },
  { band: '2m', range: '144.000 - 148.000 MHz', modes: 'CW, SSB, FM' },
  { band: '70cm', range: '420.000 - 450.000 MHz', modes: 'CW, SSB, FM' },
]

const frequencyTypes = ['HF', 'VHF', 'UHF']

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'LSB': return 'bg-[#1a2a1a] text-success'
    case 'USB': return 'bg-[#1a1a2e] text-primary'
    case 'FM': return 'bg-success-bg text-success'
    case 'CW': return 'bg-elevated text-text-secondary'
    default: return 'bg-elevated text-text-secondary'
  }
}

const getConditionStyle = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'good': return 'bg-success-bg text-success'
    case 'fair': return 'bg-warning-bg text-warning'
    case 'poor': return 'bg-error-bg text-error'
    default: return 'bg-elevated text-text-secondary'
  }
}

export default function HamRadioTab({ sidebarExpanded, setSidebarExpanded }: HamRadioTabProps) {
  const [activeType, setActiveType] = useState('HF')
  const [panelExpanded, setPanelExpanded] = useState(true)
  const [bandConditions, setBandConditions] = useState<BandCondition[]>([])
  const [repeaters, setRepeaters] = useState<Repeater[]>([])
  const [loadingConditions, setLoadingConditions] = useState(true)
  const [loadingRepeaters, setLoadingRepeaters] = useState(true)

  const fetchBandConditions = useCallback(async () => {
    try {
      setLoadingConditions(true)
      const data = await externalApi.getBandConditions()
      // Only show daytime conditions
      setBandConditions((data || []).filter((b: BandCondition) => b.time === 'day'))
    } catch (err) {
      console.error('Failed to fetch band conditions', err)
    } finally {
      setLoadingConditions(false)
    }
  }, [])

  const fetchRepeaters = useCallback(async () => {
    try {
      setLoadingRepeaters(true)
      const data = await externalApi.getRepeaters()
      setRepeaters(data || [])
    } catch (err) {
      console.error('Failed to fetch repeaters', err)
    } finally {
      setLoadingRepeaters(false)
    }
  }, [])

  useEffect(() => {
    fetchBandConditions()
    fetchRepeaters()
  }, [fetchBandConditions, fetchRepeaters])

  const filteredFrequencies = frequencies.filter(f => f.type === activeType)

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar
        title="HAM Radio"
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      >
        <div className="flex items-center gap-2 px-3 py-1 bg-elevated rounded-lg text-sm text-text-secondary">
          <IconMapPin size={16} className="text-primary" />
          Bossier City, LA
        </div>
      </Topbar>

      {/* Band Conditions Strip */}
      <div className="px-4 py-3 border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-text-tertiary uppercase tracking-wide font-medium whitespace-nowrap">
            HF Band Conditions
          </span>
          {loadingConditions ? (
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <IconLoader2 size={14} className="animate-spin" />
              Loading...
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {bandConditions.map(band => (
                <div
                  key={band.band}
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${getConditionStyle(band.condition)}`}
                  style={{ borderRadius: '8px' }}
                >
                  <div className="font-semibold">{band.band}</div>
                  <div className="opacity-80">{band.condition}</div>
                </div>
              ))}
            </div>
          )}
          <span className="text-xs text-text-disabled ml-auto whitespace-nowrap">via hamqsl.com</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Frequency List */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex gap-2 mb-4">
            {frequencyTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  activeType === type
                    ? 'bg-primary text-page-bg'
                    : 'bg-elevated text-text-secondary hover:text-text-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="bg-surface rounded-xl border overflow-hidden" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Frequency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Band</th>
                </tr>
              </thead>
              <tbody>
                {filteredFrequencies.map((freq, idx) => (
                  <tr
                    key={freq.frequency}
                    className={`border-b hover:bg-elevated/30 transition-colors ${idx === filteredFrequencies.length - 1 ? 'border-b-0' : ''}`}
                    style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-primary">{freq.frequency} {freq.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getModeColor(freq.mode)}`} style={{ borderRadius: '99px' }}>
                        {freq.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-primary text-sm">{freq.description}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-elevated text-text-secondary" style={{ borderRadius: '99px' }}>
                        {freq.band}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel */}
        <div
          className={`border-l bg-surface transition-all duration-300 flex ${panelExpanded ? 'w-80' : 'w-8'}`}
          style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
        >
          {panelExpanded && (
            <div className="flex-1 overflow-auto p-4">
              {/* Local Repeaters */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Local Repeaters</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-elevated text-text-secondary" style={{ borderRadius: '99px' }}>50mi</span>
                </div>
                {loadingRepeaters ? (
                  <div className="flex items-center gap-2 text-text-secondary text-xs">
                    <IconLoader2 size={14} className="animate-spin" />
                    Loading repeaters...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {repeaters.map(rep => (
                      <div
                        key={rep.callsign}
                        className="p-3 bg-elevated rounded-lg"
                        style={{ borderRadius: '8px' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-primary text-sm">{rep.callsign}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-surface text-text-secondary" style={{ borderRadius: '99px' }}>
                            {rep.band}
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {rep.frequency} ({rep.offset}) · PL {rep.pl}
                        </div>
                        <div className="text-xs text-text-tertiary mt-0.5">{rep.location}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ARRL Band Plan */}
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">ARRL Band Plan</h3>
                <div className="space-y-2">
                  {bandPlan.map(plan => (
                    <div
                      key={plan.band}
                      className="p-2 bg-elevated rounded-lg text-xs"
                      style={{ borderRadius: '8px' }}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-text-primary">{plan.band}</span>
                        <span className="text-text-tertiary">{plan.range}</span>
                      </div>
                      <div className="text-text-secondary">{plan.modes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!panelExpanded && (
            <div className="flex flex-col items-center pt-4 flex-1">
              <span
                className="text-xs text-text-tertiary font-medium tracking-wide"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Panels
              </span>
            </div>
          )}

          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-8 flex items-center justify-center hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary border-l flex-shrink-0"
            style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
          >
            {panelExpanded ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}