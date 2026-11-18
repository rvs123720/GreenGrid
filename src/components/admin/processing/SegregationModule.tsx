import React, { useState } from 'react';
import { ProcessingBatch, SegregationRecord, ProcessingStreamCategory } from '../../../types';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Droplet, 
  Flame, 
  Recycle, 
  Skull, 
  FlaskConical, 
  Mountain, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  BarChart2
} from 'lucide-react';

interface SegregationModuleProps {
  batch: ProcessingBatch;
  batches: ProcessingBatch[];
  onSelectBatch: (b: ProcessingBatch) => void;
  onNavigateToStreams?: () => void;
}

export const SegregationModule: React.FC<SegregationModuleProps> = ({
  batch,
  batches,
  onSelectBatch,
  onNavigateToStreams,
}) => {
  const segregation = batch.segregation;

  if (!segregation) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 text-xs">No segregation record found for this batch.</p>
      </div>
    );
  }

  // Mass Balance Check (Control Point 2)
  const sumCategoriesKg = 
    segregation.wetKg + 
    segregation.dryKg + 
    segregation.plasticKg + 
    segregation.hazardousKg + 
    segregation.chemicalKg + 
    segregation.ashKg;
  
  const massBalanceDifferenceKg = Math.abs(segregation.inputWeightKg - sumCategoriesKg);
  const isMassBalanceVerified = massBalanceDifferenceKg <= 1; // within 1 kg roundoff

  // Category Configuration
  const categories: Array<{
    id: ProcessingStreamCategory;
    name: string;
    weightKg: number;
    pct: number;
    expectedPct: number;
    route: string;
    icon: any;
    color: string;
    badgeBg: string;
    badgeText: string;
    barColor: string;
    confidence: number;
  }> = [
    {
      id: 'wet',
      name: 'Wet Waste (Organics)',
      weightKg: segregation.wetKg,
      pct: segregation.wetPct,
      expectedPct: segregation.expectedComposition.wet,
      route: 'ZLD / Water Treatment Process',
      icon: Droplet,
      color: 'text-emerald-700',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-600',
      confidence: segregation.confidence.wet,
    },
    {
      id: 'dry',
      name: 'Dry Waste (Combustibles)',
      weightKg: segregation.dryKg,
      pct: segregation.dryPct,
      expectedPct: segregation.expectedComposition.dry,
      route: 'Power Generation / Energy Recovery',
      icon: Flame,
      color: 'text-amber-700',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800 border-amber-200',
      barColor: 'bg-amber-500',
      confidence: segregation.confidence.dry,
    },
    {
      id: 'plastic',
      name: 'Plastic Waste (Polymers)',
      weightKg: segregation.plasticKg,
      pct: segregation.plasticPct,
      expectedPct: segregation.expectedComposition.plastic,
      route: 'Recycling / Non-Hazardous Plastic',
      icon: Recycle,
      color: 'text-blue-700',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-800 border-blue-200',
      barColor: 'bg-blue-600',
      confidence: segregation.confidence.plastic,
    },
    {
      id: 'hazardous',
      name: 'Hazardous Waste',
      weightKg: segregation.hazardousKg,
      pct: segregation.hazardousPct,
      expectedPct: segregation.expectedComposition.hazardous,
      route: 'Safe Collection → Authorized TSDF',
      icon: Skull,
      color: 'text-red-700',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-800 border-red-200',
      barColor: 'bg-red-600',
      confidence: segregation.confidence.hazardous,
    },
    {
      id: 'chemical',
      name: 'Chemical Waste',
      weightKg: segregation.chemicalKg,
      pct: segregation.chemicalPct,
      expectedPct: segregation.expectedComposition.chemical,
      route: 'Recovery Assessment → Reuse OR Safe Disposal',
      icon: FlaskConical,
      color: 'text-purple-700',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800 border-purple-200',
      barColor: 'bg-purple-600',
      confidence: segregation.confidence.chemical,
    },
    {
      id: 'ash',
      name: 'Burnt Waste / Ash',
      weightKg: segregation.ashKg,
      pct: segregation.ashPct,
      expectedPct: segregation.expectedComposition.ash,
      route: 'Quality Testing → Construction OR Landfill',
      icon: Mountain,
      color: 'text-slate-700',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-800 border-slate-200',
      barColor: 'bg-slate-500',
      confidence: segregation.confidence.ash,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Batch Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Control Point 2
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI/ML Waste Segregation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically classify incoming waste into processing streams and verify mass conservation.
          </p>
        </div>

        {/* Batch Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Auditing Batch:</span>
          <select
            value={batch.id}
            onChange={(e) => {
              const found = batches.find(b => b.id === e.target.value);
              if (found) onSelectBatch(found);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} ({b.facilityInputWeightKg} kg {b.isDemoBatch ? '— 1,000kg Demo' : ''})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Explicit AI/ML SIMULATION Notice Banner */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-700" />
            <span>AI/ML SIMULATION MODE ACTIVATED</span>
          </strong>
          <p className="text-[11px] text-amber-800">
            This module runs simulated computer-vision classification and anomaly detection. 
            The microservice architecture is prepared for direct drop-in integration with real-time conveyor NIR spectroscopy, camera edge inference, and optical sorter telematics.
          </p>
        </div>
      </div>

      {/* Batch Dossier & Mass Balance Check Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 font-mono">Batch: {batch.id}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Classification Status: Completed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Facility: {batch.facilityName} · Trucks: {batch.sourceTruckIds.join(', ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold font-mono ${
              isMassBalanceVerified
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {isMassBalanceVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mass Balance Verified ✓ ({segregation.inputWeightKg} kg = {sumCategoriesKg} kg)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Mass Balance Variance: {massBalanceDifferenceKg} kg ⚠</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stacked Proportional Stream Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600">
            <span className="font-semibold">Stream Allocation ({segregation.inputWeightKg.toLocaleString()} kg Total Input):</span>
            <span className="font-mono text-slate-500">100% Accounted</span>
          </div>
          <div className="w-full h-4 rounded-lg overflow-hidden flex shadow-2xs">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`${cat.barColor} transition-all hover:opacity-90`}
                style={{ width: `${cat.pct}%` }}
                title={`${cat.name}: ${cat.weightKg} kg (${cat.pct}%)`}
              />
            ))}
          </div>

          {/* Stream Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-[11px]">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${cat.barColor}`} />
                <span className="text-slate-600 font-medium truncate">{cat.name.split(' ')[0]}:</span>
                <strong className="font-mono text-slate-900">{cat.weightKg} kg</strong>
                <span className="text-slate-400 font-mono">({cat.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segregation Stream Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          const deviation = Math.round((cat.pct - cat.expectedPct) * 10) / 10;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${cat.badgeBg} ${cat.color} flex items-center justify-center font-bold`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{cat.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Model Confidence: {cat.confidence}%</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-mono font-bold text-slate-900">{cat.weightKg} kg</span>
                  <span className="text-[11px] text-slate-500 font-mono block">{cat.pct}% of batch</span>
                </div>
              </div>

              {/* Processing Route Badge */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                  Downstream Processing Route
                </span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {cat.route}
                </span>
              </div>

              {/* Composition Deviation Check */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                <span>Expected Municipal Baseline:</span>
                <span className="font-mono">
                  {cat.expectedPct}%{' '}
                  <span className={deviation > 0 ? 'text-amber-600 font-semibold' : deviation < 0 ? 'text-blue-600 font-semibold' : 'text-slate-400'}>
                    ({deviation > 0 ? `+${deviation}%` : `${deviation}%`})
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI/ML Segregation Anomaly Detection Card */}
      {segregation.anomalyDetected && (
        <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-red-900">
                  AI Anomaly Detection: Composition Deviation Detected
                </h3>
                <p className="text-[11px] text-red-700">
                  Simulated neural autoencoder flagged a statistical variance from historic municipal ward profiles.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-red-200 text-red-900">
              Status: ⚠ Review Recommended
            </span>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-red-100 text-xs text-red-950 font-medium">
            <p>{segregation.anomalyMessage || 'Hazardous waste proportion exceeds historical ward baseline by +2.0%.'}</p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-red-800 font-mono">
            <span>Neural Anomaly Score: {segregation.anomalyScore} (Threshold: &ge; 0.15)</span>
            <span>Batch ID: {batch.id}</span>
          </div>
        </div>
      )}
    </div>
  );
};
