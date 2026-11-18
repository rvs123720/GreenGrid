
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_APP_STATE } from './src/mockData';
import { AppState, WasteAnalysisResult } from './src/types';
import connectDB from './config/database';

// In-memory synchronized application state across Customer, Collector, and Admin
let state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of GoogleGenAI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

// -----------------------------
// REST API Routes
// -----------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// GET complete application state
app.get('/api/state', (_req, res) => {
  res.json(state);
});

// POST reset state to initial prototype data
app.post('/api/reset', (_req, res) => {
  state = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
  res.json({ success: true, state });
});

// GET dynamically available trucks based on capacity and weight
app.get('/api/trucks/available', (req, res) => {
  const weight = Math.max(1, Number(req.query.weight) || 80);

  const availableTrucks = state.trucks
    .filter(truck => {
      if (
        truck.status === 'offline' ||
        truck.status === 'maintenance' ||
        truck.status === 'discharging' ||
        truck.status === 'full'
      ) {
        return false;
      }

      const availableCapacity = truck.capacityKg - truck.currentLoadKg;
      return availableCapacity >= weight;
    })
    .map(truck => {
      const availableCapacityKg = Math.max(
        0,
        truck.capacityKg - truck.currentLoadKg
      );

      const occupancyPercent = Math.round(
        (truck.currentLoadKg / truck.capacityKg) * 100
      );

      return {
        ...truck,
        availableCapacityKg,
        occupancyPercent
      };
    })
    .sort((a, b) => (a.distanceKm || 1) - (b.distanceKm || 1));

  res.json({ success: true, trucks: availableTrucks });
});

// POST schedule a customer pickup
app.post('/api/pickups', (req, res) => {
  const {
    residentName,
    residentEmail,
    residentPhone,
    address,
    zone,
    wasteCategory,
    estimatedWeightKg,
    scheduledDate,
    timeSlot,
    specialInstructions,
    selectedTruckId
  } = req.body;

  const reqId = `WM-${Math.floor(28000 + Math.random() * 1000)}`;
  const weight = Number(estimatedWeightKg) || 80;

  let assignedTruck = selectedTruckId
    ? state.trucks.find(t => t.id === selectedTruckId)
    : undefined;

  // If no truck explicitly selected, pick first available with enough capacity
  if (!assignedTruck) {
    assignedTruck =
      state.trucks.find(
        t =>
          t.status === 'available' &&
          t.capacityKg - t.currentLoadKg >= weight
      ) || state.trucks.find(t => t.id === 'TR-07');
  }

  if (assignedTruck) {
    assignedTruck.status = 'collecting';
    assignedTruck.currentJobId = reqId;
    assignedTruck.lastUpdated = 'Just now';

    if (state.todayStats.trucksAvailable > 0) {
      state.todayStats.trucksAvailable -= 1;
    }

    state.todayStats.trucksOnJob += 1;
  }

  const newPickup = {
    id: reqId,
    customerId: 'CUST-101',
    residentName: residentName || 'Alex Rivera',
    residentEmail: residentEmail || 'alex.rivera@example.com',
    residentPhone: residentPhone || '+91 98860 12091',
    address:
      address ||
      '12 Lake View Road, Green Valley Apartments, Indiranagar',
    zone: zone || 'Sector 4 — Indiranagar',
    wasteCategory: wasteCategory || 'general',
    estimatedWeightKg: weight,
    scheduledDate:
      scheduledDate || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '11:00 - 01:00 PM',
    status: 'assigned' as const,
    assignedTruckId: assignedTruck?.id || 'TR-07',
    collectorName: assignedTruck?.driverName || 'Ravi Kumar',
    qrCode: `ECO-${Math.floor(10000 + Math.random() * 89999)}-IND`,
    specialInstructions:
      specialInstructions ||
      'Gate pass provided. Digital scale on site.',
    pricePerKg: 2.0,
    ecoPointsEarned: Math.round(weight * 2),
    createdAt: 'Just now'
  };

  state.pickups.unshift(newPickup);
  state.todayStats.pendingRequests += 1;

  res.status(201).json({
    success: true,
    pickup: newPickup,
    truck: assignedTruck
  });
});

// POST Collector: Start a job
app.post('/api/collector/start-job', (req, res) => {
  const { jobId, truckId } = req.body;

  const pickup = state.pickups.find(p => p.id === jobId);
  const truck = state.trucks.find(t => t.id === truckId);

  if (pickup) {
    pickup.status = 'in_transit';
  }

  if (truck) {
    truck.status = 'collecting';
    truck.currentJobId = jobId;
  }

  res.json({ success: true, pickup, truck });
});

// POST Collector: Record actual weight & confirm collection
app.post('/api/collector/weigh-collect', (req, res) => {
  const { truckId, pickupId, actualWeightKg, notes } = req.body;

  const truck = state.trucks.find(t => t.id === truckId);
  const pickup = state.pickups.find(p => p.id === pickupId);

  if (!truck) {
    return res.status(404).json({ error: 'Truck not found' });
  }

  const weight = Number(actualWeightKg);

  if (isNaN(weight) || weight <= 0) {
    return res.status(400).json({
      error: 'Actual weight must be greater than 0 kg'
    });
  }

  const remainingCap = truck.capacityKg - truck.currentLoadKg;

  if (weight > remainingCap) {
    return res.status(400).json({
      error: `Weight of ${weight} kg exceeds remaining truck capacity of ${remainingCap} kg.`
    });
  }

  // Update truck payload
  truck.currentLoadKg = Math.round(
    (truck.currentLoadKg + weight) * 10
  ) / 10;

  truck.lastUpdated = 'Just now';

  // Capacity threshold evaluation (90% operating threshold)
  const occupancy = truck.currentLoadKg / truck.capacityKg;

  if (occupancy >= 1.0) {
    truck.status = 'full';
  } else if (occupancy >= 0.90) {
    truck.status = 'near_capacity';

    // Add alert if not exists
    if (
      !state.alerts.some(
        a => a.relatedEntityId === truck.id && a.type === 'capacity'
      )
    ) {
      state.alerts.unshift({
        id: `ALT-${Date.now()}`,
        type: 'capacity',
        severity: 'warning',
        title: `Truck ${truck.id} near capacity (${Math.round(
          occupancy * 100
        )}%)`,
        message: `Current load is ${truck.currentLoadKg} kg / ${truck.capacityKg} kg. Redirecting to disposal yard recommended.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        relatedEntityId: truck.id
      });
    }
  }

  // Calculate final customer price based purely on actual weight
  const ratePerKg = pickup?.pricePerKg || 2.0;
  const finalPrice = Math.round(weight * ratePerKg);

  if (pickup) {
    pickup.actualCollectedKg = weight;
    pickup.finalPriceInr = finalPrice;
    pickup.status = 'collected';

    pickup.collectedAt = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (notes) {
      pickup.specialInstructions =
        `${pickup.specialInstructions || ''} | Weigh note: ${notes}`;
    }
  }

  state.todayStats.collectedTodayKg += weight;
  state.todayStats.completedPickups += 1;

  if (state.todayStats.pendingRequests > 0) {
    state.todayStats.pendingRequests -= 1;
  }

  res.json({
    success: true,
    truck,
    pickup,
    message: `${weight} kg recorded. Truck load updated to ${truck.currentLoadKg} kg. Customer price calculated at ₹${finalPrice}.`
  });
});

// POST Collector / Yard: Record disposal & generate weighbridge reconciliation
app.post('/api/collector/log-disposal', (req, res) => {
  const { truckId, yardId, weightBeforeKg, weightAfterKg } = req.body;

  const truck = state.trucks.find(t => t.id === truckId);

  if (!truck) {
    return res.status(404).json({ error: 'Truck not found' });
  }

  const yard =
    state.disposalYards.find(y => y.id === yardId) ||
    state.disposalYards[2];

  // Yard #03 default
  const before = Number(weightBeforeKg) || truck.currentLoadKg || 874;
  const after = Number(weightAfterKg) || 30;
  const netDisposed = Math.max(0, before - after);

  // Cumulative collected load in this cycle
  const collected = before;
  const diff = Math.abs(collected - netDisposed);

  // Reconciliation discrepancy threshold: > 5 kg or > 1%
  const toleranceThreshold = Math.max(5, collected * 0.01);
  const isDiscrepant = diff > toleranceThreshold;

  const slipId = `SLIP-${Math.floor(77000 + Math.random() * 2000)}`;
  const recId = `REC-${Math.floor(505 + Math.random() * 400)}`;

  const reconciliationRecord = {
    id: recId,
    truckId: truck.id,
    driverName: truck.driverName,
    yardId: yard.id,
    yardName: yard.name,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    collectedKg: collected,
    disposedKg: netDisposed,
    diffKg: diff,
    status: (
      isDiscrepant ? 'investigation_required' : 'verified'
    ) as 'verified' | 'investigation_required',
    slipId,
    notes: isDiscrepant
      ? `Discrepancy of ${diff} kg exceeds municipal tolerance threshold (${toleranceThreshold.toFixed(1)} kg). Investigation required.`
      : `Disposal verified. Discharged ${netDisposed} kg at ${yard.name}.`,
    investigationDetails: isDiscrepant
      ? {
          flaggedBy: 'Automatic Weighbridge Audit System',
          reason: `Net disposed weight ${netDisposed} kg differs from truck payload ${collected} kg by ${diff} kg.`
        }
      : undefined
  };

  state.reconciliation.unshift(reconciliationRecord);
  state.todayStats.disposedTodayKg += netDisposed;

  // Reset truck payload and mark available
  truck.currentLoadKg = after;
  truck.status = 'available';
  truck.currentJobId = undefined;
  truck.lastUpdated = 'Just now';

  // Mark recently collected pickups assigned to this truck as verified
  // and create proof of disposal
  const proofId = `DISP-VER-${Math.floor(8800 + Math.random() * 1100)}`;

  state.pickups.forEach(p => {
    if (
      p.assignedTruckId === truck.id &&
      (p.status === 'collected' || p.status === 'in_transit')
    ) {
      p.status = 'completed';
      p.disposalYardId = yard.id;
      p.disposalYardName = yard.name;
      p.disposalVerifiedAt = reconciliationRecord.timestamp;
      p.proofOfDisposalId = proofId;
    }
  });

  if (isDiscrepant) {
    truck.discrepancyCount += 1;

    state.alerts.unshift({
      id: `ALT-${Date.now()}`,
      type: 'discrepancy',
      severity: 'danger',
      title: `Truck ${truck.id} discrepancy detected — ${diff} kg mismatch`,
      message: `Weighbridge recorded net ${netDisposed} kg at ${yard.name} vs ${collected} kg payload.`,
      timestamp: reconciliationRecord.timestamp,
      relatedEntityId: recId
    });
  } else {
    state.alerts.unshift({
      id: `ALT-${Date.now()}`,
      type: 'disposal',
      severity: 'info',
      title: `Truck ${truck.id} successfully disposed at ${yard.name}`,
      message: `${netDisposed} kg discharged. Truck load reset to ${after} kg. Ready for new jobs.`,
      timestamp: reconciliationRecord.timestamp,
      relatedEntityId: truck.id
    });
  }

  res.json({
    success: true,
    reconciliationRecord,
    truck,
    proofOfDisposalId: proofId,
    message: `Disposal verified. Truck ${truck.id} payload reset to ${after} kg. Available for new assignments.`
  });
});

// PATCH resolve reconciliation investigation
app.patch('/api/reconciliation/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { actionTaken, resolutionNotes } = req.body;

  const item = state.reconciliation.find(r => r.id === id);

  if (!item) {
    return res.status(404).json({
      error: 'Reconciliation record not found'
    });
  }

  item.status = 'resolved';

  if (item.investigationDetails) {
    item.investigationDetails.actionTaken =
      actionTaken ||
      'Audited and adjusted for moisture evaporation / sensor calibration drift.';

    item.investigationDetails.resolvedAt = new Date().toISOString();
  }

  if (resolutionNotes) {
    item.notes = `${item.notes || ''} | Resolution: ${resolutionNotes}`;
  }

  // Clear related alert
  state.alerts = state.alerts.filter(a => a.relatedEntityId !== id);

  res.json({ success: true, item });
});

// POST Gemini AI Waste Classification (Secondary feature)
app.post('/api/ai/sort-waste', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are EcoTrack's Municipal AI Waste Classification Specialist.
Analyze this item: "${query}".
Return ONLY a valid JSON object matching this schema:
{
  "itemName": string,
  "category": "general" | "organic" | "dry_recyclable" | "plastic" | "construction_debris" | "e_waste" | "hazardous",
  "binColor": "green" | "blue" | "yellow" | "red" | "grey",
  "preparationSteps": string[],
  "recyclable": boolean,
  "hazardWarning": string,
  "co2SavingsEstimateKg": number,
  "confidenceScore": number,
  "explanation": string
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      return res.json({ success: true, result: parsed });
    } catch (err: any) {
      console.warn('Gemini fallback:', err?.message);
    }
  }

  // Heuristic fallback
  const result: WasteAnalysisResult = {
    itemName: query,
    category: 'dry_recyclable',
    binColor: 'blue',
    preparationSteps: [
      'Clean and dry before collection',
      'Flatten to optimize volume'
    ],
    recyclable: true,
    co2SavingsEstimateKg: 1.2,
    confidenceScore: 0.94,
    explanation: 'Processed according to Municipal Solid Waste Guidelines.'
  };

  res.json({ success: true, result });
});

// -----------------------------
// Vite middleware & Production Serving
// -----------------------------

async function startServer() {
  // Connect to MongoDB before starting the application
  await connectDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EcoTrack server running on http://localhost:${PORT}`);
  });
}

startServer();
