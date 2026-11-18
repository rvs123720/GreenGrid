import React, { useState } from 'react';
import { 
  AppState, 
  Truck, 
  PickupRequest, 
  ReconciliationRecord, 
  DisposalYard,
  ProcessingFacility,
  ProcessingBatch
} from '../../types';
import { 
  INITIAL_FACILITIES, 
  INITIAL_BATCHES, 
  ProcessingSimulationService 
} from '../../services/processingSimulation';
import { ProcessingCentreOverview } from './processing/ProcessingCentreOverview';
import { WasteReceivingVerification } from './processing/WasteReceivingVerification';
import { SegregationModule } from './processing/SegregationModule';
import { StreamProcessingDetail } from './processing/StreamProcessingDetail';
import { FinancialControlView } from './processing/FinancialControlView';
import { ProfitabilityView } from './processing/ProfitabilityView';
import { EndToEndFlowModal } from './processing/EndToEndFlowModal';
import { AIMLApplicationsPanel } from './processing/AIMLApplicationsPanel';
import { 
  BarChart3, 
  Truck as TruckIcon, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Scale, 
  ShieldCheck, 
  Clock, 
  Filter, 
  ChevronRight, 
  ArrowUpRight, 
  Building2, 
  AlertCircle,
  FileCheck2,
  Users,
  Eye,
  Check,
  Compass,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  X,
  Cpu,
  Recycle,
  Coins,
  Layers,
  Sparkles,
  PieChart,
  Droplet
} from 'lucide-react';

interface AdminDashboardProps {
  state: AppState;
  onRefresh: () => Promise<void>;
  onResolveReconciliation: (recordId: string, actionTaken: string, notes?: string) => Promise<void>;
  onOpenRoleSwitcher: () => void;
}

export type AdminTab = 
  | 'overview' 
  | 'live_map' 
  | 'fleet' 
  | 'requests' 
  | 'reconciliation'
  | 'processing_centres'
  | 'receiving_verification'
  | 'segregation'
  | 'stream_processing'
  | 'financial_control'
  | 'profitability'
  | 'ai_simulations'
  | 'analytics';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  state,
  onRefresh,
  onResolveReconciliation,
  onOpenRoleSwitcher,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(state.trucks[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Downstream Processing State
  const [facilities, setFacilities] = useState<ProcessingFacility[]>(INITIAL_FACILITIES);
  const [batches, setBatches] = useState<ProcessingBatch[]>(INITIAL_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState<ProcessingBatch>(INITIAL_BATCHES[0]);
  const [isFlowModalOpen, setIsFlowModalOpen] = useState<boolean>(false);
  const [aiSimulations, setAiSimulations] = useState(ProcessingSimulationService.getAISimulations());

  // Reconciliation Investigation Modal State
  const [investigatingRecord, setInvestigatingRecord] = useState<ReconciliationRecord | null>(null);
  const [resolutionAction, setResolutionAction] = useState<string>('Sensor recalibration & scale drift offset confirmed');
  const [resolutionNotes, setResolutionNotes] = useState<string>('Inspection at Yard #03 gross tare scale sensor passed.');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigatingRecord) return;
    setIsResolving(true);
    try {
      await onResolveReconciliation(investigatingRecord.id, resolutionAction, resolutionNotes);
      setInvestigatingRecord(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  // Filtered trucks
  const filteredTrucks = state.trucks.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.currentZone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered requests
  const filteredRequests = state.pickups.filter(p => {
    return statusFilter === 'all' || p.status === statusFilter;
  });

  // Discrepancies count
  const discrepancyCount = state.reconciliation.filter(r => r.status === 'investigation_required').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-900">
      {/* Top Municipal Operational Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-slate-900">EcoTrack</span>
              <span className="text-xs text-slate-500 font-medium ml-1">· Municipal Command Center</span>
            </div>
          </div>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <div className="text-xs text-slate-600 font-medium hidden sm:flex items-center gap-2">
            <span>BBMP Solid Waste Management Division</span>
            <span>·</span>
            <span className="text-emerald-700 font-bold">Bangalore Central Telematics Node</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlowModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>View Full Processing Flow</span>
          </button>

          <button
            onClick={handleManualRefresh}
            className="p-1.5 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Poll Telematics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenRoleSwitcher}
            className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer"
          >
            Switch Role
          </button>
        </div>
      </header>

      {/* Municipal Navigation Ribbon */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max text-xs font-medium">
          {/* Operations Group */}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Operations:</span>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'live_map', label: 'Live GIS Map', icon: Compass },
            { id: 'fleet', label: 'Fleet', icon: TruckIcon },
            { id: 'requests', label: 'Requests', icon: FileCheck2 },
            { id: 'reconciliation', label: 'Reconciliation', icon: Scale, badge: discrepancyCount },
            { id: 'analytics', label: 'City Analytics', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setStatusFilter('all');
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge ? (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          <span className="w-px h-5 bg-slate-200 mx-2" />

          {/* Waste Processing & Recovery Group */}
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mr-1">
            Processing & Recovery:
          </span>
          {[
            { id: 'processing_centres', label: 'Centres', icon: Building2 },
            { id: 'receiving_verification', label: 'Receiving & Verification', icon: Scale },
            { id: 'segregation', label: 'AI Segregation', icon: Cpu },
            { id: 'stream_processing', label: '6 Streams', icon: Recycle },
            { id: 'financial_control', label: 'Financial Control', icon: Coins },
            { id: 'profitability', label: 'Profitability', icon: PieChart },
            { id: 'ai_simulations', label: 'AI Intelligence', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setStatusFilter('all');
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                    : 'text-emerald-950 hover:text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Discrepancy Alert Banner if any investigation required */}
        {discrepancyCount > 0 && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-red-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <strong className="text-sm">
                  {discrepancyCount} WEIGHBRIDGE DISCREPANCY REQUIRING AUDIT
                </strong>
                <p className="text-red-800 mt-0.5">
                  Variance between truck cumulative scale weights and weighbridge discharge exceeded regulatory tolerance (+168 kg).
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('reconciliation')}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Inspect Weighbridge Audit Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW                                              */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top 7 KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Collected Today</span>
                <p className="text-xl font-mono font-bold text-slate-900 mt-1">
                  {(state.todayStats.collectedTodayKg).toLocaleString()} kg
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">+8.4% vs yesterday</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Disposed</span>
                <p className="text-xl font-mono font-bold text-slate-900 mt-1">
                  {(state.todayStats.disposedTodayKg).toLocaleString()} kg
                </p>
                <span className="text-[10px] text-slate-500">Certified weighbridge</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active Trucks</span>
                <p className="text-xl font-mono font-bold text-slate-900 mt-1">{state.todayStats.activeTrucks}</p>
                <span className="text-[10px] text-emerald-600">37 fleet units</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Trucks Available</span>
                <p className="text-xl font-mono font-bold text-emerald-700 mt-1">{state.todayStats.trucksAvailable}</p>
                <span className="text-[10px] text-emerald-600">Ready for assignment</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Trucks On Job</span>
                <p className="text-xl font-mono font-bold text-blue-700 mt-1">{state.todayStats.trucksOnJob}</p>
                <span className="text-[10px] text-blue-600">Active collections</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Near Capacity (&ge;90%)</span>
                <p className="text-xl font-mono font-bold text-amber-700 mt-1">
                  {state.trucks.filter(t => (t.currentLoadKg / t.capacityKg) >= 0.9).length}
                </p>
                <span className="text-[10px] text-amber-700">En route to yards</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Audit Discrepancies</span>
                <p className={`text-xl font-mono font-bold mt-1 ${discrepancyCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {discrepancyCount}
                </p>
                <span className="text-[10px] text-red-600">Requires review</span>
              </div>
            </div>

            {/* Split Dashboard Row: Live Operations & Active Disposal Facilities */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Fleet Quick Status (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-tight text-slate-800">
                      Live Fleet Telematics &amp; Axle Loads
                    </h3>
                    <p className="text-[11px] text-slate-500">Real-time status of Bangalore sector units</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('fleet')}
                    className="text-xs text-emerald-700 hover:underline font-semibold"
                  >
                    View all 37 trucks →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs font-mono">
                  {state.trucks.slice(0, 5).map(truck => {
                    const occ = Math.round((truck.currentLoadKg / truck.capacityKg) * 100);
                    return (
                      <div key={truck.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                            occ >= 90 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {truck.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{truck.driverName}</span>
                              <span className="text-[10px] text-slate-400">· {truck.currentZone}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-sans">
                              Plate: {truck.plateNumber} · Speed: {(truck as any).speedKmh || (truck.status === 'collecting' ? 24 : 0)} km/h
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-slate-900">
                            {truck.currentLoadKg} / {truck.capacityKg} kg ({occ}%)
                          </span>
                          <span className={`block text-[10px] uppercase font-bold font-sans ${
                            truck.status === 'near_capacity' ? 'text-amber-600' :
                            truck.status === 'collecting' ? 'text-blue-600' :
                            'text-emerald-600'
                          }`}>
                            {truck.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Authorized Disposal Facilities (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-tight text-slate-800">
                    Municipal Disposal Yards Status
                  </h3>
                  <p className="text-[11px] text-slate-500">Live weighbridge reception capacities</p>
                </div>

                <div className="space-y-3">
                  {state.disposalYards.map(yard => (
                    <div key={yard.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 block font-semibold">{yard.name}</strong>
                          <span className="text-[10px] text-slate-500">{yard.address}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {(yard.status || 'operational').toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Bay Reception:</span>
                        <strong className="text-slate-800">
                          {yard.currentLoadTons} / {yard.capacityTonsPerDay} Tons
                        </strong>
                      </div>

                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.round((yard.currentLoadTons / Math.max(1, yard.capacityTonsPerDay)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Waste Recovery & Financial Overview Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Downstream Waste Recovery &amp; Financial Overview
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Consolidated mass recovery balance, commodity monetization, and TSDF operational expenses
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFlowModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Open Interactive Flow Diagram</span>
                  </button>
                </div>
              </div>

              {/* 8 Core Recovery & Financial Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Waste Received</span>
                  <strong className="text-base font-mono font-bold text-slate-900 block mt-0.5">8,760 kg</strong>
                  <span className="text-[10px] text-slate-500">4 centres combined</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Processed Mass</span>
                  <strong className="text-base font-mono font-bold text-slate-900 block mt-0.5">8,420 kg</strong>
                  <span className="text-[10px] text-emerald-600">340 kg in staging</span>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Resource Recovery</span>
                  <strong className="text-base font-mono font-bold text-emerald-900 block mt-0.5">6,240 kg</strong>
                  <span className="text-[10px] text-emerald-700 font-semibold">Circular output</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Disposal</span>
                  <strong className="text-base font-mono font-bold text-slate-800 block mt-0.5">2,180 kg</strong>
                  <span className="text-[10px] text-slate-500">TSDF & Landfill</span>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Recovery Rate</span>
                  <strong className="text-base font-mono font-bold text-emerald-900 block mt-0.5">72.0%</strong>
                  <span className="text-[10px] text-emerald-700">+4.1% MoM</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Revenue</span>
                  <strong className="text-base font-mono font-bold text-emerald-800 block mt-0.5">₹9,260</strong>
                  <span className="text-[10px] text-slate-500">Recycled sales</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Cost</span>
                  <strong className="text-base font-mono font-bold text-red-800 block mt-0.5">₹21,150</strong>
                  <span className="text-[10px] text-slate-500">Processing & TSDF</span>
                </div>

                <div className="p-3 bg-red-50/70 rounded-xl border border-red-200">
                  <span className="text-[10px] uppercase font-bold text-red-800 block">Net Profit / Loss</span>
                  <strong className="text-base font-mono font-bold text-red-900 block mt-0.5">-₹11,890</strong>
                  <span className="text-[10px] text-red-700">Subsidized utility</span>
                </div>
              </div>

              {/* Mass Balance Visual Bar */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Consolidated City Diversion Yield</span>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span>
                      Recovered (72%)
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block"></span>
                      Disposal (28%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600 h-full" style={{ width: '72%' }} title="Recovered: 72%" />
                  <div className="bg-slate-400 h-full" style={{ width: '28%' }} title="Disposed: 28%" />
                </div>
              </div>

              {/* Quick Jump Shortcuts to Submodules */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-tight text-slate-400">
                  Module Control Points:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('receiving_verification')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    1. Inspect Weighbridge Verification →
                  </button>
                  <button
                    onClick={() => setActiveTab('segregation')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    2. AI/ML Segregation Details →
                  </button>
                  <button
                    onClick={() => setActiveTab('stream_processing')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    3. 6 Specialized Streams →
                  </button>
                  <button
                    onClick={() => setActiveTab('financial_control')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    4. Financial Ledger →
                  </button>
                  <button
                    onClick={() => setActiveTab('profitability')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    5. Profitability &amp; Breakeven →
                  </button>
                  <button
                    onClick={() => setActiveTab('ai_simulations')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>AI Intelligence →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: LIVE GIS MAP                                          */}
        {/* ============================================================ */}
        {activeTab === 'live_map' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Bruhat Bengaluru Live Telematics Map</h2>
                <p className="text-xs text-slate-500">
                  Tracking 37 fleet vehicles, 4 authorized municipal yards, and live customer collection requests
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Available
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Collecting
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Near Capacity (&ge;90%)
                </span>
              </div>
            </div>

            {/* Interactive Map Stage with Selected Truck Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Canvas (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <div className="relative h-[480px] bg-slate-100 overflow-hidden">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"></div>

                  {/* Ward Lines Simulation */}
                  <div className="absolute left-[30%] top-0 bottom-0 border-r border-slate-200 border-dashed"></div>
                  <div className="absolute left-[65%] top-0 bottom-0 border-r border-slate-200 border-dashed"></div>
                  <div className="absolute top-[40%] left-0 right-0 border-b border-slate-200 border-dashed"></div>

                  <span className="absolute left-4 top-4 text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Sector 4 Indiranagar (Ward 84)
                  </span>
                  <span className="absolute left-[32%] top-4 text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Sector 1 Koramangala
                  </span>
                  <span className="absolute left-[67%] top-4 text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Sector 7 Whitefield
                  </span>

                  {/* Disposal Yards Markers */}
                  {state.disposalYards.map((yard, idx) => {
                    const coords = [
                      { x: 80, y: 75 },
                      { x: 25, y: 30 },
                      { x: 75, y: 25 },
                      { x: 15, y: 80 },
                    ][idx] || { x: 50, y: 50 };

                    return (
                      <div 
                        key={yard.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 text-center"
                        style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold bg-white text-purple-900 px-1.5 py-0.5 rounded shadow-xs border border-purple-200 mt-0.5 block whitespace-nowrap">
                          {yard.id}
                        </span>
                      </div>
                    );
                  })}

                  {/* Truck Markers */}
                  {state.trucks.map(truck => {
                    const isSelected = selectedTruck?.id === truck.id;
                    const occ = truck.currentLoadKg / truck.capacityKg;
                    const color = 
                      occ >= 0.90 ? 'bg-amber-500' :
                      truck.status === 'collecting' ? 'bg-blue-600' :
                      'bg-emerald-600';

                    const posX = truck.coordinates?.x ?? 50;
                    const posY = truck.coordinates?.y ?? 50;

                    return (
                      <button
                        key={truck.id}
                        onClick={() => setSelectedTruck(truck)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all cursor-pointer ${
                          isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                        }`}
                        style={{ left: `${posX}%`, top: `${posY}%` }}
                      >
                        <div className={`w-8 h-8 rounded-xl ${color} text-white flex items-center justify-center shadow-lg ring-2 ${
                          isSelected ? 'ring-slate-900' : 'ring-white'
                        }`}>
                          <TruckIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-white text-slate-900 px-1 py-0.2 rounded shadow-xs border border-slate-200 mt-0.5 block whitespace-nowrap">
                          {truck.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Truck Inspector Drawer (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                {selectedTruck ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Unit Telematics</span>
                        <h3 className="text-lg font-bold font-mono text-slate-900">{selectedTruck.id}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {selectedTruck.plateNumber}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Driver:</span>
                        <strong className="text-slate-900 font-sans">{selectedTruck.driverName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Sector:</span>
                        <span className="text-slate-800">{selectedTruck.currentZone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Speed:</span>
                        <span className="text-slate-800">{(selectedTruck as any).speedKmh || (selectedTruck.status === 'collecting' ? 24 : 0)} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-sans">Payload:</span>
                        <strong className="text-emerald-700">
                          {selectedTruck.currentLoadKg} / {selectedTruck.capacityKg} kg (
                          {Math.round((selectedTruck.currentLoadKg / selectedTruck.capacityKg) * 100)}%)
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase text-slate-400 block">Available Payload</span>
                      <p className="text-2xl font-bold font-mono text-emerald-700">
                        {selectedTruck.capacityKg - selectedTruck.currentLoadKg} kg
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setStatusFilter(selectedTruck.id);
                          setActiveTab('requests');
                        }}
                        className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Inspect Active Manifest</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Select a truck on the map to inspect telematics.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: FLEET MANAGEMENT                                      */}
        {/* ============================================================ */}
        {activeTab === 'fleet' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Fleet Operations Table</h2>
                <p className="text-xs text-slate-500">Live axle sensor telemetry across all active collection vehicles</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative w-48">
                  <input
                    type="text"
                    placeholder="Search truck or driver..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg text-slate-800"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="collecting">Collecting</option>
                  <option value="near_capacity">Near Capacity (&ge;90%)</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs font-mono divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-sans font-bold">
                  <tr>
                    <th className="p-3">Truck ID</th>
                    <th className="p-3">Driver</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Current Load</th>
                    <th className="p-3">Available Space</th>
                    <th className="p-3">Occupancy</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrucks.map(truck => {
                    const occ = Math.round((truck.currentLoadKg / truck.capacityKg) * 100);
                    return (
                      <tr key={truck.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{truck.id}</td>
                        <td className="p-3 font-sans font-medium text-slate-800">{truck.driverName}</td>
                        <td className="p-3 font-sans text-slate-600">{truck.currentZone}</td>
                        <td className="p-3 text-slate-600">{truck.capacityKg} kg</td>
                        <td className="p-3 font-bold text-slate-900">{truck.currentLoadKg} kg</td>
                        <td className="p-3 font-bold text-emerald-700">{truck.capacityKg - truck.currentLoadKg} kg</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            occ >= 90 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {occ}%
                          </span>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            truck.status === 'near_capacity' ? 'bg-amber-100 text-amber-800' :
                            truck.status === 'collecting' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {truck.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <button
                            onClick={() => {
                              setSelectedTruck(truck);
                              setActiveTab('live_map');
                            }}
                            className="text-xs text-emerald-700 hover:underline font-semibold"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: REQUEST MONITOR                                       */}
        {/* ============================================================ */}
        {activeTab === 'requests' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Municipal Pickup Requests</h2>
                <p className="text-xs text-slate-500">Live feed of resident and commercial waste collection tickets</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                {['all', 'pending', 'assigned', 'in_transit', 'collected', 'completed'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium cursor-pointer ${
                      statusFilter === st
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-sans font-bold">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Address &amp; Zone</th>
                    <th className="p-3">Waste Category</th>
                    <th className="p-3">Estimated</th>
                    <th className="p-3">Actual Weighed</th>
                    <th className="p-3">Assigned Truck</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-slate-900">{p.id}</td>
                      <td className="p-3 font-sans font-semibold text-slate-800">{p.residentName}</td>
                      <td className="p-3 font-sans text-slate-600 max-w-xs truncate">{p.address}</td>
                      <td className="p-3 font-sans capitalize">{p.wasteCategory.replace('_', ' ')}</td>
                      <td className="p-3 text-slate-500">~{p.estimatedWeightKg} kg</td>
                      <td className="p-3 font-bold text-emerald-700">
                        {p.actualCollectedKg ? `${p.actualCollectedKg} kg (Weighed)` : '—'}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{p.assignedTruckId || 'Pending'}</td>
                      <td className="p-3 font-sans">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                          p.status === 'in_transit' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: RECONCILIATION & AUDITS (CRITICAL DISCREPANCY AUDIT) */}
        {/* ============================================================ */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weighbridge Reconciliation &amp; Discrepancy Audits</h2>
              <p className="text-xs text-slate-500">
                Comparing certified cumulative on-board collection weights against municipal facility weighbridge discharges.
              </p>
            </div>

            {/* Reconciliation Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100 font-mono">
                <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-sans font-bold">
                  <tr>
                    <th className="p-3">Record ID</th>
                    <th className="p-3">Truck &amp; Driver</th>
                    <th className="p-3">Disposal Facility</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Collected (Payload)</th>
                    <th className="p-3">Disposed (Weighbridge)</th>
                    <th className="p-3">Difference</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.reconciliation.map(rec => {
                    const isDiscrepant = rec.status === 'investigation_required';
                    return (
                      <tr key={rec.id} className={isDiscrepant ? 'bg-red-50/50' : 'hover:bg-slate-50/80'}>
                        <td className="p-3 font-bold text-slate-900">{rec.id}</td>
                        <td className="p-3 font-sans">
                          <strong>{rec.truckId}</strong> ({rec.driverName})
                        </td>
                        <td className="p-3 font-sans text-slate-700">{rec.yardName}</td>
                        <td className="p-3 text-slate-500">{rec.timestamp}</td>
                        <td className="p-3 font-bold text-slate-900">{rec.collectedKg} kg</td>
                        <td className="p-3 font-bold text-slate-900">{rec.disposedKg} kg</td>
                        <td className={`p-3 font-bold ${rec.diffKg > 10 ? 'text-red-600' : 'text-slate-600'}`}>
                          {rec.diffKg} kg
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            rec.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'investigation_required' ? 'bg-red-100 text-red-800 ring-1 ring-red-300' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {rec.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans">
                          {isDiscrepant ? (
                            <button
                              onClick={() => setInvestigatingRecord(rec)}
                              className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shadow-2xs cursor-pointer"
                            >
                              Investigate
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-bold">Verified ✓</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Investigation Modal */}
            {investigatingRecord && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-600">Discrepancy Audit Inspector</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        Audit Case: {investigatingRecord.id} ({investigatingRecord.truckId})
                      </h3>
                    </div>
                    <button
                      onClick={() => setInvestigatingRecord(null)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-900 font-mono">
                    <p><strong>Cumulative Collected Payload:</strong> {investigatingRecord.collectedKg} kg</p>
                    <p><strong>Weighbridge Discharged:</strong> {investigatingRecord.disposedKg} kg</p>
                    <p className="text-red-700 font-bold">
                      <strong>Variance (Diff):</strong> {investigatingRecord.diffKg} kg (+19.2% excess over tolerance)
                    </p>
                    <p className="text-[11px] text-red-800 font-sans mt-1">
                      Reason: {investigatingRecord.investigationDetails?.reason || investigatingRecord.notes}
                    </p>
                  </div>

                  <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Select Supervisory Action:
                      </label>
                      <select
                        value={resolutionAction}
                        onChange={(e) => setResolutionAction(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      >
                        <option value="Sensor recalibration & scale drift offset confirmed">
                          Sensor recalibration &amp; scale drift offset confirmed
                        </option>
                        <option value="Moisture evaporation during open-air transit verified">
                          Moisture evaporation during open-air transit verified
                        </option>
                        <option value="Manual weighbridge ticket error adjusted by supervisor">
                          Manual weighbridge ticket error adjusted by supervisor
                        </option>
                        <option value="Disciplinary log issued to carrier contractor">
                          Disciplinary log issued to carrier contractor
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Supervisor Resolution Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setInvestigatingRecord(null)}
                        className="py-2 px-3 text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResolving}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                      >
                        {isResolving ? 'Resolving...' : 'Mark Resolved & Clear Alert'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ANALYTICS                                             */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-slate-900">City-Wide Waste Analytics</h2>
              <p className="text-xs text-slate-500">Resource recovery, landfill diversion, and logistics efficiency</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Landfill Diversion Rate</span>
                <p className="text-3xl font-mono font-bold text-emerald-700">68.4%</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[68.4%]"></div>
                </div>
                <p className="text-xs text-slate-500">Target: 75% municipal recycling compliance by Q4</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Fleet Average Turnaround</span>
                <p className="text-3xl font-mono font-bold text-slate-900">34.2 min</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[82%]"></div>
                </div>
                <p className="text-xs text-slate-500">From request confirmation to verified weighbridge discharge</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly CO2 Abatement</span>
                <p className="text-3xl font-mono font-bold text-emerald-700">142.8 Tons</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[70%]"></div>
                </div>
                <p className="text-xs text-slate-500">Calculated via bio-methanation and dry sorting yields</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 1: PROCESSING CENTRES OVERVIEW                */}
        {/* ============================================================ */}
        {activeTab === 'processing_centres' && (
          <div className="max-w-7xl mx-auto">
            <ProcessingCentreOverview
              facilities={facilities}
              onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
              onOpenFlowModal={() => setIsFlowModalOpen(true)}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 2: RECEIVING & INPUT VERIFICATION (CP1)       */}
        {/* ============================================================ */}
        {activeTab === 'receiving_verification' && (
          <div className="max-w-7xl mx-auto">
            <WasteReceivingVerification
              batches={batches}
              selectedBatch={selectedBatch}
              onSelectBatch={setSelectedBatch}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 3: AI/ML SEGREGATION & MASS BALANCE (CP2)    */}
        {/* ============================================================ */}
        {activeTab === 'segregation' && (
          <div className="max-w-7xl mx-auto">
            <SegregationModule
              batch={selectedBatch}
              batches={batches}
              onSelectBatch={setSelectedBatch}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 4: 6 SPECIALIZED STREAM PROCESSING (CP3)      */}
        {/* ============================================================ */}
        {activeTab === 'stream_processing' && (
          <div className="max-w-7xl mx-auto">
            <StreamProcessingDetail
              batch={selectedBatch}
              batches={batches}
              onSelectBatch={setSelectedBatch}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 5: FINANCIAL CONTROL & LEDGER (CP4)           */}
        {/* ============================================================ */}
        {activeTab === 'financial_control' && (
          <div className="max-w-7xl mx-auto">
            <FinancialControlView
              batch={selectedBatch}
              batches={batches}
              onSelectBatch={setSelectedBatch}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 6: SEGMENTAL PROFITABILITY & BREAKEVEN (CP5)  */}
        {/* ============================================================ */}
        {activeTab === 'profitability' && (
          <div className="max-w-7xl mx-auto">
            <ProfitabilityView
              batch={selectedBatch}
              batches={batches}
              onSelectBatch={setSelectedBatch}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* DOWNSTREAM TAB 7: AI & ML OPERATIONAL INTELLIGENCE           */}
        {/* ============================================================ */}
        {activeTab === 'ai_simulations' && (
          <div className="max-w-7xl mx-auto">
            <AIMLApplicationsPanel
              simulations={aiSimulations}
              onInvestigateBatch={(batchId) => {
                const found = batches.find(b => b.id === batchId);
                if (found) {
                  setSelectedBatch(found);
                  setActiveTab('receiving_verification');
                }
              }}
            />
          </div>
        )}
      </main>

      {/* End-to-End Waste Journey Traceability Modal */}
      <EndToEndFlowModal
        isOpen={isFlowModalOpen}
        onClose={() => setIsFlowModalOpen(false)}
        batch={selectedBatch}
        batches={batches}
        onSelectBatch={setSelectedBatch}
      />
    </div>
  );
};
