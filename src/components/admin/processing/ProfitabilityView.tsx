import React, { useState } from 'react';
import { ProcessingBatch, SegmentalProfitability } from '../../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ProfitabilityViewProps {
  batch: ProcessingBatch;
  batches?: ProcessingBatch[];
  onSelectBatch?: (b: ProcessingBatch) => void;
}

export const ProfitabilityView: React.FC<ProfitabilityViewProps> = ({ batch }) => {
  const [selectedView, setSelectedView] = useState<'batch' | 'monthly'>('batch');

  // Segmental Profitability dataset (matching Prompt specs)
  const segments: SegmentalProfitability[] = [
    {
      segment: 'Collection & Route Logistics',
      category: 'collection',
      revenue: 0,
      cost: 8400,
      profit: -8400,
      status: 'cost_center',
      marginPercent: -100,
    },
    {
      segment: 'Wet Waste (ZLD Water Treatment)',
      category: 'wet',
      revenue: 500,
      cost: 1800,
      profit: -1300,
      status: 'cost_center',
      marginPercent: -260,
    },
    {
      segment: 'Power Generation / Energy Recovery',
      category: 'dry',
      revenue: 1260,
      cost: 700,
      profit: 560,
      status: 'profitable',
      marginPercent: 44,
    },
    {
      segment: 'Plastic Recycling & Products',
      category: 'plastic',
      revenue: 3600,
      cost: 1800,
      profit: 1800,
      status: 'profitable',
      marginPercent: 50,
    },
    {
      segment: 'Hazardous Waste Management (TSDF)',
      category: 'hazardous',
      revenue: 0,
      cost: 4900,
      profit: -4900,
      status: 'cost_center',
      marginPercent: -100,
    },
    {
      segment: 'Chemical Recovery & Distillation',
      category: 'chemical',
      revenue: 3000,
      cost: 2700,
      profit: 300,
      status: 'profitable',
      marginPercent: 10,
    },
    {
      segment: 'Burnt Waste / Fly Ash Aggregates',
      category: 'ash',
      revenue: 900,
      cost: 850,
      profit: 50,
      status: 'profitable',
      marginPercent: 6,
    },
  ];

  const totalRevenue = segments.reduce((acc, s) => acc + s.revenue, 0); // ₹9,260
  const totalCost = segments.reduce((acc, s) => acc + s.cost, 0);       // ₹21,150
  const netProfitLoss = totalRevenue - totalCost;                        // -₹11,890

  // Monthly trends mock dataset
  const monthlyTrends = [
    { month: 'Apr 2026', receivedKg: 245000, recoveredKg: 171500, disposedKg: 73500, revenue: 2260000, cost: 5180000, profit: -2920000 },
    { month: 'May 2026', receivedKg: 258000, recoveredKg: 183180, disposedKg: 74820, revenue: 2415000, cost: 5320000, profit: -2905000 },
    { month: 'Jun 2026', receivedKg: 272000, recoveredKg: 198560, disposedKg: 73440, revenue: 2610000, cost: 5490000, profit: -2880000 },
    { month: 'Jul 2026', receivedKg: 269000, recoveredKg: 196370, disposedKg: 72630, revenue: 2580000, cost: 5410000, profit: -2830000 },
    { month: 'Aug 2026', receivedKg: 284000, recoveredKg: 210160, disposedKg: 73840, revenue: 2790000, cost: 5540000, profit: -2750000 },
    { month: 'Current (Sept)', receivedKg: 64200, recoveredKg: 47508, disposedKg: 16692, revenue: 630000, cost: 1250000, profit: -620000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              Control Point 5
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Segmental Profitability & Municipal Economics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate cost recovery across collection, processing streams, and circular commodity sales.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
          <button
            onClick={() => setSelectedView('batch')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedView === 'batch'
                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Analysis ({batch.id})
          </button>
          <button
            onClick={() => setSelectedView('monthly')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedView === 'monthly'
                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historical Monthly Trends
          </button>
        </div>
      </div>

      {/* Overall Economics KPI Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">
              MUNICIPAL NET FINANCIAL RESULT
            </span>
            <h2 className="text-lg font-bold">Standard 1,000 kg Municipal Processing Model</h2>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            Formula: Revenue (₹9,260) - Cost (₹21,150) = Net (-₹11,890)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Commodity Revenue</span>
            <p className="text-2xl font-mono font-bold text-emerald-400">+₹{totalRevenue.toLocaleString()}</p>
            <span className="text-[11px] text-slate-400">Plastic, chemistry, energy & ash sales</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Municipal Operational Cost</span>
            <p className="text-2xl font-mono font-bold text-red-400">₹{totalCost.toLocaleString()}</p>
            <span className="text-[11px] text-slate-400">Collection, facility operation & TSDF disposal</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Net Operational Subvention</span>
            <p className="text-2xl font-mono font-bold text-amber-400">-₹{Math.abs(netProfitLoss).toLocaleString()}</p>
            <span className="text-[11px] text-slate-400">Subsidized by municipal property tax & grants</span>
          </div>
        </div>
      </div>

      {selectedView === 'batch' ? (
        <>
          {/* Segmental Profitability Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Segmental Profitability Breakdown</h3>
                <p className="text-xs text-slate-500">
                  Detailed margins across all 7 operational divisions for Batch {batch.id}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Segment / Processing Stream</th>
                    <th className="p-3.5">Revenue</th>
                    <th className="p-3.5">Cost</th>
                    <th className="p-3.5">Profit / Contribution</th>
                    <th className="p-3.5">Visual Margin Ratio</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {segments.map((seg, idx) => {
                    const isProfitable = seg.status === 'profitable';
                    const maxAmount = 8400; // max scale for bars
                    const revPct = Math.min(100, Math.round((seg.revenue / maxAmount) * 100));
                    const costPct = Math.min(100, Math.round((seg.cost / maxAmount) * 100));

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{seg.segment}</span>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono text-emerald-700 font-semibold">
                          ₹{seg.revenue.toLocaleString()}
                        </td>

                        <td className="p-3.5 font-mono text-slate-700">
                          ₹{seg.cost.toLocaleString()}
                        </td>

                        <td className="p-3.5 font-mono font-bold">
                          <span className={isProfitable ? 'text-emerald-700' : 'text-red-600'}>
                            {seg.profit >= 0 ? `+₹${seg.profit.toLocaleString()}` : `-₹${Math.abs(seg.profit).toLocaleString()}`}
                          </span>
                        </td>

                        <td className="p-3.5 w-48">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="w-8 text-slate-400">Rev:</span>
                              <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full" style={{ width: `${revPct}%` }} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="w-8 text-slate-400">Cost:</span>
                              <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{ width: `${costPct}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isProfitable 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isProfitable ? 'PROFITABLE' : 'COST CENTER'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-xs">
                  <tr>
                    <td className="p-3.5 text-slate-900">Total Operations</td>
                    <td className="p-3.5 font-mono text-emerald-700">₹{totalRevenue.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-slate-900">₹{totalCost.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-amber-700">-₹{Math.abs(netProfitLoss).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">Recovery Cost Ratio: {Math.round((totalRevenue / totalCost) * 100)}%</td>
                    <td className="p-3.5 text-right text-slate-600">Cost Center (Public Service)</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Operational Policy Note */}
          <div className="p-4 bg-blue-50/75 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold block">Municipal Economic Reality & Circular Subsidization Principle</strong>
              <p className="text-[11px] text-blue-800">
                Collection logistics and Hazardous handling are mandatory public health functions that inherently operate as cost centers. 
                Downstream resource recovery (Plastic granulates +₹1,800, WTE electricity +₹560, Distilled solvents +₹300, Ash aggregates +₹50) produces ₹2,710 in net margins that directly offset municipal treatment expenses.
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Monthly Trends Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Monthly Municipal Throughput & Recovery Financials</h3>
            <p className="text-xs text-slate-500">6-Month historical performance across all authorized processing centres.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Billing Period</th>
                  <th className="p-3.5">Received</th>
                  <th className="p-3.5">Recovered</th>
                  <th className="p-3.5">Recovery %</th>
                  <th className="p-3.5">Safe Disposed</th>
                  <th className="p-3.5">Revenue</th>
                  <th className="p-3.5">Total Cost</th>
                  <th className="p-3.5 text-right">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {monthlyTrends.map((row, i) => {
                  const recRate = Math.round((row.recoveredKg / row.receivedKg) * 100);
                  return (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-3.5 font-sans font-medium text-slate-900">{row.month}</td>
                      <td className="p-3.5 text-slate-700">{(row.receivedKg / 1000).toFixed(1)} T</td>
                      <td className="p-3.5 text-emerald-700 font-semibold">{(row.recoveredKg / 1000).toFixed(1)} T</td>
                      <td className="p-3.5 text-teal-700 font-bold">{recRate}%</td>
                      <td className="p-3.5 text-slate-600">{(row.disposedKg / 1000).toFixed(1)} T</td>
                      <td className="p-3.5 text-emerald-700">₹{(row.revenue / 100000).toFixed(2)}L</td>
                      <td className="p-3.5 text-slate-700">₹{(row.cost / 100000).toFixed(2)}L</td>
                      <td className="p-3.5 text-right font-bold text-amber-700">-₹{(Math.abs(row.profit) / 100000).toFixed(2)}L</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
