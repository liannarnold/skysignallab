import { useState } from 'react'
import { IconMapPin, IconChevronRight, IconChevronLeft } from '@tabler/icons-react'
import Topbar from './Topbar'

interface HamRadioTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

const bandConditions = [
  { band: '80m', status: 'Good', noise: 'S3', color: 'bg-success text-page-bg' },
  { band: '40m', status: 'Good', noise: 'S2', color: 'bg-success text-page-bg' },
  { band: '20m', status: 'Fair', noise: 'S4', color: 'bg-warning text-page-bg' },
  { band: '17m', status: 'Fair', noise: 'S5', color: 'bg-warning text-page-bg' },
  { band: '15m', status: 'Poor', noise: 'S7', color: 'bg-error text-page-bg' },
  { band: '10m', status: 'Poor', noise: 'S8', color: 'bg-error text-page-bg' },
  { band: '2m', status: 'Good', noise: 'S1', color: 'bg-success text-page-bg' },
  { band: '70cm', status: 'Good', noise: 'S1', color: 'bg-success text-page-bg' },
]

const frequencyTypes = ['HF', 'VHF', 'UHF']

const frequencies = [
  { frequency: '3.885', unit: 'MHz', mode: 'LSB', description: '75m Phone Net', band: '80m' },
  { frequency: '7.290', unit: 'MHz', mode: 'LSB', description: '40m Traffic Net', band: '40m' },
  { frequency: '14.300', unit: 'MHz', mode: 'USB', description: 'Maritime Mobile Service', band: '20m' },
  { frequency: '21.340', unit: 'MHz', mode: 'USB', description: '15m Calling', band: '15m' },
  { frequency: '144.200', unit: 'MHz', mode: 'USB', description: '2m SSB Calling', band: '2m' },
  { frequency: '146.520', unit: 'MHz', mode: 'FM', description: '2m National Simplex', band: '2m' },
  { frequency: '446.000', unit: 'MHz', mode: 'FM', description: '70cm National Simplex', band: '70cm' },
]

const repeaters = [
  { callsign: 'W5SLA', frequency: '146.940', offset: '-', pl: '107.2', band: '2m' },
  { callsign: 'K5QHD', frequency: '147.060', offset: '+', pl: '88.5', band: '2m' },
  { callsign: 'W5BII', frequency: '444.850', offset: '+', pl: '100.0', band: '70cm' },
  { callsign: 'K5WMB', frequency: '442.125', offset: '+', pl: '103.5', band: '70cm' },
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

const getModeColor = (mode: string) => {
  switch (mode) {
    case 'LSB': return 'bg-[#1a2a1a] text-success'
    case 'USB': return 'bg-[#1a1a2e] text-primary'
    case 'FM': return 'bg-success-bg text-success'
    case 'CW': return 'bg-elevated text-text-secondary'
    default: return 'bg-elevated text-text-secondary'
  }
}

export default function HamRadioTab({ sidebarExpanded, setSidebarExpanded }: HamRadioTabProps) {
  const [activeType, setActiveType] = useState('HF')
  const [panelExpanded, setPanelExpanded] = useState(true)

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
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-tertiary uppercase tracking-wide font-medium">HF Band Conditions</span>
          <div className="flex gap-2 flex-wrap">
            {bandConditions.map(band => (
              <div 
                key={band.band}
                className={`px-2 py-1 rounded-lg text-xs font-medium ${band.color}`}
                style={{ borderRadius: '8px' }}
              >
                <div className="font-semibold">{band.band}</div>
                <div className="opacity-80">{band.status} · {band.noise}</div>
              </div>
            ))}
          </div>
          <span className="text-xs text-text-disabled ml-auto">via hamqsl.com</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Frequency List */}
        <div className="flex-1 overflow-auto p-4">
          {/* Filter Chips */}
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

          {/* Frequency Table */}
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
                {frequencies.map((freq, idx) => (
                  <tr 
                    key={freq.frequency}
                    className={`border-b hover:bg-elevated/30 transition-colors ${idx === frequencies.length - 1 ? 'border-b-0' : ''}`}
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
          {panelExpanded ? (
            <div className="flex-1 overflow-auto p-4">
              {/* Local Repeaters */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Local Repeaters</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-elevated text-text-secondary" style={{ borderRadius: '99px' }}>50mi</span>
                </div>
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
                    </div>
                  ))}
                </div>
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
          ) : (
            <div className="flex flex-col items-center pt-4">
              <span 
                className="text-xs text-text-tertiary font-medium tracking-wide"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Panels
              </span>
            </div>
          )}
          
          {/* Toggle Button */}
          <button
            onClick={() => setPanelExpanded(!panelExpanded)}
            className="w-8 flex items-center justify-center hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary border-l"
            style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
          >
            {panelExpanded ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
