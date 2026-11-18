import React, { useState } from 'react';
import { ProcessingBatch } from '../../../types';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Truck as TruckIcon, 
  Clock, 
  ArrowRight, 
  ArrowDown, 
  Check, 
  AlertCircle,
  FileText,
  Building2,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

interface WasteReceivingVerificationProps {
  batches: ProcessingBatch[];
  selectedBatch: ProcessingBatch;
  onSelectBatch: (batch: ProcessingBatch) => void;
  onOpenFlowModal?: () => void;
}

export const WasteReceivingVerification: React.FC<WasteReceivingVerificationProps> = ({
  batches,
  selectedBatch,
  onSelectBatch,
  onOpenFlowModal,
}) => {
  // Configurable variance threshold (default 2.0%)
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(2.0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'investigation'>('all');

  // Input Control KPI calculations
  const totalIncomingTodayKg = 8760;
  const verifiedInputKg = 8412;
  const pendingVerificationKg = 348;
  const varianceDetectedKg = 186;
  const processingQueueKg = 2840;

  // Filtered batch records
  const filteredBatches = batches.filter(b => {
    const matchesSearch = 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.collectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.sourceTruckIds.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const isOverTolerance = b.variancePercentage > toleranceThreshold;
    if (statusFilter === 'verified') return matchesSearch && !isOverTolerance;
    if (statusFilter === 'investigation') return matchesSearch && isOverTolerance;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              Control Point 1
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Waste Receiving & Input Weight Verification</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit weighbridge gate weight vs collection point strain-gauge payload before facility admission.
          </p>
        </div>

        {/* Tolerance Threshold Configurator */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span>Tolerance Threshold:</span>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={toleranceThreshold}
              onChange={(e) => setToleranceThreshold(parseFloat(e.target.value))}
              className="w-24 accent-emerald-700 cursor-pointer"
            />
            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
              {toleranceThreshold.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Control Point 1 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Today's Incoming Waste</span>
          <p className="text-xl font-mono font-bold text-slate-900 mt-1">{totalIncomingTodayKg.toLocaleString()} kg</p>
          <span className="text-[10px] text-slate-500">Gross intake register</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified Input</span>
          <p className="text-xl font-mono font-bold text-emerald-700 mt-1">{verifiedInputKg.toLocaleString()} kg</p>
          <span className="text-[10px] text-emerald-600 font-medium">Passed gate tolerance</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Verification</span>
          <p className="text-xl font-mono font-bold text-amber-700 mt-1">{pendingVerificationKg.toLocaleString()} kg</p>
          <span className="text-[10px] text-amber-600">On weighbridge apron</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Variance Detected</span>
          <p className="text-xl font-mono font-bold text-red-600 mt-1">{varianceDetectedKg.toLocaleString()} kg</p>
          <span className="text-[10px] text-red-600 font-medium">Flagged for audit</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Processing Queue</span>
          <p className="text-xl font-mono font-bold text-blue-700 mt-1">{processingQueueKg.toLocaleString()} kg</p>
          <span className="text-[10px] text-blue-600">Awaiting AI segregation</span>
        </div>
      </div>

      {/* Visual Municipal Waste Flow Chain */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Traceable Municipal Mass Balance Chain</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">End-to-End Conservation of Mass</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">1. Collection Weight</span>
            <p className="text-base font-mono font-bold text-slate-900">8,760 kg</p>
            <span className="text-[10px] text-slate-400 block">Logged at pickups</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] text-emerald-800 uppercase font-bold">2. Facility Input Weight</span>
            <p className="text-base font-mono font-bold text-emerald-800">8,574 kg</p>
            <span className="text-[10px] text-emerald-600 block">Net weighbridge tare</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[10px] text-blue-800 uppercase font-bold">3. Processed Weight</span>
            <p className="text-base font-mono font-bold text-blue-800">8,420 kg</p>
            <span className="text-[10px] text-blue-600 block">Fed to sorting lines</span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
            <span className="text-[10px] text-teal-800 uppercase font-bold">4. Recovered Output</span>
            <p className="text-base font-mono font-bold text-teal-800">6,240 kg</p>
            <span className="text-[10px] text-teal-600 block">Circular commodities</span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] text-purple-800 uppercase font-bold">5. Final Safe Disposal</span>
            <p className="text-base font-mono font-bold text-purple-800">2,180 kg</p>
            <span className="text-[10px] text-purple-600 block">Secured landfill/TSDF</span>
          </div>
        </div>
      </div>

      {/* Incoming Truck Weighing Ledger & Verification */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Incoming Truck Weighing Logs</h3>
            <p className="text-xs text-slate-500">
              Select a batch below to audit weighbridge receipts and downstream segregation streams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search truck, collector, batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 w-48 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Batches</option>
              <option value="verified">Verified (&le; {toleranceThreshold}%)</option>
              <option value="investigation">Audit Needed (&gt; {toleranceThreshold}%)</option>
            </select>
          </div>
        </div>

        {/* Table of Batches */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Batch / Truck</th>
                <th className="p-3.5">Source & Collector</th>
                <th className="p-3.5">Collection Weight</th>
                <th className="p-3.5">Facility Input</th>
                <th className="p-3.5">Variance Check</th>
                <th className="p-3.5">Receiving Time</th>
                <th className="p-3.5">Audit Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map(batch => {
                const isSelected = selectedBatch.id === batch.id;
                const isOverTolerance = batch.variancePercentage > toleranceThreshold;
                const statusBadgeClass = isOverTolerance
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                return (
                  <tr 
                    key={batch.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/40 font-medium' : ''}`}
                  >
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                          <span>{batch.id}</span>
                          {batch.isDemoBatch && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-purple-100 text-purple-800 rounded font-sans uppercase font-bold">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <TruckIcon className="w-3 h-3 text-slate-400" />
                          <span>Truck: {batch.sourceTruckIds.join(', ')}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="text-slate-900 font-medium">{batch.collectorName}</div>
                      <div className="text-[11px] text-slate-500 truncate" title={batch.sourceDescription}>
                        {batch.sourceDescription}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700">
                      <strong>{batch.collectionWeightKg.toLocaleString()} kg</strong>
                    </td>

                    <td className="p-3.5 font-mono text-slate-900">
                      <strong>{batch.facilityInputWeightKg.toLocaleString()} kg</strong>
                      {batch.truckWeightBeforeDisposalKg && (
                        <span className="text-[10px] text-slate-400 block">
                          Gross {batch.truckWeightBeforeDisposalKg} kg · Tare {batch.truckWeightAfterUnloadingKg} kg
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className={`flex items-center gap-1 font-bold ${isOverTolerance ? 'text-red-600' : 'text-slate-700'}`}>
                        <span>{batch.varianceKg} kg</span>
                        <span className="text-[11px] font-normal text-slate-500">({batch.variancePercentage}%)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Tolerance: &le; {toleranceThreshold.toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 text-[11px]">
                      {batch.createdAt}
                      <span className="text-[10px] text-slate-400 block">{batch.facilityName.split('(')[0]}</span>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass}`}>
                        {isOverTolerance ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>INVESTIGATION REQUIRED</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>VERIFIED</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectBatch(batch)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? 'Auditing Batch' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Batch Detailed Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono">SELECTED AUDIT DOSSIER:</span>
              <h3 className="text-sm font-bold text-slate-900 font-mono">{selectedBatch.id}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{selectedBatch.wasteType}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              selectedBatch.variancePercentage > toleranceThreshold
                ? 'bg-red-100 text-red-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {selectedBatch.variancePercentage > toleranceThreshold
                ? '⚠ Gate Scale Variance Exceeds Municipal Tolerance'
                : '✓ Gate Scale Mass Verified'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Weighbridge Math</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Collection Sum:</span>
              <strong className="font-mono text-slate-900">{selectedBatch.collectionWeightKg} kg</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Facility Gate Scale:</span>
              <strong className="font-mono text-slate-900">{selectedBatch.facilityInputWeightKg} kg</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1">
              <span className="text-slate-600 font-medium">Variance (Loss/Gain):</span>
              <strong className={`font-mono ${selectedBatch.variancePercentage > toleranceThreshold ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                {selectedBatch.varianceKg} kg ({selectedBatch.variancePercentage}%)
              </strong>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Logistics & Manifest</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Collector:</span>
              <span className="font-medium text-slate-800">{selectedBatch.collectorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Truck:</span>
              <span className="font-mono font-bold text-slate-800">{selectedBatch.sourceTruckIds.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="text-slate-800 truncate" title={selectedBatch.facilityName}>{selectedBatch.facilityName.split('(')[0]}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Downstream Transition</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Segregation Status:</span>
              <span className="font-semibold text-blue-700 capitalize">{selectedBatch.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recoverable Potential:</span>
              <span className="font-mono font-bold text-emerald-700">{selectedBatch.recoveredWeightKg} kg ({Math.round((selectedBatch.recoveredWeightKg / selectedBatch.facilityInputWeightKg) * 100)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Est. Final Disposal:</span>
              <span className="font-mono text-slate-700">{selectedBatch.disposalWeightKg} kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
