import React from 'react';
import { AIApplicationSimulations } from '../../../types';
import { 
  Cpu, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar,
  Layers,
  Activity,
  Zap
} from 'lucide-react';

interface AIMLApplicationsPanelProps {
  simulations: AIApplicationSimulations;
  onInvestigateBatch?: (batchId: string) => void;
}

export const AIMLApplicationsPanel: React.FC<AIMLApplicationsPanelProps> = ({
  simulations,
  onInvestigateBatch,
}) => {
  const { wasteGenerationPrediction, classificationConfidence, quantityAnomalies, predictiveMaintenance } = simulations;

  return (
    <div className="space-y-6">
      {/* Title & Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
              Simulated Intelligence Layer
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI & Machine Learning Operational Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive forecasting, edge vision classification telemetry, statistical anomaly detection, and equipment health.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900">
          <Cpu className="w-3.5 h-3.5 text-amber-700" />
          <span>SIMULATION MODE (Edge API Stubbed)</span>
        </div>
      </div>

      {/* Grid of 4 AI Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Waste Generation Prediction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">1. Waste Generation Forecasting</h3>
                <span className="text-[10px] text-slate-400">ARIMA + Weather Ensemble Model</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
              Confidence: {wasteGenerationPrediction.confidencePercent}%
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Forecasted Volume ({wasteGenerationPrediction.tomorrowDate})</span>
              <strong className="text-xl font-mono font-bold text-slate-900">
                {wasteGenerationPrediction.expectedKg.toLocaleString()} kg
              </strong>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.2% vs 7-Day Avg</span>
              </span>
              <span className="text-[10px] text-slate-400 block">High residential generation</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Recommends deploying 2 extra reserve collection trucks to South Ward #174 (Begur-Koppa) during 07:00–10:00 morning shift.
          </p>
        </div>

        {/* 2. Classification Confidence Model */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">2. Real-Time NIR Classification Confidence</h3>
                <span className="text-[10px] text-slate-400">Edge Convolutional Spectroscopy</span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-emerald-700 font-bold">
              Avg: 88.5%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Wet Organics</span>
              <strong className="font-mono text-emerald-700">{classificationConfidence.wetWaste}%</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Plastic Polymers</span>
              <strong className="font-mono text-blue-700">{classificationConfidence.plastic}%</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Combustibles</span>
              <strong className="font-mono text-amber-700">{classificationConfidence.dryWaste}%</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Hazardous Class II</span>
              <strong className="font-mono text-red-700">{classificationConfidence.hazardous}%</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Solvent Chemistry</span>
              <strong className="font-mono text-purple-700">{classificationConfidence.chemical}%</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Pozzolanic Ash</span>
              <strong className="font-mono text-slate-700">{classificationConfidence.ash}%</strong>
            </div>
          </div>
        </div>

        {/* 3. Quantity & Composition Anomaly Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">3. Statistical Anomaly Detection</h3>
                <span className="text-[10px] text-slate-400">Mass Loss & Ward Profiling</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
              {quantityAnomalies.length} Flagged
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {quantityAnomalies.map((anom, idx) => (
              <div key={idx} className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                <div className="flex justify-between items-start">
                  <strong className="font-mono text-red-900">{anom.batchId}</strong>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-red-200 text-red-900 rounded">
                    {anom.variancePercent}% Variance
                  </span>
                </div>
                <p className="text-[11px] text-red-800">{anom.message}</p>
                <div className="flex justify-between items-center text-[10px] text-red-600 pt-1">
                  <span>Source: {anom.source}</span>
                  <button
                    onClick={() => onInvestigateBatch && onInvestigateBatch(anom.batchId)}
                    className="font-bold underline cursor-pointer"
                  >
                    Open Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Predictive Equipment Maintenance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">4. Predictive Machine Health Telematics</h3>
                <span className="text-[10px] text-slate-400">Vibration & Temperature Telemetry</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 font-mono">
              4 Monitored Assets
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {predictiveMaintenance.map(item => {
              const isHigh = item.risk === 'high';
              const isMedium = item.risk === 'medium';

              return (
                <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <strong className="text-slate-900 text-xs block">{item.equipmentName}</strong>
                    <span className="text-[10px] text-slate-400">{item.facilityName} · Inspected {item.lastInspected}</span>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isHigh ? 'bg-red-100 text-red-800' : isMedium ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.healthScorePercent}% Health
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Service in {item.predictedMaintenanceDays} days
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
