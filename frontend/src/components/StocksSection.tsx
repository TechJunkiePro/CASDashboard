import { useState } from 'react';
import type { StockEntry } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Formatter } from 'recharts/types/component/DefaultTooltipContent';

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const genId = () => `stock-${crypto.randomUUID()}`;

const empty: Omit<StockEntry, 'id'> = { symbol: '', quantity: 0, avg_price: 0, current_price: 0 };

export default function StocksSection() {
  const [stocks, setStocks] = useState<StockEntry[]>([]);
  const [form, setForm] = useState<Omit<StockEntry, 'id'>>(empty);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!form.symbol.trim()) { setError('Symbol is required.'); return; }
    if (form.quantity <= 0) { setError('Quantity must be > 0.'); return; }
    if (form.avg_price <= 0) { setError('Avg price must be > 0.'); return; }
    if (form.current_price <= 0) { setError('Current price must be > 0.'); return; }
    setStocks((prev) => [...prev, { ...form, symbol: form.symbol.toUpperCase(), id: genId() }]);
    setForm(empty);
    setError('');
  };

  const handleRemove = (id: string) => setStocks((prev) => prev.filter((s) => s.id !== id));

  const totalInvested = stocks.reduce((s, x) => s + x.quantity * x.avg_price, 0);
  const totalCurrent = stocks.reduce((s, x) => s + x.quantity * x.current_price, 0);
  const totalGain = totalCurrent - totalInvested;

  const pieData = stocks.map((s) => ({
    name: s.symbol,
    value: s.quantity * s.current_price,
  }));

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Stock Investments</h2>

      {/* Add form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-gray-400 text-sm font-medium mb-4">Add Stock Entry</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['symbol', 'quantity', 'avg_price', 'current_price'] as const).map((field) => (
            <div key={field}>
              <label className="text-gray-500 text-xs mb-1 block capitalize">{field.replace('_', ' ')}</label>
              <input
                type={field === 'symbol' ? 'text' : 'number'}
                value={form[field] || ''}
                onChange={(e) => {
                  const val = field === 'symbol' ? e.target.value : parseFloat(e.target.value) || 0;
                  setForm((f) => ({ ...f, [field]: val }));
                }}
                placeholder={field === 'symbol' ? 'e.g. RELIANCE' : '0'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <button
          onClick={handleAdd}
          className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          + Add Stock
        </button>
      </div>

      {stocks.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Invested</div>
              <div className="text-white font-bold">{fmt.format(totalInvested)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Current</div>
              <div className="text-white font-bold">{fmt.format(totalCurrent)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-gray-500 text-xs mb-1">Gain/Loss</div>
              <div className={`font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalGain >= 0 ? '+' : ''}{fmt.format(totalGain)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Stock Allocation</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={((v: unknown) => [fmt.format((v ?? 0) as number), '']) as Formatter}
                  />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-gray-400 text-sm font-medium mb-3">Holdings</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="text-left pb-2">Symbol</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Avg</th>
                    <th className="text-right pb-2">CMP</th>
                    <th className="text-right pb-2">P&L</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => {
                    const pnl = s.quantity * (s.current_price - s.avg_price);
                    const pnlPct = ((s.current_price - s.avg_price) / s.avg_price) * 100;
                    return (
                      <tr key={s.id} className="border-b border-gray-800/50">
                        <td className="py-2 text-white font-medium">{s.symbol}</td>
                        <td className="py-2 text-right text-gray-300">{s.quantity}</td>
                        <td className="py-2 text-right text-gray-300">{fmt.format(s.avg_price)}</td>
                        <td className="py-2 text-right text-gray-300">{fmt.format(s.current_price)}</td>
                        <td className={`py-2 text-right font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <div>{pnl >= 0 ? '+' : ''}{fmt.format(pnl)}</div>
                          <div className="text-xs opacity-80">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%</div>
                        </td>
                        <td className="py-2 pl-2">
                          <button onClick={() => handleRemove(s.id)} className="text-gray-600 hover:text-red-400 transition-colors text-xs">✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
