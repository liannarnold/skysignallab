import { useState } from 'react'
import { IconRadio, IconLoader2 } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

export default function LoginModal() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(username, email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(11,15,26,0.95)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl border" style={{ background: '#0f1422', borderColor: '#1c2440', borderWidth: '0.5px' }}>
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <IconRadio size={28} style={{ color: '#fb923c' }} />
          <div>
            <div className="font-semibold text-lg" style={{ color: '#fb923c' }}>SkySignalLab</div>
            <div className="text-xs" style={{ color: '#2d3a5e' }}>SDR Companion</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden mb-6 border" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
          <button
            onClick={() => setMode('login')}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={{
              background: mode === 'login' ? '#1c2440' : 'transparent',
              color: mode === 'login' ? '#fb923c' : '#2d3a5e',
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={{
              background: mode === 'register' ? '#1c2440' : 'transparent',
              color: mode === 'register' ? '#fb923c' : '#2d3a5e',
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="liannarnold"
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{
                  background: '#0b0f1a',
                  border: '0.5px solid #1c2440',
                  color: '#c8d4f0',
                }}
              />
            </div>
          )}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: '#0b0f1a',
                border: '0.5px solid #1c2440',
                color: '#c8d4f0',
              }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: '#93a8d4' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: '#0b0f1a',
                border: '0.5px solid #1c2440',
                color: '#c8d4f0',
              }}
            />
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: '#2d1010', color: '#f87171' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
            style={{ background: '#fb923c', color: '#0b0f1a' }}
          >
            {loading && <IconLoader2 size={16} className="animate-spin" />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}