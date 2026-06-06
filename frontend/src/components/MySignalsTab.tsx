import { useState, useEffect, useCallback } from 'react'
import { IconPlus, IconCopy, IconEdit, IconTrash, IconLoader2, IconX } from '@tabler/icons-react'
import Topbar from './Topbar'
import { userSignalsApi } from '../services/api'

interface MySignalsTabProps {
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
}

interface UserSignal {
  id: string
  frequency: number
  mode: string
  category?: string
  description: string
  band?: string
  created_at: string
}

interface SignalForm {
  frequency: string
  mode: string
  description: string
  category: string
  band: string
}

const EMPTY_FORM: SignalForm = {
  frequency: '',
  mode: 'FM',
  description: '',
  category: '',
  band: '',
}

const MODES = ['AM', 'FM', 'NFM', 'USB', 'LSB', 'CW']

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
  const [signals, setSignals] = useState<UserSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SignalForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userSignalsApi.getAll()
      setSignals(data || [])
    } catch (err) {
      setError('Failed to load signals')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSignals()
  }, [fetchSignals])

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  const openEdit = (signal: UserSignal) => {
    setEditingId(signal.id)
    setForm({
      frequency: signal.frequency.toString(),
      mode: signal.mode,
      description: signal.description,
      category: signal.category || '',
      band: signal.band || '',
    })
    setFormError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  const handleSave = async () => {
    if (!form.frequency || !form.mode || !form.description) {
      setFormError('Frequency, mode, and description are required')
      return
    }
    const freq = parseFloat(form.frequency)
    if (isNaN(freq) || freq <= 0) {
      setFormError('Frequency must be a valid number')
      return
    }
    try {
      setSaving(true)
      setFormError(null)
      const payload = {
        frequency: freq,
        mode: form.mode,
        description: form.description,
        category: form.category,
        band: form.band,
      }
      if (editingId) {
        await userSignalsApi.update(editingId, payload)
        setSignals(prev => prev.map(s =>
          s.id === editingId ? { ...s, ...payload } : s
        ))
      } else {
        const result = await userSignalsApi.create(payload)
        setSignals(prev => [...prev, { id: result.id, ...payload, created_at: new Date().toISOString() }])
      }
      closeModal()
    } catch (err) {
      setFormError('Failed to save signal')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const removeSignal = async (id: string) => {
    try {
      await userSignalsApi.remove(id)
      setSignals(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Failed to delete signal', err)
    }
  }

  const copyFrequency = (frequency: number) => {
    navigator.clipboard.writeText(`${frequency.toFixed(4)} MHz`)
  }

  return (
    <div className="h-full flex flex-col bg-page-bg">
      <Topbar
        title="My Signals"
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        rightContent={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-page-bg rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <IconPlus size={16} />
            Add signal
          </button>
        }
      />

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
        ) : signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <IconPlus size={48} className="text-text-tertiary mb-4" />
            <h2 className="text-lg font-semibold text-text-primary mb-2">No custom signals yet</h2>
            <p className="text-text-secondary text-sm mb-4">Add your own frequencies to track</p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-page-bg rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((signal, idx) => (
                  <tr
                    key={signal.id}
                    className={`border-b hover:bg-elevated/30 transition-colors ${idx === signals.length - 1 ? 'border-b-0' : ''}`}
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
                    <td className="px-4 py-3 text-text-secondary text-sm">{signal.category || '—'}</td>
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
                          onClick={() => openEdit(signal)}
                          className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
                          aria-label="Edit signal"
                        >
                          <IconEdit size={16} />
                        </button>
                        <button
                          onClick={() => removeSignal(signal.id)}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(11,15,26,0.85)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: '#0f1422', borderColor: '#1c2440', borderWidth: '0.5px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-text-primary font-semibold">{editingId ? 'Edit Signal' : 'Add Signal'}</h2>
              <button onClick={closeModal} className="text-text-tertiary hover:text-text-primary">
                <IconX size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Frequency (MHz)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  placeholder="162.4000"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none font-mono"
                  style={{ background: '#0b0f1a', border: '0.5px solid #1c2440', color: 'var(--accent-color)'}}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Mode</label>
                <select
                  value={form.mode}
                  onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: '#0b0f1a', border: '0.5px solid #1c2440', color: '#c8d4f0' }}
                >
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="NOAA Weather Radio"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: '#0b0f1a', border: '0.5px solid #1c2440', color: '#c8d4f0' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Category <span style={{ color: '#2d3a5e' }}>(optional)</span></label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Weather, HAM, CB..."
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: '#0b0f1a', border: '0.5px solid #1c2440', color: '#c8d4f0' }}
                />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Band <span style={{ color: '#2d3a5e' }}>(optional)</span></label>
                <input
                  type="text"
                  value={form.band}
                  onChange={e => setForm(f => ({ ...f, band: e.target.value }))}
                  placeholder="2m, 40m, 70cm..."
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{ background: '#0b0f1a', border: '0.5px solid #1c2440', color: '#c8d4f0' }}
                />
              </div>

              {formError && (
                <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#2d1010', color: '#f87171' }}>
                  {formError}
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: '#1c2440', color: '#93a8d4' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--accent-color)', color: '#0b0f1a' }}
                >
                  {saving && <IconLoader2 size={14} className="animate-spin" />}
                  {editingId ? 'Save changes' : 'Add signal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}