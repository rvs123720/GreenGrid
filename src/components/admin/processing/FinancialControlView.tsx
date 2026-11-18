import React, { useState } from 'react';
import { ProcessingBatch } from '../../../types';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChart, 
  DollarSign, 
  Truck, 
  Factory, 
  Trash2, 
  CheckCircle2, 
  X,
  FileText,
  Info
} from 'lucide-react';

interface FinancialControlViewProps {
  batch: ProcessingBatch;
  batches?: ProcessingBatch[];
  onSelectBatch?: (b: ProcessingBatch) => void;
}

interface CostDrillDown {
  title: string;
  category: string;
  amount: number;
  items: Array<{ name: string; amount: number; notes: string }>;
}

export const FinancialControlView: React.FC<FinancialControlViewProps> = ({ batch }) => {
  const [activeDrillDown, setActiveDrillDown] = useState<CostDrillDown | null>(null);

  // Financial calculations
  const collectionCost = 8400; // Driver wages ₹3,800 + Fuel ₹2,800 + Route toll & fleet maintenance ₹1,800
  const processingCost = 6900; // ZLD ₹1,800 + Power RDF ₹700 + Plastic ₹1,800 + Chem ₹1,200 + Ash ₹400 + Hazmat transport ₹1,000
  const disposalCost = 5850;   // Sludge ₹1,350 + TSDF hazmat ₹3,500 + Chem disposal ₹550 + Ash slag ₹450
  
  const totalCost = collectionCost + processingCost + disposalCost; // ₹21,150

  const powerRevenue = 1260;
  const plasticRevenue = 3600;
  const chemicalRevenue = 3000;
  const ashRevenue = 900;
  const waterReuseRevenue = 500;
  const totalRevenue = powerRevenue + plasticRevenue + chemicalRevenue + ashRevenue + waterReuseRevenue; // ₹9,260

  const netOperatingLoss = totalRevenue - totalCost; // -₹11,890

  // Itemized Drill Downs
  const drillDownDetails: Record<string, CostDrillDown> = {
    collection: {
      title: 'Collection & Logistics Cost Breakdown',
      category: 'Upstream Logistics',
      amount: collectionCost,
      items: [
        { name: 'Driver & Collector Wages (2 shifts)', amount: 3800, notes: 'Direct municipal field labor' },
        { name: 'Fleet Diesel & EV Charging', amount: 2800, notes: '142 km cumulative route telematics' },
        { name: 'Fleet Scheduled Maintenance & Tyres', amount: 1200, notes: 'Vehicle wear and maintenance amortized' },
        { name: 'Municipal Highway Tolls & Weighbridge Fees', amount: 600, notes: 'State toll gate receipts' },
      ],
    },
    processing: {
      title: 'Facility Processing & Sorting Operating Costs',
      category: 'Midstream Facility',
      amount: processingCost,
      items: [
        { name: 'ZLD Multi-Effect Evaporator Electrical & Steam', amount: 1800, notes: 'Thermal energy for water separation' },
        { name: 'Optical Near-Infrared Polymer Sorter & Granulator', amount: 1800, notes: 'Sorting blade wear and electricity' },
        { name: 'Chemical Vacuum Distillation Recovery Solvent', amount: 1200, notes: 'Specialized condensation condensers' },
        { name: 'Hazardous Waste Monitored GPS Hazmat Tanker Transport', amount: 1000, notes: 'Dedicated certified hazmat carrier' },
        { name: 'Refuse-Derived Fuel Pelletizer & Shredder Feed', amount: 700, notes: 'Mechanical pelletizing prep' },
        { name: 'Pozzolanic Ash Heavy-Metal Leach Testing & Milling', amount: 400, notes: 'Laboratory batch certification' },
      ],
    },
    disposal: {
      title: 'Secured TSDF & Landfill Disposal Costs',
      category: 'Downstream Safe Disposal',
      amount: disposalCost,
      items: [
        { name: 'Authorized TSDF Encapsulation & Autoclave (Hazardous)', amount: 3500, notes: 'CPCB-certified deep secured cell' },
        { name: 'Dewatered ZLD Sludge Safe Landfill Disposal', amount: 1350, notes: 'Specialized organic sludge disposal' },
        { name: 'Non-Recoverable Chemical Neutralization & Disposal', amount: 550, notes: 'Acid/base neutralization sludge' },
        { name: 'Contaminated Fly Ash Heavy-Metal Vitrification Slag', amount: 450, notes: 'Concrete block safe burial' },
      ],
    },
    revenue: {
      title: 'Circular Resource Sales Revenue Breakdown',
      category: 'Municipal Resource Monetization',
      amount: totalRevenue,
      items: [
        { name: 'Recycled Plastic Paver Blocks & Containers (80 kg @ ₹45/kg)', amount: 3600, notes: 'Commercial wholesale sales to civil contractors' },
        { name: 'Recovered Organic Chemical Solvents (25 kg @ ₹120/kg)', amount: 3000, notes: 'Industrial solvent distributor purchase' },
        { name: 'Grid Export Electricity (180 kWh @ ₹7/kWh BESCOM PPA)', amount: 1260, notes: 'Net-metered power fed to municipal substation' },
        { name: 'Pozzolanic Ash for Green Cement (45 kg @ ₹20/kg)', amount: 900, notes: 'Ready-mix concrete manufacturing blend' },
        { name: 'Treated ZLD Water Offset Savings (250 L reused)', amount: 500, notes: 'Facility and municipal truck wash water offset' },
      ],
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Control Point 4
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Control & Cost Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent municipal financial accounting covering collection, processing, authorized TSDF disposal, and circular revenue streams.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono font-bold">
            Auditing: {batch.id} ({batch.facilityInputWeightKg} kg)
          </span>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost Card */}
        <div 
          onClick={() => setActiveDrillDown(drillDownDetails.collection)}
          className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Operational Cost</span>
            <span className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900">₹{totalCost.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Collection, sorting & disposal</span>
            <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
              Breakdown <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Processing Cost Card */}
        <div 
          onClick={() => setActiveDrillDown(drillDownDetails.processing)}
          className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400">Processing & Sorting Cost</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Factory className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-blue-700">₹{processingCost.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Energy, ZLD & labor</span>
            <span className="text-blue-700 font-bold group-hover:underline flex items-center gap-0.5">
              Breakdown <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Disposal Cost Card */}
        <div 
          onClick={() => setActiveDrillDown(drillDownDetails.disposal)}
          className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400">Safe Disposal & TSDF</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-amber-700">₹{disposalCost.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Encapsulation & sludge</span>
            <span className="text-amber-700 font-bold group-hover:underline flex items-center gap-0.5">
              Breakdown <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div 
          onClick={() => setActiveDrillDown(drillDownDetails.revenue)}
          className="bg-white rounded-2xl border border-slate-200 p-4.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Commodity Revenue</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-700">₹{totalRevenue.toLocaleString()}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Recycled products & power</span>
            <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
              Breakdown <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Cost & Revenue Categorical Comparison Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Streams Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Cost Structure Allocation</h3>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">100% = ₹{totalCost.toLocaleString()}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div 
              onClick={() => setActiveDrillDown(drillDownDetails.collection)}
              className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer space-y-1.5"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  Collection & Fleet Logistics
                </span>
                <span className="font-mono font-bold text-slate-900">₹{collectionCost.toLocaleString()} (39.7%)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full" style={{ width: '39.7%' }} />
              </div>
            </div>

            <div 
              onClick={() => setActiveDrillDown(drillDownDetails.processing)}
              className="p-3 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer space-y-1.5"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-blue-600" />
                  Facility Processing & Sorting
                </span>
                <span className="font-mono font-bold text-blue-800">₹{processingCost.toLocaleString()} (32.6%)</span>
              </div>
              <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: '32.6%' }} />
              </div>
            </div>

            <div 
              onClick={() => setActiveDrillDown(drillDownDetails.disposal)}
              className="p-3 bg-amber-50/50 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer space-y-1.5"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                  Authorized TSDF & Landfill Disposal
                </span>
                <span className="font-mono font-bold text-amber-800">₹{disposalCost.toLocaleString()} (27.7%)</span>
              </div>
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full" style={{ width: '27.7%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Streams Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Revenue Generation Streams</h3>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700">Total = ₹{totalRevenue.toLocaleString()}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-emerald-50/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950 block">Recycled Plastic Products (80 kg @ ₹45/kg)</span>
                <span className="text-[10px] text-slate-500">Paver blocks, pots & structural polymer boards</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-sm">₹{plasticRevenue.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-purple-50/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-950 block">Recovered Industrial Chemicals (25 kg @ ₹120/kg)</span>
                <span className="text-[10px] text-slate-500">Vacuum distillation recovered solvents</span>
              </div>
              <span className="font-mono font-bold text-purple-700 text-sm">₹{chemicalRevenue.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-amber-50/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-amber-950 block">Grid Power Export (180 kWh @ ₹7/kWh)</span>
                <span className="text-[10px] text-slate-500">Waste-to-Energy thermal gasification turbines</span>
              </div>
              <span className="font-mono font-bold text-amber-700 text-sm">₹{powerRevenue.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Fly Ash for Cement Blending (45 kg @ ₹20/kg)</span>
                <span className="text-[10px] text-slate-500">Pozzolanic concrete manufacturing sales</span>
              </div>
              <span className="font-mono font-bold text-slate-700 text-sm">₹{ashRevenue.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-teal-50/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-teal-950 block">ZLD Treated Water Non-Potable Offset</span>
                <span className="text-[10px] text-slate-500">250 L used for truck washing & cooling towers</span>
              </div>
              <span className="font-mono font-bold text-teal-700 text-sm">₹{waterReuseRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drill Down Modal / Slide-Out */}
      {activeDrillDown && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                  {activeDrillDown.category}
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeDrillDown.title}</h3>
              </div>
              <button
                onClick={() => setActiveDrillDown(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {activeDrillDown.items.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-slate-900 block">{item.name}</strong>
                    <span className="text-[11px] text-slate-500">{item.notes}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Subtotal:</span>
              <strong className="font-mono text-base font-bold text-slate-900">
                ₹{activeDrillDown.amount.toLocaleString()}
              </strong>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveDrillDown(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Audit Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
