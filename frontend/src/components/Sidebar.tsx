import { 
  IconRadio, 
  IconAntenna, 
  IconBroadcast, 
  IconPlane,
  IconStar,
  IconWaveSine,
  IconSettings,
  IconLogout
} from '@tabler/icons-react'
import type { TabId } from '../App'
import { useAuth } from '../context/AuthContext'

interface SidebarProps {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  expanded: boolean
}

const browseItems = [
  { id: 'signals' as TabId, icon: IconWaveSine, label: 'Signals' },
  { id: 'ham' as TabId, icon: IconAntenna, label: 'HAM Radio' },
  { id: 'fmam' as TabId, icon: IconBroadcast, label: 'FM/AM' },
  { id: 'aircraft' as TabId, icon: IconPlane, label: 'Aircraft' },
]

const accountItems = [
  { id: 'favorites' as TabId, icon: IconStar, label: 'Favorites' },
  { id: 'mysignals' as TabId, icon: IconWaveSine, label: 'My Signals' },
  { id: 'settings' as TabId, icon: IconSettings, label: 'Settings' },
]

// Get initials from username
const getInitials = (username: string) => {
  const parts = username.trim().split(/[\s._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return username.slice(0, 2).toUpperCase()
}

export default function Sidebar({ activeTab, setActiveTab, expanded }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <aside 
      className={`h-full bg-surface border-r transition-all duration-300 flex flex-col ${
        expanded ? 'w-[200px]' : 'w-12'
      }`}
      style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
    >
      {/* Logo */}
      <div className={`p-3 flex items-center gap-2 ${expanded ? '' : 'justify-center'}`}>
        <IconRadio size={24} className="text-primary flex-shrink-0" />
        {expanded && (
          <div className="min-w-0">
            <div className="text-primary font-semibold text-sm">SkySignalLab</div>
            <div className="text-text-tertiary text-xs">SDR Companion</div>
          </div>
        )}
      </div>

      {/* Browse Section */}
      <div className="flex-1 py-2">
        {expanded && (
          <div className="px-3 py-1 text-text-tertiary text-xs font-medium uppercase tracking-wide">
            Browse
          </div>
        )}
        <nav className="mt-1">
          {browseItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors ${
                  expanded ? '' : 'justify-center'
                } ${
                  isActive 
                    ? 'bg-elevated text-primary' 
                    : 'text-text-secondary hover:bg-elevated/50 hover:text-text-primary'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {expanded && <span className="text-sm">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Account Section */}
        {expanded && (
          <div className="px-3 py-1 mt-4 text-text-tertiary text-xs font-medium uppercase tracking-wide">
            Account
          </div>
        )}
        <nav className={expanded ? 'mt-1' : 'mt-4'}>
          {accountItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors ${
                  expanded ? '' : 'justify-center'
                } ${
                  isActive 
                    ? 'bg-elevated text-primary' 
                    : 'text-text-secondary hover:bg-elevated/50 hover:text-text-primary'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {expanded && <span className="text-sm">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* User footer */}
      <div
        className={`p-3 border-t flex items-center gap-2 ${expanded ? '' : 'justify-center'}`}
        style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-page-bg text-xs font-semibold">
            {user ? getInitials(user.username) : '?'}
          </span>
        </div>
        {expanded && (
          <>
            <span className="text-text-secondary text-xs flex-1 truncate">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="p-1 rounded-lg hover:bg-elevated transition-colors text-text-tertiary hover:text-error"
              aria-label="Logout"
              title="Logout"
            >
              <IconLogout size={16} />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}