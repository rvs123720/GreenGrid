import React, { useState } from 'react';
import { ProcessingBatch, ProcessingStream } from '../../../types';
import { 
  Droplet, 
  Flame, 
  Recycle, 
  Skull, 
  FlaskConical, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Scale, 
  Info,
  ShieldCheck,
  Zap,
  Sliders,
  Settings
} from 'lucide-react';

interface StreamProcessingDetailProps {
  batch: ProcessingBatch;
  batches?: ProcessingBatch[];
  onSelectBatch?: (b: ProcessingBatch) => void;
  onUpdateAshBranch?: (canBeReused: boolean) => void;
}

export const StreamProcessingDetail: React.FC<StreamProcessingDetailProps> = ({
  batch,
  batches,
  onSelectBatch,
  onUpdateAshBranch,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'wet' | 'dry' | 'plastic' | 'hazardous' | 'chemical' | 'ash'>('all');
  const [ashReuseOverride, setAshReuseOverride] = useState<boolean>(true);

  const streams = batch.streams || [];

  // Filtered streams
  const filteredStreams = activeCategory === 'all' 
    ? streams 
    : streams.filter(s => s.category === activeCategory);

  // Totals across streams
  const totalInput = streams.reduce((acc, s) => acc + s.inputKg, 0);
  const totalRecovered = streams.reduce((acc, s) => acc + s.recoveredKg, 0);
  const totalResidual = streams.reduce((acc, s) => acc + s.residualKg, 0);
  const totalRevenue = streams.reduce((acc, s) => acc + s.revenue, 0);
  const totalCost = streams.reduce((acc, s) => acc + s.processingCost, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 text-teal-800 uppercase tracking-wider">
              Control Point 3
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stream-Specific Waste Processing & Recovery</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dedicated multi-stream engineering routes: ZLD Water Treatment, WTE Energy, Polymer Recycling, TSDF & Chemistry.
          </p>
        </div>

        {/* Stream Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
          {[
            { id: 'all', label: 'All 6 Streams' },
            { id: 'wet', label: 'Wet (ZLD)' },
            { id: 'dry', label: 'Dry (Energy)' },
            { id: 'plastic', label: 'Plastic' },
            { id: 'hazardous', label: 'Hazardous' },
            { id: 'chemical', label: 'Chemical' },
            { id: 'ash', label: 'Ash' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Engineering Cards */}
      <div className="space-y-5">
        {filteredStreams.map(stream => {
          return (
            <div
              key={stream.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    stream.category === 'wet' ? 'bg-emerald-100 text-emerald-800' :
                    stream.category === 'dry' ? 'bg-amber-100 text-amber-800' :
                    stream.category === 'plastic' ? 'bg-blue-100 text-blue-800' :
                    stream.category === 'hazardous' ? 'bg-red-100 text-red-800' :
                    stream.category === 'chemical' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {stream.category === 'wet' && <Droplet className="w-5 h-5" />}
                    {stream.category === 'dry' && <Flame className="w-5 h-5" />}
                    {stream.category === 'plastic' && <Recycle className="w-5 h-5" />}
                    {stream.category === 'hazardous' && <Skull className="w-5 h-5" />}
                    {stream.category === 'chemical' && <FlaskConical className="w-5 h-5" />}
                    {stream.category === 'ash' && <Mountain className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{stream.name}</h3>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {stream.processingRoute}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{stream.processingMethod}</p>
                  </div>
                </div>

                {/* Economics Chip */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contribution</span>
                    <strong className={`font-mono text-sm font-bold ${
                      stream.profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {stream.profit >= 0 ? `+₹${stream.profit.toLocaleString()}` : `-₹${Math.abs(stream.profit).toLocaleString()}`}
                    </strong>
                  </div>
                  <div className="text-left border-l border-slate-200 pl-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery Rate</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{stream.recoveryRatePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Stream Detailed Sections */}

              {/* 1. WET WASTE (ZLD & Water Treatment) */}
              {stream.category === 'wet' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Input Stream</span>
                      <p className="text-base font-mono font-bold text-slate-900">{stream.inputKg} kg</p>
                      <span className="text-[10px] text-slate-500 block">Wet organics & slurry</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">Treated Water Recovery</span>
                      <p className="text-base font-mono font-bold text-emerald-800">
                        {stream.details.recoveredWaterLiters || 250} L
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold block">✓ Reusable (Non-Potable)</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Organic Residue</span>
                      <p className="text-base font-mono font-bold text-slate-800">
                        {stream.details.organicResidueKg || 110} kg
                      </p>
                      <span className="text-[10px] text-slate-500 block">Compostable soil enricher</span>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-amber-800 uppercase font-bold">Sludge Generated</span>
                      <p className="text-base font-mono font-bold text-amber-800">
                        {stream.details.sludgeKg || 45} kg
                      </p>
                      <span className="text-[10px] text-amber-700 block">Disposal Cost: ₹{stream.details.sludgeDisposalCost || 1350}</span>
                    </div>
                  </div>

                  {/* Processing Stages & Uses */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Treated Water Applications (Strictly Non-Potable):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(stream.details.waterPotentialUse || []).map((use, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                            • {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500">Processing Loss:</span>
                      <strong className="font-mono text-slate-700 ml-1">{stream.details.processingLossKg || 15} kg</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. DRY WASTE (Power Generation) */}
              {stream.category === 'dry' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Input Stream</span>
                      <p className="text-base font-mono font-bold text-slate-900">{stream.inputKg} kg</p>
                      <span className="text-[10px] text-slate-500 block">RDF Pellets / Combustibles</span>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-amber-800 uppercase font-bold">Power Generated</span>
                      <p className="text-base font-mono font-bold text-amber-800">
                        {stream.details.energyGeneratedKwh || 180} kWh
                      </p>
                      <span className="text-[10px] text-amber-700 block">Thermal Gasification</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Grid Power Tariff</span>
                      <p className="text-base font-mono font-bold text-slate-800">
                        ₹{stream.details.powerTariffPerKwh || 7.0} / kWh
                      </p>
                      <span className="text-[10px] text-slate-500 block">BESCOM PPA Agreement</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">Power Sales Revenue</span>
                      <p className="text-base font-mono font-bold text-emerald-800">
                        ₹{stream.revenue.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-700 block">Net Contribution: +₹{stream.profit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Dynamic Formula: <strong>Revenue = {stream.details.energyGeneratedKwh || 180} kWh × ₹7/kWh = ₹{stream.revenue}</strong>
                    </span>
                    <span>Processing Cost: ₹{stream.processingCost} · Net: +₹{stream.profit}</span>
                  </div>
                </div>
              )}

              {/* 3. PLASTIC WASTE (Recycling) */}
              {stream.category === 'plastic' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Total Polymer Input</span>
                      <p className="text-base font-mono font-bold text-slate-900">{stream.inputKg} kg</p>
                      <span className="text-[10px] text-blue-600 font-semibold block">Non-Hazardous Plastic</span>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-blue-800 uppercase font-bold">Recoverable Polymers</span>
                      <p className="text-base font-mono font-bold text-blue-800">
                        {stream.details.recoverablePlasticKg || 120} kg
                      </p>
                      <span className="text-[10px] text-blue-600 block">PET, HDPE & PP Granules</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">Reusable Product Output</span>
                      <p className="text-base font-mono font-bold text-emerald-800">
                        {stream.details.reusableProductKg || 80} kg
                      </p>
                      <span className="text-[10px] text-emerald-700 block">Sold @ ₹45/kg</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Contaminated Residual</span>
                      <p className="text-base font-mono font-bold text-slate-700">
                        {stream.details.contaminatedPlasticKg || 30} kg
                      </p>
                      <span className="text-[10px] text-slate-500 block">Non-recyclable film</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Commercial Sales Status: <strong>✓ Completed (Manufactured Paver Blocks & Plant Containers)</strong></span>
                    </span>
                    <span className="font-mono">Revenue: ₹{stream.revenue} · Cost: ₹{stream.processingCost} · Net: +₹{stream.profit}</span>
                  </div>
                </div>
              )}

              {/* 4. HAZARDOUS WASTE (Controlled TSDF) */}
              {stream.category === 'hazardous' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2 text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold">Strictly Controlled Hazardous Handling Protocol</strong>
                      <p className="text-[11px] text-red-800">
                        Never mixed with municipal recyclable streams. Transported exclusively via GPS-monitored sealed carriers to Government-Authorized Treatment, Storage and Disposal Facility (TSDF).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Hazardous Input</span>
                      <p className="text-base font-mono font-bold text-red-700">{stream.inputKg} kg</p>
                      <span className="text-[10px] text-slate-500 block">Class II Regulated Waste</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Authorized Transport</span>
                      <p className="text-base font-mono font-bold text-slate-800">
                        ₹{stream.details.transportCost || 1400}
                      </p>
                      <span className="text-[10px] text-slate-500 block">Dedicated Hazmat Tanker</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">TSDF Encapsulation</span>
                      <p className="text-base font-mono font-bold text-slate-800">
                        ₹{stream.details.hazardDisposalCost || 3500}
                      </p>
                      <span className="text-[10px] text-slate-500 block">Autoclave & Stabilized Cell</span>
                    </div>

                    <div className="p-3 bg-red-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-red-800 uppercase font-bold">Total Disposal Cost</span>
                      <p className="text-base font-mono font-bold text-red-700">
                        -₹{stream.processingCost.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-red-600 font-bold block">Revenue: ₹0 (Net Loss)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. CHEMICAL WASTE (Recovery Assessment) */}
              {stream.category === 'chemical' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Chemical Input</span>
                      <p className="text-base font-mono font-bold text-slate-900">{stream.inputKg} kg</p>
                      <span className="text-[10px] text-slate-500 block">Solvents & Spent Reagents</span>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-purple-800 uppercase font-bold">Recoverable Chemistry</span>
                      <p className="text-base font-mono font-bold text-purple-800">
                        {stream.details.recoverableChemicalKg || 25} kg
                      </p>
                      <span className="text-[10px] text-purple-700 block">Sold @ ₹120/kg (₹3,000 rev)</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Non-Recoverable</span>
                      <p className="text-base font-mono font-bold text-slate-700">
                        {stream.details.chemicalDisposalKg || 15} kg
                      </p>
                      <span className="text-[10px] text-slate-500 block">Disposal Cost: ₹1,500</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">Net Chemical Margin</span>
                      <p className="text-base font-mono font-bold text-emerald-800">
                        +₹{stream.profit.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-700 block">Revenue ₹3,000 - Cost ₹2,700</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BURNT WASTE / ASH (Testing & Dual-Path) */}
              {stream.category === 'ash' && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-medium">Quality Testing Protocol:</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ Quality Check Passed (Pozzolanic Class F)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Simulate Branch:</span>
                      <button
                        onClick={() => {
                          const next = !ashReuseOverride;
                          setAshReuseOverride(next);
                          if (onUpdateAshBranch) onUpdateAshBranch(next);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          ashReuseOverride
                            ? 'bg-emerald-700 text-white'
                            : 'bg-red-700 text-white'
                        }`}
                      >
                        <span>Path: {ashReuseOverride ? 'YES (Cement / Construction)' : 'NO (Safe Landfill)'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Ash Input</span>
                      <p className="text-base font-mono font-bold text-slate-900">{stream.inputKg} kg</p>
                      <span className="text-[10px] text-slate-500 block">Boiler & Incinerator Fly Ash</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Recovered for Cement</span>
                      <p className="text-base font-mono font-bold text-slate-800">
                        {stream.details.reusableAshKg || 45} kg
                      </p>
                      <span className="text-[10px] text-slate-500 block">Sold @ ₹20/kg</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Heavy Metal Slag</span>
                      <p className="text-base font-mono font-bold text-slate-700">
                        {stream.details.ashDisposalKg || 15} kg
                      </p>
                      <span className="text-[10px] text-slate-500 block">Safe Disposal: ₹450</span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl space-y-1">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold">Net Ash Economics</span>
                      <p className="text-base font-mono font-bold text-emerald-800">
                        +₹{stream.profit.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-700 block">Revenue ₹{stream.revenue} - Cost ₹{stream.processingCost}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
