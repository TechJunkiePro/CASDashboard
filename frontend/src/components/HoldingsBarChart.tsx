import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { Formatter } from 'recharts/types/component/DefaultTooltipContent';

interface DataItem {
  name: string;
  value: number;
  gain_pct?: number;
}

interface Props {
  data: DataItem[];
  title: string;
  color?: string;
}

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function truncate(s: string, max = 22) {
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export default function HoldingsBarChart({ data, title, color = '#6366f1' }: Props) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="text-gray-300 font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v: number) => fmt.format(v)}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={(v: string) => truncate(v)}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            formatter={((value: unknown, _name: unknown, props: { payload?: DataItem }) => {
              const numVal = (value ?? 0) as number;
              const formatted = fmt.format(numVal);
              const pct = props.payload?.gain_pct;
              return pct !== undefined
                ? [`${formatted} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`, 'Current Value']
                : [formatted, 'Current Value'];
            }) as Formatter}
            labelStyle={{ color: '#e5e7eb', fontSize: '12px' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.gain_pct !== undefined
                    ? entry.gain_pct >= 0
                      ? '#10b981'
                      : '#ef4444'
                    : color
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
