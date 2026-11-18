import { 
  ProcessingFacility, 
  ProcessingBatch, 
  SegregationRecord, 
  ProcessingStream, 
  FinancialRecord, 
  SegmentalProfitability, 
  PredictiveMaintenanceItem, 
  AIApplicationSimulations 
} from '../types';

/**
 * Waste Processing, AI/ML Segregation & Financial Economics Simulation Service
 * 
 * Simulates downstream municipal processing facility operations:
 * COLLECTION -> COLLECTION CENTRE -> INPUT WEIGHT VERIFICATION -> 
 * AI/ML SEGREGATION -> STREAM PROCESSING -> RECOVERY/DISPOSAL -> 
 * FINANCIAL ACCOUNTING -> PROFITABILITY
 */

export const INITIAL_FACILITIES: ProcessingFacility[] = [
  {
    id: 'PROC-01',
    name: 'Municipal Processing Centre #01 (North Integrated Bio-Park)',
    location: 'Bengaluru North — Yelahanka Industrial Hub',
    status: 'operational',
    inputWeightTodayKg: 4820,
    processedWeightTodayKg: 4510,
    recoveredWeightTodayKg: 3240,
    disposedWeightTodayKg: 1270,
    recoveryRatePercent: 71.8,
    processingCostInr: 16240,
    revenueInr: 21850,
    profitInr: 5610,
    activeBays: 4,
    currentIntakeRateKgPerHour: 620,
  },
  {
    id: 'PROC-02',
    name: 'Municipal Processing Centre #02 (West MRF & Energy Plant)',
    location: 'Bengaluru West — Peenya Eco-Tech Zone',
    status: 'operational',
    inputWeightTodayKg: 3940,
    processedWeightTodayKg: 3720,
    recoveredWeightTodayKg: 2680,
    disposedWeightTodayKg: 1040,
    recoveryRatePercent: 72.0,
    processingCostInr: 14100,
    revenueInr: 18400,
    profitInr: 4300,
    activeBays: 3,
    currentIntakeRateKgPerHour: 480,
  },
  {
    id: 'PROC-03',
    name: 'Municipal Processing Centre #03 (South Central ZLD & Recovery Hub)',
    location: 'Bengaluru South — Begur Koppa Advanced Recovery Park',
    status: 'operational',
    inputWeightTodayKg: 5410,
    processedWeightTodayKg: 5120,
    recoveredWeightTodayKg: 3780,
    disposedWeightTodayKg: 1340,
    recoveryRatePercent: 73.8,
    processingCostInr: 19400,
    revenueInr: 25600,
    profitInr: 6200,
    activeBays: 5,
    currentIntakeRateKgPerHour: 740,
  },
  {
    id: 'PROC-04',
    name: 'Municipal Processing Centre #04 (East Circular Materials Complex)',
    location: 'Bengaluru East — Whitefield Environmental Park',
    status: 'operational',
    inputWeightTodayKg: 2980,
    processedWeightTodayKg: 2840,
    recoveredWeightTodayKg: 2160,
    disposedWeightTodayKg: 680,
    recoveryRatePercent: 76.1,
    processingCostInr: 10850,
    revenueInr: 15300,
    profitInr: 4450,
    activeBays: 2,
    currentIntakeRateKgPerHour: 390,
  },
];

// Helper to construct dynamic streams from segregated quantities
export function buildStreamsForBatch(batchId: string, segregation: {
  wetKg: number;
  dryKg: number;
  plasticKg: number;
  hazardousKg: number;
  chemicalKg: number;
  ashKg: number;
}, ashCanBeReused: boolean = true): ProcessingStream[] {
  // 1. WET WASTE -> ZLD Process
  const wetInput = segregation.wetKg;
  const recoveredWaterLiters = Math.round(wetInput * (250 / 420));
  const organicResidueKg = Math.round(wetInput * (110 / 420));
  const sludgeKg = Math.round(wetInput * (45 / 420));
  const wetLossKg = wetInput - (recoveredWaterLiters + organicResidueKg + sludgeKg);
  const wetCost = Math.round(wetInput * (1800 / 420));
  const wetRevenue = Math.round(wetInput * (500 / 420)); // Water reuse value
  const wetProfit = wetRevenue - wetCost;
  const wetRecovered = recoveredWaterLiters + organicResidueKg;
  const wetResidual = sludgeKg + Math.max(0, wetLossKg);

  // 2. DRY WASTE -> Power Generation / Energy Recovery
  const dryInput = segregation.dryKg;
  const energyKwh = Math.round(dryInput * (180 / 260));
  const powerTariff = 7.0; // ₹7 per kWh
  const dryRevenue = Math.round(energyKwh * powerTariff);
  const dryCost = Math.round(dryInput * (700 / 260));
  const dryProfit = dryRevenue - dryCost;
  const dryRecovered = dryInput - Math.round(dryInput * (30 / 260)); // Recovered energy fraction
  const dryResidual = dryInput - dryRecovered;

  // 3. PLASTIC WASTE -> Recycling / Reusable Products
  const plasticInput = segregation.plasticKg;
  const recoverablePlastic = Math.round(plasticInput * (120 / 150));
  const reusableProductKg = Math.round(plasticInput * (80 / 150));
  const plasticProductPrice = 45; // ₹45 per kg
  const plasticRevenue = Math.round(reusableProductKg * plasticProductPrice);
  const plasticCost = Math.round(plasticInput * (1800 / 150));
  const plasticProfit = plasticRevenue - plasticCost;
  const plasticRecovered = reusableProductKg;
  const plasticResidual = plasticInput - reusableProductKg;

  // 4. HAZARDOUS WASTE -> Safe Collection & Authorized Disposal
  const hazInput = segregation.hazardousKg;
  const transportCost = Math.round(hazInput * (1400 / 70));
  const hazardDisposalCost = Math.round(hazInput * (3500 / 70));
  const hazCost = transportCost + hazardDisposalCost;
  const hazRevenue = 0;
  const hazProfit = -hazCost;
  const hazRecovered = 0;
  const hazResidual = hazInput;

  // 5. CHEMICAL WASTE -> Recovery Assessment & Reuse vs Disposal
  const chemInput = segregation.chemicalKg;
  const recoverableChemicalKg = Math.round(chemInput * (25 / 40));
  const chemDisposalKg = chemInput - recoverableChemicalKg;
  const chemSellingRate = 120; // ₹120 per kg
  const chemRevenue = Math.round(recoverableChemicalKg * chemSellingRate);
  const chemRecoveryCost = Math.round(recoverableChemicalKg * (1200 / 25));
  const chemDisposalCost = Math.round(chemDisposalKg * (1500 / 15));
  const chemTotalCost = chemRecoveryCost + chemDisposalCost;
  const chemProfit = chemRevenue - chemTotalCost;
  const chemRecovered = recoverableChemicalKg;
  const chemResidual = chemDisposalKg;

  // 6. BURNT WASTE / ASH -> Testing & Construction vs Safe Disposal
  const ashInput = segregation.ashKg;
  let ashRecovered = 0;
  let ashResidual = ashInput;
  let ashRevenue = 0;
  let ashCost = 0;
  let reusableAshKg = 0;
  let ashDisposalKg = ashInput;

  if (ashCanBeReused) {
    reusableAshKg = Math.round(ashInput * (45 / 60));
    ashDisposalKg = ashInput - reusableAshKg;
    const ashSellingRate = 20; // ₹20/kg for cement manufacturing
    ashRevenue = Math.round(reusableAshKg * ashSellingRate);
    const ashProcessingCost = Math.round(reusableAshKg * (400 / 45));
    const ashDisposalCost = Math.round(ashDisposalKg * (450 / 15));
    ashCost = ashProcessingCost + ashDisposalCost;
    ashRecovered = reusableAshKg;
    ashResidual = ashDisposalKg;
  } else {
    // 100% safe disposal
    ashRevenue = 0;
    ashCost = Math.round(ashInput * 15); // ₹15/kg safe disposal
    ashRecovered = 0;
    ashResidual = ashInput;
  }
  const ashProfit = ashRevenue - ashCost;

  return [
    {
      id: `${batchId}-STR-WET`,
      batchId,
      category: 'wet',
      name: 'Wet Waste (Organic & Slurry)',
      processingRoute: 'ZLD / Water Treatment Process',
      inputKg: wetInput,
      processedKg: wetInput - Math.max(0, wetLossKg),
      recoveredKg: wetRecovered,
      residualKg: wetResidual,
      processingCost: wetCost,
      revenue: wetRevenue,
      profit: wetProfit,
      recoveryRatePercent: wetInput > 0 ? Math.round((wetRecovered / wetInput) * 1000) / 10 : 0,
      processingMethod: 'Anaerobic Digestion + Multi-Effect Evaporator (Zero Liquid Discharge)',
      status: 'completed',
      details: {
        recoveredWaterLiters,
        organicResidueKg,
        sludgeKg,
        processingLossKg: Math.max(0, wetLossKg),
        waterPotentialUse: ['Urban green belt watering', 'Facility cooling towers', 'Truck wash bays', 'Non-potable civil works'],
        sludgeDisposalCost: 1350,
      },
    },
    {
      id: `${batchId}-STR-DRY`,
      batchId,
      category: 'dry',
      name: 'Dry Waste (Refuse-Derived Fuel & Combustibles)',
      processingRoute: 'Power Generation / Energy Recovery (WTE)',
      inputKg: dryInput,
      processedKg: dryInput,
      recoveredKg: dryRecovered,
      residualKg: dryResidual,
      processingCost: dryCost,
      revenue: dryRevenue,
      profit: dryProfit,
      recoveryRatePercent: dryInput > 0 ? Math.round((dryRecovered / dryInput) * 1000) / 10 : 0,
      processingMethod: 'High-Calorific RDF Pelletization & Thermal Gasification Turbines',
      status: 'completed',
      details: {
        energyGeneratedKwh: energyKwh,
        energySoldKwh: energyKwh,
        powerTariffPerKwh: powerTariff,
      },
    },
    {
      id: `${batchId}-STR-PLASTIC`,
      batchId,
      category: 'plastic',
      name: 'Plastic Waste (Rigid & Flexible Polymers)',
      processingRoute: 'Recycling / Non-Hazardous Plastic Processing',
      inputKg: plasticInput,
      processedKg: plasticInput,
      recoveredKg: plasticRecovered,
      residualKg: plasticResidual,
      processingCost: plasticCost,
      revenue: plasticRevenue,
      profit: plasticProfit,
      recoveryRatePercent: plasticInput > 0 ? Math.round((plasticRecovered / plasticInput) * 1000) / 10 : 0,
      processingMethod: 'Optical Near-Infrared Sorting, Granulation & Extrusion Molding',
      status: 'completed',
      details: {
        recoverablePlasticKg: recoverablePlastic,
        reusableProductKg,
        plasticProductPricePerKg: plasticProductPrice,
        contaminatedPlasticKg: plasticInput - recoverablePlastic,
      },
    },
    {
      id: `${batchId}-STR-HAZ`,
      batchId,
      category: 'hazardous',
      name: 'Hazardous Waste (Infectious, Biomedical & Sharp)',
      processingRoute: 'Safe Collection -> Authorized Hazardous Disposal (TSDF)',
      inputKg: hazInput,
      processedKg: hazInput,
      recoveredKg: 0,
      residualKg: hazInput,
      processingCost: hazCost,
      revenue: 0,
      profit: -hazCost,
      recoveryRatePercent: 0,
      processingMethod: 'High-Temperature Autoclaving & Secured Landfill Cell Stabilization',
      status: 'completed',
      details: {
        controlledHandlingProtocol: 'CPCB Guidelines for Hazardous Waste Class II',
        transportCost,
        hazardDisposalCost,
      },
    },
    {
      id: `${batchId}-STR-CHEM`,
      batchId,
      category: 'chemical',
      name: 'Chemical Waste (Solvents, Battery Acids & Spent Reagents)',
      processingRoute: 'Recovery Assessment -> Fractional Distillation OR Neutralization',
      inputKg: chemInput,
      processedKg: chemInput,
      recoveredKg: chemRecovered,
      residualKg: chemResidual,
      processingCost: chemTotalCost,
      revenue: chemRevenue,
      profit: chemProfit,
      recoveryRatePercent: chemInput > 0 ? Math.round((chemRecovered / chemInput) * 1000) / 10 : 0,
      processingMethod: 'Vacuum Solvent Recovery & Chemical Precipitation Neutralization',
      status: 'completed',
      details: {
        recoverableChemicalKg,
        chemicalSellingRatePerKg: chemSellingRate,
        chemicalDisposalKg: chemDisposalKg,
        chemicalDisposalCost: chemDisposalCost,
      },
    },
    {
      id: `${batchId}-STR-ASH`,
      batchId,
      category: 'ash',
      name: 'Burnt Waste & Fly Ash (Thermal Residues)',
      processingRoute: ashCanBeReused 
        ? 'Quality Testing -> Cement & Construction Aggregates'
        : 'Quality Testing -> Safe Encapsulation Disposal',
      inputKg: ashInput,
      processedKg: ashInput,
      recoveredKg: ashRecovered,
      residualKg: ashResidual,
      processingCost: ashCost,
      revenue: ashRevenue,
      profit: ashProfit,
      recoveryRatePercent: ashInput > 0 ? Math.round((ashRecovered / ashInput) * 1000) / 10 : 0,
      processingMethod: ashCanBeReused ? 'Pozzolanic Reactivity Grading & Heavy Metal Leach Testing' : 'Cementitous Vitrification & Hazardous Cell Landfill',
      status: 'completed',
      details: {
        qualityStatus: ashCanBeReused ? 'passed' : 'failed',
        canBeReused: ashCanBeReused,
        reusableAshKg,
        ashSellingRatePerKg: 20,
        ashDisposalKg,
        ashDisposalCost: Math.round(ashDisposalKg * 30),
      },
    },
  ];
}

// 1. Demonstration 1,000 kg Benchmark Batch (Exact match to prompt specifications)
export const DEMO_BATCH_1000KG: ProcessingBatch = (() => {
  const batchId = 'SEG-2026-0906-014';
  const segregation: SegregationRecord = {
    id: `SEG-REC-014`,
    batchId,
    inputWeightKg: 1000,
    wetKg: 420,
    wetPct: 42.0,
    dryKg: 260,
    dryPct: 26.0,
    plasticKg: 150,
    plasticPct: 15.0,
    hazardousKg: 70,
    hazardousPct: 7.0,
    chemicalKg: 40,
    chemicalPct: 4.0,
    ashKg: 60,
    ashPct: 6.0,
    confidence: {
      wet: 94.2,
      dry: 88.5,
      plastic: 91.0,
      hazardous: 83.4,
      chemical: 86.1,
      ash: 89.2,
      overall: 89.7,
    },
    anomalyScore: 0.18,
    anomalyDetected: true,
    anomalyMessage: 'Composition deviation: Hazardous waste is 2.0% above expected municipal baseline (7% vs 5%). Review recommended.',
    expectedComposition: {
      wet: 40.0,
      dry: 30.0,
      plastic: 15.0,
      hazardous: 5.0,
      chemical: 3.0,
      ash: 7.0,
    },
    status: 'completed',
  };

  const streams = buildStreamsForBatch(batchId, segregation, true);
  const totalRevenue = streams.reduce((acc, s) => acc + s.revenue, 0);
  const processingCost = streams.reduce((acc, s) => acc + s.processingCost, 0);
  const collectionCost = 8400; // Standard municipal collection cost
  const totalCost = processingCost + collectionCost;
  const netProfit = totalRevenue - totalCost;
  const recoveredWeight = streams.reduce((acc, s) => acc + s.recoveredKg, 0);
  const disposalWeight = 1000 - recoveredWeight;

  return {
    id: batchId,
    facilityId: 'PROC-03',
    facilityName: 'Municipal Processing Centre #03 (South Central ZLD & Recovery Hub)',
    sourceTruckIds: ['TR-07', 'TR-12', 'TR-21'],
    sourceRequestIds: ['WM-28470', 'WM-28471', 'WM-28475', 'WM-28480'],
    collectorName: 'Ravi Kumar (Lead Dispatcher)',
    sourceDescription: 'Green Valley Apartments, Koramangala Commercial Hub & Indiranagar Sector 4',
    wasteType: 'Mixed Municipal Solid Waste (MSW) — Regulated Batch',
    collectionWeightKg: 1000,
    facilityInputWeightKg: 1000,
    truckWeightBeforeDisposalKg: 1030,
    truckWeightAfterUnloadingKg: 30,
    calculatedWasteReceivedKg: 1000,
    varianceKg: 0,
    variancePercentage: 0.0,
    varianceStatus: 'verified',
    status: 'completed',
    createdAt: 'Today, 09:15 AM',
    completedAt: 'Today, 11:45 AM',
    segregation,
    streams,
    recoveredWeightKg: recoveredWeight, // 720 kg
    disposalWeightKg: disposalWeight,   // 280 kg
    totalRevenueInr: totalRevenue,       // ₹9,260
    totalCostInr: totalCost,             // ₹21,150
    netProfitInr: netProfit,             // -₹11,890
    isDemoBatch: true,
  };
})();

// 2. Real TR-07 Collected Batch (Connecting to actual application telemetry)
export const TR07_LIVE_BATCH: ProcessingBatch = (() => {
  const batchId = 'BATCH-TR07-0866';
  const collectionWeightKg = 874;
  const facilityInputWeightKg = 866;
  const varianceKg = 8;
  const variancePercentage = Math.round((varianceKg / collectionWeightKg) * 10000) / 100; // 0.92%

  // Segregation scaled to 866 kg:
  // Wet 42% (364 kg), Dry 26% (225 kg), Plastic 15% (130 kg), Haz 7% (61 kg), Chem 4% (35 kg), Ash 6% (51 kg)
  const wetKg = Math.round(866 * 0.4203);  // 364
  const dryKg = Math.round(866 * 0.2598);  // 225
  const plasticKg = Math.round(866 * 0.1501); // 130
  const hazardousKg = Math.round(866 * 0.0704); // 61
  const chemicalKg = Math.round(866 * 0.0404); // 35
  const ashKg = 866 - (wetKg + dryKg + plasticKg + hazardousKg + chemicalKg); // 51 kg

  const segregation: SegregationRecord = {
    id: `SEG-TR07-0866`,
    batchId,
    inputWeightKg: 866,
    wetKg,
    wetPct: 42.0,
    dryKg,
    dryPct: 26.0,
    plasticKg,
    plasticPct: 15.0,
    hazardousKg,
    hazardousPct: 7.0,
    chemicalKg,
    chemicalPct: 4.0,
    ashKg,
    ashPct: 5.9,
    confidence: {
      wet: 95.1,
      dry: 89.2,
      plastic: 92.4,
      hazardous: 84.7,
      chemical: 87.0,
      ash: 90.1,
      overall: 90.4,
    },
    anomalyScore: 0.08,
    anomalyDetected: false,
    expectedComposition: {
      wet: 40.0,
      dry: 30.0,
      plastic: 15.0,
      hazardous: 5.0,
      chemical: 3.0,
      ash: 7.0,
    },
    status: 'completed',
  };

  const streams = buildStreamsForBatch(batchId, segregation, true);
  const totalRevenue = streams.reduce((acc, s) => acc + s.revenue, 0);
  const processingCost = streams.reduce((acc, s) => acc + s.processingCost, 0);
  const collectionCost = 7200;
  const totalCost = processingCost + collectionCost;
  const netProfit = totalRevenue - totalCost;
  const recoveredWeight = streams.reduce((acc, s) => acc + s.recoveredKg, 0);
  const disposalWeight = 866 - recoveredWeight;

  return {
    id: batchId,
    facilityId: 'PROC-03',
    facilityName: 'Municipal Processing Centre #03 (South Central ZLD & Recovery Hub)',
    sourceTruckIds: ['TR-07'],
    sourceRequestIds: ['WM-28491', 'WM-28492'],
    collectorName: 'Ravi Kumar',
    sourceDescription: 'Green Valley Apartments + nearby Sector 4 resident pickups',
    wasteType: 'Mixed Municipal Waste (Actual Dispatch)',
    collectionWeightKg,
    facilityInputWeightKg,
    truckWeightBeforeDisposalKg: 874,
    truckWeightAfterUnloadingKg: 30,
    calculatedWasteReceivedKg: 844,
    varianceKg,
    variancePercentage,
    varianceStatus: 'verified',
    status: 'processing',
    createdAt: 'Today, 12:26 PM',
    segregation,
    streams,
    recoveredWeightKg: recoveredWeight,
    disposalWeightKg: disposalWeight,
    totalRevenueInr: totalRevenue,
    totalCostInr: totalCost,
    netProfitInr: netProfit,
    isDemoBatch: false,
  };
})();

// 3. TR-03 Discrepancy Batch (Anomaly batch connecting to REC-503 in Reconciliation)
export const TR03_DISCREPANCY_BATCH: ProcessingBatch = (() => {
  const batchId = 'BATCH-TR03-ANOMALY';
  const collectionWeightKg = 910;
  const facilityInputWeightKg = 742;
  const varianceKg = 168;
  const variancePercentage = 18.46;

  const wetKg = Math.round(742 * 0.45);
  const dryKg = Math.round(742 * 0.25);
  const plasticKg = Math.round(742 * 0.14);
  const hazardousKg = Math.round(742 * 0.08);
  const chemicalKg = Math.round(742 * 0.04);
  const ashKg = 742 - (wetKg + dryKg + plasticKg + hazardousKg + chemicalKg);

  const segregation: SegregationRecord = {
    id: `SEG-TR03-742`,
    batchId,
    inputWeightKg: 742,
    wetKg,
    wetPct: 45.0,
    dryKg,
    dryPct: 25.0,
    plasticKg,
    plasticPct: 14.0,
    hazardousKg,
    hazardousPct: 8.0,
    chemicalKg,
    chemicalPct: 4.0,
    ashKg,
    ashPct: 4.0,
    confidence: {
      wet: 91.0,
      dry: 84.2,
      plastic: 89.1,
      hazardous: 81.3,
      chemical: 83.2,
      ash: 87.0,
      overall: 86.2,
    },
    anomalyScore: 0.88,
    anomalyDetected: true,
    anomalyMessage: 'CRITICAL AUDIT: Weight variance 18.46% (168 kg missing between route collection & gate scale).',
    expectedComposition: {
      wet: 40.0,
      dry: 30.0,
      plastic: 15.0,
      hazardous: 5.0,
      chemical: 3.0,
      ash: 7.0,
    },
    status: 'pending',
  };

  const streams = buildStreamsForBatch(batchId, segregation, false); // ash failed test
  const totalRevenue = streams.reduce((acc, s) => acc + s.revenue, 0);
  const processingCost = streams.reduce((acc, s) => acc + s.processingCost, 0);
  const collectionCost = 8200;
  const totalCost = processingCost + collectionCost;
  const netProfit = totalRevenue - totalCost;
  const recoveredWeight = streams.reduce((acc, s) => acc + s.recoveredKg, 0);
  const disposalWeight = 742 - recoveredWeight;

  return {
    id: batchId,
    facilityId: 'PROC-03',
    facilityName: 'Municipal Waste Yard #03 (South Landfill & Transfer Station)',
    sourceTruckIds: ['TR-03'],
    sourceRequestIds: ['WM-28480', 'WM-28481', 'WM-28482'],
    collectorName: 'Mohan Lal',
    sourceDescription: 'Begur Koppa Industrial Route RT-09',
    wasteType: 'Mixed Commercial & Residential',
    collectionWeightKg,
    facilityInputWeightKg,
    truckWeightBeforeDisposalKg: 772,
    truckWeightAfterUnloadingKg: 30,
    calculatedWasteReceivedKg: 742,
    varianceKg,
    variancePercentage,
    varianceStatus: 'investigation_required',
    status: 'investigation_required',
    createdAt: 'Today, 11:15 AM',
    segregation,
    streams,
    recoveredWeightKg: recoveredWeight,
    disposalWeightKg: disposalWeight,
    totalRevenueInr: totalRevenue,
    totalCostInr: totalCost,
    netProfitInr: netProfit,
    isDemoBatch: false,
  };
})();

export const INITIAL_BATCHES: ProcessingBatch[] = [
  DEMO_BATCH_1000KG,
  TR07_LIVE_BATCH,
  TR03_DISCREPANCY_BATCH,
];

// Predictive Maintenance Mock Dataset
export const INITIAL_MAINTENANCE_PREDICTIONS: PredictiveMaintenanceItem[] = [
  {
    id: 'EQ-01',
    equipmentName: 'ZLD Multi-Stage Feed Pump #03',
    facilityName: 'Municipal Processing Centre #03',
    healthScorePercent: 82,
    predictedMaintenanceDays: 18,
    risk: 'low',
    lastInspected: '4 days ago',
  },
  {
    id: 'EQ-02',
    equipmentName: 'High-Torque Plastic Shredder #02',
    facilityName: 'Municipal Processing Centre #01',
    healthScorePercent: 61,
    predictedMaintenanceDays: 5,
    risk: 'medium',
    lastInspected: '12 days ago',
  },
  {
    id: 'EQ-03',
    equipmentName: 'Thermal Gasifier RDF Injector #01',
    facilityName: 'Municipal Processing Centre #02',
    healthScorePercent: 91,
    predictedMaintenanceDays: 42,
    risk: 'low',
    lastInspected: 'Yesterday',
  },
  {
    id: 'EQ-04',
    equipmentName: 'Near-Infrared Optical Polymer Sorter #04',
    facilityName: 'Municipal Processing Centre #04',
    healthScorePercent: 44,
    predictedMaintenanceDays: 2,
    risk: 'high',
    lastInspected: '18 days ago',
  },
];

// AI Simulation Layer
export class ProcessingSimulationService {
  /**
   * Simulates AI classification confidence across municipal waste streams
   */
  static simulateWasteClassification(query?: string) {
    return {
      wetWaste: 94,
      plastic: 91,
      dryWaste: 88,
      hazardous: 83,
      chemical: 86,
      ash: 89,
      timestamp: new Date().toLocaleTimeString(),
      model: 'EcoTrack-EdgeVision-v3.4 (Simulated)',
    };
  }

  /**
   * Evaluates input weight variance against configurable threshold (default: 2.0%)
   */
  static detectQuantityAnomaly(
    collectionWeightKg: number, 
    facilityInputWeightKg: number, 
    thresholdPercent: number = 2.0
  ) {
    const varianceKg = Math.abs(collectionWeightKg - facilityInputWeightKg);
    const variancePercent = collectionWeightKg > 0 
      ? Math.round((varianceKg / collectionWeightKg) * 10000) / 100 
      : 0;
    const isAnomaly = variancePercent > thresholdPercent;

    return {
      collectionWeightKg,
      facilityInputWeightKg,
      varianceKg,
      variancePercent,
      thresholdPercent,
      status: isAnomaly ? ('investigation_required' as const) : ('verified' as const),
      message: isAnomaly
        ? `Unusual ${variancePercent}% weight variance detected (${varianceKg} kg discrepancy exceeds ${thresholdPercent}% tolerance).`
        : `Weight verified within regulatory tolerance (${variancePercent}% variance ≤ ${thresholdPercent}%).`,
    };
  }

  /**
   * Predicts next-day municipal waste generation based on area historical load
   */
  static predictWasteGeneration() {
    return {
      tomorrowDate: 'Tomorrow, Sept 7',
      expectedKg: 9240,
      confidencePercent: 87,
      trend: 'up' as const,
      weatherFactor: 'Clear skies (normal collection efficiency)',
    };
  }

  /**
   * Dynamic recalculation of segmental profitability
   */
  static calculateSegmentalEconomics(batch: ProcessingBatch): SegmentalProfitability[] {
    const streams = batch.streams || [];
    
    // Collection segment
    const collectionCost = 8400;
    const collectionSegment: SegmentalProfitability = {
      segment: 'Collection & Route Logistics',
      category: 'collection',
      revenue: 0,
      cost: collectionCost,
      profit: -collectionCost,
      status: 'cost_center',
      marginPercent: -100,
    };

    const streamSegments: SegmentalProfitability[] = streams.map(s => {
      const margin = s.revenue > 0 ? Math.round((s.profit / s.revenue) * 100) : -100;
      return {
        segment: s.name,
        category: s.category,
        revenue: s.revenue,
        cost: s.processingCost,
        profit: s.profit,
        status: s.profit >= 0 ? 'profitable' : 'cost_center',
        marginPercent: margin,
      };
    });

    return [collectionSegment, ...streamSegments];
  }

  /**
   * Returns AI Simulations object
   */
  static getAISimulations(): AIApplicationSimulations {
    return {
      wasteGenerationPrediction: this.predictWasteGeneration(),
      classificationConfidence: {
        wetWaste: 94,
        plastic: 91,
        dryWaste: 88,
        hazardous: 83,
        chemical: 86,
        ash: 89,
      },
      quantityAnomalies: [
        {
          batchId: 'BATCH-2026-0906-014',
          varianceKg: 184,
          variancePercent: 18.4,
          source: 'Begur Industrial Sector 2',
          status: 'investigation_required',
          message: 'Unusual 18.4% weight variance detected in Batch BATCH-2026-0906-014',
        },
        {
          batchId: 'BATCH-TR03-ANOMALY',
          varianceKg: 168,
          variancePercent: 18.46,
          source: 'Begur Koppa Route RT-09',
          status: 'investigation_required',
          message: 'Critical 168 kg mass discrepancy logged between route scale and Yard #03 weighbridge',
        },
      ],
      predictiveMaintenance: INITIAL_MAINTENANCE_PREDICTIONS,
    };
  }
}
