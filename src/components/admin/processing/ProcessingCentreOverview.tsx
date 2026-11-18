import React from 'react';
import { ProcessingFacility } from '../../../types';
import { 
  Building2, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Coins, 
  TrendingUp,
  Percent,
  RefreshCw
} from 'lucide-react';

interface ProcessingCentreOverviewProps {
  facilities: ProcessingFacility[];
  onSelectFacility?: (facility: ProcessingFacility) => void;
  onOpenBatch?: (batchId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenFlowModal?: () => void;
}

export const ProcessingCentreOverview: React.FC<ProcessingCentreOverviewProps> = ({
  facilities,
  onSelectFacility,
  onNavigateTab,
  onOpenFlowModal,
}) => {
  // Aggregate metrics
  const totalInputTodayKg = facilities.reduce((sum, f) => sum + f.inputWeightTodayKg, 0);
  const totalProcessedKg = facilities.reduce((sum, f) => sum + f.processedWeightTodayKg, 0);
  const totalRecoveredKg = facilities.reduce((sum, f) => sum + f.recoveredWeightTodayKg, 0);
  const totalDisposedKg = facilities.reduce((sum, f) => sum + f.disposedWeightTodayKg, 0);
  const avgRecoveryRate = totalInputTodayKg > 0 
    ? Math.round((totalRecoveredKg / totalInputTodayKg) * 1000) / 10 
    : 0;
  const totalRevenue = facilities.reduce((sum, f) => sum + f.revenueInr, 0);
  const totalCost = facilities.reduce((sum, f) => sum + f.processingCostInr, 0);
  const totalProfit = facilities.reduce((sum, f) => sum + f.profitInr, 0);

  return (
    <div className="space-y-6">
      {/* Title & Subtitle Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Processing Centres</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor incoming waste, segregation, processing and recovery across authorized facilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {facilities.filter(f => f.status === 'operational').length} Facilities Operational
          </span>
        </div>
      </div>

      {/* Aggregate Municipal KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Input Today</span>
          <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">{(totalInputTodayKg / 1000).toFixed(2)} T</p>
          <span className="text-[10px] text-slate-500">{totalInputTodayKg.toLocaleString()} kg</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Processed</span>
          <p className="text-lg font-mono font-bold text-blue-700 mt-0.5">{(totalProcessedKg / 1000).toFixed(2)} T</p>
          <span className="text-[10px] text-blue-600">{Math.round((totalProcessedKg / totalInputTodayKg) * 100)}% throughput</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Material Recovered</span>
          <p className="text-lg font-mono font-bold text-emerald-700 mt-0.5">{(totalRecoveredKg / 1000).toFixed(2)} T</p>
          <span className="text-[10px] text-emerald-600">{totalRecoveredKg.toLocaleString()} kg circular</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Safe Disposal</span>
          <p className="text-lg font-mono font-bold text-slate-700 mt-0.5">{(totalDisposedKg / 1000).toFixed(2)} T</p>
          <span className="text-[10px] text-slate-500">{totalDisposedKg.toLocaleString()} kg residual</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Recovery Rate</span>
          <p className="text-lg font-mono font-bold text-teal-700 mt-0.5">{avgRecoveryRate}%</p>
          <span className="text-[10px] text-teal-600 font-semibold">Target &ge; 70% met</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</span>
          <p className="text-lg font-mono font-bold text-emerald-700 mt-0.5">₹{totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600">From energy & products</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Facility Net Profit</span>
          <p className={`text-lg font-mono font-bold mt-0.5 ${totalProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {totalProfit >= 0 ? `+₹${totalProfit.toLocaleString()}` : `-₹${Math.abs(totalProfit).toLocaleString()}`}
          </p>
          <span className="text-[10px] text-slate-500">Excl. collection fleet</span>
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map(facility => {
          const recoveryPercent = facility.recoveryRatePercent;
          const isHealthy = facility.status === 'operational';

          return (
            <div
              key={facility.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{facility.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{facility.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {facility.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Progress & Recovery Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Resource Recovery Progress:</span>
                  <span className="font-mono font-bold text-emerald-800">{recoveryPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${recoveryPercent}%` }}
                    title={`Recovered: ${facility.recoveredWeightTodayKg} kg`}
                  />
                  <div 
                    className="bg-slate-300 h-full transition-all"
                    style={{ width: `${100 - recoveryPercent}%` }}
                    title={`Disposed: ${facility.disposedWeightTodayKg} kg`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Recovered: {facility.recoveredWeightTodayKg.toLocaleString()} kg</span>
                  <span>Safe Disposal: {facility.disposedWeightTodayKg.toLocaleString()} kg</span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-medium">Input Today</span>
                  <strong className="font-mono text-slate-900 text-xs">{facility.inputWeightTodayKg.toLocaleString()} kg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-medium">Processed</span>
                  <strong className="font-mono text-blue-700 text-xs">{facility.processedWeightTodayKg.toLocaleString()} kg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-medium">Revenue</span>
                  <strong className="font-mono text-emerald-700 text-xs">₹{facility.revenueInr.toLocaleString()}</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-medium">Facility Profit</span>
                  <strong className="font-mono text-emerald-800 text-xs">+₹{facility.profitInr.toLocaleString()}</strong>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>{facility.activeBays} Active Intake Bays · {facility.currentIntakeRateKgPerHour} kg/hr throughput</span>
                </span>
                <span className="font-semibold text-emerald-700">Cost: ₹{facility.processingCostInr.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
