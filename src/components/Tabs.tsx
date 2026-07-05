import type { LucideIcon } from 'lucide-react'

export interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number
}

interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <nav className="border-b border-white/6 bg-[#0a0a0f]/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
        {tabs.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-zinc-500 hover:border-white/10 hover:text-zinc-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? 'bg-indigo-500/25 text-indigo-300'
                      : 'bg-white/6 text-zinc-500'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
