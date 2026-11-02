const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'ked_data.json');

// Initial seed dataset
const initialData = {
  users: [
    {
      id: "usr_101",
      userCode: "KED-84920",
      meterNumber: "ERB-992384-M",
      password: "password123",
      fullName: "Demo KED Customer",
      email: "customer@example.test",
      phone: "+964 750 000 0000",
      city: "Erbil (Hewlêr)",
      neighborhood: "Demo District",
      street: "Sample Service Road",
      houseNumber: "Demo House 1",
      meterType: "Smart 3-Phase 60A (EDMI-MK10)",
      twoFactorEnabled: false,
      biometricEnabled: true,
      preferredLanguage: "en",
      createdAt: "2026-01-15T10:00:00Z"
    }
  ],
  meter: {
    meterNumber: "ERB-992384-M",
    baseKw: 4.85,
    fluctuation: 0.25,
    voltage: 224.6,
    frequency: 50.02,
    powerFactor: 0.98,
    status: "active",
    lastSynced: new Date().toISOString()
  },
  appliances: [
    {
      id: "app_1",
      name: "Cooling System (Living & Master AC)",
      category: "HVAC",
      nominalKw: 2.80,
      currentKw: 2.80,
      sharePercent: 54,
      isActive: true,
      icon: "Wind"
    },
    {
      id: "app_2",
      name: "Kitchen (Inverter Fridge & Ovens)",
      category: "Kitchen",
      nominalKw: 0.95,
      currentKw: 0.95,
      sharePercent: 18,
      isActive: true,
      icon: "UtensilsCrossed"
    },
    {
      id: "app_3",
      name: "Water Geyser & Pressure Pump",
      category: "Utility",
      nominalKw: 1.10,
      currentKw: 1.10,
      sharePercent: 21,
      isActive: true,
      icon: "Droplets"
    },
    {
      id: "app_4",
      name: "EV Fast Charger (Wallbox 7kW)",
      category: "EV",
      nominalKw: 7.20,
      currentKw: 0.00,
      sharePercent: 0,
      isActive: false,
      icon: "Zap"
    },
    {
      id: "app_5",
      name: "Lighting & Home Entertainment",
      category: "Electronics",
      nominalKw: 0.35,
      currentKw: 0.35,
      sharePercent: 7,
      isActive: true,
      icon: "Tv"
    }
  ],
  invoices: [
    {
      id: "inv_2026_09",
      invoiceNumber: "INV-2026-09-8492",
      billingMonth: "September 2026",
      year: 2026,
      month: 9,
      kwhConsumed: 1140,
      amountIqd: 84200,
      baseTariffIqd: 72000,
      municipalFeeIqd: 5000,
      fuelSurchargeIqd: 7200,
      status: "warning_level_2",
      dueDate: "2026-09-28",
      paidAt: null,
      paymentMethod: null,
      warningNotice: "Immediate disconnection notice: Unpaid 12+ days past due date."
    },
    {
      id: "inv_2026_10",
      invoiceNumber: "INV-2026-10-8492",
      billingMonth: "October 2026",
      year: 2026,
      month: 10,
      kwhConsumed: 980,
      amountIqd: 78400,
      baseTariffIqd: 67200,
      municipalFeeIqd: 5000,
      fuelSurchargeIqd: 6200,
      status: "pending",
      dueDate: "2026-10-25",
      paidAt: null,
      paymentMethod: null,
      warningNotice: null
    },
    {
      id: "inv_2026_08",
      invoiceNumber: "INV-2026-08-8492",
      billingMonth: "August 2026",
      year: 2026,
      month: 8,
      kwhConsumed: 1420,
      amountIqd: 112000,
      baseTariffIqd: 98000,
      municipalFeeIqd: 5000,
      fuelSurchargeIqd: 9000,
      status: "paid",
      dueDate: "2026-08-25",
      paidAt: "2026-08-22T14:15:00Z",
      paymentMethod: "FIB",
      receiptRef: "TXN-FIB-8921873"
    },
    {
      id: "inv_2026_07",
      invoiceNumber: "INV-2026-07-8492",
      billingMonth: "July 2026",
      year: 2026,
      month: 7,
      kwhConsumed: 1250,
      amountIqd: 96500,
      baseTariffIqd: 83500,
      municipalFeeIqd: 5000,
      fuelSurchargeIqd: 8000,
      status: "paid",
      dueDate: "2026-07-25",
      paidAt: "2026-07-20T09:40:00Z",
      paymentMethod: "FastPay",
      receiptRef: "TXN-FP-3948102"
    },
    {
      id: "inv_2026_06",
      invoiceNumber: "INV-2026-06-8492",
      billingMonth: "June 2026",
      year: 2026,
      month: 6,
      kwhConsumed: 1120,
      amountIqd: 89000,
      baseTariffIqd: 76000,
      municipalFeeIqd: 5000,
      fuelSurchargeIqd: 8000,
      status: "paid",
      dueDate: "2026-06-25",
      paidAt: "2026-06-24T18:30:00Z",
      paymentMethod: "ZainCash",
      receiptRef: "TXN-ZC-5541920"
    }
  ],
  alerts: [
    {
      id: "alt_1",
      type: "billing",
      severity: "critical",
      title: "Warning Level 2: Unpaid Invoice",
      message: "Invoice INV-2026-09-8492 (84,200 IQD) is significantly overdue. Settle via FIB, Zain Cash, or FastPay immediately to prevent automatic meter relay disconnect.",
      createdAt: "2026-10-09T08:00:00Z",
      isRead: false
    },
    {
      id: "alt_2",
      type: "grid",
      severity: "warning",
      title: "Peak Grid Load in Erbil (14:00 - 18:00)",
      message: "Regional dispatch reports high grid stress across Erbil 100m ring feeder. Shift high-wattage water geysers and EV charging to off-peak hours.",
      createdAt: "2026-10-11T12:30:00Z",
      isRead: false
    },
    {
      id: "alt_3",
      type: "threshold",
      severity: "info",
      title: "Monthly Quota Update: 82%",
      message: "Your meter consumption has reached 980 kWh of your estimated monthly benchmark. Efficiency score remains healthy (84/100).",
      createdAt: "2026-10-10T16:00:00Z",
      isRead: true
    }
  ],
  payments: [],
  supportMessages: []
};

// Database class with auto-persistence
class Database {
  constructor() {
    this.data = this.load();
    if (!Array.isArray(this.data.supportMessages)) {
      this.data.supportMessages = [];
      this.save();
    }
    const demoUser = this.data.users.find(user => user.id === "usr_101");
    if (demoUser && (demoUser.fullName !== "Demo KED Customer" || demoUser.phone !== "+964 750 000 0000")) {
      demoUser.fullName = "Demo KED Customer";
      demoUser.email = "customer@example.test";
      demoUser.phone = "+964 750 000 0000";
      demoUser.neighborhood = "Demo District";
      demoUser.street = "Sample Service Road";
      demoUser.houseNumber = "Demo House 1";
      this.save();
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading database, resetting to initial seed:', e);
    }
    this.save(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  save(data = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
    return this.data;
  }
}

const db = new Database();

module.exports = db;
