import React from 'react';
import { UserRole, SystemAlert } from '../types';
import { 
  LayoutDashboard, 
  Truck, 
  User, 
  Activity, 
  MapPin, 
  FileSpreadsheet, 
  Sparkles,
  RotateCcw,
  Radio,
  Clock
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeAlerts: SystemAlert[];
  onOpenAudit?: () => void;
  onResetData: () => void;
  activeSubView?: string;
  onSelectSubView?: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onRoleChange,
  activeAlerts,
  onOpenAudit,
  onResetData,
  activeSubView,
  onSelectSubView,
}) => {
  const discrepancyAlert = activeAlerts.find(a => a.type === 'discrepancy');
  const capacityAlert = activeAlerts.find(a => a.type === 'capacity');

  return (
    <aside className="w-56 bg-slate-900 flex flex-col p-4 flex-shrink-0 select-none">
      {/* Operational Views Section */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-3 px-2 tracking-wider">
          Operational Views
        </p>

        {/* Admin Link */}
        <button
          id="sidebar-nav-admin"
          onClick={() => onRoleChange('admin')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
            currentRole === 'admin'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Admin Dashboard</span>
        </button>

        {/* Collector Link */}
        <button
          id="sidebar-nav-collector"
          onClick={() => onRoleChange('collector')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
            currentRole === 'collector'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Collector Hub</span>
        </button>

        {/* Customer Link */}
        <button
          id="sidebar-nav-customer"
          onClick={() => onRoleChange('customer')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
            currentRole === 'customer'
              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">Customer Portal</span>
        </button>
      </div>

      {/* Role-specific Contextual Shortcuts */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-2 tracking-wider">
          {currentRole === 'admin' && 'Command Controls'}
          {currentRole === 'collector' && 'TR-07 Controls'}
          {currentRole === 'customer' && 'Eco Services'}
        </p>

        {currentRole === 'admin' && (
          <div className="space-y-1 text-xs">
            <button
              onClick={() => onSelectSubView?.('fleet')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Fleet Monitor
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">6 Units</span>
            </button>
            <button
              onClick={() => onSelectSubView?.('reconciliation')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                Reconciliation Matrix
              </span>
              {discrepancyAlert && (
                <span className="text-[10px] bg-red-900/60 text-red-300 px-1.5 py-0.5 rounded font-bold">1 Alert</span>
              )}
            </button>
            <button
              onClick={() => onSelectSubView?.('iot')}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Smart IoT Bins
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">6 Nodes</span>
            </button>
          </div>
        )}

        {currentRole === 'collector' && (
          <div className="space-y-1 text-xs">
            <div className="px-2.5 py-2 rounded-md bg-slate-800/40 border border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-300 font-mono mb-1">
                <span>Truck Unit:</span>
                <span className="font-bold text-white">TR-07</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                <span>Driver:</span>
                <span className="text-emerald-400">Ravi Kumar</span>
              </div>
            </div>
          </div>
        )}

        {currentRole === 'customer' && (
          <div className="space-y-1 text-xs">
            <div className="px-2.5 py-2 rounded-md bg-emerald-950/40 border border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Eco-Rewards Balance
              </div>
              <p className="text-lg font-bold text-white">480 pts</p>
              <p className="text-[10px] text-emerald-300">Equivalent to ₹240 utility waiver</p>
            </div>
          </div>
        )}
      </div>

      {/* Active Alerts Panel (matching high-density mockup design) */}
      <div className="mt-auto pt-4">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Active Alerts ({activeAlerts.length})
            </p>
            <Clock className="w-3 h-3 text-slate-400" />
          </div>

          {discrepancyAlert ? (
            <div 
              onClick={onOpenAudit}
              className="flex items-start gap-2 mb-2.5 cursor-pointer hover:bg-slate-700/50 p-1 rounded transition-colors"
              title="Click to open Discrepancy Investigation"
            >
              <div className="w-2 h-2 mt-1 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
              <div>
                <p className="text-[11px] text-slate-200 leading-tight font-medium">
                  Discrepancy: TR-03 at Yard #03 (+168kg)
                </p>
                <span className="text-[9px] text-red-400 underline font-semibold">Audit Required →</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-[11px]">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Reconciliation clean</span>
            </div>
          )}

          {capacityAlert && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 mt-1 rounded-full bg-amber-500 flex-shrink-0"></div>
              <p className="text-[11px] text-slate-300 leading-tight">
                TR-21 capacity near limit (92%)
              </p>
            </div>
          )}
        </div>

        {/* Prototype Reset Button */}
        <button
          onClick={onResetData}
          className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-md transition-colors border border-slate-800"
          title="Reset to default seed data"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Prototype Data</span>
        </button>
      </div>
    </aside>
  );
};
