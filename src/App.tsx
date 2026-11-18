import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { AppState, UserRole, CustomerUser, ReconciliationRecord } from './types';
import { INITIAL_APP_STATE, DEFAULT_CUSTOMER } from './mockData';
import { PlatformEntryScreen } from './components/auth/PlatformEntryScreen';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { CollectorHub } from './components/collector/CollectorHub';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ReconciliationModal } from './components/modals/ReconciliationModal';
import { ShieldCheck, Truck, Users, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ViewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('View rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 text-center bg-slate-50">
          <div className="max-w-md bg-white p-6 rounded-2xl border border-red-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center font-bold">
              !
            </div>
            <h2 className="text-base font-bold text-slate-900">View Encountered an Error</h2>
            <p className="text-xs text-slate-500 font-mono bg-slate-100 p-2.5 rounded text-left overflow-auto max-h-32">
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onReset();
              }}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              Reset View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Current active role. Default to showing the welcome/entry screen if null or initially requested
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<CustomerUser>(DEFAULT_CUSTOMER);
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState<boolean>(true);

  // Synchronized Application State
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Reconciliation Modal for Admin
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<ReconciliationRecord | undefined>(undefined);

  // Sync state from server
  const fetchState = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setAppState(data);
      }
    } catch (err) {
      console.warn('Using client-side synchronized state cache:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  // Handle Role Selection from Welcome Screen
  const handleSelectRole = (role: UserRole, user?: CustomerUser) => {
    setCurrentRole(role);
    if (user) {
      setCurrentUser(user);
    }
    setIsRoleSelectionOpen(false);
  };

  // Customer: Schedule a new collection
  const handleSchedulePickup = async (pickupData: any) => {
    try {
      const res = await fetch('/api/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickupData),
      });
      if (res.ok) {
        await fetchState();
      } else {
        // Fallback local state update
        const weight = Number(pickupData.estimatedWeightKg) || 80;
        const newReq = {
          id: `WM-${Math.floor(28000 + Math.random() * 1000)}`,
          customerId: currentUser.id,
          residentName: pickupData.residentName || currentUser.name,
          residentEmail: pickupData.residentEmail || currentUser.email,
          residentPhone: pickupData.residentPhone || currentUser.phone,
          address: pickupData.address || currentUser.address,
          zone: pickupData.zone || currentUser.zone,
          wasteCategory: pickupData.wasteCategory || 'general',
          estimatedWeightKg: weight,
          scheduledDate: new Date().toISOString().split('T')[0],
          timeSlot: pickupData.timeSlot || '11:00 - 01:00 PM',
          status: 'assigned' as const,
          assignedTruckId: pickupData.selectedTruckId || 'TR-07',
          collectorName: 'Ravi Kumar',
          qrCode: `ECO-${Math.floor(10000 + Math.random() * 89999)}-IND`,
          specialInstructions: pickupData.specialInstructions || '',
          pricePerKg: 2.0,
          ecoPointsEarned: Math.round(weight * 2),
          createdAt: 'Just now',
        };

        setAppState(prev => ({
          ...prev,
          pickups: [newReq, ...prev.pickups],
          todayStats: {
            ...prev.todayStats,
            pendingRequests: prev.todayStats.pendingRequests + 1,
            trucksOnJob: prev.todayStats.trucksOnJob + 1,
          },
        }));
      }
    } catch (err) {
      console.error('Error scheduling pickup:', err);
    }
  };

  // Collector: Log physical scale weighing
  const handleLogStopCollection = async (truckId: string, stopId: string, collectedKg: number, notes?: string) => {
    try {
      const res = await fetch('/api/collector/weigh-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truckId, pickupId: stopId, actualWeightKg: collectedKg, notes }),
      });
      if (res.ok) {
        await fetchState();
      } else {
        // Local state update fallback
        setAppState(prev => {
          const truck = prev.trucks.find(t => t.id === truckId);
          if (truck) {
            truck.currentLoadKg = Math.round((truck.currentLoadKg + collectedKg) * 10) / 10;
            if (truck.currentLoadKg / truck.capacityKg >= 0.90) {
              truck.status = 'near_capacity';
            }
          }
          const pickup = prev.pickups.find(p => p.id === stopId);
          if (pickup) {
            pickup.status = 'collected';
            pickup.actualCollectedKg = collectedKg;
            pickup.finalPriceInr = Math.round(collectedKg * 2.0);
            pickup.collectedAt = 'Just now';
          }
          return {
            ...prev,
            todayStats: {
              ...prev.todayStats,
              collectedTodayKg: prev.todayStats.collectedTodayKg + collectedKg,
              completedPickups: prev.todayStats.completedPickups + 1,
            }
          };
        });
      }
    } catch (err) {
      console.error('Error logging collection:', err);
    }
  };

  // Collector: Log weighbridge discharge at disposal yard
  const handleLogDisposalSlip = async (data: {
    truckId: string;
    yardId: string;
    weightBeforeKg: number;
    weightAfterKg: number;
  }) => {
    try {
      const res = await fetch('/api/collector/log-disposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchState();
      } else {
        const netDisposed = Math.max(0, data.weightBeforeKg - data.weightAfterKg);
        setAppState(prev => {
          const truck = prev.trucks.find(t => t.id === data.truckId);
          if (truck) {
            truck.currentLoadKg = data.weightAfterKg;
            truck.status = 'available';
          }
          return {
            ...prev,
            todayStats: {
              ...prev.todayStats,
              disposedTodayKg: prev.todayStats.disposedTodayKg + netDisposed,
            }
          };
        });
      }
    } catch (err) {
      console.error('Error logging disposal:', err);
    }
  };

  // Admin: Resolve reconciliation audit investigation
  const handleResolveReconciliation = async (recordId: string, actionTaken: string, notes?: string) => {
    try {
      const res = await fetch(`/api/reconciliation/${recordId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionTaken, resolutionNotes: notes }),
      });
      if (res.ok) {
        await fetchState();
      } else {
        setAppState(prev => ({
          ...prev,
          reconciliation: prev.reconciliation.map(r => r.id === recordId ? {
            ...r,
            status: 'resolved',
            notes: `${r.notes || ''} | Resolved: ${notes || actionTaken}`,
          } : r),
          alerts: prev.alerts.filter(a => a.relatedEntityId !== recordId),
        }));
      }
    } catch (err) {
      console.error('Error resolving audit:', err);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Global Prototype Quick Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-200 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-800 z-40 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Active Role:</span>
          <span className="font-bold text-white text-xs capitalize">
            {currentRole ? (
              currentRole === 'admin' ? 'Administrator (Command Center)' :
              currentRole === 'collector' ? 'Waste Collector (TR-07)' :
              `Resident Customer (${currentUser.name})`
            ) : 'Role Selection'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] text-slate-400 mr-1 hidden md:inline">Quick Jump:</span>
          <button
            id="global-switch-customer-btn"
            onClick={() => handleSelectRole('customer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'customer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Customer</span>
          </button>
          <button
            id="global-switch-collector-btn"
            onClick={() => handleSelectRole('collector')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'collector'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Collector</span>
          </button>
          <button
            id="global-switch-admin-btn"
            onClick={() => handleSelectRole('admin')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'admin'
                ? 'bg-purple-600 text-white shadow-xs ring-1 ring-purple-400'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Dashboard</span>
          </button>
          <button
            id="global-open-welcome-modal-btn"
            onClick={() => setIsRoleSelectionOpen(true)}
            className="ml-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 cursor-pointer"
          >
            Welcome Menu
          </button>
        </div>
      </div>

      {/* 1. Welcome / Role-Specific Access Entry Screen */}
      {isRoleSelectionOpen && (
        <PlatformEntryScreen
          onSelectRole={handleSelectRole}
          currentRole={currentRole}
          onCancel={currentRole ? () => setIsRoleSelectionOpen(false) : undefined}
        />
      )}

      {/* 2. Distinct Role-Based Interfaces with Error Boundary */}
      <ViewErrorBoundary onReset={fetchState}>
        {currentRole === 'customer' && (
          <CustomerPortal
            state={appState}
            currentUser={currentUser}
            onSchedulePickup={handleSchedulePickup}
            onOpenRoleSwitcher={() => setIsRoleSelectionOpen(true)}
          />
        )}

        {currentRole === 'collector' && (
          <CollectorHub
            state={appState}
            onLogStopCollection={handleLogStopCollection}
            onLogDisposalSlip={handleLogDisposalSlip}
            onOpenRoleSwitcher={() => setIsRoleSelectionOpen(true)}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            state={appState}
            onRefresh={fetchState}
            onResolveReconciliation={handleResolveReconciliation}
            onOpenRoleSwitcher={() => setIsRoleSelectionOpen(true)}
          />
        )}

        {/* Fallback if somehow no role selected and modal closed */}
        {!currentRole && !isRoleSelectionOpen && (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">No Role Selected</h2>
              <p className="text-xs text-slate-500">
                Please choose a role to enter the EcoTrack municipal waste platform.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleSelectRole('admin')}
                  className="py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  Open Admin Dashboard
                </button>
                <button
                  onClick={() => setIsRoleSelectionOpen(true)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                >
                  View All Roles
                </button>
              </div>
            </div>
          </div>
        )}
      </ViewErrorBoundary>
    </div>
  );
}
