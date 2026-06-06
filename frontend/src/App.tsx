import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SignalsTab from './components/SignalsTab'
import HamRadioTab from './components/HamRadioTab'
import FmAmTab from './components/FmAmTab'
import AircraftTab from './components/AircraftTab'
import FavoritesTab from './components/FavoritesTab'
import MySignalsTab from './components/MySignalsTab'
import SettingsTab from './components/SettingsTab'
import LoginModal from './components/LoginModal'
import { useAuth } from './context/AuthContext'

export type TabId = 'signals' | 'ham' | 'fmam' | 'aircraft' | 'favorites' | 'mysignals' | 'settings'

function App() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('signals')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [accentColor, setAccentColor] = useState('#fb923c')

  // Update CSS variable when accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', accentColor)
  }, [accentColor])

  const renderTab = () => {
    switch (activeTab) {
      case 'signals':
        return <SignalsTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
      case 'ham':
        return <HamRadioTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
      case 'fmam':
        return <FmAmTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
      case 'aircraft':
        return <AircraftTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
      case 'favorites':
        return <FavoritesTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
      case 'mysignals':
        return <MySignalsTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
      case 'settings':
        return <SettingsTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} accentColor={accentColor} setAccentColor={setAccentColor} />
      default:
        return <SignalsTab sidebarExpanded={sidebarExpanded} setSidebarExpanded={setSidebarExpanded} />
    }
  }

  return (
    <div className="flex h-screen bg-page-bg overflow-hidden">
      {!isAuthenticated && <LoginModal />}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expanded={sidebarExpanded}
      />
      <main className="flex-1 overflow-hidden">
        {renderTab()}
      </main>
    </div>
  )
}

export default App