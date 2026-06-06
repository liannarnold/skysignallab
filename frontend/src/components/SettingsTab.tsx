import { useState, useRef } from 'react'
import { IconMapPin, IconPalette, IconDownload, IconUpload, IconLoader2, IconCheck, IconAlertCircle } from '@tabler/icons-react'
import Topbar from './Topbar'
import { signalsApi, userSignalsApi } from '../services/api'

interface SettingsTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
  accentColor: string
  setAccentColor: (value: string) => void
}

type Status = { type: 'success' | 'error'; message: string } | null

export default function SettingsTab({ sidebarExpanded, setSidebarExpanded, accentColor, setAccentColor }: SettingsTabProps) {
  const [location, setLocation] = useState('Bossier City, LA')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const accentColors = [
    '#fb923c',
    '#4ade80',
    '#60a5fa',
    '#f472b6',
    '#a78bfa',
    '#fbbf24',
  ]

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 4000)
  }

  // ── Export ────────────────────────────────────────
  const handleExport = async () => {
    try {
      setExporting(true)

      // Fetch all signals and user signals
      const [signals, userSignals] = await Promise.all([
        signalsApi.getAll(),
        userSignalsApi.getAll(),
      ])

      const allSignals = [
        ...(signals || []).map((s: { frequency: number; mode: string; description: string; category: string; band?: string }) => ({
          ...s,
          source: 'database',
        })),
        ...(userSignals || []).map((s: { frequency: number; mode: string; description: string; category: string; band?: string }) => ({
          ...s,
          source: 'user',
        })),
      ]

      if (allSignals.length === 0) {
        showStatus('error', 'No signals to export')
        return
      }

      // Build CSV
      const headers = ['frequency', 'mode', 'description', 'category', 'band', 'source']
      const rows = allSignals.map(s =>
        headers.map(h => {
          const val = (s as Record<string, unknown>)[h] ?? ''
          // Wrap in quotes if contains comma or quote
          const str = String(val)
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
        }).join(',')
      )

      const csv = [headers.join(','), ...rows].join('\n')

      // Trigger download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `skysignallab-signals-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showStatus('success', `Exported ${allSignals.length} signals successfully`)
    } catch (err) {
      console.error('Export failed', err)
      showStatus('error', 'Export failed — check your connection')
    } finally {
      setExporting(false)
    }
  }

  // ── Import ────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      showStatus('error', 'Please select a CSV file')
      return
    }

    setImporting(true)
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.trim().split('\n')

        if (lines.length < 2) {
          showStatus('error', 'CSV file is empty or invalid')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const freqIdx = headers.indexOf('frequency')
        const modeIdx = headers.indexOf('mode')
        const descIdx = headers.indexOf('description')
        const catIdx = headers.indexOf('category')
        const bandIdx = headers.indexOf('band')

        if (freqIdx === -1 || modeIdx === -1 || descIdx === -1) {
          showStatus('error', 'CSV must have frequency, mode, and description columns')
          return
        }

        const dataRows = lines.slice(1).filter(l => l.trim() !== '')
        let imported = 0
        let failed = 0

        for (const line of dataRows) {
          // Handle quoted fields
          const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g)?.map(c =>
            c.startsWith('"') ? c.slice(1, -1).replace(/""/g, '"') : c.trim()
          ) ?? line.split(',').map(c => c.trim())

          const frequency = parseFloat(cols[freqIdx])
          const mode = cols[modeIdx]
          const description = cols[descIdx]

          if (isNaN(frequency) || !mode || !description) {
            failed++
            continue
          }

          try {
            await userSignalsApi.create({
              frequency,
              mode,
              description,
              category: catIdx !== -1 ? cols[catIdx] || '' : '',
              band: bandIdx !== -1 ? cols[bandIdx] || '' : '',
            })
            imported++
          } catch {
            failed++
          }
        }

        if (imported > 0) {
          showStatus('success', `Imported ${imported} signal${imported !== 1 ? 's' : ''}${failed > 0 ? ` (${failed} skipped)` : ''}`)
        } else {
          showStatus('error', `Import failed — ${failed} row${failed !== 1 ? 's' : ''} could not be imported`)
        }
      } catch (err) {
        console.error('Import failed', err)
        showStatus('error', 'Failed to parse CSV file')
      } finally {
        setImporting(false)
        // Reset file input so same file can be re-imported
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar
        title="Settings"
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl space-y-6">

          {/* Location */}
          <div className="bg-surface rounded-xl border p-4" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <IconMapPin size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Location</h3>
                <p className="text-sm text-text-secondary">Used for local repeaters and band conditions</p>
              </div>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 bg-elevated rounded-lg text-text-primary border focus:outline-none focus:border-border-emphasis"
              style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '8px' }}
            />
          </div>

          {/* Accent Color */}
          <div className="bg-surface rounded-xl border p-4" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <IconPalette size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Accent Color</h3>
                <p className="text-sm text-text-secondary">Customize the app appearance</p>
              </div>
            </div>
            <div className="flex gap-3">
              {accentColors.map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    accentColor === color ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color, borderRadius: '99px' }}
                />
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-surface rounded-xl border p-4" style={{ borderColor: '#1c2440', borderWidth: '0.5px', borderRadius: '12px' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-elevated rounded-lg" style={{ borderRadius: '8px' }}>
                <IconDownload size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Data Management</h3>
                <p className="text-sm text-text-secondary">Export or import your signals as a CSV file</p>
              </div>
            </div>

            {/* Status message */}
            {status && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mt-3"
                style={{
                  background: status.type === 'success' ? '#163a20' : '#2d1010',
                  color: status.type === 'success' ? '#4ade80' : '#f87171',
                  borderRadius: '8px',
                }}
              >
                {status.type === 'success'
                  ? <IconCheck size={16} />
                  : <IconAlertCircle size={16} />
                }
                {status.message}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                style={{ borderRadius: '8px' }}
              >
                {exporting
                  ? <IconLoader2 size={18} className="animate-spin" />
                  : <IconDownload size={18} />
                }
                Export CSV
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                style={{ borderRadius: '8px' }}
              >
                {importing
                  ? <IconLoader2 size={18} className="animate-spin" />
                  : <IconUpload size={18} />
                }
                Import CSV
              </button>
            </div>

            <p className="text-xs text-text-tertiary mt-3">
              CSV format: frequency, mode, description, category, band
            </p>
          </div>

          {/* Version */}
          <div className="text-center text-sm text-text-tertiary py-4">
            SkySignalLab v1.0.0 • SDR Companion
          </div>
        </div>
      </div>
    </div>
  )
}