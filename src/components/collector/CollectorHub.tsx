import React, { useState } from 'react';
import { AppState, Truck, PickupRequest, DisposalYard } from '../../types';
import { 
  Truck as TruckIcon, 
  MapPin, 
  Scale, 
  CheckCircle2, 
  QrCode, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  ArrowLeft,
  Gauge,
  Clock,
  Compass,
  Check,
  Building2,
  Calendar,
  History,
  Navigation,
  Play,
  CheckCheck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CollectorHubProps {
  state: AppState;
  onLogStopCollection: (truckId: string, stopId: string, collectedKg: number, notes?: string) => Promise<void>;
  onLogDisposalSlip: (data: {
    truckId: string;
    yardId: string;
    weightBeforeKg: number;
    weightAfterKg: number;
  }) => Promise<void>;
  onOpenRoleSwitcher: () => void;
}

type CollectorTab = 
  | 'dashboard' 
  | 'jobs' 
  | 'active_pickup' 
  | 'weigh_waste' 
  | 'truck_status' 
  | 'disposal' 
  | 'history';

export const CollectorHub: React.FC<CollectorHubProps> = ({
  state,
  onLogStopCollection,
  onLogDisposalSlip,
  onOpenRoleSwitcher,
}) => {
  const [activeTab, setActiveTab] = useState<CollectorTab>('dashboard');
  const [activeTruckId, setActiveTruckId] = useState<string>('TR-07');
  const currentTruck = state.trucks.find(t => t.id === activeTruckId) || state.trucks[0];

  // Active Job State
  const [activeJobId, setActiveJobId] = useState<string>('WM-28491');
  const activePickup = state.pickups.find(p => p.id === activeJobId) || state.pickups[0];

  // Digital Scale Weighing State
  const [digitalScaleWeight, setDigitalScaleWeight] = useState<number>(86.4);
  const [scaleTareZeroed, setScaleTareZeroed] = useState<boolean>(true);
  const [isConfirmingWeight, setIsConfirmingWeight] = useState<boolean>(false);
  const [scaleSuccessBanner, setScaleSuccessBanner] = useState<string | null>(null);
  const [scaleErrorMessage, setScaleErrorMessage] = useState<string | null>(null);

  // Disposal Weighbridge State
  const [selectedYardId, setSelectedYardId] = useState<string>('YARD-03');
  const [disposalWeightBefore, setDisposalWeightBefore] = useState<number>(874);
  const [disposalWeightAfter, setDisposalWeightAfter] = useState<number>(30);
  const [isSubmittingDisposal, setIsSubmittingDisposal] = useState<boolean>(false);
  const [disposalSuccessBanner, setDisposalSuccessBanner] = useState<string | null>(null);

  // Computed Capacity Metrics
  const availableCapacityKg = Math.max(0, currentTruck.capacityKg - currentTruck.currentLoadKg);
  const occupancyPercent = Math.round((currentTruck.currentLoadKg / currentTruck.capacityKg) * 100);
  const isNearCapacity = occupancyPercent >= 90;
  const isFull = occupancyPercent >= 100 || availableCapacityKg < 10;

  // Jobs assigned to this truck or pending nearby in current sector
  const truckJobs = state.pickups.filter(
    p => p.assignedTruckId === currentTruck.id || (p.status === 'assigned' && p.zone.includes('Sector 4'))
  );

  const handleStartJob = (jobId: string) => {
    setActiveJobId(jobId);
    setActiveTab('active_pickup');
  };

  const handleConfirmWeighing = async () => {
    setScaleErrorMessage(null);
    if (digitalScaleWeight <= 0) {
      setScaleErrorMessage('Actual weight must be strictly greater than 0 kg.');
      return;
    }

    if (digitalScaleWeight > availableCapacityKg) {
      setScaleErrorMessage(
        `Scale reading of ${digitalScaleWeight} kg exceeds remaining truck capacity of ${availableCapacityKg} kg!`
      );
      return;
    }

    setIsConfirmingWeight(true);
    try {
      await onLogStopCollection(currentTruck.id, activeJobId, digitalScaleWeight);
      setScaleSuccessBanner(
        `✓ ${digitalScaleWeight} kg added to truck. Payload updated from ${(currentTruck.currentLoadKg).toFixed(1)} kg to ${(currentTruck.currentLoadKg + digitalScaleWeight).toFixed(1)} kg. Customer billed ₹${Math.round(digitalScaleWeight * 2)}.`
      );
      setTimeout(() => setScaleSuccessBanner(null), 6000);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      setScaleErrorMessage('Failed to submit weighing. Check network connectivity.');
    } finally {
      setIsConfirmingWeight(false);
    }
  };

  const handleDisposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDisposal(true);
    try {
      const netDisposed = Math.max(0, disposalWeightBefore - disposalWeightAfter);
      await onLogDisposalSlip({
        truckId: currentTruck.id,
        yardId: selectedYardId,
        weightBeforeKg: disposalWeightBefore,
        weightAfterKg: disposalWeightAfter,
      });

      setDisposalSuccessBanner(
        `✓ Disposal Verified at Municipal Waste Yard #03. Discharged: ${netDisposed} kg. Truck load reset to ${disposalWeightAfter} kg (3%). Status: AVAILABLE.`
      );
      setTimeout(() => setDisposalSuccessBanner(null), 8000);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDisposal(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-900">
      {/* Top Light Operational Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              <TruckIcon className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-slate-900">EcoTrack</span>
              <span className="text-xs text-slate-500 font-medium ml-1">· Collector Operations</span>
            </div>
          </div>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
            <span>Collector: <strong className="text-slate-900">{currentTruck.driverName}</strong></span>
            <span>·</span>
            <span>Truck: <strong className="text-slate-900 font-mono">{currentTruck.id}</strong> [{currentTruck.plateNumber}]</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Gauge },
            { id: 'jobs', label: "Today's Jobs", icon: Calendar },
            { id: 'active_pickup', label: 'Active Pickup', icon: Navigation },
            { id: 'weigh_waste', label: 'Weigh Waste', icon: Scale },
            { id: 'truck_status', label: 'Truck Capacity', icon: TruckIcon },
            { id: 'disposal', label: 'Disposal', icon: Building2 },
            { id: 'history', label: 'History', icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`collector-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as CollectorTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unit Selector & Role Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={activeTruckId}
            onChange={(e) => setActiveTruckId(e.target.value)}
            className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800"
          >
            {state.trucks.slice(0, 6).map(t => (
              <option key={t.id} value={t.id}>{t.id} - {t.driverName}</option>
            ))}
          </select>
          <button
            onClick={onOpenRoleSwitcher}
            className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 font-semibold"
          >
            Switch Role
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Global Notification Banners */}
        {scaleSuccessBanner && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{scaleSuccessBanner}</span>
          </div>
        )}

        {disposalSuccessBanner && (
          <div className="p-3.5 bg-blue-50 border border-blue-300 rounded-xl text-xs text-blue-900 flex items-center gap-2.5 shadow-2xs animate-in fade-in">
            <CheckCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="font-semibold">{disposalSuccessBanner}</span>
          </div>
        )}

        {/* Capacity Warning Alert if >= 90% */}
        {isNearCapacity && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong className="text-sm">
                  {isFull ? 'TRUCK FULL — DISPOSAL REQUIRED' : 'TRUCK NEAR CAPACITY (>= 90%)'}
                </strong>
                <p className="text-amber-800 mt-0.5">
                  Current payload is <strong>{currentTruck.currentLoadKg.toFixed(1)} / {currentTruck.capacityKg} kg ({occupancyPercent}%)</strong>. 
                  Proceed to an authorized disposal facility.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setDisposalWeightBefore(currentTruck.currentLoadKg || 874);
                setActiveTab('disposal');
              }}
              className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Navigate to Disposal Yard</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: COLLECTOR DASHBOARD                                   */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Large Truck Capacity Visualization Card (Light Theme) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    On-Board Telematics &amp; Payload Sensor
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <h2 className="text-3xl font-mono font-bold text-slate-900">
                      {currentTruck.currentLoadKg.toFixed(1)} <span className="text-base text-slate-400 font-sans">/ {currentTruck.capacityKg} kg</span>
                    </h2>
                    <span className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-full ${
                      isFull ? 'bg-red-100 text-red-800' :
                      isNearCapacity ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {occupancyPercent}% Occupied
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase text-slate-400">Available Space</span>
                  <p className="text-2xl font-mono font-bold text-emerald-700">
                    {availableCapacityKg.toFixed(1)} kg
                  </p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    isFull ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {isFull ? 'DISPOSAL REQUIRED' : 'AVAILABLE FOR PICKUPS'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-red-500' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                />
              </div>

              {/* Quick Telematics Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans block">Assigned Sector</span>
                  <strong className="text-slate-800">{currentTruck.currentZone}</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans block">Battery Health</span>
                  <strong className="text-emerald-700">{currentTruck.batteryPercent}% (Normal)</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans block">Fuel Reserve</span>
                  <strong className="text-slate-800">{currentTruck.fuelPercent}%</strong>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans block">Authorized Weigh Station</span>
                  <strong className="text-blue-700">Yard #03 (South)</strong>
                </div>
              </div>
            </div>

            {/* Operational Summary 4 Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Today's Pickups</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">4</p>
                <span className="text-[10px] text-emerald-600 font-semibold">2 Completed · 2 Scheduled</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Waste Collected Today</span>
                <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">{currentTruck.currentLoadKg} kg</p>
                <span className="text-[10px] text-slate-500">Live scale certified</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pending Pickups</span>
                <p className="text-2xl font-bold text-blue-700 mt-1 font-mono">
                  {truckJobs.filter(j => j.status !== 'completed').length}
                </p>
                <span className="text-[10px] text-slate-500">Next: Green Valley Apts</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Next Disposal Yard</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Yard #03 Landfill</p>
                <span className="text-[10px] text-slate-500">Begur Koppa Rd (4.2 km)</span>
              </div>
            </div>

            {/* Immediate Action: Current Assigned Job */}
            {activePickup && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-xs">
                    JOB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 font-mono">{activePickup.id}</h3>
                      <span className="text-xs font-semibold text-slate-700">{activePickup.residentName}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {activePickup.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{activePickup.address}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Estimated Waste: <strong>{activePickup.estimatedWeightKg} kg</strong> · Category: {activePickup.wasteCategory}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStartJob(activePickup.id)}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Job / Navigate</span>
                  </button>

                  <button
                    id="collector-quick-weigh-btn"
                    onClick={() => {
                      setActiveJobId(activePickup.id);
                      setDigitalScaleWeight(86.4);
                      setActiveTab('weigh_waste');
                    }}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Weigh Waste</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TODAY'S JOBS                                          */}
        {/* ============================================================ */}
        {activeTab === 'jobs' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Jobs Manifest</h2>
              <p className="text-xs text-slate-500">Pickups assigned to Unit TR-07 across Sector 4</p>
            </div>

            <div className="space-y-3">
              {truckJobs.map(job => (
                <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{job.id}</span>
                      <h4 className="text-xs font-bold text-slate-800">{job.residentName}</h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {job.wasteCategory}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{job.address}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                      Distance: 1.4 km · Est. Waste: <strong>{job.estimatedWeightKg} kg</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartJob(job.id)}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveJobId(job.id);
                        setActiveTab('active_pickup');
                      }}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Job</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ACTIVE PICKUP                                         */}
        {/* ============================================================ */}
        {activeTab === 'active_pickup' && activePickup && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Job in Progress</span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5 font-mono">{activePickup.id}</h2>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">
                STATUS: {activePickup.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Customer</span>
                <strong className="text-slate-900 text-sm font-sans">{activePickup.residentName}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Address</span>
                <strong className="text-slate-900 font-sans">{activePickup.address}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Waste Stream</span>
                <strong className="text-slate-900 capitalize font-sans">{activePickup.wasteCategory}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] font-sans text-slate-400 block uppercase font-bold">Estimated Payload</span>
                <strong className="text-slate-900 text-sm">{activePickup.estimatedWeightKg} kg</strong>
              </div>
            </div>

            {activePickup.specialInstructions && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                <span className="font-bold block text-[10px] uppercase text-slate-400 mb-0.5">Special Access Instructions</span>
                <p>"{activePickup.specialInstructions}"</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('jobs')}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Manifest</span>
              </button>

              <button
                id="collector-proceed-weigh-btn"
                onClick={() => {
                  setDigitalScaleWeight(86.4);
                  setActiveTab('weigh_waste');
                }}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Arrived at Customer — Open Digital Scale</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ACTUAL WEIGHING SCREEN (CORE DIGITAL SCALE)           */}
        {/* ============================================================ */}
        {activeTab === 'weigh_waste' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Certified On-Board Digital Scale</span>
                <h1 className="text-xl font-bold text-slate-900 mt-0.5">Record Actual Weight</h1>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                Job: {activeJobId}
              </span>
            </div>

            {scaleErrorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{scaleErrorMessage}</span>
              </div>
            )}

            {/* Large Digital Scale Display */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3 shadow-inner">
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold block">
                BBMP CERTIFIED STRAIN-GAUGE SCALE #SC-402
              </span>

              {/* Huge Scale Number */}
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-mono font-bold tracking-tight text-white">
                  {digitalScaleWeight.toFixed(1)}
                </span>
                <span className="text-xl font-mono font-bold text-slate-400">kg</span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDigitalScaleWeight(prev => Math.max(1, Math.round((prev - 5) * 10) / 10))}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-200"
                >
                  -5 kg
                </button>
                <button
                  type="button"
                  onClick={() => setDigitalScaleWeight(86.4)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-mono text-white font-bold"
                >
                  86.4 kg (Scale Preset)
                </button>
                <button
                  type="button"
                  onClick={() => setDigitalScaleWeight(80)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-200"
                >
                  80.0 kg
                </button>
                <button
                  type="button"
                  onClick={() => setDigitalScaleWeight(prev => Math.round((prev + 5) * 10) / 10)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono text-slate-200"
                >
                  +5 kg
                </button>
              </div>
            </div>

            {/* Scale Calculation Preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Weight:</span>
                <span className="text-slate-700">80.0 kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scale Actual Weight:</span>
                <strong className="text-slate-900">{digitalScaleWeight.toFixed(1)} kg</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Truck Load Before:</span>
                <span className="text-slate-700">{currentTruck.currentLoadKg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold border-t border-slate-200 pt-2">
                <span>Truck Load After Collection:</span>
                <span>{(currentTruck.currentLoadKg + digitalScaleWeight).toFixed(1)} / {currentTruck.capacityKg} kg</span>
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="space-y-2">
              <button
                type="button"
                id="collector-confirm-weight-btn"
                disabled={isConfirmingWeight || digitalScaleWeight <= 0}
                onClick={handleConfirmWeighing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isConfirmingWeight ? 'Updating State...' : 'Record Weight & Confirm Collection'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('active_pickup')}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancel &amp; Return to Job
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: DISPOSAL AT WEIGHBRIDGE (YARD FLOW)                   */}
        {/* ============================================================ */}
        {activeTab === 'disposal' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Transfer Facility Weighbridge Bay</span>
                <h1 className="text-xl font-bold text-slate-900 mt-0.5">Discharge at Disposal Yard</h1>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded">
                TR-07 Bay 2
              </span>
            </div>

            <form onSubmit={handleDisposalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Authorized Municipal Facility:
                </label>
                <select
                  value={selectedYardId}
                  onChange={(e) => setSelectedYardId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="YARD-03">Municipal Waste Yard #03 (South Landfill &amp; Transfer Station)</option>
                  <option value="YARD-01">Municipal Waste Yard #01 (Central MRF Facility)</option>
                  <option value="YARD-02">Municipal Waste Yard #02 (West Bio-Methanation Yard)</option>
                  <option value="YARD-04">Municipal Waste Yard #04 (East Eco-Recovery &amp; E-Waste Hub)</option>
                </select>
              </div>

              {/* Weighbridge In-Out Scales */}
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-sans">
                    WEIGHT BEFORE (Gross In-Weight)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={disposalWeightBefore}
                      onChange={(e) => setDisposalWeightBefore(Number(e.target.value))}
                      className="w-full text-lg font-bold px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                    />
                    <span className="text-slate-400 font-bold">kg</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 font-sans">
                    WEIGHT AFTER (Tare Out-Weight)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={disposalWeightAfter}
                      onChange={(e) => setDisposalWeightAfter(Number(e.target.value))}
                      className="w-full text-lg font-bold px-2 py-1 border border-slate-300 rounded bg-white text-slate-900"
                    />
                    <span className="text-slate-400 font-bold">kg</span>
                  </div>
                </div>
              </div>

              {/* Calculated Discharged Payload */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold font-sans block">
                    CALCULATED WASTE DISPOSED
                  </span>
                  <span className="text-2xl font-bold text-emerald-900">
                    {Math.max(0, disposalWeightBefore - disposalWeightAfter)} kg
                  </span>
                </div>
                <div className="text-right text-xs font-sans text-emerald-700">
                  <p className="font-bold">✓ Ready for Weighbridge Verification</p>
                  <p className="text-[10px]">Truck payload will reset to {disposalWeightAfter} kg</p>
                </div>
              </div>

              <button
                type="submit"
                id="collector-submit-disposal-btn"
                disabled={isSubmittingDisposal}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>{isSubmittingDisposal ? 'Certifying Weighbridge Slip...' : 'Submit Weighbridge Discharge'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: TRUCK CAPACITY & TELEMATICS                           */}
        {/* ============================================================ */}
        {activeTab === 'truck_status' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Truck Capacity Telematics</h2>
              <p className="text-xs text-slate-500">Live axle load cells and municipal fleet allocation rules</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase text-slate-400">Regulatory 90% Operating Rule</span>
                <span className="font-mono text-emerald-700 font-bold">Threshold: 900 kg</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a vehicle reaches 90% (900 kg / 1000 kg), the central dispatch automatically halts automated customer matching 
                and orders the operator to proceed to the designated sector weigh station to prevent overloading.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: HISTORY                                               */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Collector Shift History</h2>
              <p className="text-xs text-slate-500">Completed jobs and weighbridge slips for TR-07</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden text-xs">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 font-mono">SLIP-77182 · Yard #01 Central MRF</strong>
                  <p className="text-slate-500 font-sans mt-0.5">719 kg net discharged · Tolerance 0.14%</p>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">VERIFIED ✓</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <strong className="text-slate-900 font-mono">WM-28485 · Cafe Coffee Day Roastery</strong>
                  <p className="text-slate-500 font-sans mt-0.5">68.2 kg organic weighed on scale · ₹136.40</p>
                </div>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">COLLECTED</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
