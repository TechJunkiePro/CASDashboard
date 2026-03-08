import { useState } from 'react';
import type { SchemeDistribution } from '../types';

interface Props {
  schemes: SchemeDistribution[];
}

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

export default function SchemesTable({ schemes }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof SchemeDistribution>('current');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: keyof SchemeDistribution) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = schemes
    .filter((s) =>
      s.scheme.toLowerCase().includes(search.toLowerCase()) ||
      s.amc.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const SortIcon = ({ k }: { k: keyof SchemeDistribution }) =>
    sortKey === k ? (
      <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-gray-600">↕</span>
    );

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="text-gray-300 font-semibold text-sm uppercase tracking-wider">All Schemes</h3>
        <input
          type="text"
          placeholder="Search scheme or AMC…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
              <th className="text-left pb-3 pr-4 cursor-pointer" onClick={() => handleSort('scheme')}>
                Scheme <SortIcon k="scheme" />
              </th>
              <th className="text-left pb-3 pr-4 hidden sm:table-cell">AMC</th>
              <th className="text-left pb-3 pr-4 hidden md:table-cell">Category</th>
              <th className="text-right pb-3 pr-4 cursor-pointer" onClick={() => handleSort('units')}>
                Units <SortIcon k="units" />
              </th>
              <th className="text-right pb-3 pr-4 cursor-pointer hidden sm:table-cell" onClick={() => handleSort('nav')}>
                NAV <SortIcon k="nav" />
              </th>
              <th className="text-right pb-3 pr-4 cursor-pointer" onClick={() => handleSort('invested')}>
                Invested <SortIcon k="invested" />
              </th>
              <th className="text-right pb-3 pr-4 cursor-pointer" onClick={() => handleSort('current')}>
                Current <SortIcon k="current" />
              </th>
              <th className="text-right pb-3 cursor-pointer" onClick={() => handleSort('gain_loss_pct')}>
                Gain/Loss <SortIcon k="gain_loss_pct" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-3 pr-4 text-white max-w-[200px]">
                  <div className="truncate" title={s.scheme}>{s.scheme}</div>
                </td>
                <td className="py-3 pr-4 text-gray-400 hidden sm:table-cell max-w-[120px]">
                  <div className="truncate" title={s.amc}>{s.amc}</div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.category === 'Equity' ? 'bg-blue-900/50 text-blue-300' :
                    s.category === 'Debt' ? 'bg-yellow-900/50 text-yellow-300' :
                    s.category === 'Hybrid' ? 'bg-purple-900/50 text-purple-300' :
                    'bg-gray-800 text-gray-400'
                  }`}>{s.category}</span>
                </td>
                <td className="py-3 pr-4 text-right text-gray-300">{s.units.toFixed(3)}</td>
                <td className="py-3 pr-4 text-right text-gray-300 hidden sm:table-cell">{fmt.format(s.nav)}</td>
                <td className="py-3 pr-4 text-right text-gray-300">{fmt.format(s.invested)}</td>
                <td className="py-3 pr-4 text-right text-white font-medium">{fmt.format(s.current)}</td>
                <td className={`py-3 text-right font-medium ${s.gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <div>{s.gain_loss >= 0 ? '+' : ''}{fmt.format(s.gain_loss)}</div>
                  <div className="text-xs opacity-80">{s.gain_loss_pct >= 0 ? '+' : ''}{s.gain_loss_pct.toFixed(1)}%</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">No schemes match your search.</p>
        )}
      </div>
    </div>
  );
}
