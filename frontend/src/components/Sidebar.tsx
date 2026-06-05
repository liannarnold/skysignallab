import { 
  IconRadio, 
  IconAntenna, 
  IconBroadcast, 
  IconPlane,
  IconStar,
  IconWaveSine,
  IconSettings
} from '@tabler/icons-react'
import type { TabId } from '../App'

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

export default function Sidebar({ activeTab, setActiveTab, expanded }: SidebarProps) {
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

      {/* User Avatar */}
      <div className={`p-3 border-t ${expanded ? '' : 'flex justify-center'}`} style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-page-bg text-sm font-semibold">LA</span>
        </div>
      </div>
    </aside>
  )
}
