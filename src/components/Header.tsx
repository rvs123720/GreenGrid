import React from 'react';
import { UserRole, SystemAlert } from '../types';
import { 
  Recycle, 
  ShieldAlert, 
  RefreshCw, 
  Truck, 
  User, 
  Building2, 
  CheckCircle2, 
  Bell,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeAlerts: SystemAlert[];
  onOpenAudit?: () => void;
  onResetData: () => void;
  isSyncing: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeAlerts,
  onOpenAudit,
  onResetData,
  isSyncing,
  onRefresh,
}) => {
  const discrepancyAlert = activeAlerts.find(a => a.type === 'discrepancy');

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <div className="bg-emerald-600 p-1.5 rounded-lg flex items-center justify-center text-white shadow-sm">
          <Recycle className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-lg tracking-tight text-slate-900">EcoTrack</span>
          <span className="hidden sm:inline-block h-4 w-[1px] bg-slate-200 mx-1"></span>
          <span className="hidden md:inline-block text-slate-500 font-medium text-xs uppercase tracking-wider">
            {currentRole === 'admin' && 'Municipal Command Center'}
            {currentRole === 'collector' && 'Collector Operations Hub'}
            {currentRole === 'customer' && 'Resident Eco-Portal'}
          </span>
        </div>
      </div>

      {/* Center Role Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2">
        <nav className="flex gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            id="role-btn-admin"
            onClick={() => onRoleChange('admin')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            id="role-btn-collector"
            onClick={() => onRoleChange('collector')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              currentRole === 'collector'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Collector Hub</span>
          </button>

          <button
            id="role-btn-customer"
            onClick={() => onRoleChange('customer')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${
              currentRole === 'customer'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Resident</span>
          </button>
        </nav>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Discrepancy indicator badge */}
        {discrepancyAlert && (
          <button
            id="header-discrepancy-badge"
            onClick={onOpenAudit}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 text-xs font-bold transition-colors animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>TR-03 Discrepancy (+168kg)</span>
          </button>
        )}

        {/* Sync / Refresh button */}
        <button
          id="header-refresh-btn"
          onClick={onRefresh}
          title="Refresh real-time telemetry"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* User Identity Info */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {currentRole === 'admin' && 'A. Kulkarni'}
              {currentRole === 'collector' && 'Ravi Kumar'}
              {currentRole === 'customer' && 'Pooja Sharma'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {currentRole === 'admin' && 'ID: #ADM-422'}
              {currentRole === 'collector' && 'Unit: #TR-07'}
              {currentRole === 'customer' && 'Res: #IND-402'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-300 shadow-xs">
            {currentRole === 'admin' && 'AK'}
            {currentRole === 'collector' && 'RK'}
            {currentRole === 'customer' && 'PS'}
          </div>
        </div>
      </div>
    </header>
  );
};
