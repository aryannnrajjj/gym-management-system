export default function StatCard({ title, value, icon: Icon, color, change }) {
  const colors = {
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20'   },
    green:  { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20'  },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  };
  const c = colors[color] || colors.orange;

  return (
    <div className={`card p-5 border ${c.border} hover:shadow-glow-sm cursor-default`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${c.bg} p-2.5 rounded-xl`}>
          <Icon size={20} className={c.text} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}