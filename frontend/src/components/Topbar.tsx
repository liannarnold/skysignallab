import { IconLayoutSidebar } from '@tabler/icons-react'

interface TopbarProps {
  title: string
  sidebarExpanded: boolean
  setSidebarExpanded: (value: boolean) => void
  children?: React.ReactNode
  rightContent?: React.ReactNode
}

export default function Topbar({
  title,
  sidebarExpanded,
  setSidebarExpanded,
  children,
  rightContent
}: TopbarProps) {
  return (
    <div className="bg-surface px-4 py-3 flex items-center gap-4 border-b" style={{ borderColor: '#1c2440', borderWidth: '0.5px' }}>
      <button
        onClick={() => setSidebarExpanded(!sidebarExpanded)}
        className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-text-secondary hover:text-text-primary"
        aria-label="Toggle sidebar"
      >
        <IconLayoutSidebar size={20} />
      </button>

      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>

      {children}

      <div className="flex-1" />

      {rightContent}
    </div>
  )
}
