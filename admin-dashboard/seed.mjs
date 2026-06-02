import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD4rFBD8NUJAwnEDelTepGglGLEtfpMp7A",
  authDomain: "soc-appv1.firebaseapp.com",
  projectId: "soc-appv1",
  storageBucket: "soc-appv1.firebasestorage.app",
  messagingSenderId: "47849992844",
  appId: "1:47849992844:web:43c2eeed69aff56f6241a9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const flats = [
  '1101', '1102', '1103', '1104', '1201', '1202', '1203', '1204',
  '1301', '1302', '1303', '1304', '1401', '1402', '1403', '1404',
  '1501', '1502', '1503', '1504', '1601', '1602', '1603', '1604',
  '1701', '1702', '1703', '1704', '1801', '1802', '1803', '1804',
  '1901', '1902', '1903', '1904', '1001', '1002', '1003', '1004',
  '2101', '2102', '2103', '2104', '2201', '2202', '2203', '2204',
  '2301', '2302', '2303', '2304', '2401', '2402', '2403', '2404',
  '2501', '2502', '2503', '2504', '2601', '2602', '2603', '2604',
  '2701', '2702', '2703', '2704', '2801', '2802', '2803', '2804',
  '2901', '2902', '2903', '2904', '2001', '2002', '2003', '2004'
];

async function seed() {
  console.log(`Fetching existing flats to delete...`);
  const flatsRef = collection(db, 'flats');
  const snapshot = await getDocs(flatsRef);
  
  let batch = writeBatch(db);
  let count = 0;

  snapshot.forEach((document) => {
    batch.delete(document.ref);
    count++;
    // Firestore batches have a limit of 500 operations, but we probably have < 500
  });

  console.log(`Deleting ${count} flats...`);
  await batch.commit();
  console.log('Deleted existing flats.');

  console.log(`Seeding exact 80 flats...`);
  batch = writeBatch(db);
  for (const flat of flats) {
    const docRef = doc(flatsRef, flat);
    batch.set(docRef, {
      flatNumber: flat,
      inviteCode: '123456',
      ownerName: `Resident ${flat}`,
      phoneNumbers: ['+919999999901'],
      createdAt: new Date().toISOString()
    });
  }

  await batch.commit();
  console.log('Successfully seeded exactly 80 flats with invite code 123456 and phone +919999999901!');
  process.exit(0);
}

seed().catch(console.error);
