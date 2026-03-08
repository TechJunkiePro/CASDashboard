import type { CASResponse } from '../types';
import SummaryCard from './SummaryCard';
import AllocationPieChart from './AllocationPieChart';
import HoldingsBarChart from './HoldingsBarChart';
import GrowthLineChart from './GrowthLineChart';
import SchemesTable from './SchemesTable';
import StocksSection from './StocksSection';

interface Props {
  data: CASResponse;
  onReset: () => void;
  onDownload: () => void;
}

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const fmtFull = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

export default function Dashboard({ data, onReset, onDownload }: Props) {
  const { investor_info, portfolio_summary: ps, analytics } = data;

  const amcPie = analytics.amc_distribution.map((a) => ({ name: a.amc, value: a.current }));
  const categoryPie = analytics.category_distribution.map((c) => ({ name: c.category, value: c.current }));
  const sipLumpsumPie = [
    { name: 'SIP', value: analytics.sip_vs_lumpsum.sip },
    { name: 'Lumpsum', value: analytics.sip_vs_lumpsum.lumpsum },
  ].filter((x) => x.value > 0);

  const top10Bar = analytics.top_10_holdings.map((h) => ({
    name: h.scheme,
    value: h.current,
    gain_pct: h.gain_loss_pct,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              <span className="text-indigo-400">CAS</span> Dashboard
            </h1>
            {investor_info.name && (
              <span className="text-gray-500 text-sm hidden sm:block">· {investor_info.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              ↓ JSON
            </button>
            <button
              onClick={onReset}
              className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              New Upload
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Investor info */}
        {investor_info.email && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
            {investor_info.email && <span>✉️ {investor_info.email}</span>}
            {investor_info.mobile && <span>📱 {investor_info.mobile}</span>}
            {investor_info.address && <span className="truncate max-w-sm">📍 {investor_info.address}</span>}
          </div>
        )}

        {/* Summary cards */}
        <section>
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Portfolio Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <SummaryCard
              label="Total Invested"
              value={fmt.format(ps.total_invested)}
              icon="💰"
            />
            <SummaryCard
              label="Current Value"
              value={fmt.format(ps.total_current_value)}
              icon="📈"
            />
            <SummaryCard
              label="Total Gain/Loss"
              value={fmtFull.format(ps.total_gain_loss)}
              sub={`${ps.total_gain_loss_pct >= 0 ? '+' : ''}${ps.total_gain_loss_pct.toFixed(2)}%`}
              positive={ps.total_gain_loss >= 0}
              icon="📊"
            />
            <SummaryCard
              label="Total Funds"
              value={String(ps.total_funds)}
              sub={`${ps.total_folios} folio${ps.total_folios !== 1 ? 's' : ''}`}
              icon="🗂️"
            />
            <SummaryCard
              label="SIP Invested"
              value={fmt.format(ps.sip_invested)}
              sub={`Lumpsum: ${fmt.format(ps.lumpsum_invested)}`}
              icon="🔄"
            />
          </div>
        </section>

        {/* Pie charts */}
        <section>
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Allocation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AllocationPieChart data={amcPie} title="AMC Allocation" />
            <AllocationPieChart data={categoryPie} title="Asset Class Allocation" />
            <AllocationPieChart data={sipLumpsumPie} title="SIP vs Lumpsum" />
          </div>
        </section>

        {/* Charts row */}
        <section>
          <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <HoldingsBarChart data={top10Bar} title="Top 10 Holdings by Value" />
            <GrowthLineChart data={analytics.investment_growth} />
          </div>
        </section>

        {/* Schemes table */}
        <section>
          <SchemesTable schemes={analytics.scheme_distribution} />
        </section>

        {/* Stocks */}
        <section>
          <StocksSection />
        </section>
      </main>
    </div>
  );
}
