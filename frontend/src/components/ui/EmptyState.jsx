export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-dark-border p-5 rounded-2xl mb-4">
        <Icon size={40} className="text-gray-600" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-gray-500 text-sm mb-5 max-w-xs">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}