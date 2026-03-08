interface CardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
  icon?: string;
}

export default function SummaryCard({ label, value, sub, positive, icon }: CardProps) {
  const subColor =
    positive === true
      ? 'text-green-400'
      : positive === false
      ? 'text-red-400'
      : 'text-gray-400';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider">
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className={`text-sm font-medium ${subColor}`}>{sub}</div>}
    </div>
  );
}
