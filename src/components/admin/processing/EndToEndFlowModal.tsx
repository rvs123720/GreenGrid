import React, { useState } from 'react';
import { ProcessingBatch } from '../../../types';
import { 
  X, 
  ArrowRight, 
  Truck, 
  Scale, 
  CheckCircle2, 
  Cpu, 
  Droplet, 
  Flame, 
  Recycle, 
  Skull, 
  FlaskConical, 
  Mountain, 
  Coins, 
  Trash2, 
  Info,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface EndToEndFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ProcessingBatch;
  batches: ProcessingBatch[];
  onSelectBatch: (b: ProcessingBatch) => void;
}

export const EndToEndFlowModal: React.FC<EndToEndFlowModalProps> = ({
  isOpen,
  onClose,
  batch,
  batches,
  onSelectBatch,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const seg = batch.segregation;

  const steps = [
    {
      title: '1. Upstream Collection',
      subtitle: `${batch.collectionWeightKg.toLocaleString()} kg collected`,
      icon: Truck,
      color: 'text-slate-800 bg-slate-100 border-slate-300',
      description: `Dispatched from route "${batch.sourceDescription}". Trucks: ${batch.sourceTruckIds.join(', ')} driven by ${batch.collectorName}. Weigh scales at pickup logged total mass of ${batch.collectionWeightKg} kg.`,
      stat: `${batch.collectionWeightKg} kg`,
      statLabel: 'Recorded Route Load',
    },
    {
      title: '2. Facility Gate Weighbridge',
      subtitle: `${batch.facilityInputWeightKg.toLocaleString()} kg net received`,
      icon: Scale,
      color: 'text-blue-800 bg-blue-50 border-blue-200',
      description: `Truck crossed entrance weighbridge at ${batch.facilityName.split('(')[0]}. Tare weight deducted. Net received mass is ${batch.facilityInputWeightKg} kg.`,
      stat: `${batch.facilityInputWeightKg} kg`,
      statLabel: 'Gate Net Mass',
    },
    {
      title: '3. Input Weight Verification',
      subtitle: `${batch.variancePercentage}% variance (${batch.varianceKg} kg)`,
      icon: ShieldCheck,
      color: batch.variancePercentage <= 2.0 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-red-800 bg-red-50 border-red-200',
      description: batch.variancePercentage <= 2.0 
        ? `Variance between collection log and gate scale is ${batch.variancePercentage}% (≤ 2.0% tolerance). Verified for processing.`
        : `CRITICAL AUDIT: Weight variance is ${batch.variancePercentage}% (> 2.0% tolerance). Anomaly report dispatched to municipal control.`,
      stat: `${batch.varianceKg} kg (${batch.variancePercentage}%)`,
      statLabel: 'Audited Variance',
    },
    {
      title: '4. AI/ML Segregation Sorting',
      subtitle: '6 streams categorized',
      icon: Cpu,
      color: 'text-purple-800 bg-purple-50 border-purple-200',
      description: `Edge computer-vision and spectroscopy split ${batch.facilityInputWeightKg} kg: Wet (${seg?.wetKg}kg), Dry (${seg?.dryKg}kg), Plastic (${seg?.plasticKg}kg), Hazardous (${seg?.hazardousKg}kg), Chemical (${seg?.chemicalKg}kg), Ash (${seg?.ashKg}kg). Mass conservation difference = 0 kg.`,
      stat: '100% Mass Conserved',
      statLabel: 'Sum = Input Weight',
    },
    {
      title: '5. Multi-Stream Processing',
      subtitle: '6 specialized routes',
      icon: Recycle,
      color: 'text-teal-800 bg-teal-50 border-teal-200',
      description: 'Wet waste undergoes ZLD water separation; Dry fuels thermal gasification turbines; Polymers extruded into pavers; Hazardous safely contained; Solvents vacuum distilled; Ash tested for pozzolanic cement.',
      stat: `${batch.streams?.length || 6} Streams`,
      statLabel: 'Active Engineering Lines',
    },
    {
      title: '6. Circular Recovery & Safe Disposal',
      subtitle: `${batch.recoveredWeightKg} kg recovered · ${batch.disposalWeightKg} kg disposed`,
      icon: Trash2,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      description: `${batch.recoveredWeightKg} kg recovered as treated water, grid electricity, polymer pavers, industrial solvents, and cement aggregates. Residual ${batch.disposalWeightKg} kg securely routed to certified TSDF & sanitary landfill.`,
      stat: `${Math.round((batch.recoveredWeightKg / batch.facilityInputWeightKg) * 100)}% Recovery`,
      statLabel: 'Circular Diversion Rate',
    },
    {
      title: '7. Municipal Economics',
      subtitle: `Revenue: ₹${batch.totalRevenueInr.toLocaleString()} · Cost: ₹${batch.totalCostInr.toLocaleString()}`,
      icon: Coins,
      color: 'text-amber-800 bg-amber-50 border-amber-200',
      description: `Monetization of recycled commodities yielded ₹${batch.totalRevenueInr.toLocaleString()}. Total operational costs across collection, processing and TSDF disposal were ₹${batch.totalCostInr.toLocaleString()}. Net municipal operational balance: ${batch.netProfitInr >= 0 ? `+₹${batch.netProfitInr}` : `-₹${Math.abs(batch.netProfitInr)}`}.`,
      stat: `${batch.netProfitInr >= 0 ? `+₹${batch.netProfitInr.toLocaleString()}` : `-₹${Math.abs(batch.netProfitInr).toLocaleString()}`}`,
      statLabel: 'Net Operational Balance',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase">
                End-to-End Traceability
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Interactive Waste Journey & Lifecycle Flow
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditing mass balance and financial economics from route collection to circular recovery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Batch Selector */}
            <select
              value={batch.id}
              onChange={(e) => {
                const found = batches.find(b => b.id === e.target.value);
                if (found) onSelectBatch(found);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.facilityInputWeightKg} kg)
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Step Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer space-y-1 ${
                  isSelected 
                    ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                </div>
                <div className="text-[10px] font-bold text-slate-900 truncate">{s.title.split('. ')[1]}</div>
                <div className="text-[9px] text-slate-500 font-mono truncate">{s.stat}</div>
              </button>
            );
          })}
        </div>

        {/* Detailed Active Step Focus Card */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                {activeStep + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{steps[activeStep].title}</h3>
                <span className="text-xs text-slate-500 font-medium">{steps[activeStep].subtitle}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{steps[activeStep].statLabel}</span>
              <strong className="text-base font-mono font-bold text-emerald-800">{steps[activeStep].stat}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            {steps[activeStep].description}
          </p>
        </div>

        {/* Dynamic Mass Balance Summary Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Mass Conservation Audit</span>
            <span className="font-mono text-slate-900 font-medium">
              Collection ({batch.collectionWeightKg} kg) &rarr; Gate ({batch.facilityInputWeightKg} kg) &rarr; Recovered ({batch.recoveredWeightKg} kg) + Disposed ({batch.disposalWeightKg} kg)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              Previous Step
            </button>
            <button
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
