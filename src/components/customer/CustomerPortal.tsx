import React, { useState } from 'react';
import { 
  AppState, 
  CustomerUser, 
  PickupRequest, 
  WasteCategory,
  Truck 
} from '../../types';
import { getAvailableTrucks, MatchedTruck } from '../../utils/truckMatching';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  Truck as TruckIcon,
  ShieldCheck,
  FileText,
  CreditCard,
  History,
  PlusCircle,
  Home,
  Check,
  Compass,
  Scale,
  Sparkles,
  Building2,
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';

interface CustomerPortalProps {
  state: AppState;
  currentUser: CustomerUser;
  onSchedulePickup: (pickupData: any) => Promise<void>;
  onOpenRoleSwitcher: () => void;
}

type CustomerTab = 
  | 'home' 
  | 'request' 
  | 'track' 
  | 'scheduled' 
  | 'history' 
  | 'payments' 
  | 'disposal_verification';

type BookingStep = 1 | 2 | 3 | 4;

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  state,
  currentUser,
  onSchedulePickup,
  onOpenRoleSwitcher,
}) => {
  const [activeTab, setActiveTab] = useState<CustomerTab>('home');
  const [selectedPickupForTracking, setSelectedPickupForTracking] = useState<string>('WM-28491');
  const [selectedDisposalRecordId, setSelectedDisposalRecordId] = useState<string>('WM-28488');

  // Multi-step Request Booking State
  const [bookingStep, setBookingStep] = useState<BookingStep>(1);
  const [wasteType, setWasteType] = useState<WasteCategory>('general');
  const [estimatedWeight, setEstimatedWeight] = useState<number>(80);
  const [locationChoice, setLocationChoice] = useState<'current' | 'saved' | 'other'>('current');
  const [addressInput, setAddressInput] = useState<string>(currentUser.address);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('TR-07');
  const [specialInstructions, setSpecialInstructions] = useState<string>('Loading bay available. Ring intercom 12.');
  const [timeSlot, setTimeSlot] = useState<string>('11:00 - 01:00 PM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmCancelBooking, setConfirmCancelBooking] = useState<boolean>(false);

  // Dynamic truck matching for the current weight & location
  const matchedTrucks: MatchedTruck[] = getAvailableTrucks(state.trucks, estimatedWeight, {
    address: addressInput,
    x: 35,
    y: 40,
  });

  // Pickups for this customer
  const myPickups = state.pickups.filter(
    p => p.customerId === currentUser.id || p.residentEmail === currentUser.email || p.id === 'WM-28491'
  );

  // Active pickup for tracking
  const activePickup = state.pickups.find(p => p.id === selectedPickupForTracking) || myPickups[0] || state.pickups[0];

  // Latest assigned truck for active pickup
  const trackingTruck = state.trucks.find(t => t.id === activePickup?.assignedTruckId) || state.trucks.find(t => t.id === 'TR-07');

  const handleStartBooking = () => {
    setBookingStep(1);
    setActiveTab('request');
  };

  const handleCancelBooking = () => {
    if (confirmCancelBooking) {
      setBookingStep(1);
      setActiveTab('home');
      setConfirmCancelBooking(false);
    } else {
      setConfirmCancelBooking(true);
      setTimeout(() => setConfirmCancelBooking(false), 4000);
    }
  };

  const handleConfirmPickup = async () => {
    if (currentUser.isGuest) {
      alert('Please create a customer account to confirm and dispatch real municipal pickups.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSchedulePickup({
        residentName: currentUser.name,
        residentEmail: currentUser.email,
        residentPhone: currentUser.phone,
        address: addressInput,
        zone: currentUser.zone,
        wasteCategory: wasteType,
        estimatedWeightKg: estimatedWeight,
        timeSlot,
        specialInstructions,
        selectedTruckId,
      });

      // Move to tracking
      setSelectedPickupForTracking('WM-28491');
      setActiveTab('track');
      setBookingStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden text-slate-900">
      {/* Top Customer Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              ET
            </div>
            <div className="leading-tight">
              <span className="text-xs font-bold text-slate-900">EcoTrack</span>
              <span className="text-xs text-slate-400 font-medium ml-1">· Customer Portal</span>
            </div>
          </div>
          <span className="hidden sm:inline-block text-slate-300">|</span>
          <span className="text-xs text-slate-600 font-medium">
            Welcome, <strong>{currentUser.name}</strong> {currentUser.isGuest && <span className="text-amber-600 font-bold">(Guest)</span>}
          </span>
        </div>

        {/* Tab Links */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'request', label: 'Request Pickup', icon: PlusCircle },
            { id: 'track', label: 'Track Pickup', icon: Compass },
            { id: 'scheduled', label: 'Scheduled Collections', icon: Calendar },
            { id: 'history', label: 'Collection History', icon: History },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'disposal_verification', label: 'Disposal Verification', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`customer-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as CustomerTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Switcher */}
        <button
          onClick={onOpenRoleSwitcher}
          className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors font-semibold"
        >
          Switch Role
        </button>
      </header>

      {/* Main Tab Viewport */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: CUSTOMER HOME                                         */}
        {/* ============================================================ */}
        {activeTab === 'home' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Greeting & Primary Action */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Good afternoon, {currentUser.name.split(' ')[0]}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Residential waste services active for <span className="font-semibold text-slate-700">{currentUser.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="customer-home-request-extra-pickup-btn"
                  onClick={handleStartBooking}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Request Extra Pickup</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Next Scheduled</span>
                <p className="text-sm font-bold text-slate-900 mt-1">Today, 11:00 AM</p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Unit TR-07 Assigned
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active Pickup</span>
                <p className="text-sm font-bold text-blue-700 mt-1 font-mono">{activePickup?.id || 'None'}</p>
                <span className="text-[10px] text-slate-500">{activePickup?.status.toUpperCase() || 'IDLE'}</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Waste Collected</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{currentUser.totalWasteCollectedKg} kg</p>
                <span className="text-[10px] text-slate-500">Certified by scale</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Pickups</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{currentUser.totalPickupsCompleted}</p>
                <span className="text-[10px] text-slate-500">100% verified</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pending Payment</span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5 font-mono">₹{currentUser.pendingPaymentInr}</p>
                <span className="text-[10px] text-emerald-600">All invoices settled</span>
              </div>
            </div>

            {/* Active Pickup Alert / Card */}
            {activePickup && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <TruckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">{activePickup.id}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {activePickup.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Assigned to <strong>{trackingTruck?.id} ({trackingTruck?.driverName})</strong> · ETA ~6 mins
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPickupForTracking(activePickup.id);
                      setActiveTab('track');
                    }}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>View Live Tracking Map</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-tight text-slate-800">
                  Recent Collection Activity &amp; Invoices
                </h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  View all history →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {myPickups.slice(0, 3).map(p => (
                  <div key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-xs font-bold text-slate-700">
                        {p.wasteCategory.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-900">{p.id}</span>
                          <span className="text-[10px] text-slate-500">· {p.scheduledDate} ({p.timeSlot})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{p.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {p.actualCollectedKg ? `${p.actualCollectedKg} kg (Weighed)` : `~${p.estimatedWeightKg} kg (Est.)`}
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {p.finalPriceInr ? `₹${p.finalPriceInr}` : `Est. ₹${Math.round(p.estimatedWeightKg * 2)}`}
                        </p>
                      </div>

                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: REQUEST PICKUP (4-STEP REAL WORKFLOW)                 */}
        {/* ============================================================ */}
        {activeTab === 'request' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header & Step Indicator */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Request Waste Pickup</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic truck capacity dispatch with certified digital weighing
                </p>
              </div>

              {/* Steps Progress */}
              <div className="flex items-center gap-2">
                {[
                  { num: 1, label: 'Waste' },
                  { num: 2, label: 'Location' },
                  { num: 3, label: 'Truck' },
                  { num: 4, label: 'Confirm' },
                ].map(s => (
                  <div key={s.num} className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      bookingStep === s.num
                        ? 'bg-emerald-600 text-white'
                        : bookingStep > s.num
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {bookingStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:inline ${
                      bookingStep === s.num ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                    {s.num < 4 && <span className="text-slate-300 mx-1">›</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Body */}
            <div className="p-6">
              {/* ----------------- STEP 1: WASTE ----------------- */}
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">STEP 1 — WASTE SELECTION</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select the dominant waste stream and provide an estimated batch weight.
                    </p>
                  </div>

                  {/* Waste Category Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'general', label: 'General Waste', desc: 'Mixed non-recyclable domestic' },
                      { id: 'organic', label: 'Organic / Wet Waste', desc: 'Food waste, lawn clippings' },
                      { id: 'dry_recyclable', label: 'Dry / Recyclable', desc: 'Paper, cardboard, glass' },
                      { id: 'plastic', label: 'Plastic Packaging', desc: 'Bottles, films, clean rigid' },
                      { id: 'construction_debris', label: 'Construction / Debris', desc: 'Rubble, tiles, plaster' },
                      { id: 'e_waste', label: 'E-Waste / Special', desc: 'Electronics, appliances' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setWasteType(type.id as WasteCategory)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          wasteType === type.id
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{type.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{type.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Estimated Weight Input with Quick Presets */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <label className="block text-xs font-bold uppercase text-slate-700">
                      Estimated Weight (kg):
                    </label>

                    <div className="flex items-center gap-3">
                      <div className="relative w-44">
                        <input
                          type="number"
                          min="1"
                          max="800"
                          value={estimatedWeight}
                          onChange={(e) => setEstimatedWeight(Math.max(1, Number(e.target.value) || 1))}
                          className="w-full text-xl font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">kg</span>
                      </div>

                      {/* Weight presets */}
                      <div className="flex items-center gap-1.5">
                        {[25, 50, 80, 120, 250].map(w => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => setEstimatedWeight(w)}
                            className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                              estimatedWeight === w
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {w}kg
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weight Pricing Notice */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                      <Scale className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong>Important Billing Policy:</strong> Final charges are calculated strictly using the 
                        actual weight recorded by the collector on the certified digital scale at pickup. 
                        Estimates are solely used to guarantee truck capacity.
                      </p>
                    </div>
                  </div>

                  {/* Navigation Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleCancelBooking}
                      className="text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                    >
                      {confirmCancelBooking ? 'Confirm Discard?' : 'Cancel Booking'}
                    </button>

                    <button
                      type="button"
                      id="customer-step1-continue-btn"
                      onClick={() => setBookingStep(2)}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Location</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- STEP 2: LOCATION ----------------- */}
              {bookingStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">STEP 2 — LOCATION &amp; ACCESS</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Confirm pickup address and driver gate instructions.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'current', label: 'Current Location', desc: 'Indiranagar Ward 84' },
                        { id: 'saved', label: 'Saved Address', desc: currentUser.address.substring(0, 24) + '...' },
                        { id: 'other', label: 'Other Address', desc: 'Enter custom address' },
                      ].map(loc => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setLocationChoice(loc.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            locationChoice === loc.id
                              ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{loc.label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{loc.desc}</p>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Pickup Address
                      </label>
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Preferred Time Slot
                        </label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                        >
                          <option value="09:00 - 11:00 AM">09:00 - 11:00 AM (Morning Slot)</option>
                          <option value="11:00 - 01:00 PM">11:00 - 01:00 PM (Midday Slot)</option>
                          <option value="02:00 - 04:00 PM">02:00 - 04:00 PM (Afternoon Slot)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Gate Access Notes / Intercom
                        </label>
                        <input
                          type="text"
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="e.g. Ring bell 12, gate security notified"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Simulated Map Visualizer */}
                    <div className="relative h-40 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div className="text-center z-10 p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-slate-200 shadow-xs">
                        <MapPin className="w-5 h-5 text-emerald-600 mx-auto mb-1 animate-bounce" />
                        <span className="text-xs font-bold text-slate-900 block">{addressInput}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Ward 84 GIS Point (35.2°N, 40.1°E)</span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Waste</span>
                    </button>

                    <button
                      type="button"
                      id="customer-step2-continue-btn"
                      onClick={() => setBookingStep(3)}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <span>Find Available Trucks</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- STEP 3: FIND AVAILABLE TRUCKS ----------------- */}
              {bookingStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">STEP 3 — AVAILABLE TRUCKS WITH CAPACITY</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing nearby trucks with sufficient capacity for your {estimatedWeight} kg request.
                    </p>
                  </div>

                  {matchedTrucks.length === 0 ? (
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                      <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                      <p className="text-xs font-bold text-amber-900">
                        No trucks in Sector 4 currently have {estimatedWeight} kg of available capacity.
                      </p>
                      <p className="text-xs text-amber-700">
                        Units are currently discharging at transfer facilities. Try lowering the estimated batch weight or check back shortly.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matchedTrucks.slice(0, 4).map((truck) => {
                        const isSelected = selectedTruckId === truck.id;
                        return (
                          <div
                            key={truck.id}
                            onClick={() => setSelectedTruckId(truck.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-wrap items-center justify-between gap-4 ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <TruckIcon className="w-5 h-5" />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900 font-mono">{truck.id}</h4>
                                  <span className="text-xs font-semibold text-slate-600">({truck.driverName})</span>
                                  <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                                    {truck.status}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-mono">
                                  <span>{truck.distanceKm} km away</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold">ETA: {truck.etaMinutes} min</span>
                                  <span>•</span>
                                  <span>Zone: {truck.currentZone}</span>
                                </p>
                              </div>
                            </div>

                            {/* Capacity Metrics & Select Button */}
                            <div className="flex items-center gap-4">
                              <div className="text-right text-xs font-mono">
                                <p className="text-slate-500">
                                  Current Load: <strong className="text-slate-900">{truck.currentLoadKg} kg</strong>
                                </p>
                                <p className="text-emerald-700 font-bold">
                                  Available Capacity: {truck.availableCapacityKg} kg
                                </p>
                                <span className="text-[10px] text-slate-400">
                                  Occupancy: {truck.occupancyPercent}%
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTruckId(truck.id);
                                }}
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isSelected ? 'Selected ✓' : 'Select Truck'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Navigation Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Location</span>
                    </button>

                    <button
                      type="button"
                      id="customer-step3-continue-btn"
                      disabled={matchedTrucks.length === 0}
                      onClick={() => setBookingStep(4)}
                      className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Confirmation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- STEP 4: CONFIRM PICKUP ----------------- */}
              {bookingStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">STEP 4 — CONFIRM DISPATCH</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review collection itinerary. Job will be dispatched directly to the collector's manifest.
                    </p>
                  </div>

                  {/* Summary Itinerary Card */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Pickup Address:</span>
                      <strong className="text-slate-900 text-right">{addressInput}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Waste Stream:</span>
                      <strong className="text-slate-900 capitalize">{wasteType.replace('_', ' ')}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Estimated Weight:</span>
                      <span className="font-mono font-bold text-slate-900">{estimatedWeight} kg</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Assigned Truck &amp; Collector:</span>
                      <span className="font-bold text-emerald-800 font-mono">
                        {selectedTruckId} · {matchedTrucks.find(t => t.id === selectedTruckId)?.driverName || 'Ravi Kumar'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/80">
                      <span className="text-slate-500">Estimated Arrival (ETA):</span>
                      <strong className="text-slate-900">
                        {matchedTrucks.find(t => t.id === selectedTruckId)?.etaMinutes || 8} minutes
                      </strong>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Estimated Price Range:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{Math.round(estimatedWeight * 1.8)} - ₹{Math.round(estimatedWeight * 2.2)} (at ₹2.0/kg)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Actual Weight Billing Policy:</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed">
                        Final price will be calculated after the waste is weighed on the on-board digital scale. 
                        Payment is processed only upon physical verification.
                      </p>
                    </div>
                  </div>

                  {/* Navigation Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setBookingStep(3)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Trucks</span>
                    </button>

                    <button
                      type="button"
                      id="customer-confirm-booking-btn"
                      disabled={isSubmitting}
                      onClick={handleConfirmPickup}
                      className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'Dispatching Request...' : 'Confirm Pickup'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: LIVE TRACKING                                         */}
        {/* ============================================================ */}
        {activeTab === 'track' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Live Collection Tracking</h2>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {activePickup.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned Unit: <strong className="text-slate-900">{trackingTruck?.id} ({trackingTruck?.driverName})</strong> · Plate: {trackingTruck?.plateNumber}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  ETA: 6 mins away
                </span>
              </div>
            </div>

            {/* Tracking Map & Status Progression */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Large Map Visualizer (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    Sector 4 Indiranagar Telematics Grid
                  </span>
                  <span className="font-mono text-slate-500">Live GPS Polling</span>
                </div>

                {/* Map Stage */}
                <div className="relative h-[340px] bg-slate-100 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"></div>

                  {/* Route SVG Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="35%" y1="65%" x2="60%" y2="35%" stroke="#059669" strokeWidth="3" strokeDasharray="6 6" />
                  </svg>

                  {/* Customer Marker */}
                  <div className="absolute left-[35%] top-[65%] -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg ring-4 ring-slate-200 mx-auto">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded shadow-xs border border-slate-200 mt-1 block">
                      My Location (12 Lake View Rd)
                    </span>
                  </div>

                  {/* Moving Truck Marker */}
                  <div className="absolute left-[60%] top-[35%] -translate-x-1/2 -translate-y-1/2 z-20 text-center animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200 mx-auto">
                      <TruckIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-800 text-white px-2 py-0.5 rounded shadow-xs mt-1 block whitespace-nowrap">
                      {trackingTruck?.id} · Ravi Kumar (6 min)
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestones Timeline (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 mb-4">
                    Collection Progression
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Request Confirmed</p>
                        <p className="text-[11px] text-slate-500">Order logged at {activePickup.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Collector Assigned</p>
                        <p className="text-[11px] text-slate-500">
                          {trackingTruck?.id} ({trackingTruck?.driverName})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 animate-pulse">
                        ●
                      </div>
                      <div>
                        <p className="font-bold text-blue-900">Collector on the Way</p>
                        <p className="text-[11px] text-blue-700">1.4 km away · ETA ~6 mins</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                        activePickup.actualCollectedKg ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {activePickup.actualCollectedKg ? '✓' : '○'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Waste Collection &amp; Weighing</p>
                        {activePickup.actualCollectedKg ? (
                          <p className="text-[11px] text-emerald-700 font-bold">
                            Weighed: {activePickup.actualCollectedKg} kg · ₹{activePickup.finalPriceInr}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">Digital scale verification</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                        activePickup.disposalVerifiedAt ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {activePickup.disposalVerifiedAt ? '✓' : '○'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Disposal Verification</p>
                        {activePickup.disposalVerifiedAt ? (
                          <p className="text-[11px] text-emerald-700 font-bold">
                            Verified at {activePickup.disposalYardName}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">Yard weighbridge audit slip</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Pass for verification */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Driver Verification Pass</span>
                    <p className="text-xs font-mono font-bold text-slate-900">{activePickup.qrCode}</p>
                  </div>
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
              </div>
            </div>

            {/* Collection Completion Card (when weighed) */}
            {activePickup.actualCollectedKg && (
              <div className="bg-white rounded-xl border border-emerald-300 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-sm font-bold">Waste Collected Successfully</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-sans">Estimated Weight</span>
                    <strong className="text-slate-700">{activePickup.estimatedWeightKg} kg</strong>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block font-sans font-bold">Certified Actual Weight</span>
                    <strong className="text-emerald-900 text-base">{activePickup.actualCollectedKg} kg</strong>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block font-sans font-bold">Final Price (₹2.0/kg)</span>
                    <strong className="text-emerald-900 text-base">₹{activePickup.finalPriceInr}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-sans">Weighed At</span>
                    <strong className="text-slate-700">{activePickup.collectedAt || '11:42 AM'}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  The price is strictly calculated from the certified onboard digital scale reading of{' '}
                  <strong>{activePickup.actualCollectedKg} kg</strong>, not the estimated weight.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SCHEDULED COLLECTIONS                                 */}
        {/* ============================================================ */}
        {activeTab === 'scheduled' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Scheduled Collections</h2>
                <p className="text-xs text-slate-500">Pending and upcoming pickups scheduled for your address</p>
              </div>
              <button
                onClick={handleStartBooking}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Book New</span>
              </button>
            </div>

            <div className="space-y-3">
              {myPickups.filter(p => p.status !== 'completed').map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{p.id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {p.wasteCategory.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{p.scheduledDate} ({p.timeSlot})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.address}</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Assigned: {p.assignedTruckId || 'Pending dispatch'} ({p.collectorName || 'Assigning driver'})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-900 font-bold">~{p.estimatedWeightKg} kg</span>
                      <p className="text-[10px] text-slate-400">Est. ₹{Math.round(p.estimatedWeightKg * 2)}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPickupForTracking(p.id);
                        setActiveTab('track');
                      }}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg"
                    >
                      Track →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: COLLECTION HISTORY                                    */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Collection History</h2>
              <p className="text-xs text-slate-500">Historical records of waste collected and verified</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {state.pickups.map(p => (
                  <div key={p.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">{p.id}</span>
                        <span className="text-xs font-semibold text-slate-700">{p.residentName}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.wasteCategory.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{p.address}</p>
                      {p.disposalYardName && (
                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Disposed at {p.disposalYardName}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono text-xs">
                        <strong className="text-slate-900">{p.actualCollectedKg ? `${p.actualCollectedKg} kg` : `~${p.estimatedWeightKg} kg`}</strong>
                        <p className="text-slate-500">{p.finalPriceInr ? `₹${p.finalPriceInr}` : `Est. ₹${Math.round(p.estimatedWeightKg * 2)}`}</p>
                      </div>

                      {p.proofOfDisposalId ? (
                        <button
                          onClick={() => {
                            setSelectedDisposalRecordId(p.id);
                            setActiveTab('disposal_verification');
                          }}
                          className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-bold"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">In Transit</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: PAYMENTS                                              */}
        {/* ============================================================ */}
        {activeTab === 'payments' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Billing &amp; Payments</h2>
              <p className="text-xs text-slate-500">Invoices generated strictly from certified weigh scale data</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Billed YTD</span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">₹572.80</p>
                <span className="text-[10px] text-slate-500">286.4 kg @ ₹2.0/kg</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Eco-Points Tax Offset</span>
                <p className="text-xl font-bold font-mono text-emerald-700 mt-1">₹240.00</p>
                <span className="text-[10px] text-emerald-600">480 points redeemed</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Outstanding</span>
                <p className="text-xl font-bold font-mono text-slate-900 mt-1">₹0.00</p>
                <span className="text-[10px] text-emerald-600">All balances clear</span>
              </div>
            </div>

            {/* Invoices list */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4">
              <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 mb-3">
                Scale Weighed Receipts
              </h3>

              <div className="divide-y divide-slate-100 text-xs font-mono">
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">INV-8820 · Tata Consultancy Complex</span>
                    <p className="text-[10px] text-slate-500 font-sans">124.5 kg e-waste @ ₹5.0/kg</p>
                  </div>
                  <span className="font-bold text-emerald-700">₹622.50 Paid ✓</span>
                </div>

                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900">INV-8812 · Cafe Coffee Day</span>
                    <p className="text-[10px] text-slate-500 font-sans">68.2 kg organic @ ₹2.0/kg</p>
                  </div>
                  <span className="font-bold text-emerald-700">₹136.40 Paid ✓</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: DISPOSAL VERIFICATION (PROOF OF DISPOSAL)             */}
        {/* ============================================================ */}
        {activeTab === 'disposal_verification' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Proof of Disposal</h2>
              <p className="text-xs text-slate-500">
                Audited certificate proving that waste reached authorized municipal processing facilities.
              </p>
            </div>

            {/* Certificate Presentation Card */}
            <div className="bg-white rounded-2xl border border-emerald-300 shadow-md p-6 space-y-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-emerald-50 pointer-events-none"></div>

              {/* Certificate Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">Disposal Verified ✓</h3>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        OFFICIAL MUNICIPAL SLIP
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Bruhat Bengaluru Mahanagara Palike (BBMP) Solid Waste Div.</p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Downloading official municipal PDF weighbridge certificate...')}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                  title="Download Slip"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Certificate Field Table */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Collection ID</span>
                  <strong className="text-slate-900 font-mono text-sm">WM-28491</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Waste Collected</span>
                  <strong className="text-emerald-700 font-mono text-sm">86.4 kg (Scale Certified)</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Transport Vehicle</span>
                  <strong className="text-slate-900 font-mono">TR-07 (Ravi Kumar)</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Authorized Facility</span>
                  <strong className="text-slate-900">Municipal Waste Yard #03</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Collection Time</span>
                  <strong className="text-slate-900 font-mono">11:42 AM</strong>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Disposal Time</span>
                  <strong className="text-slate-900 font-mono">12:26 PM</strong>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Status: <strong>VERIFIED</strong> · Weight reconciles with Yard #03 digital weighbridge gross/tare sensors.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-emerald-600 font-bold">DISP-VER-8820</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
