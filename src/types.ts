export type UserRole = 'admin' | 'customer' | 'collector';

export type TruckStatus = 'available' | 'collecting' | 'near_capacity' | 'discharging' | 'full' | 'offline' | 'maintenance';

export interface Truck {
  id: string; // e.g. TR-07
  driverName: string;
  driverPhone: string;
  plateNumber: string;
  status: TruckStatus;
  currentLoadKg: number;
  capacityKg: number;
  fuelPercent: number;
  batteryPercent: number;
  currentZone: string;
  coordinates: { x: number; y: number }; // normalized 0-100 on city map
  assignedRouteId?: string;
  targetYardId?: string;
  currentJobId?: string;
  distanceKm?: number;
  etaMinutes?: number;
  discrepancyCount: number;
  lastUpdated: string;
}

export interface DisposalYard {
  id: string; // e.g. YARD-01
  name: string;
  type: 'mrf' | 'compost' | 'landfill' | 'ewaste';
  address: string;
  capacityTonsPerDay: number;
  currentLoadTons: number;
  operatingHours: string;
  coordinates: { x: number; y: number };
  status: 'operational' | 'congested' | 'maintenance';
}

export type WasteCategory = 
  | 'general' 
  | 'organic' 
  | 'dry_recyclable' 
  | 'plastic' 
  | 'construction_debris' 
  | 'e_waste' 
  | 'hazardous';

export interface PickupRequest {
  id: string; // e.g. WM-28491 or REQ-9821
  customerId: string;
  residentName: string;
  residentEmail: string;
  residentPhone: string;
  address: string;
  zone: string;
  coordinates?: { x: number; y: number };
  wasteCategory: WasteCategory;
  estimatedWeightKg: number;
  scheduledDate: string;
  timeSlot: string; // e.g. "09:00 - 11:00 AM"
  status: 'pending' | 'assigned' | 'in_transit' | 'arrived' | 'collected' | 'completed' | 'cancelled';
  assignedTruckId?: string;
  collectorName?: string;
  qrCode: string;
  specialInstructions?: string;
  actualCollectedKg?: number;
  collectedAt?: string;
  finalPriceInr?: number;
  pricePerKg?: number;
  disposalYardId?: string;
  disposalYardName?: string;
  disposalVerifiedAt?: string;
  proofOfDisposalId?: string;
  ecoPointsEarned: number;
  createdAt: string;
}

export interface ReconciliationRecord {
  id: string; // e.g. REC-502
  truckId: string;
  driverName: string;
  yardId: string;
  yardName: string;
  timestamp: string;
  collectedKg: number;
  disposedKg: number;
  diffKg: number;
  status: 'verified' | 'investigation_required' | 'resolved';
  slipId: string;
  notes?: string;
  associatedPickupIds?: string[];
  investigationDetails?: {
    flaggedBy: string;
    reason: string;
    actionTaken?: string;
    resolvedAt?: string;
  };
}

export interface SystemAlert {
  id: string;
  type: 'discrepancy' | 'capacity' | 'sensor' | 'missed' | 'disposal';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: string;
  relatedEntityId?: string;
  resolved?: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zone: string;
  isGuest?: boolean;
  walletBalancePoints: number;
  totalWasteCollectedKg: number;
  totalPickupsCompleted: number;
  pendingPaymentInr: number;
}

export interface WasteAnalysisResult {
  itemName: string;
  category: WasteCategory;
  binColor: 'green' | 'blue' | 'yellow' | 'red' | 'grey';
  preparationSteps: string[];
  recyclable: boolean;
  hazardWarning?: string;
  co2SavingsEstimateKg: number;
  confidenceScore: number;
  explanation: string;
}

export interface AppState {
  trucks: Truck[];
  disposalYards: DisposalYard[];
  pickups: PickupRequest[];
  reconciliation: ReconciliationRecord[];
  alerts: SystemAlert[];
  todayStats: {
    activeTrucks: number;
    totalTrucks: number;
    trucksOnJob: number;
    trucksAvailable: number;
    trucksAtYard: number;
    collectedTodayKg: number;
    disposedTodayKg: number;
    pendingRequests: number;
    completedPickups: number;
  };
}

// ----------------------------------------------------------------------
// Downstream Waste Processing, Segregation & Financial Control Data Model
// ----------------------------------------------------------------------

export type ProcessingBatchStatus = 
  | 'received' 
  | 'weight_verification' 
  | 'segregation' 
  | 'processing' 
  | 'recovery' 
  | 'final_disposal' 
  | 'completed' 
  | 'investigation_required';

export interface ProcessingFacility {
  id: string; // e.g. 'PROC-01'
  name: string;
  location: string;
  status: 'operational' | 'congested' | 'maintenance';
  inputWeightTodayKg: number;
  processedWeightTodayKg: number;
  recoveredWeightTodayKg: number;
  disposedWeightTodayKg: number;
  recoveryRatePercent: number;
  processingCostInr: number;
  revenueInr: number;
  profitInr: number;
  activeBays: number;
  currentIntakeRateKgPerHour: number;
}

export interface SegregationRecord {
  id: string;
  batchId: string;
  inputWeightKg: number;
  wetKg: number;
  wetPct: number;
  dryKg: number;
  dryPct: number;
  plasticKg: number;
  plasticPct: number;
  hazardousKg: number;
  hazardousPct: number;
  chemicalKg: number;
  chemicalPct: number;
  ashKg: number;
  ashPct: number;
  confidence: {
    wet: number;
    dry: number;
    plastic: number;
    hazardous: number;
    chemical: number;
    ash: number;
    overall: number;
  };
  anomalyScore: number;
  anomalyDetected: boolean;
  anomalyMessage?: string;
  expectedComposition: {
    wet: number;
    dry: number;
    plastic: number;
    hazardous: number;
    chemical: number;
    ash: number;
  };
  status: 'completed' | 'processing' | 'pending';
}

export type ProcessingStreamCategory = 'wet' | 'dry' | 'plastic' | 'hazardous' | 'chemical' | 'ash';

export interface ProcessingStream {
  id: string;
  batchId: string;
  category: ProcessingStreamCategory;
  name: string;
  processingRoute: string;
  inputKg: number;
  processedKg: number;
  recoveredKg: number;
  residualKg: number;
  processingCost: number;
  revenue: number;
  profit: number;
  recoveryRatePercent: number;
  processingMethod: string;
  status: 'completed' | 'in_progress' | 'queued';
  details: {
    // Wet Waste (ZLD)
    recoveredWaterLiters?: number;
    organicResidueKg?: number;
    sludgeKg?: number;
    processingLossKg?: number;
    waterPotentialUse?: string[];
    sludgeDisposalCost?: number;
    // Dry Waste (Energy)
    energyGeneratedKwh?: number;
    energySoldKwh?: number;
    powerTariffPerKwh?: number;
    // Plastic
    recoverablePlasticKg?: number;
    reusableProductKg?: number;
    plasticProductPricePerKg?: number;
    contaminatedPlasticKg?: number;
    // Hazardous
    controlledHandlingProtocol?: string;
    transportCost?: number;
    hazardDisposalCost?: number;
    // Chemical
    recoverableChemicalKg?: number;
    chemicalSellingRatePerKg?: number;
    chemicalDisposalKg?: number;
    chemicalDisposalCost?: number;
    // Ash
    qualityStatus?: 'passed' | 'failed';
    canBeReused?: boolean;
    reusableAshKg?: number;
    ashSellingRatePerKg?: number;
    ashDisposalKg?: number;
    ashDisposalCost?: number;
  };
}

export interface ProcessingBatch {
  id: string;
  facilityId: string;
  facilityName: string;
  sourceTruckIds: string[];
  sourceRequestIds: string[];
  collectorName: string;
  sourceDescription: string;
  wasteType: string;
  collectionWeightKg: number;
  facilityInputWeightKg: number;
  truckWeightBeforeDisposalKg?: number;
  truckWeightAfterUnloadingKg?: number;
  calculatedWasteReceivedKg: number;
  varianceKg: number;
  variancePercentage: number;
  varianceStatus: 'verified' | 'investigation_required';
  status: ProcessingBatchStatus;
  createdAt: string;
  completedAt?: string;
  segregation?: SegregationRecord;
  streams?: ProcessingStream[];
  recoveredWeightKg: number;
  disposalWeightKg: number;
  totalRevenueInr: number;
  totalCostInr: number;
  netProfitInr: number;
  isDemoBatch?: boolean;
}

export interface FinancialRecord {
  id: string;
  batchId: string;
  segment: string;
  type: 'cost' | 'revenue';
  amount: number;
  description: string;
  timestamp: string;
}

export interface SegmentalProfitability {
  segment: string;
  category: ProcessingStreamCategory | 'collection';
  revenue: number;
  cost: number;
  profit: number;
  status: 'profitable' | 'cost_center';
  marginPercent: number;
}

export interface PredictiveMaintenanceItem {
  id: string;
  equipmentName: string;
  facilityName: string;
  healthScorePercent: number;
  predictedMaintenanceDays: number;
  risk: 'low' | 'medium' | 'high';
  lastInspected: string;
}

export interface AIApplicationSimulations {
  wasteGenerationPrediction: {
    tomorrowDate: string;
    expectedKg: number;
    confidencePercent: number;
    trend: 'up' | 'down' | 'stable';
  };
  classificationConfidence: {
    wetWaste: number;
    plastic: number;
    dryWaste: number;
    hazardous: number;
    chemical: number;
    ash: number;
  };
  quantityAnomalies: Array<{
    batchId: string;
    varianceKg: number;
    variancePercent: number;
    source: string;
    status: 'investigation_required' | 'under_review';
    message: string;
  }>;
  predictiveMaintenance: PredictiveMaintenanceItem[];
}

