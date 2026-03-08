import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import type { Formatter } from 'recharts/types/component/DefaultTooltipContent';
import type { InvestmentGrowth } from '../types';

interface Props {
  data: InvestmentGrowth[];
}

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function GrowthLineChart({ data }: Props) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="text-gray-300 font-semibold mb-4 text-sm uppercase tracking-wider">Investment Growth Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v: number) => fmt.format(v)}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            formatter={((value: unknown) => [fmt.format((value ?? 0) as number), 'Cumulative Invested']) as Formatter}
            labelStyle={{ color: '#e5e7eb', fontSize: '12px' }}
          />
          <Area
            type="monotone"
            dataKey="cumulative_invested"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#growthGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
