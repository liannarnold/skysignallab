import { useState } from 'react'
import { IconPlus, IconCopy, IconEdit, IconTrash } from '@tabler/icons-react'
import Topbar from './Topbar'

interface MySignalsTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

const mySignals = [
  { frequency: '145.230', unit: 'MHz', mode: 'FM', category: 'HAM', description: 'Local Net Frequency', notes: 'Sunday 8PM check-in' },
  { frequency: '462.5625', unit: 'MHz', mode: 'NFM', category: 'GMRS', description: 'Family Channel', notes: 'GMRS Channel 1' },
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

export default function MySignalsTab({ sidebarExpanded, setSidebarExpanded }: MySignalsTabProps) {
  const [signals, setSignals] = useState(mySignals)

  const removeSignal = (frequency: string) => {
    setSignals(prev => prev.filter(s => s.frequency !== frequency))
  }

  const copyFrequency = (frequency: string, unit: string) => {
    navigator.clipboard.writeText(`${frequency} ${unit}`)
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar 
        title="My Signals" 

        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        rightContent={
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-page-bg rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <IconPlus size={16} />
            Add signal
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-4">
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <IconPlus size={48} className="text-text-tertiary mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">No custom signals yet</h2>
            <p className="text-text-secondary text-sm mb-4">Add your own frequencies to track</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-page-bg rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <IconPlus size={16} />
              Add your first signal
            </button>
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
                {signals.map((signal, idx) => (
                  <tr 
                    key={signal.frequency}
                    className={`border-b hover:bg-elevated/30 transition-colors ${idx === signals.length - 1 ? 'border-b-0' : ''}`}
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
                    <td className="px-4 py-3 text-text-tertiary text-sm">{signal.notes}</td>
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
                          className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
                          aria-label="Edit signal"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => removeSignal(signal.frequency)}
                          className="p-1.5 rounded-lg hover:bg-error-bg transition-colors text-text-secondary hover:text-error"
                          aria-label="Delete signal"
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
