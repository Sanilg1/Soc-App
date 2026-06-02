const fs = require('fs');
const path = require('path');
const os = require('os');
const { Firestore } = require('@google-cloud/firestore');
const { UserRefreshClient } = require('google-auth-library');

const projectId = process.env.GCLOUD_PROJECT || 'soc-appv1';
console.log(`Initializing Seeding for Firebase Project: ${projectId}`);

// Load Firebase CLI tokens
let refreshToken;
try {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    refreshToken = config.tokens?.refresh_token;
  }
} catch (e) {
  console.log("Could not load firebase-tools config:", e.message);
}

if (!refreshToken) {
  console.error('No Firebase CLI refresh token found. Please run: firebase login');
  process.exit(1);
}

console.log('Using Firebase CLI user credentials...');

// Create proper auth client using Firebase CLI's OAuth credentials
const authClient = new UserRefreshClient(
  '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
  'j9iVZfS8kkCEFUPaAeJV0sAi',
  refreshToken
);

// Initialize Firestore with proper auth credentials
const db = new Firestore({
  projectId,
  authClient,
});

const seedData = async () => {
  const batch = db.batch();

  // 1. Seed Flats
  const flats = [
    { id: 'A302', flatNumber: 'A302', building: 'A', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: 'A303', flatNumber: 'A303', building: 'A', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: 'B101', flatNumber: 'B101', building: 'B', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: '1302', flatNumber: '1302', building: 'Wing A', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: '2104', flatNumber: '2104', building: 'Wing B', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: '1501', flatNumber: '1501', building: 'Wing A', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: '2203', flatNumber: '2203', building: 'Wing B', inviteCode: '123456', createdAt: new Date().toISOString() },
    { id: '2402', flatNumber: '2402', building: 'Wing C', inviteCode: '123456', createdAt: new Date().toISOString() },
  ];

  flats.forEach((flat) => {
    const ref = db.collection('flats').doc(flat.id);
    batch.set(ref, flat);
  });

  // 2. Seed Users
  const users = [
    {
      id: 'resident_seeded_1',
      name: 'Resident John',
      phone: '+15550100001',
      role: 'resident',
      flatId: 'A302',
      devices: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'worker_electrician_1',
      name: 'Rajesh Kumar',
      phone: '+15550100002',
      role: 'worker',
      devices: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'worker_plumber_1',
      name: 'Suresh Patil',
      phone: '+15550100003',
      role: 'worker',
      devices: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'worker_housekeeping_1',
      name: 'Ramesh Singh',
      phone: '+15550100004',
      role: 'worker',
      devices: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin_seeded_1',
      name: 'Admin Alice',
      phone: '+15550100003',
      role: 'admin',
      devices: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guard_seeded_1',
      name: 'Guard Bob',
      phone: '+15550100009',
      role: 'guard',
      devices: [],
      createdAt: new Date().toISOString(),
    },
  ];

  users.forEach((user) => {
    const ref = db.collection('users').doc(user.id);
    batch.set(ref, user);
  });

  // 3. Seed Workers
  const workers = [
    {
      id: 'worker_electrician_1',
      name: 'Rajesh Kumar',
      category: 'electrical',
      phone: '+15550100002',
      active: true,
      onLeave: false,
      pauseStatus: false,
    },
    {
      id: 'worker_plumber_1',
      name: 'Suresh Patil',
      category: 'plumbing',
      phone: '+15550100003',
      active: true,
      onLeave: false,
      pauseStatus: false,
    },
    {
      id: 'worker_housekeeping_1',
      name: 'Ramesh Singh',
      category: 'housekeeping',
      phone: '+15550100004',
      active: true,
      onLeave: false,
      pauseStatus: false,
    },
  ];

  workers.forEach((worker) => {
    const ref = db.collection('workers').doc(worker.id);
    batch.set(ref, worker);
  });

  // 4. Seed Admins
  const admins = [
    {
      id: 'admin_seeded_1',
      name: 'Admin Alice',
      phone: '+15550100003',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  admins.forEach((admin) => {
    const ref = db.collection('admins').doc(admin.id);
    batch.set(ref, admin);
  });

  // 5. Seed Guards
  const guards = [
    {
      id: 'guard_seeded_1',
      name: 'Guard Bob',
      phone: '+15550100009',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  guards.forEach((guard) => {
    const ref = db.collection('guards').doc(guard.id);
    batch.set(ref, guard);
  });

  // 6. Seed Notices
  const notices = [
    {
      id: 'notice_1',
      title: 'Water Tank Cleaning Scheduled',
      topic: 'Maintenance',
      content: 'Periodic maintenance cleaning for secondary drinking water overhead tank on Friday. Please store water in advance as supply will be interrupted from 10 AM to 4 PM.',
      author: 'Admin Team',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notice_2',
      title: 'Annual General Meeting Notice',
      topic: 'General',
      content: 'The Annual General Meeting of the Society will be held on June 15, 2026 at 6:00 PM in the Community Hall. All flat owners are requested to attend. Proxy forms are available at the office.',
      author: 'Secretary',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notice_3',
      title: 'Parking Sticker Renewal',
      topic: 'Parking',
      content: 'All residents are required to renew their vehicle parking stickers before June 30, 2026. Vehicles without valid stickers will not be permitted entry after the deadline. Contact the security office for renewal.',
      author: 'Admin Team',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notice_4',
      title: 'Pest Control Drive — All Buildings',
      topic: 'Maintenance',
      content: 'A society-wide pest control drive has been scheduled for June 8, 2026. All residents are requested to keep their doors closed during spraying hours (9 AM - 12 PM). Pets should be kept indoors.',
      author: 'Admin Team',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  notices.forEach((notice) => {
    const ref = db.collection('notices').doc(notice.id);
    batch.set(ref, notice);
  });

  // 7. Seed Flat Ledgers
  const ledgers = [
    {
      flatId: '1302',
      outstandingBalance: 110,
      transactions: [
        {
          id: 'txn_1',
          type: 'charge',
          amount: 110,
          description: 'Ironing delivery: 5 Shirts, 4 Trousens',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          itemCounts: { shirts: 5, trousers: 4, sarees: 0, others: 0 }
        }
      ]
    },
    {
      flatId: '2104',
      outstandingBalance: 162,
      transactions: [
        {
          id: 'txn_2',
          type: 'charge',
          amount: 162,
          description: 'Ironing delivery: 2 Shirts, 2 Trousers, 4 Sarees, 1 Other',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          itemCounts: { shirts: 2, trousers: 2, sarees: 4, others: 1 }
        }
      ]
    },
    {
      flatId: '1501',
      outstandingBalance: 0,
      transactions: [
        {
          id: 'txn_3',
          type: 'payment',
          amount: 80,
          description: 'Cash payment recorded',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'txn_4',
          type: 'charge',
          amount: 80,
          description: 'Ironing delivery: 8 Shirts',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          itemCounts: { shirts: 8, trousers: 0, sarees: 0, others: 0 }
        }
      ]
    },
    {
      flatId: '2203',
      outstandingBalance: 45,
      transactions: [
        {
          id: 'txn_5',
          type: 'charge',
          amount: 45,
          description: 'Ironing delivery: 3 Trousers',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          itemCounts: { shirts: 0, trousers: 3, sarees: 0, others: 0 }
        }
      ]
    },
    {
      flatId: '2402',
      outstandingBalance: 90,
      transactions: [
        {
          id: 'txn_6',
          type: 'charge',
          amount: 90,
          description: 'Ironing delivery: 6 Shirts, 2 Trousers',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          itemCounts: { shirts: 6, trousers: 2, sarees: 0, others: 0 }
        }
      ]
    }
  ];

  ledgers.forEach((ledger) => {
    const ref = db.collection('flat_ledgers').doc(ledger.flatId);
    batch.set(ref, ledger);
  });

  // 8. Seed Complaints
  const complaints = [
    {
      id: 'C001',
      flatId: '1302',
      category: 'electrical',
      description: 'Sparking from main switchboard near kitchen area',
      urgency: 'emergency',
      isEmergency: true,
      workerPriority: 'emergency',
      status: 'queued',
      slaStatus: 'breached',
      assignedWorker: 'Rajesh Kumar',
      images: [],
      availability: { type: 'anytime_today' },
      workerNotes: [],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 1302', role: 'resident', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'C002',
      flatId: '2104',
      category: 'plumbing',
      description: 'Kitchen sink pipe leaking heavily, water pooling under the cabinet',
      urgency: 'high',
      isEmergency: false,
      workerPriority: 'high',
      status: 'visited',
      slaStatus: 'within_sla',
      assignedWorker: 'Suresh Patil',
      images: [],
      availability: { type: 'morning' },
      workerNotes: [
        { note: 'Inspected, need pipe wrench and sealant', workerId: 'w2', workerName: 'Suresh Patil', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 2104', role: 'resident', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
        { action: 'Status changed to Visited', performedBy: 'Suresh Patil', role: 'worker', note: 'Inspected, need pipe wrench and sealant', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C003',
      flatId: '1501',
      category: 'electrical',
      description: 'Ceiling fan making grinding noise and wobbling dangerously',
      urgency: 'medium',
      isEmergency: false,
      workerPriority: 'medium',
      status: 'need_tools',
      slaStatus: 'within_sla',
      assignedWorker: 'Rajesh Kumar',
      images: [],
      availability: { type: 'evening' },
      workerNotes: [
        { note: 'Need replacement capacitor and fan regulator', workerId: 'w1', workerName: 'Rajesh Kumar', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 1501', role: 'resident', timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
        { action: 'Status changed to Visited', performedBy: 'Rajesh Kumar', role: 'worker', timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString() },
        { action: 'Status changed to Need Tools', performedBy: 'Rajesh Kumar', role: 'worker', note: 'Need replacement capacitor and fan regulator', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 1,
      slaDeadline: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C004',
      flatId: '1103',
      category: 'plumbing',
      description: 'Bathroom tap dripping consistently, wasting water',
      urgency: 'low',
      isEmergency: false,
      workerPriority: 'low',
      status: 'awaiting_confirmation',
      slaStatus: 'within_sla',
      assignedWorker: 'Suresh Patil',
      images: [],
      availability: { type: 'anytime_today' },
      workerNotes: [
        { note: 'Replaced washer and tightened fitting', workerId: 'w2', workerName: 'Suresh Patil', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 1103', role: 'resident', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Status changed to Visited', performedBy: 'Suresh Patil', role: 'worker', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Marked as completed', performedBy: 'Suresh Patil', role: 'worker', note: 'Replaced washer and tightened fitting', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C005',
      flatId: '2203',
      category: 'electrical',
      description: 'Power outlets in bedroom not working after recent power outage',
      urgency: 'high',
      isEmergency: false,
      workerPriority: 'high',
      status: 'reopened',
      slaStatus: 'warning',
      assignedWorker: 'Rajesh Kumar',
      images: [],
      availability: { type: 'custom_slot', customSlot: '2-5 PM' },
      workerNotes: [
        { note: 'Checked MCB, reset breaker', workerId: 'w1', workerName: 'Rajesh Kumar', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { note: 'Issue returned, may need wiring replacement', workerId: 'w1', workerName: 'Rajesh Kumar', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 2203', role: 'resident', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Status changed to Visited', performedBy: 'Rajesh Kumar', role: 'worker', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Marked as completed', performedBy: 'Rajesh Kumar', role: 'worker', note: 'Checked MCB, reset breaker', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Complaint reopened', performedBy: 'Resident 2203', role: 'resident', note: 'Issue came back', timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Reopened again (2nd time)', performedBy: 'Resident 2203', role: 'resident', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Reopened again (3rd time) — Auto-escalated', performedBy: 'System', role: 'admin', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 3,
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C006',
      flatId: '2301',
      category: 'plumbing',
      description: 'Water pressure very low in the morning hours',
      urgency: 'medium',
      isEmergency: false,
      workerPriority: 'medium',
      status: 'queued',
      slaStatus: 'within_sla',
      assignedWorker: 'Suresh Patil',
      images: [],
      availability: { type: 'morning' },
      workerNotes: [],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 2301', role: 'resident', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C007',
      flatId: '1202',
      category: 'electrical',
      description: 'Doorbell not working, needs battery or wiring check',
      urgency: 'low',
      isEmergency: false,
      workerPriority: 'low',
      status: 'closed',
      slaStatus: 'within_sla',
      assignedWorker: 'Rajesh Kumar',
      images: [],
      availability: { type: 'anytime_today' },
      workerNotes: [
        { note: 'Replaced doorbell battery, working now', workerId: 'w1', workerName: 'Rajesh Kumar', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 1202', role: 'resident', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Status changed to Visited', performedBy: 'Rajesh Kumar', role: 'worker', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Marked as completed', performedBy: 'Rajesh Kumar', role: 'worker', note: 'Replaced doorbell battery, working now', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Resident confirmed completion', performedBy: 'Resident 1202', role: 'resident', timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date().toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C008',
      flatId: '2402',
      category: 'plumbing',
      description: 'Toilet flush not working properly, water keeps running',
      urgency: 'medium',
      isEmergency: false,
      workerPriority: 'medium',
      status: 'submitted',
      slaStatus: 'breached',
      assignedWorker: 'Suresh Patil',
      images: [],
      availability: { type: 'anytime_today' },
      workerNotes: [],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 2402', role: 'resident', timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C009',
      flatId: '1101',
      category: 'plumbing',
      description: 'Sink tap leaking in the master bathroom',
      urgency: 'low',
      isEmergency: false,
      workerPriority: 'low',
      status: 'closed',
      slaStatus: 'within_sla',
      assignedWorker: 'Suresh Patil',
      images: [],
      availability: { type: 'anytime_today' },
      workerNotes: [
        { note: 'Replaced plumbing washer', workerId: 'w2', workerName: 'Suresh Patil', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 1101', role: 'resident', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Marked as completed', performedBy: 'Suresh Patil', role: 'worker', note: 'Replaced washer', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date().toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'C010',
      flatId: '2402',
      category: 'electrical',
      description: 'Balcony light bulb flickering and needs replacement',
      urgency: 'low',
      isEmergency: false,
      workerPriority: 'low',
      status: 'closed',
      slaStatus: 'within_sla',
      assignedWorker: 'Rajesh Kumar',
      images: [],
      availability: { type: 'anytime_today' },
      workerNotes: [
        { note: 'Replaced LED bulb, working perfectly', workerId: 'w1', workerName: 'Rajesh Kumar', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      timeline: [
        { action: 'Complaint created', performedBy: 'Resident 2402', role: 'resident', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Marked as completed', performedBy: 'Rajesh Kumar', role: 'worker', note: 'Replaced LED bulb, working perfectly', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { action: 'Resident confirmed completion', performedBy: 'Resident 2402', role: 'resident', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      reopenCount: 0,
      slaDeadline: new Date().toISOString(),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  complaints.forEach((c) => {
    const ref = db.collection('complaints').doc(c.id);
    batch.set(ref, c);
  });

  // 9. Seed Society Issues
  const societyIssues = [
    {
      id: 'SI001',
      title: 'Lift #2 malfunction — stuck between floors',
      description: 'Residents reported lift #2 getting stuck between 3rd and 4th floor. Lift company has been contacted.',
      status: 'in_progress',
      reportedBy: 'Flat 2301',
      updates: [
        { message: 'Lift company technician scheduled for tomorrow morning', updatedBy: 'Admin', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { message: 'Lift put out of service, signage placed', updatedBy: 'Admin', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'SI002',
      title: 'Parking area lights not working — Zone B',
      description: 'Multiple lights in Zone B parking area have stopped working. Dark and unsafe during evening hours.',
      status: 'assigned',
      reportedBy: 'Flat 1202',
      updates: [
        { message: 'Assigned to Rajesh (Electrician) for inspection', updatedBy: 'Admin', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'SI003',
      title: 'Water supply disruption — Building C',
      description: 'No water supply to Building C since morning. Possible pump failure or valve issue.',
      status: 'under_review',
      reportedBy: 'Flat 1501',
      updates: [],
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'SI004',
      title: 'Main gate intercom not functioning',
      description: 'Gate intercom system has stopped working. Guards unable to contact residents for visitor verification.',
      status: 'resolved',
      reportedBy: 'Guard Post',
      updates: [
        { message: 'Intercom system replaced and tested', updatedBy: 'Admin', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { message: 'Vendor contacted for replacement unit', updatedBy: 'Admin', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  societyIssues.forEach((si) => {
    const ref = db.collection('society_issues').doc(si.id);
    batch.set(ref, si);
  });

  // 10. Seed Leave Requests
  const leaveRequests = [
    {
      id: 'LR001',
      workerId: 'worker_electrician_1',
      workerName: 'Rajesh Kumar',
      startDate: '2026-06-01',
      endDate: '2026-06-03',
      reason: 'Family function',
      note: 'Will be available on phone for emergencies',
      status: 'pending',
      adminActionBy: '',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'LR002',
      workerId: 'worker_plumber_1',
      workerName: 'Suresh Patil',
      startDate: '2026-05-20',
      endDate: '2026-05-22',
      reason: 'Medical appointment',
      note: '',
      status: 'approved',
      adminActionBy: 'Alice',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  leaveRequests.forEach((lr) => {
    const ref = db.collection('leave_requests').doc(lr.id);
    batch.set(ref, lr);
  });

  // 11. Seed Escalations
  const escalations = [
    {
      id: 'E001',
      complaintId: 'C001',
      flatId: '1302',
      type: 'emergency',
      severity: 'critical',
      reason: 'Emergency complaint not acknowledged within 15 minutes. Sparking from switchboard reported.',
      worker: 'Rajesh Kumar',
      resolved: false,
      resolvedBy: '',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolvedAt: '',
    },
    {
      id: 'E002',
      complaintId: 'C005',
      flatId: '2203',
      type: 'reopen_threshold',
      severity: 'high',
      reason: 'Complaint reopened 3 times. Bedroom power outlets issue persists after multiple visits.',
      worker: 'Rajesh Kumar',
      resolved: false,
      resolvedBy: '',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      resolvedAt: '',
    },
    {
      id: 'E003',
      complaintId: 'C008',
      flatId: '2402',
      type: 'sla_breach',
      severity: 'medium',
      reason: 'Medium priority complaint exceeded 24-hour initial response SLA. No worker action taken.',
      worker: 'Suresh Patil',
      resolved: false,
      resolvedBy: '',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      resolvedAt: '',
    },
  ];

  escalations.forEach((e) => {
    const ref = db.collection('escalations').doc(e.id);
    batch.set(ref, e);
  });

  // 12. Seed Activity Logs
  const activityLogs = [
    {
      id: 'log_1',
      action: 'Complaint Created',
      description: 'New emergency complaint C001 submitted by Flat 1302 — Sparking from switchboard',
      performedBy: 'Resident 1302',
      role: 'resident',
      entityType: 'complaint',
      entityId: 'C001',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_2',
      action: 'Status Updated',
      description: 'Complaint C002 status changed to Visited by Suresh Patil',
      performedBy: 'Suresh Patil',
      role: 'worker',
      entityType: 'complaint',
      entityId: 'C002',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_3',
      action: 'Worker Toggled',
      description: 'Rajesh Kumar marked as active by Admin',
      performedBy: 'Admin Alice',
      role: 'admin',
      entityType: 'worker',
      entityId: 'worker_electrician_1',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_4',
      action: 'Notice Published',
      description: 'New notice posted: Water Tank Cleaning Scheduled',
      performedBy: 'Admin Team',
      role: 'admin',
      entityType: 'notice',
      entityId: 'notice_1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_5',
      action: 'Escalation Created',
      description: 'Emergency escalation E001 auto-generated for complaint C001 — SLA breached',
      performedBy: 'System',
      role: 'system',
      entityType: 'escalation',
      entityId: 'E001',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_6',
      action: 'Leave Request Submitted',
      description: 'Rajesh Kumar submitted leave request for June 1-3 (Family function)',
      performedBy: 'Rajesh Kumar',
      role: 'worker',
      entityType: 'leave_request',
      entityId: 'LR001',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_7',
      action: 'Leave Request Approved',
      description: 'Leave request LR002 by Suresh Patil approved by Admin Alice',
      performedBy: 'Admin Alice',
      role: 'admin',
      entityType: 'leave_request',
      entityId: 'LR002',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_8',
      action: 'Complaint Reopened',
      description: 'Complaint C005 reopened for the 3rd time by Resident 2203 — auto-escalated',
      performedBy: 'System',
      role: 'system',
      entityType: 'complaint',
      entityId: 'C005',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_9',
      action: 'Society Issue Reported',
      description: 'Lift #2 malfunction reported by Flat 2301',
      performedBy: 'Resident 2301',
      role: 'resident',
      entityType: 'society_issue',
      entityId: 'SI001',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'log_10',
      action: 'Ironing Charge Added',
      description: 'Ironing charge of Rs 90 added to Flat 2402 (6 Shirts, 2 Trousers)',
      performedBy: 'Admin Team',
      role: 'admin',
      entityType: 'ledger',
      entityId: '2402',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  activityLogs.forEach((log) => {
    const ref = db.collection('activity_logs').doc(log.id);
    batch.set(ref, log);
  });

  // 13. Seed Notifications (for admin)
  const notifications = [
    {
      id: 'notif_1',
      targetUserId: 'admin_committee_1',
      title: 'Emergency Complaint Filed',
      body: 'Flat 1302 reported sparking from main switchboard — immediate attention required.',
      type: 'emergency',
      read: false,
      entityType: 'complaint',
      entityId: 'C001',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_2',
      targetUserId: 'admin_committee_1',
      title: 'SLA Breach Alert',
      body: 'Complaint C008 (Toilet flush, Flat 2402) has exceeded 24-hour SLA with no worker response.',
      type: 'sla_breach',
      read: false,
      entityType: 'complaint',
      entityId: 'C008',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_3',
      targetUserId: 'admin_committee_1',
      title: 'Complaint Auto-Escalated',
      body: 'Complaint C005 (Power outlets, Flat 2203) reopened 3 times — automatically escalated.',
      type: 'escalation',
      read: true,
      entityType: 'complaint',
      entityId: 'C005',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_4',
      targetUserId: 'admin_committee_1',
      title: 'Leave Request Pending',
      body: 'Rajesh Kumar (Electrician) has requested leave from June 1-3 for a family function.',
      type: 'leave_request',
      read: true,
      entityType: 'leave_request',
      entityId: 'LR001',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif_5',
      targetUserId: 'admin_committee_1',
      title: 'Society Issue Reported',
      body: 'Lift #2 stuck between floors — reported by Flat 2301. Immediate action needed.',
      type: 'society_issue',
      read: false,
      entityType: 'society_issue',
      entityId: 'SI001',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
  ];

  notifications.forEach((n) => {
    const ref = db.collection('notifications').doc(n.id);
    batch.set(ref, n);
  });

  // Commit batch
  await batch.commit();
  console.log('Successfully seeded ALL collections: flats, users, workers, admins, guards, notices, ledgers, complaints, society issues, leave requests, escalations, activity logs, and notifications!');
};

seedData().catch((err) => {
  console.error('Seeding failed with error: ', err);
  process.exit(1);
});
