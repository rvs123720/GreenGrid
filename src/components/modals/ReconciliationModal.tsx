import React, { useState } from 'react';
import { ReconciliationRecord } from '../../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Scale, 
  FileText, 
  AlertTriangle,
  Clock,
  Truck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface ReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: ReconciliationRecord;
  onResolve: (recordId: string, actionTaken: string, resolutionNotes: string) => void;
}

export const ReconciliationModal: React.FC<ReconciliationModalProps> = ({
  isOpen,
  onClose,
  record,
  onResolve,
}) => {
  if (!isOpen || !record) return null;

  const [resolutionAction, setResolutionAction] = useState('moisture_loss');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    let actionDescription = 'Moisture evaporation and rain soak adjustment verified.';
    if (resolutionAction === 'calibration') {
      actionDescription = 'Weighbridge load-cell recalibrated (zero-tare adjusted). Variance accounted.';
    } else if (resolutionAction === 'driver_audit') {
      actionDescription = 'Driver telematics and en-route route stops reviewed; residual waste confirmed cleared at transfer bay.';
    }

    onResolve(record.id, actionDescription, customNotes || 'Supervisor clearance authorized by Municipal Command Center.');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-100 text-red-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Municipal Reconciliation Investigation
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                  {record.slipId}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Automatic weighbridge audit flagged variance exceeding ±5% municipal threshold
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Comparison Metrics Banner */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Collected On-Route</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{record.collectedKg.toLocaleString()} kg</p>
              <p className="text-[10px] text-slate-500">Sum of digital bins / pickups</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Disposed at Yard</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{record.disposedKg.toLocaleString()} kg</p>
              <p className="text-[10px] text-slate-500">Gross Tare Net scale</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Discrepancy (Variance)</p>
              <p className="text-xl font-bold text-red-600 mt-0.5">+{record.diffKg} kg</p>
              <p className="text-[10px] text-red-500 font-medium">18.4% variance</p>
            </div>
          </div>

          {/* Vehicle & Facility Telematics */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Truck ID:</span>
                <span className="font-mono font-bold text-slate-800">{record.truckId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Driver:</span>
                <span className="font-medium text-slate-800">{record.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{record.timestamp}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility Station:</span>
                <span className="font-semibold text-slate-800">{record.yardName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Weighbridge Bay:</span>
                <span className="font-mono text-slate-800">BAY-03 (South)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operator ID:</span>
                <span className="font-mono text-slate-800">#WB-881</span>
              </div>
            </div>
          </div>

          {/* Root Cause Reason */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Automated Flagging Reason
            </p>
            <p className="text-slate-700">
              {record.investigationDetails?.reason || 'Payload discrepancy between mobile onboard scale and transfer station static weighbridge.'}
            </p>
          </div>

          {/* Resolution Options Form */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Audit Resolution Action
            </p>

            <div className="grid grid-cols-3 gap-2">
              <label 
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                  resolutionAction === 'moisture_loss'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="action" 
                  className="sr-only" 
                  checked={resolutionAction === 'moisture_loss'} 
                  onChange={() => setResolutionAction('moisture_loss')} 
                />
                <span className="font-bold">Moisture Loss / Leachate</span>
                <span className="text-[10px] text-slate-500 mt-1">High-density wet organic loss during transit</span>
              </label>

              <label 
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                  resolutionAction === 'calibration'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="action" 
                  className="sr-only" 
                  checked={resolutionAction === 'calibration'} 
                  onChange={() => setResolutionAction('calibration')} 
                />
                <span className="font-bold">Weighbridge Zero-Drift</span>
                <span className="text-[10px] text-slate-500 mt-1">Tare drift recorded at Yard #03 sensor head</span>
              </label>

              <label 
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                  resolutionAction === 'driver_audit'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input 
                  type="radio" 
                  name="action" 
                  className="sr-only" 
                  checked={resolutionAction === 'driver_audit'} 
                  onChange={() => setResolutionAction('driver_audit')} 
                />
                <span className="font-bold">Manual Driver Clearance</span>
                <span className="text-[10px] text-slate-500 mt-1">Confirmed complete discharge verified by supervisor</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Supervisor Audit Sign-Off Notes:
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g., Variance accounted for. Authorizing reconciliation clearance."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            Resolving marks the transaction as Verified and discharges supervisor alert.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              id="resolve-audit-confirm-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sign-Off &amp; Resolve Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
