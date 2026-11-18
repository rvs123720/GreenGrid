import React, { useState } from 'react';
import { UserRole, CustomerUser } from '../../types';
import { DEFAULT_CUSTOMER } from '../../mockData';
import { 
  Users, 
  Truck as TruckIcon, 
  ShieldCheck, 
  ArrowRight, 
  Leaf, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Phone, 
  ArrowLeft,
  Info
} from 'lucide-react';

interface PlatformEntryScreenProps {
  onSelectRole: (role: UserRole, user?: CustomerUser) => void;
  currentRole?: UserRole | null;
  onCancel?: () => void;
}

type AuthModalRole = 'customer' | 'collector' | 'admin' | null;

export const PlatformEntryScreen: React.FC<PlatformEntryScreenProps> = ({
  onSelectRole,
  currentRole,
  onCancel,
}) => {
  const [activeModal, setActiveModal] = useState<AuthModalRole>(null);

  // Customer Login State
  const [custEmailPhone, setCustEmailPhone] = useState('alex.rivera@example.com');
  const [custPassword, setCustPassword] = useState('••••••••');
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [custName, setCustName] = useState('Alex Rivera');
  const [custAddress, setCustAddress] = useState('12 Lake View Road, Green Valley Apartments, Indiranagar');

  // Collector Login State
  const [collectorId, setCollectorId] = useState('COL-07 (Ravi Kumar)');
  const [collectorPassword, setCollectorPassword] = useState('••••••••');

  // Admin Login State
  const [adminId, setAdminId] = useState('admin@ecotrack.gov.in (A. Kulkarni)');
  const [adminPassword, setAdminPassword] = useState('••••••••');

  const handleCustomerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const user: CustomerUser = {
      ...DEFAULT_CUSTOMER,
      name: custName || DEFAULT_CUSTOMER.name,
      email: custEmailPhone.includes('@') ? custEmailPhone : DEFAULT_CUSTOMER.email,
      phone: custEmailPhone.includes('@') ? DEFAULT_CUSTOMER.phone : custEmailPhone,
      address: custAddress || DEFAULT_CUSTOMER.address,
      isGuest: false,
    };
    onSelectRole('customer', user);
  };

  const handleGuestLogin = () => {
    const guestUser: CustomerUser = {
      ...DEFAULT_CUSTOMER,
      id: 'GUEST-' + Math.floor(1000 + Math.random() * 9000),
      name: 'Guest Resident',
      email: 'guest@example.com',
      isGuest: true,
      walletBalancePoints: 0,
    };
    onSelectRole('customer', guestUser);
  };

  const handleCollectorLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSelectRole('collector');
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSelectRole('admin');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome to EcoTrack</h1>
                <span className="text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                  v2.4 Production
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Smart waste collection, tracking and disposal — all in one platform.
              </p>
            </div>
          </div>

          {currentRole && onCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white transition-colors"
            >
              ← Return to active session
            </button>
          )}
        </div>

        {/* Content Area: Main 3 Role Cards or Active Login Modal */}
        <div className="p-6 sm:p-8 bg-white flex-1">
          {activeModal === null && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-lg font-bold text-slate-900">Select Platform Role to Access</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Each role offers an authenticated, synchronized view of municipal waste operations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Customer Card */}
                <div className="bg-[#F8FAFC] hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-2xs group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white text-emerald-800 flex items-center justify-center mb-4 transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Customer</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Request doorstep waste pickup, track truck ETA on live map, view scale weights, and verify disposal slips.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dynamic truck capacity match</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Actual weight billing</span>
                      </p>
                    </div>
                  </div>

                  <button
                    id="entry-continue-customer-btn"
                    onClick={() => setActiveModal('customer')}
                    className="mt-6 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Continue as Customer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Waste Collector Card */}
                <div className="bg-[#F8FAFC] hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-2xs group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-600 group-hover:text-white text-blue-800 flex items-center justify-center mb-4 transition-colors">
                      <TruckIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Waste Collector</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Manage daily pickup manifests, record certified scale weights, monitor truck capacity, and discharge at yards.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Digital on-board scale</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>90% Capacity lock &amp; Yard routing</span>
                      </p>
                    </div>
                  </div>

                  <button
                    id="entry-continue-collector-btn"
                    onClick={() => setActiveModal('collector')}
                    className="mt-6 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Continue as Collector</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. Administrator Card */}
                <div className="bg-[#F8FAFC] hover:bg-purple-50/40 border border-slate-200 hover:border-purple-300 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-2xs group">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-600 group-hover:text-white text-purple-800 flex items-center justify-center mb-4 transition-colors">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Administrator</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Command center monitoring 37 fleet units, weighbridge reconciliation, discrepancy audits, and city KPIs.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Live GIS truck telemetry</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Weighbridge variance audit</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button
                      id="entry-open-admin-btn"
                      onClick={() => onSelectRole('admin')}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Open Admin Dashboard (Instant Access)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModal('admin')}
                      className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 font-medium py-1"
                    >
                      Supervisor Login with Custom PIN →
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Demonstration Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    <strong>Prototype Demonstration Mode:</strong> All three roles synchronize against the same municipal state.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Bangalore BBMP Ward 84</span>
              </div>
            </div>
          )}

          {/* Customer Sign In / Sign Up Modal */}
          {activeModal === 'customer' && (
            <div className="max-w-md mx-auto space-y-5">
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Selection</span>
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isNewAccount ? 'Create Customer Account' : 'Welcome back'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {isNewAccount 
                    ? 'Register your residential address to book on-demand collections.' 
                    : 'Sign in to access your scheduled collections, live truck tracking, and invoices.'}
                </p>
              </div>

              <form onSubmit={handleCustomerLogin} className="space-y-3.5">
                {isNewAccount && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email / Phone</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={custEmailPhone}
                      onChange={(e) => setCustEmailPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={custPassword}
                      onChange={(e) => setCustPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                {isNewAccount && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Address</label>
                    <input
                      type="text"
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  id="customer-signin-submit-btn"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{isNewAccount ? 'Create Account & Sign In' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5 text-center">
                <button
                  type="button"
                  onClick={() => setIsNewAccount(!isNewAccount)}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  {isNewAccount ? 'Already registered? Sign In' : 'New to EcoTrack? Create Customer Account'}
                </button>

                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400 bg-white px-2">or</div>
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Continue as Guest (Explore demo without account)
                </button>
              </div>
            </div>
          )}

          {/* Collector Operations Sign In */}
          {activeModal === 'collector' && (
            <div className="max-w-md mx-auto space-y-5">
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Selection</span>
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Collector Operations</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access ruggedized field operations, onboard digital scale, and weighbridge logging.
                </p>
              </div>

              <form onSubmit={handleCollectorLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Collector ID / Phone
                  </label>
                  <input
                    type="text"
                    value={collectorId}
                    onChange={(e) => setCollectorId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Password / PIN
                  </label>
                  <input
                    type="password"
                    value={collectorPassword}
                    onChange={(e) => setCollectorPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Quick Unit Presets */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">Assigned Unit: TR-07 (Ravi Kumar)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-mono font-bold px-1.5 py-0.5 rounded">
                      620 / 1000 kg (62%)
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Ready to receive job assignments from Sector 4 Indiranagar.
                  </p>
                </div>

                <button
                  type="submit"
                  id="collector-signin-submit-btn"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Access Collector Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Admin Operations Sign In */}
          {activeModal === 'admin' && (
            <div className="max-w-md mx-auto space-y-5">
              <button
                onClick={() => setActiveModal(null)}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Selection</span>
              </button>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Municipal Operations Center</h2>
                <p className="text-xs text-slate-500 mt-1">
                  City-wide supervision, live GIS fleet routing, and weighbridge reconciliation matrix.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Admin ID / Email
                  </label>
                  <input
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Security Key / Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-purple-900">Chief Waste Logistics Supervisor</span>
                  <p className="text-[11px] text-purple-700">
                    Full authority: view 37 active trucks, investigate TR-03 discrepancy (+168kg), adjust weighbridge tolerances.
                  </p>
                </div>

                <button
                  type="submit"
                  id="admin-signin-submit-btn"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
