const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_ID = (process.env.KED_ADMIN_ID || 'admin123').toLowerCase();
const ADMIN_PASSWORD = process.env.KED_ADMIN_PASSWORD || '12345678';
const boundaryCache = new Map();
const KURDISTAN_MAP_BOUNDS = { south: 34.5, west: 41.7, north: 37.6, east: 46.6 };

app.use(cors());
app.use(express.json());

// Helper to generate IDs
const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
// ============================================================
// KRG OFFICIAL TIERED ELECTRICITY TARIFF ENGINE
// Source: Kurdistan Regional Government – Ministry of Electricity
// Roonaki Project Tariff Schedule (IQD per kWh)
// ============================================================

// Residential tiered rates (مالان / Residential)
const RESIDENTIAL_TIERS = [
  { upTo: 400,  rateIqd: 72  },  // kWh 1–400
  { upTo: 800,  rateIqd: 108 },  // kWh 401–800
  { upTo: 1200, rateIqd: 175 },  // kWh 801–1200
  { upTo: 1600, rateIqd: 265 },  // kWh 1201–1600
  { upTo: Infinity, rateIqd: 350 } // kWh 1600+
];

// Commercial / Other categories rates
const COMMERCIAL_RATES = {
  commercial:      { label: 'Commercial (بازرگانی)',         rateIqd: 185 },
  industry_large:  { label: 'Large Industry (پیشەسازی گەورە)', rateIqd: 125 },
  industry:        { label: 'Industry (پیشەسازی)',            rateIqd: 160 },
  government:      { label: 'Government (میری)',              rateIqd: 160 },
  agriculture:     { label: 'Agriculture (کشتوکاڵی)',        rateIqd: 60  },
};

/**
 * Calculate the total electricity cost using KRG tiered residential tariff.
 * Each kWh block is billed at the tier's rate that applies to THAT block.
 * @param {number} totalKwh  – total monthly consumption in kWh
 * @returns {{ totalIqd: number, breakdown: Array }} cost result
 */
function calcTieredCost(totalKwh) {
  let remaining = totalKwh;
  let totalIqd = 0;
  const breakdown = [];
  let prevUpTo = 0;

  for (const tier of RESIDENTIAL_TIERS) {
    if (remaining <= 0) break;
    const tierBlock = Math.min(remaining, tier.upTo - prevUpTo);
    const cost = tierBlock * tier.rateIqd;
    totalIqd += cost;
    if (tierBlock > 0) {
      breakdown.push({
        rangeLabel: tier.upTo === Infinity
          ? `${prevUpTo + 1}+ kWh`
          : `${prevUpTo + 1}–${tier.upTo} kWh`,
        kwhInTier: Math.round(tierBlock),
        rateIqd: tier.rateIqd,
        costIqd: Math.round(cost)
      });
    }
    remaining -= tierBlock;
    prevUpTo = tier.upTo;
  }

  return { totalIqd: Math.round(totalIqd), breakdown };
}

/**
 * Get which tier rate applies to the CURRENT live kWh reading
 * (used for the real-time dashboard rate badge).
 * Assumes ~700 kWh consumed so far this month (mid-month residential average).
 * @param {number} monthKwhSoFar
 */
function getCurrentTierRate(monthKwhSoFar) {
  let prev = 0;
  for (const tier of RESIDENTIAL_TIERS) {
    if (monthKwhSoFar <= tier.upTo) return { rateIqd: tier.rateIqd, upTo: tier.upTo, prevUpTo: prev };
    prev = tier.upTo;
  }
  return { rateIqd: 350, upTo: Infinity, prevUpTo: 1600 };
}

// ---------------- AUTH ROUTES ---------------- //

// Demo Login (Instant Access)
app.post('/api/auth/demo-login', (req, res) => {
  const user = db.data.users[0];
  res.json({
    success: true,
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      userCode: user.userCode,
      meterNumber: user.meterNumber,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      neighborhood: user.neighborhood,
      street: user.street,
      houseNumber: user.houseNumber,
      meterType: user.meterType,
      biometricEnabled: user.biometricEnabled,
      preferredLanguage: user.preferredLanguage
    }
  });
});

// Standard Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'User code or meter number, and password are required' });
  }

  if (identifier.trim().toLowerCase() === ADMIN_ID && password === ADMIN_PASSWORD) {
    const user = {
      id: 'ked-admin',
      userCode: ADMIN_ID,
      email: 'admin@ked.gov.krd',
      fullName: 'KED System Administrator',
      role: 'admin'
    };
    return res.json({
      success: true,
      token: `token_${user.id}_${Date.now()}`,
      user
    });
  }

  const user = db.data.users.find(u => 
    u.userCode.toLowerCase() === identifier.toLowerCase() || 
    u.meterNumber.toLowerCase() === identifier.toLowerCase() ||
    u.email.toLowerCase() === identifier.toLowerCase()
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Try Demo Login or use: KED-84920 / password123' });
  }

  res.json({
    success: true,
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      userCode: user.userCode,
      meterNumber: user.meterNumber,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      neighborhood: user.neighborhood,
      street: user.street,
      houseNumber: user.houseNumber,
      meterType: user.meterType,
      role: user.role || 'user',
      biometricEnabled: user.biometricEnabled,
      preferredLanguage: user.preferredLanguage
    }
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const {
    userCode,
    meterNumber,
    fullName,
    password,
    phone,
    city,
    neighborhood,
    street,
    houseNumber
  } = req.body;

  if (!userCode || !meterNumber || !fullName || !password) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  const existing = db.data.users.find(u => u.userCode === userCode || u.meterNumber === meterNumber);
  if (existing) {
    return res.status(409).json({ success: false, message: 'A user with this User Code or Meter Number already exists' });
  }

  const newUser = {
    id: uid('usr'),
    userCode,
    meterNumber,
    password,
    fullName,
    email: `${userCode.toLowerCase()}@ked.iq`,
    phone: phone || '+964 750 000 0000',
    city: city || 'Erbil (Hewlêr)',
    neighborhood: neighborhood || 'Ankawa',
    street: street || '100m Road',
    houseNumber: houseNumber || 'No. 12',
    meterType: 'Smart 3-Phase 60A (EDMI-MK10)',
    biometricEnabled: false,
    preferredLanguage: 'en',
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);
  db.save();

  res.json({
    success: true,
    token: `token_${newUser.id}_${Date.now()}`,
    user: newUser
  });
});

// Get current user profile
app.get('/api/auth/me', (req, res) => {
  const user = db.data.users[0];
  const profile = { ...user };
  delete profile.password;
  delete profile.twoFactorEnabled;
  res.json({ success: true, user: profile });
});

// Update security settings
app.put('/api/auth/settings', (req, res) => {
  const user = db.data.users[0];
  const { biometricEnabled, preferredLanguage, newPassword } = req.body;

  delete user.twoFactorEnabled;
  if (biometricEnabled !== undefined) user.biometricEnabled = Boolean(biometricEnabled);
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (newPassword && newPassword.length >= 6) user.password = newPassword;

  db.save();
  const { password, ...profile } = user;
  res.json({ success: true, message: 'Settings updated successfully', user: profile });
});

// Citizen profile is official and read-only to prevent misleading data
app.put('/api/auth/profile', (req, res) => {
  return res.status(403).json({ 
    success: false, 
    message: 'Citizen profile records are officially locked by the Ministry of Electricity. Changes require authorized in-person verification at a KED Directorate office.' 
  });
});

// ---------------- REALTIME METER & APPLIANCES ---------------- //

app.get('/api/meter/realtime', (req, res) => {
  // Calculate total from active appliances
  const activeAppliances = db.data.appliances.filter(a => a.isActive);
  const baseKw = activeAppliances.reduce((acc, a) => acc + a.nominalKw, 0);

  // Micro-fluctuation (-0.08 to +0.08 kW) to simulate real smart meter telemetry
  const jitter = (Math.random() - 0.5) * 0.16;
  const liveKw = Math.max(0.2, Number((baseKw + jitter).toFixed(2)));

  const voltage = Number((224 + (Math.random() - 0.5) * 2.5).toFixed(1));
  const currentAmps = Number(((liveKw * 1000) / voltage).toFixed(1));
  const frequency = Number((50.0 + (Math.random() - 0.5) * 0.08).toFixed(2));
  const powerFactor = 0.98;

  // ── KRG Tiered Tariff: use accumulated month kWh to determine current rate tier
  // Simulate ~350 kWh consumed so far this month (mid-month for a ~700 kWh/month home)
  const monthKwhSoFar = 350 + Math.round(liveKw * 2);
  const { rateIqd: currentRateIqd } = getCurrentTierRate(monthKwhSoFar);

  // Daily cost: project today's kW × 24h hours billed at current tier
  const dailyKwh = liveKw * 24;
  const { totalIqd: dailyCostIqd } = calcTieredCost(dailyKwh);

  // Monthly projection: assume current live kW sustained for 30 days
  const projectedMonthlyKwh = liveKw * 24 * 30;
  const { totalIqd: monthlyCostIqd, breakdown: monthlyTierBreakdown } = calcTieredCost(projectedMonthlyKwh);

  res.json({
    success: true,
    data: {
      meterNumber: db.data.meter.meterNumber,
      liveKw,
      voltage,
      currentAmps,
      frequency,
      powerFactor,
      currentRateIqd,
      monthKwhSoFar,
      dailyCostIqd,
      monthlyCostIqd,
      monthlyTierBreakdown,
      tariffTiers: RESIDENTIAL_TIERS.map((t, i) => ({
        range: t.upTo === Infinity ? `${[0,400,800,1200,1600][i] + 1}+ kWh` : `${[1,401,801,1201,1601][i]}–${t.upTo} kWh`,
        rateIqd: t.rateIqd,
        isCurrentTier: monthKwhSoFar > [0,400,800,1200,1600][i] && monthKwhSoFar <= t.upTo
      })),
      gridLoadRegion: 'Erbil Central Ring',
      gridLoadStatus: 'Moderate-High',
      lastPing: new Date().toISOString()
    }
  });
});

app.get('/api/meter/appliances', (req, res) => {
  res.json({ success: true, data: db.data.appliances });
});

app.patch('/api/meter/appliances/:id/toggle', (req, res) => {
  const { id } = req.params;
  const appliance = db.data.appliances.find(a => a.id === id);

  if (!appliance) {
    return res.status(404).json({ success: false, message: 'Appliance not found' });
  }

  appliance.isActive = !appliance.isActive;
  appliance.currentKw = appliance.isActive ? appliance.nominalKw : 0.00;

  // Recalculate percentages
  const totalKw = db.data.appliances
    .filter(a => a.isActive)
    .reduce((acc, a) => acc + a.nominalKw, 0) || 1;

  db.data.appliances.forEach(a => {
    a.sharePercent = a.isActive ? Math.round((a.nominalKw / totalKw) * 100) : 0;
  });

  db.save();

  res.json({
    success: true,
    message: `${appliance.name} is now ${appliance.isActive ? 'Active' : 'Off'}`,
    appliance,
    appliances: db.data.appliances
  });
});

// ---------------- ANALYTICS & AI COACH ---------------- //

app.get('/api/analytics/peak-offpeak', (req, res) => {
  // Realistic 24-hour load curve using KRG tiered billing
  // Cumulative kWh builds up across the day to reflect tier changes
  const rawHours = [
    { hour: '00:00', kw: 2.1, isPeak: false },
    { hour: '02:00', kw: 1.8, isPeak: false },
    { hour: '04:00', kw: 1.6, isPeak: false },
    { hour: '06:00', kw: 2.4, isPeak: false },
    { hour: '08:00', kw: 3.9, isPeak: true  },
    { hour: '10:00', kw: 4.8, isPeak: true  },
    { hour: '12:00', kw: 5.6, isPeak: true  },
    { hour: '14:00', kw: 6.2, isPeak: true  },
    { hour: '16:00', kw: 6.0, isPeak: true  },
    { hour: '18:00', kw: 5.4, isPeak: true  },
    { hour: '20:00', kw: 5.1, isPeak: true  },
    { hour: '22:00', kw: 3.2, isPeak: false },
  ];

  // Compute cost per 2h block with the tiered engine
  let cumulativeKwh = 0;
  const hourlyChart = rawHours.map(h => {
    const blockKwh = h.kw * 2; // 2-hour block
    const { totalIqd } = calcTieredCost(cumulativeKwh + blockKwh);
    const { totalIqd: prevCost } = calcTieredCost(cumulativeKwh);
    const blockCost = totalIqd - prevCost;
    cumulativeKwh += blockKwh;
    return { ...h, kwhBlock: Math.round(blockKwh * 10) / 10, costIqd: blockCost };
  });

  const peakKwh = Math.round(rawHours.filter(h => h.isPeak).reduce((s, h) => s + h.kw * 2, 0));
  const offPeakKwh = Math.round(rawHours.filter(h => !h.isPeak).reduce((s, h) => s + h.kw * 2, 0));
  const totalKwh = peakKwh + offPeakKwh;
  const { totalIqd: totalCostIqd } = calcTieredCost(totalKwh);
  const { totalIqd: offPeakCostIqd } = calcTieredCost(offPeakKwh);
  const peakCostIqd = totalCostIqd - offPeakCostIqd;
  const latestInvoice = [...db.data.invoices].sort((a, b) =>
    b.year - a.year || b.month - a.month
  )[0];
  const billingDays = new Date(latestInvoice.year, latestInvoice.month, 0).getDate();
  const dailyWeights = Array.from({ length: billingDays }, (_, index) =>
    0.8 + ((index * 7) % 13) / 25 + (index % 6 === 0 ? 0.18 : 0)
  );
  const weightTotal = dailyWeights.reduce((sum, weight) => sum + weight, 0);
  const dailyChart = dailyWeights.map((weight, index) => ({
    day: index + 1,
    kwh: Math.floor(latestInvoice.kwhConsumed * weight / weightTotal)
  }));
  let remainingKwh = latestInvoice.kwhConsumed - dailyChart.reduce((sum, day) => sum + day.kwh, 0);
  for (let index = 0; remainingKwh > 0; index = (index + 1) % dailyChart.length) {
    dailyChart[index].kwh += 1;
    remainingKwh -= 1;
  }

  res.json({
    success: true,
    data: {
      peakHoursText: '08:00 - 22:00 (KRG Tiered Tariff)',
      offPeakHoursText: '22:00 - 08:00 (KRG Tiered Tariff)',
      peakKwh,
      offPeakKwh,
      peakCostIqd,
      offPeakCostIqd,
      totalKwh,
      totalCostIqd,
      hourlyChart,
      monthlyUsage: {
        billingMonth: latestInvoice.billingMonth,
        totalKwh: latestInvoice.kwhConsumed,
        averageDailyKwh: Math.round(latestInvoice.kwhConsumed / billingDays),
        dailyChart
      },
      residentialTiers: RESIDENTIAL_TIERS.map((t, i) => ({
        range: t.upTo === Infinity ? '1600+ kWh' : `${[1,401,801,1201,1601][i]}–${t.upTo} kWh`,
        rateIqd: t.rateIqd
      })),
      commercialRates: Object.entries(COMMERCIAL_RATES).map(([k, v]) => ({ key: k, ...v }))
    }
  });
});

app.get('/api/analytics/efficiency-score', (req, res) => {
  res.json({
    success: true,
    data: {
      score: 84,
      grade: 'A',
      title: 'Eco-Conscious Household',
      neighborhoodAvg: 68,
      cityAvg: 64,
      percentile: 86,
      neighborhoodName: 'Dream City, Erbil',
      breakdown: {
        coolingOptimization: 88,
        offPeakRatio: 82,
        standbyEfficiency: 80,
        loadConsistency: 86
      }
    }
  });
});

app.get('/api/analytics/ai-tips', (req, res) => {
  res.json({
    success: true,
    data: {
      estimatedMonthlySavingsIqd: 38700,
      tips: [
        {
          id: 'tip_1',
          priority: 'High',
          category: 'Cooling / HVAC',
          title: 'AC Smart Limit (24°C in Afternoon)',
          description: 'Raising your Split AC setpoint from 21°C to 24°C during peak heat hours (13:00 - 17:00) decreases continuous compressor cycling by 18%.',
          monthlySavingsIqd: 14500,
          kwhSavings: 201
        },
        {
          id: 'tip_2',
          priority: 'High',
          category: 'Water Heating & EV',
          title: 'Shift Geyser & EV Charging to 22:00',
          description: 'Night tariffs in Erbil drop from 72 IQD to 35 IQD/kWh at 22:00. Scheduling your water heating cycle overnight saves over 50% on utility charges.',
          monthlySavingsIqd: 18200,
          kwhSavings: 250
        },
        {
          id: 'tip_3',
          priority: 'Medium',
          category: 'Standby Load',
          title: 'Water Booster Pump Rapid Cycling',
          description: 'A 0.35 kW phantom drain was detected between 02:00 and 05:00. Inspecting pipe check-valves stops continuous booster pump re-pressurization.',
          monthlySavingsIqd: 6000,
          kwhSavings: 83
        }
      ]
    }
  });
});

// ---------------- INVOICES & PAYMENTS ---------------- //

app.get('/api/invoices', (req, res) => {
  const unpaid = db.data.invoices.filter(i => i.status !== 'paid');
  const totalOutstandingIqd = unpaid.reduce((acc, i) => acc + i.amountIqd, 0);

  res.json({
    success: true,
    data: {
      totalOutstandingIqd,
      unpaidCount: unpaid.length,
      invoices: db.data.invoices
    }
  });
});

app.post('/api/invoices/:id/pay', (req, res) => {
  const { id } = req.params;
  const { gateway, paymentDetails } = req.body;

  const invoice = db.data.invoices.find(i => i.id === id);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  if (invoice.status === 'paid') {
    return res.status(400).json({ success: false, message: 'Invoice is already settled' });
  }

  const validGateways = ['FIB', 'FastPay', 'ZainCash', 'NassWallet', 'QiCard'];
  const selectedGateway = validGateways.includes(gateway) ? gateway : 'FIB';

  const txnRef = `TXN-${selectedGateway.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;

  // Update invoice
  invoice.status = 'paid';
  invoice.paidAt = new Date().toISOString();
  invoice.paymentMethod = selectedGateway;
  invoice.receiptRef = txnRef;
  invoice.warningNotice = null;

  // Add payment log
  const paymentRecord = {
    id: uid('pay'),
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    amountIqd: invoice.amountIqd,
    gateway: selectedGateway,
    txnRef,
    paidAt: invoice.paidAt,
    userCode: db.data.users[0].userCode,
    meterNumber: db.data.users[0].meterNumber
  };
  db.data.payments.push(paymentRecord);

  // If there was an alert about this invoice, mark it read
  db.data.alerts.forEach(a => {
    if (a.title.includes(invoice.invoiceNumber) || a.title.includes('Unpaid Invoice')) {
      a.isRead = true;
    }
  });

  db.save();

  res.json({
    success: true,
    message: `Payment of ${invoice.amountIqd.toLocaleString()} IQD successfully processed via ${selectedGateway}`,
    payment: paymentRecord,
    invoice
  });
});

app.get('/api/invoices/:id/receipt', (req, res) => {
  const { id } = req.params;
  const invoice = db.data.invoices.find(i => i.id === id);

  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }

  const user = db.data.users[0];

  res.json({
    success: true,
    data: {
      receiptNumber: invoice.receiptRef || `REC-${invoice.invoiceNumber}`,
      invoiceNumber: invoice.invoiceNumber,
      billingMonth: invoice.billingMonth,
      citizenName: user.fullName,
      userCode: user.userCode,
      meterNumber: user.meterNumber,
      city: user.city,
      neighborhood: user.neighborhood,
      amountIqd: invoice.amountIqd,
      kwhConsumed: invoice.kwhConsumed,
      paymentMethod: invoice.paymentMethod || 'Official KED Electronic Portal',
      paidAt: invoice.paidAt || new Date().toISOString(),
      qrSignature: `KED-AUTH-SHA256:${invoice.invoiceNumber}:${invoice.amountIqd}:VALID`
    }
  });
});

// ---------------- USER SUPPORT MESSAGES ---------------- //

app.get('/api/geography/boundaries', async (req, res) => {
  const bboxValue = req.query.bbox;
  const zoomValue = req.query.zoom;
  if (typeof bboxValue !== 'string' || typeof zoomValue !== 'string') {
    return res.status(400).json({ success: false, message: 'A bbox and zoom level are required.' });
  }

  const bbox = bboxValue.split(',').map(Number);
  const zoom = Number(zoomValue);
  if (
    bbox.length !== 4
    || bbox.some(value => !Number.isFinite(value))
    || bbox[0] < -90 || bbox[2] > 90 || bbox[0] >= bbox[2]
    || bbox[1] < -180 || bbox[3] > 180 || bbox[1] >= bbox[3]
    || !Number.isInteger(zoom) || zoom < 5 || zoom > 18
    || (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) > 40
  ) {
    return res.status(400).json({ success: false, message: 'The requested map area or zoom level is invalid or too large.' });
  }

  const regionBbox = [
    Math.max(bbox[0], KURDISTAN_MAP_BOUNDS.south),
    Math.max(bbox[1], KURDISTAN_MAP_BOUNDS.west),
    Math.min(bbox[2], KURDISTAN_MAP_BOUNDS.north),
    Math.min(bbox[3], KURDISTAN_MAP_BOUNDS.east)
  ];
  if (regionBbox[0] >= regionBbox[2] || regionBbox[1] >= regionBbox[3]) {
    return res.json({ success: true, osm: { version: 0.6, elements: [] }, cached: false });
  }

  const cacheKey = `${regionBbox.join(',')}:${zoom}`;
  const cached = boundaryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({ success: true, osm: cached.osm, cached: true });
  }
  if (cached) boundaryCache.delete(cacheKey);

  const bboxClause = `(${regionBbox.join(',')})`;
  const query = `[out:json][timeout:25];(relation["boundary"="administrative"]["admin_level"~"^(4|5|6)$"]${bboxClause};way["boundary"="administrative"]["admin_level"~"^(4|5|6)$"]${bboxClause});out geom;`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'KEDAdminBoundaryViewer/1.0 (OpenStreetMap public Overpass data)'
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal
    });
    if (!response.ok) {
      console.error(`OpenStreetMap Overpass returned HTTP ${response.status}.`);
      return res.status(502).json({ success: false, message: 'The OpenStreetMap boundary service is temporarily unavailable. Please try again.' });
    }

    const osm = await response.json();
    if (!Array.isArray(osm.elements)) {
      console.error('OpenStreetMap Overpass returned an invalid boundary response.');
      return res.status(502).json({ success: false, message: 'The OpenStreetMap boundary service returned invalid data.' });
    }

    if (boundaryCache.size >= 100) boundaryCache.delete(boundaryCache.keys().next().value);
    boundaryCache.set(cacheKey, { osm, expiresAt: Date.now() + 6 * 60 * 60 * 1000 });
    return res.json({ success: true, osm, cached: false });
  } catch (error) {
    console.error('Unable to fetch OpenStreetMap boundaries:', error);
    return res.status(502).json({
      success: false,
      message: error.name === 'AbortError'
        ? 'The OpenStreetMap boundary request timed out. Try zooming in and loading a smaller area.'
        : 'Unable to reach the OpenStreetMap boundary service. Please try again.'
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.get('/api/support/conversations', (req, res) => {
  const conversations = db.data.users
    .map(user => {
      const messages = db.data.supportMessages.filter(message => message.userId === user.id);
      const latestMessage = messages[messages.length - 1];
      return {
        userId: user.id,
        userName: user.fullName || user.id,
        userCode: user.userCode || '',
        city: user.city || '',
        neighborhood: user.neighborhood || '',
        street: user.street || '',
        houseNumber: user.houseNumber || '',
        phone: user.phone || '',
        email: user.email || '',
        meterNumber: user.meterNumber || '',
        meterType: user.meterType || '',
        latestMessage,
        unreadCount: messages.filter(message => message.sender === 'user' && !message.readByAdmin).length,
        messageCount: messages.length
      };
    })
    .sort((a, b) => {
      if (!a.latestMessage) return b.latestMessage ? 1 : a.userName.localeCompare(b.userName);
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt);
    });

  res.json({ success: true, conversations });
});

app.get('/api/support/conversations/:userId', (req, res) => {
  const { userId } = req.params;
  const viewer = req.query.viewer;
  const user = db.data.users.find(candidate => candidate.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User account not found' });
  if (!['admin', 'user'].includes(viewer)) {
    return res.status(400).json({ success: false, message: 'A valid conversation viewer is required' });
  }

  const messages = db.data.supportMessages.filter(message => message.userId === userId);
  const readField = viewer === 'admin' ? 'readByAdmin' : 'readByUser';
  let markedRead = false;
  messages.forEach(message => {
    if (message.sender !== viewer && !message[readField]) {
      message[readField] = true;
      markedRead = true;
    }
  });
  if (markedRead) db.save();

  res.json({ success: true, messages });
});

const addSupportMessage = (req, res, sender) => {
  const { userId } = req.params;
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!db.data.users.some(user => user.id === userId)) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }
  if (!text || text.length > 2000) {
    return res.status(400).json({ success: false, message: 'Message must contain 1 to 2000 characters' });
  }

  const message = {
    id: uid('msg'),
    userId,
    sender,
    text,
    createdAt: new Date().toISOString(),
    readByAdmin: sender === 'admin',
    readByUser: sender === 'user'
  };
  db.data.supportMessages.push(message);
  db.save();
  res.status(201).json({ success: true, message });
};

app.post('/api/support/conversations/:userId/messages', (req, res) => addSupportMessage(req, res, 'user'));
app.post('/api/support/conversations/:userId/replies', (req, res) => addSupportMessage(req, res, 'admin'));

// ---------------- ALERTS ---------------- //

app.get('/api/alerts', (req, res) => {
  const unreadCount = db.data.alerts.filter(a => !a.isRead).length;
  res.json({
    success: true,
    data: {
      unreadCount,
      alerts: db.data.alerts
    }
  });
});

app.post('/api/alerts', (req, res) => {
  const { title, message, severity, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required' });
  }

  // Check if an unread alert with the same title already exists to avoid redundant clutter
  const existing = db.data.alerts.find(a => a.title === title && !a.isRead);
  if (existing) {
    existing.message = message;
    existing.createdAt = new Date().toISOString();
    db.save();
    const unreadCount = db.data.alerts.filter(a => !a.isRead).length;
    return res.json({ success: true, alert: existing, unreadCount, alerts: db.data.alerts });
  }

  const newAlert = {
    id: uid('alt'),
    type: type || 'threshold',
    severity: severity || 'warning',
    title,
    message,
    createdAt: new Date().toISOString(),
    isRead: false
  };

  db.data.alerts.unshift(newAlert);
  db.save();

  const unreadCount = db.data.alerts.filter(a => !a.isRead).length;
  res.json({ success: true, alert: newAlert, unreadCount, alerts: db.data.alerts });
});

app.patch('/api/alerts/:id/read', (req, res) => {
  const { id } = req.params;
  const alert = db.data.alerts.find(a => a.id === id);
  if (alert) {
    alert.isRead = true;
    db.save();
  }
  res.json({ success: true, alerts: db.data.alerts });
});

app.patch('/api/alerts/mark-all-read', (req, res) => {
  db.data.alerts.forEach(a => { a.isRead = true; });
  db.save();
  res.json({ success: true, alerts: db.data.alerts });
});

// Reset endpoint for testing
app.post('/api/system/reset', (req, res) => {
  db.reset();
  res.json({ success: true, message: 'System state reset to initial seed' });
});

// Serve static build if available
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`⚡ KED (Kurdistan Energy Department) API running on http://localhost:${PORT}`);
});
