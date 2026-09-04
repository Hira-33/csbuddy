export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === tab.id
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
