export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-slate-100 bg-slate-50/50 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-3 text-sm font-medium transition ${
            activeTab === tab.id
              ? 'text-indigo-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-indigo-600" />
          )}
        </button>
      ))}
    </div>
  )
}
