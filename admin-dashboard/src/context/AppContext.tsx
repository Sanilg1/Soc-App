'use client';

// ──────────────────────────────────────
// App Context — Global state for Firestore
// ──────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  UrgencyLevel,
  SocietyIssue,
  SocietyIssueStatus,
  LeaveRequest,
  LeaveRequestStatus,
  Notice,
  FlatLedger,
  IroningRates,
  ActivityLog,
  Notification,
  UserRole,
} from '@/types';
import {
  WORKER_FOR_CATEGORY,
  type WorkerWithStats,
  type EscalationWithDetails,
  type AdminMember,
  initialIroningRates,
} from '@/lib/mock-data';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  runTransaction,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import toast from 'react-hot-toast';

// ──────────────────────────────────────
// Context Shape
// ──────────────────────────────────────

interface AppContextType {
  // Data
  complaints: Complaint[];
  workers: WorkerWithStats[];
  escalations: EscalationWithDetails[];
  societyIssues: SocietyIssue[];
  leaveRequests: LeaveRequest[];
  admins: AdminMember[];
  notices: Notice[];
  ledgers: FlatLedger[];
  ironingRates: IroningRates;
  activityLogs: ActivityLog[];
  notifications: Notification[];

  // Complaint Actions
  updateComplaintStatus: (id: string, status: ComplaintStatus, note?: string) => Promise<void>;
  reassignComplaint: (id: string, workerName: string) => Promise<void>;
  escalateComplaint: (id: string, reason: string) => Promise<void>;
  addComplaint: (data: { flatId: string; category: ComplaintCategory; description: string; urgency: UrgencyLevel }) => Promise<string>;

  // Society Issue Actions
  addSocietyIssue: (data: { title: string; description: string; reportedBy: string }) => Promise<void>;
  updateIssueStatus: (id: string, status: SocietyIssueStatus) => Promise<void>;
  addIssueUpdate: (id: string, message: string) => Promise<void>;

  // Worker Actions
  toggleWorkerActive: (id: string) => Promise<void>;

  // Leave Request Actions
  updateLeaveStatus: (id: string, status: LeaveRequestStatus) => Promise<void>;

  // Escalation Actions
  resolveEscalation: (id: string) => Promise<void>;

  // Admin Actions
  addAdmin: (data: { name: string; role: string; phone: string }) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
  addNotice: (data: { title: string; topic: string; content: string; author?: string }) => Promise<Notice>;

  // Ironing Ledger Actions
  recordIroningPayment: (flatId: string, amount: number) => Promise<void>;
  addIroningCharge: (flatId: string, itemCounts: { shirts: number; trousers: number; sarees: number; others: number }) => Promise<void>;
  updateIroningRates: (rates: IroningRates) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ──────────────────────────────────────
// Provider
// ──────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [workers, setWorkers] = useState<WorkerWithStats[]>([]);
  const [rawWorkers, setRawWorkers] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<EscalationWithDetails[]>([]);
  const [societyIssues, setSocietyIssues] = useState<SocietyIssue[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [ledgers, setLedgers] = useState<FlatLedger[]>([]);
  const [ironingRates, setIroningRates] = useState<IroningRates>(initialIroningRates);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // ── Firestore Listeners ──
  useEffect(() => {
    // 1. Complaints
    const unsubComplaints = onSnapshot(
      query(collection(db, 'complaints'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Complaint[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Complaint);
        });
        setComplaints(list);
      },
      (error) => console.error('Firestore complaints listener error:', error)
    );

    // 2. Raw Workers
    const unsubWorkers = onSnapshot(
      collection(db, 'workers'),
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRawWorkers(list);
      },
      (error) => console.error('Firestore workers listener error:', error)
    );

    // 3. Escalations
    const unsubEscalations = onSnapshot(
      query(collection(db, 'escalations'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: EscalationWithDetails[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as EscalationWithDetails);
        });
        setEscalations(list);
      },
      (error) => console.error('Firestore escalations listener error:', error)
    );

    // 4. Society Issues
    const unsubIssues = onSnapshot(
      query(collection(db, 'society_issues'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: SocietyIssue[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as SocietyIssue);
        });
        setSocietyIssues(list);
      },
      (error) => console.error('Firestore society issues listener error:', error)
    );

    // 5. Leave Requests
    const unsubLeaves = onSnapshot(
      query(collection(db, 'leave_requests'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: LeaveRequest[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as LeaveRequest);
        });
        setLeaveRequests(list);
      },
      (error) => console.error('Firestore leave requests listener error:', error)
    );

    // 6. Admins
    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const list: AdminMember[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as AdminMember);
        });
        setAdmins(list);
      },
      (error) => console.error('Firestore admins listener error:', error)
    );

    // 7. Notices
    const unsubNotices = onSnapshot(
      query(collection(db, 'notices'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Notice[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Notice);
        });
        setNotices(list);
      },
      (error) => console.error('Firestore notices listener error:', error)
    );

    // 8. Ledgers
    const unsubLedgers = onSnapshot(
      collection(db, 'flat_ledgers'),
      (snapshot) => {
        const list: FlatLedger[] = [];
        snapshot.forEach((doc) => {
          list.push({ flatId: doc.id, ...doc.data() } as FlatLedger);
        });
        setLedgers(list);
      },
      (error) => console.error('Firestore ledgers listener error:', error)
    );

    // 9. Activity Logs
    const unsubLogs = onSnapshot(
      query(collection(db, 'activity_logs'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: ActivityLog[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ActivityLog);
        });
        setActivityLogs(list);
      },
      (error) => console.error('Firestore activity logs listener error:', error)
    );

    // 10. Notifications
    const unsubNotifs = onSnapshot(
      query(collection(db, 'notifications'), where('targetUserId', '==', 'admin_committee_1'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const list: Notification[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as Notification);
        });
        setNotifications(list);
      },
      (error) => console.error('Firestore notifications listener error:', error)
    );

    return () => {
      unsubComplaints();
      unsubWorkers();
      unsubEscalations();
      unsubIssues();
      unsubLeaves();
      unsubAdmins();
      unsubNotices();
      unsubLedgers();
      unsubLogs();
      unsubNotifs();
    };
  }, []);

  // ── Dynamically Calculate Worker Stats ──
  useEffect(() => {
    const computed = rawWorkers.map((w) => {
      const workerComplaints = complaints.filter((c) => c.assignedWorker === w.name);
      const activeComplaints = workerComplaints.filter((c) => c.status !== 'closed').length;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const completedThisWeek = workerComplaints.filter(
        (c) => c.status === 'closed' && new Date(c.updatedAt) > oneWeekAgo
      ).length;

      const closedComplaints = workerComplaints.filter((c) => c.status === 'closed');
      let avgResolutionHours = 0;
      if (closedComplaints.length > 0) {
        const totalHours = closedComplaints.reduce((acc, c) => {
          const hours = (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (3600 * 1000);
          return acc + hours;
        }, 0);
        avgResolutionHours = parseFloat((totalHours / closedComplaints.length).toFixed(1));
      }

      const totalSla = workerComplaints.length;
      const breachedSla = workerComplaints.filter((c) => c.slaStatus === 'breached').length;
      const slaCompliance = totalSla > 0 ? Math.round(((totalSla - breachedSla) / totalSla) * 100) : 100;

      return {
        ...w,
        activeComplaints,
        completedThisWeek,
        avgResolutionHours,
        slaCompliance,
      };
    });
    setWorkers(computed);
  }, [rawWorkers, complaints]);

  // ── Complaint Actions ──

  const updateComplaintStatus = useCallback(async (id: string, status: ComplaintStatus, note?: string) => {
    try {
      const now = new Date().toISOString();
      const complaintRef = doc(db, 'complaints', id);

      await updateDoc(complaintRef, {
        status,
        updatedAt: now,
        timeline: arrayUnion({
          action: `Status changed to ${status.replace(/_/g, ' ')}`,
          performedBy: 'Admin',
          role: 'admin',
          note: note || '',
          timestamp: now,
        }),
      });
      toast.success('Complaint status updated successfully.');
    } catch (e) {
      console.error('Firestore updateComplaintStatus error:', e);
      toast.error('Failed to update complaint status.');
    }
  }, []);

  const reassignComplaint = useCallback(async (id: string, workerName: string) => {
    try {
      const now = new Date().toISOString();
      const complaintRef = doc(db, 'complaints', id);

      await updateDoc(complaintRef, {
        assignedWorker: workerName,
        updatedAt: now,
        timeline: arrayUnion({
          action: `Reassigned to ${workerName}`,
          performedBy: 'Admin',
          role: 'admin',
          timestamp: now,
        }),
      });
      toast.success(`Complaint reassigned to ${workerName}.`);
    } catch (e) {
      console.error('Firestore reassignComplaint error:', e);
      toast.error('Failed to reassign complaint.');
    }
  }, []);

  const escalateComplaint = useCallback(async (id: string, reason: string) => {
    try {
      const now = new Date().toISOString();
      const complaint = complaints.find((c) => c.id === id);
      if (!complaint) return;

      const complaintRef = doc(db, 'complaints', id);
      await updateDoc(complaintRef, {
        status: 'escalated',
        updatedAt: now,
        timeline: arrayUnion({
          action: 'Escalated by admin',
          performedBy: 'Admin',
          role: 'admin',
          note: reason,
          timestamp: now,
        }),
      });

      const escalationRef = doc(collection(db, 'escalations'));
      await setDoc(escalationRef, {
        id: escalationRef.id,
        complaintId: id,
        flatId: complaint.flatId,
        type: 'sla_breach',
        severity: complaint.urgency === 'emergency' ? 'critical' : complaint.urgency === 'high' ? 'high' : 'medium',
        reason,
        worker: complaint.assignedWorker,
        resolved: false,
        resolvedBy: '',
        createdAt: now,
        resolvedAt: '',
      });
      toast.success('Complaint escalated successfully.');
    } catch (e) {
      console.error('Firestore escalateComplaint error:', e);
      toast.error('Failed to escalate complaint.');
    }
  }, [complaints]);

  const addComplaint = useCallback(async (data: { flatId: string; category: ComplaintCategory; description: string; urgency: UrgencyLevel }) => {
    try {
      const now = new Date().toISOString();
      let slaHours = 24;
      if (data.urgency === 'emergency') slaHours = 0.25;
      else if (data.urgency === 'high') slaHours = 12;
      else if (data.urgency === 'medium') slaHours = 48;
      else if (data.urgency === 'low') slaHours = 96;

      const complaintRef = doc(collection(db, 'complaints'));
      await setDoc(complaintRef, {
        id: complaintRef.id,
        flatId: data.flatId,
        category: data.category,
        description: data.description,
        urgency: data.urgency,
        isEmergency: data.urgency === 'emergency',
        workerPriority: data.urgency,
        status: 'submitted',
        slaStatus: 'within_sla',
        assignedWorker: WORKER_FOR_CATEGORY[data.category] || 'None',
        images: [],
        availability: { type: 'anytime_today' },
        workerNotes: [],
        timeline: [
          { action: 'Complaint created', performedBy: `Resident ${data.flatId}`, role: 'resident', timestamp: now },
        ],
        reopenCount: 0,
        slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString(),
        createdAt: now,
        updatedAt: now,
      });
      toast.success('Complaint added successfully.');
      return complaintRef.id;
    } catch (e) {
      console.error('Firestore addComplaint error:', e);
      toast.error('Failed to add complaint.');
      throw e;
    }
  }, []);

  // ── Society Issue Actions ──

  const addSocietyIssue = useCallback(async (data: { title: string; description: string; reportedBy: string }) => {
    try {
      const now = new Date().toISOString();
      const ref = doc(collection(db, 'society_issues'));
      await setDoc(ref, {
        id: ref.id,
        title: data.title,
        description: data.description,
        status: 'reported',
        reportedBy: data.reportedBy,
        updates: [],
        createdAt: now,
      });
      toast.success('Society issue reported successfully.');
    } catch (e) {
      console.error('Firestore addSocietyIssue error:', e);
      toast.error('Failed to report society issue.');
    }
  }, []);

  const updateIssueStatus = useCallback(async (id: string, status: SocietyIssueStatus) => {
    try {
      const ref = doc(db, 'society_issues', id);
      await updateDoc(ref, {
        status,
        updates: arrayUnion({
          message: `Status changed to ${status.replace(/_/g, ' ')}`,
          updatedBy: 'Admin',
          timestamp: new Date().toISOString(),
        }),
      });
      toast.success('Society issue status updated.');
    } catch (e) {
      console.error('Firestore updateIssueStatus error:', e);
      toast.error('Failed to update status.');
    }
  }, []);

  const addIssueUpdate = useCallback(async (id: string, message: string) => {
    try {
      const ref = doc(db, 'society_issues', id);
      await updateDoc(ref, {
        updates: arrayUnion({
          message,
          updatedBy: 'Admin',
          timestamp: new Date().toISOString(),
        }),
      });
      toast.success('Issue update added.');
    } catch (e) {
      console.error('Firestore addIssueUpdate error:', e);
      toast.error('Failed to add update.');
    }
  }, []);

  // ── Worker Actions ──

  const toggleWorkerActive = useCallback(async (id: string) => {
    try {
      const ref = doc(db, 'workers', id);
      const worker = rawWorkers.find(w => w.id === id);
      if (!worker) return;

      await updateDoc(ref, {
        active: !worker.active,
      });
      toast.success(`Worker status set to ${!worker.active ? 'Active' : 'Inactive'}.`);
    } catch (e) {
      console.error('Firestore toggleWorkerActive error:', e);
      toast.error('Failed to toggle worker status.');
    }
  }, [rawWorkers]);

  // ── Leave Request Actions ──

  const updateLeaveStatus = useCallback(async (id: string, status: LeaveRequestStatus) => {
    try {
      const ref = doc(db, 'leave_requests', id);
      await updateDoc(ref, {
        status,
        adminActionBy: 'Admin',
        updatedAt: new Date().toISOString(),
      });

      if (status === 'approved') {
        const request = leaveRequests.find((lr) => lr.id === id);
        if (request) {
          const workerRef = doc(db, 'workers', request.workerId);
          await updateDoc(workerRef, { onLeave: true });
        }
      }
      toast.success(`Leave request ${status}.`);
    } catch (e) {
      console.error('Firestore updateLeaveStatus error:', e);
      toast.error('Failed to update leave request.');
    }
  }, [leaveRequests]);

  // ── Escalation Actions ──

  const resolveEscalation = useCallback(async (id: string) => {
    try {
      const ref = doc(db, 'escalations', id);
      await updateDoc(ref, {
        resolved: true,
        resolvedBy: 'Admin',
        resolvedAt: new Date().toISOString(),
      });
      toast.success('Escalation resolved.');
    } catch (e) {
      console.error('Firestore resolveEscalation error:', e);
      toast.error('Failed to resolve escalation.');
    }
  }, []);

  // ── Admin Actions ──

  const addAdmin = useCallback(async (data: { name: string; role: string; phone: string }) => {
    try {
      const ref = doc(collection(db, 'admins'));
      await setDoc(ref, {
        id: ref.id,
        name: data.name,
        role: data.role,
        phone: data.phone,
        createdAt: new Date().toISOString(),
      });
      toast.success('Admin added successfully.');
    } catch (e) {
      console.error('Firestore addAdmin error:', e);
      toast.error('Failed to add admin.');
    }
  }, []);

  const removeAdmin = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'admins', id));
      toast.success('Admin removed successfully.');
    } catch (e) {
      console.error('Firestore removeAdmin error:', e);
      toast.error('Failed to remove admin.');
    }
  }, []);

  const addNotice = useCallback(async (data: { title: string; topic: string; content: string; author?: string }): Promise<Notice> => {
    try {
      const now = new Date().toISOString();
      const ref = doc(collection(db, 'notices'));
      const newNotice = {
        id: ref.id,
        title: data.title,
        topic: data.topic,
        content: data.content,
        author: data.author || 'Admin Team',
        createdAt: now,
      };
      await setDoc(ref, newNotice);
      toast.success('Notice posted successfully.');
      return newNotice as Notice;
    } catch (e) {
      console.error('Firestore addNotice error:', e);
      toast.error('Failed to post notice.');
      throw e;
    }
  }, []);

  // ── Ironing Ledger Actions ──

  const recordIroningPayment = useCallback(async (flatId: string, amount: number) => {
    try {
      const docRef = doc(db, 'flat_ledgers', flatId);
      const now = new Date().toISOString();
      const transactionId = `txn_${Date.now()}`;

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        let currentBalance = 0.0;
        let currentHistory: any[] = [];

        if (snap.exists()) {
          const data = snap.data()!;
          currentBalance = Number(data.outstandingBalance) || 0.0;
          currentHistory = Array.isArray(data.transactions) ? data.transactions : [];
        }

        const newBalance = Math.max(0, currentBalance - amount);
        const newTransaction = {
          id: transactionId,
          type: 'payment',
          amount,
          description: 'Cash payment recorded by admin',
          timestamp: now,
        };

        transaction.set(
          docRef,
          {
            outstandingBalance: newBalance,
            transactions: [newTransaction, ...currentHistory],
          },
          { merge: true }
        );
      });
      toast.success('Payment recorded successfully.');
    } catch (e) {
      console.error('Firestore recordIroningPayment error:', e);
      toast.error('Failed to record payment.');
    }
  }, []);

  const addIroningCharge = useCallback(async (flatId: string, itemCounts: { shirts: number; trousers: number; sarees: number; others: number }) => {
    try {
      const docRef = doc(db, 'flat_ledgers', flatId);
      const now = new Date().toISOString();
      const transactionId = `txn_${Date.now()}`;

      const amount =
        itemCounts.shirts * ironingRates.shirts +
        itemCounts.trousers * ironingRates.trousers +
        itemCounts.sarees * ironingRates.sarees +
        itemCounts.others * ironingRates.others;

      const description = `Ironing delivery: ${[
        itemCounts.shirts ? `${itemCounts.shirts} Shirts` : null,
        itemCounts.trousers ? `${itemCounts.trousers} Trousers` : null,
        itemCounts.sarees ? `${itemCounts.sarees} Sarees` : null,
        itemCounts.others ? `${itemCounts.others} Others` : null,
      ]
        .filter(Boolean)
        .join(', ')}`;

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        let currentBalance = 0.0;
        let currentHistory: any[] = [];

        if (snap.exists()) {
          const data = snap.data()!;
          currentBalance = Number(data.outstandingBalance) || 0.0;
          currentHistory = Array.isArray(data.transactions) ? data.transactions : [];
        }

        const newBalance = currentBalance + amount;
        const newTransaction = {
          id: transactionId,
          type: 'charge',
          amount,
          description,
          timestamp: now,
          itemCounts,
        };

        transaction.set(
          docRef,
          {
            outstandingBalance: newBalance,
            transactions: [newTransaction, ...currentHistory],
          },
          { merge: true }
        );
      });
      toast.success('Charge added successfully.');
    } catch (e) {
      console.error('Firestore addIroningCharge error:', e);
      toast.error('Failed to add charge.');
    }
  }, [ironingRates]);

  const updateIroningRates = useCallback((rates: IroningRates) => {
    setIroningRates(rates);
  }, []);

  // ── Context Value ──

  const value: AppContextType = {
    complaints,
    workers,
    escalations,
    societyIssues,
    leaveRequests,
    admins,
    notices,
    ledgers,
    ironingRates,
    activityLogs,
    notifications,
    updateComplaintStatus,
    reassignComplaint,
    escalateComplaint,
    addComplaint,
    addSocietyIssue,
    updateIssueStatus,
    addIssueUpdate,
    toggleWorkerActive,
    updateLeaveStatus,
    resolveEscalation,
    addAdmin,
    removeAdmin,
    addNotice,
    recordIroningPayment,
    addIroningCharge,
    updateIroningRates,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ──────────────────────────────────────
// Hook
// ──────────────────────────────────────

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
