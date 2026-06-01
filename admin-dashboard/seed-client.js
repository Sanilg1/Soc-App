const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Initializing Client Firebase SDK with Project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = async () => {
  // 1. Flats
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

  console.log('Seeding Flats...');
  for (const flat of flats) {
    await setDoc(doc(db, 'flats', flat.id), flat);
  }

  // 2. Users
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

  console.log('Seeding Users...');
  for (const user of users) {
    await setDoc(doc(db, 'users', user.id), user);
  }

  // 3. Workers
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

  console.log('Seeding Workers...');
  for (const worker of workers) {
    await setDoc(doc(db, 'workers', worker.id), worker);
  }

  // 4. Admins
  const admins = [
    {
      id: 'admin_seeded_1',
      name: 'Admin Alice',
      phone: '+15550100003',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  console.log('Seeding Admins...');
  for (const admin of admins) {
    await setDoc(doc(db, 'admins', admin.id), admin);
  }

  // 5. Guards
  const guards = [
    {
      id: 'guard_seeded_1',
      name: 'Guard Bob',
      phone: '+15550100009',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  console.log('Seeding Guards...');
  for (const guard of guards) {
    await setDoc(doc(db, 'guards', guard.id), guard);
  }

  // 6. Notices
  const notices = [
    {
      id: 'notice_1',
      title: 'Water Tank Cleaning Scheduled',
      topic: 'Maintenance',
      content: 'Periodic maintenance cleaning for secondary drinking water overhead tank on Friday.',
      author: 'Admin Team',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  console.log('Seeding Notices...');
  for (const notice of notices) {
    await setDoc(doc(db, 'notices', notice.id), notice);
  }

  // 7. Flat Ledgers
  const ledgers = [
    {
      flatId: '1302',
      outstandingBalance: 110,
      transactions: [
        {
          id: 'txn_1',
          type: 'charge',
          amount: 110,
          description: 'Ironing delivery: 5 Shirts, 4 Trousers',
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

  console.log('Seeding Ledgers...');
  for (const ledger of ledgers) {
    await setDoc(doc(db, 'flat_ledgers', ledger.flatId), ledger);
  }

  // 8. Complaints
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

  console.log('Seeding Complaints...');
  for (const c of complaints) {
    await setDoc(doc(db, 'complaints', c.id), c);
  }

  // 9. Society Issues
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

  console.log('Seeding Society Issues...');
  for (const si of societyIssues) {
    await setDoc(doc(db, 'society_issues', si.id), si);
  }

  // 10. Leave Requests
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

  console.log('Seeding Leave Requests...');
  for (const lr of leaveRequests) {
    await setDoc(doc(db, 'leave_requests', lr.id), lr);
  }

  // 11. Escalations
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

  console.log('Seeding Escalations...');
  for (const e of escalations) {
    await setDoc(doc(db, 'escalations', e.id), e);
  }

  console.log('🎉 Seeding successfully completed via Client Firebase SDK!');
};

seedData().catch((err) => {
  console.error('Seeding failed with error: ', err);
  process.exit(1);
});
