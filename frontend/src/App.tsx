import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import SignalsTab from './components/SignalsTab'
import HamRadioTab from './components/HamRadioTab'
import FmAmTab from './components/FmAmTab'
import AircraftTab from './components/AircraftTab'
import FavoritesTab from './components/FavoritesTab'
import MySignalsTab from './components/MySignalsTab'
import SettingsTab from './components/SettingsTab'

export type TabId = 'signals' | 'ham' | 'fmam' | 'aircraft' | 'favorites' | 'mysignals' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('signals')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [accentColor, setAccentColor] = useState('#fb923c')
  const [soundEffects, setSoundEffects] = useState(true)

  // Update CSS variable when accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', accentColor)
  }, [accentColor])

  // Play click sound for UI interactions
  const playClickSound = () => {
    if (soundEffects) {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    }
  }

  const handleTabChange = (tab: TabId) => {
    playClickSound()
    setActiveTab(tab)
  }

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
