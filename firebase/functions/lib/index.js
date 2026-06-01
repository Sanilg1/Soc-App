"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldComplaints = exports.checkSlaBreaches = exports.onComplaintUpdated = exports.onComplaintCreated = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
/**
 * Triggered when a new complaint is filed in Firestore.
 * Creates an activity log entry and notifies the assigned worker.
 */
exports.onComplaintCreated = (0, firestore_2.onDocumentCreated)("complaints/{complaintId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const complaint = snapshot.data();
    const complaintId = event.params.complaintId;
    const now = new Date().toISOString();
    // Create initial activity log
    const logRef = db.collection("activity_logs").doc();
    const logData = {
        id: logRef.id,
        complaintId,
        action: "status_change",
        performedBy: `Resident ${complaint.flatId || "Unknown"}`,
        role: "resident",
        previousValue: "",
        newValue: complaint.status || "submitted",
        note: "Complaint submitted",
        createdAt: now,
    };
    await logRef.set(logData);
    // Trigger notification for the worker
    if (complaint.assignedWorker) {
        const notifRef = db.collection("notifications").doc();
        const notifData = {
            id: notifRef.id,
            targetUserId: `worker_${complaint.assignedWorker}`,
            type: "complaint_submitted",
            title: `New Job Available - ${complaintId}`,
            message: `A new complaint has been filed in your category: ${complaint.description || ""}`,
            read: false,
            complaintId,
            createdAt: now,
        };
        await notifRef.set(notifData);
    }
});
/**
 * Triggered when an existing complaint is updated in Firestore.
 * Handles:
 * 1. Auto-escalation when reopenCount >= 3 and status transitions to "reopened".
 * 2. Activity logging and resident notifications on status changes.
 * 3. Activity logging and worker notifications on assignment updates.
 */
exports.onComplaintUpdated = (0, firestore_2.onDocumentUpdated)("complaints/{complaintId}", async (event) => {
    const change = event.data;
    if (!change)
        return;
    const before = change.before.data();
    const after = change.after.data();
    const complaintId = event.params.complaintId;
    const now = new Date().toISOString();
    const promises = [];
    // Prevent infinite trigger loop if there are no relevant updates
    if (before.status === after.status &&
        before.assignedWorker === after.assignedWorker &&
        before.reopenCount === after.reopenCount &&
        before.slaStatus === after.slaStatus) {
        return;
    }
    // 1. Reopen Threshold Auto-escalation
    if (after.status === "reopened" &&
        after.reopenCount >= 3 &&
        before.status !== "escalated" &&
        after.status !== before.status) {
        // Auto-escalate the complaint in Firestore
        const complaintRef = db.collection("complaints").doc(complaintId);
        promises.push(complaintRef.update({
            status: "escalated",
            slaStatus: "breached",
            updatedAt: now,
            timeline: firestore_1.FieldValue.arrayUnion({
                action: "Auto-escalated due to reopen threshold (>= 3 times)",
                performedBy: "System",
                role: "admin",
                timestamp: now,
            }),
        }));
        // Create Escalation entry
        const escRef = db.collection("escalations").doc();
        promises.push(escRef.set({
            id: escRef.id,
            complaintId,
            flatId: after.flatId,
            type: "reopen_threshold",
            severity: "high",
            reason: `Complaint reopened ${after.reopenCount} times.`,
            resolved: false,
            resolvedBy: "",
            createdAt: now,
            resolvedAt: "",
        }));
        // Notify Admin
        const notifAdminRef = db.collection("notifications").doc();
        promises.push(notifAdminRef.set({
            id: notifAdminRef.id,
            targetUserId: "admin_committee_1",
            type: "escalation",
            title: `Auto-Escalation: Reopen Threshold - ${complaintId}`,
            message: `Complaint for Flat ${after.flatId} has been auto-escalated after being reopened ${after.reopenCount} times.`,
            read: false,
            complaintId,
            createdAt: now,
        }));
        // Notify Worker
        if (after.assignedWorker) {
            const notifWorkerRef = db.collection("notifications").doc();
            promises.push(notifWorkerRef.set({
                id: notifWorkerRef.id,
                targetUserId: `worker_${after.assignedWorker}`,
                type: "escalation",
                title: `Job Escalated - ${complaintId}`,
                message: `Your assigned job for Flat ${after.flatId} has been auto-escalated because it was reopened ${after.reopenCount} times.`,
                read: false,
                complaintId,
                createdAt: now,
            }));
        }
        // Activity Log
        const logRef = db.collection("activity_logs").doc();
        promises.push(logRef.set({
            id: logRef.id,
            complaintId,
            action: "admin_escalation",
            performedBy: "System",
            role: "admin",
            previousValue: before.status,
            newValue: "escalated",
            note: `Auto-escalated due to reopen threshold (reopened ${after.reopenCount} times)`,
            createdAt: now,
        }));
        await Promise.all(promises);
        return;
    }
    // 2. Status Change Handler
    if (before.status !== after.status) {
        const logRef = db.collection("activity_logs").doc();
        promises.push(logRef.set({
            id: logRef.id,
            complaintId,
            action: after.status === "reopened" ? "reopen" : "status_change",
            performedBy: "System",
            role: "admin",
            previousValue: before.status,
            newValue: after.status,
            note: `Status changed from ${before.status} to ${after.status}`,
            createdAt: now,
        }));
        // Notify Resident
        const notifRef = db.collection("notifications").doc();
        promises.push(notifRef.set({
            id: notifRef.id,
            targetUserId: `resident_${after.flatId}`,
            type: "worker_update",
            title: `Complaint Update - ${complaintId}`,
            message: `Your complaint status has changed to: ${after.status.replace(/_/g, " ")}.`,
            read: false,
            complaintId,
            createdAt: now,
        }));
    }
    // 3. Assignment Change Handler
    if (before.assignedWorker !== after.assignedWorker) {
        const logRef = db.collection("activity_logs").doc();
        promises.push(logRef.set({
            id: logRef.id,
            complaintId,
            action: "assignment",
            performedBy: "Admin",
            role: "admin",
            previousValue: before.assignedWorker || "None",
            newValue: after.assignedWorker || "None",
            note: `Reassigned from ${before.assignedWorker || "None"} to ${after.assignedWorker || "None"}`,
            createdAt: now,
        }));
        if (after.assignedWorker) {
            const notifRef = db.collection("notifications").doc();
            promises.push(notifRef.set({
                id: notifRef.id,
                targetUserId: `worker_${after.assignedWorker}`,
                type: "admin_action",
                title: `New Job Assigned - ${complaintId}`,
                message: `You have been assigned a new complaint: ${after.description || ""}`,
                read: false,
                complaintId,
                createdAt: now,
            }));
        }
    }
    if (promises.length > 0) {
        await Promise.all(promises);
    }
});
/**
 * Scheduled cron job running every 5 minutes.
 * Checks active, uncompleted complaints for resolution SLA breaches
 * and emergency acknowledgment timeouts (15 minutes).
 */
exports.checkSlaBreaches = (0, scheduler_1.onSchedule)("every 5 minutes", async (event) => {
    const now = new Date();
    const nowStr = now.toISOString();
    // Query all active complaints that are NOT closed and NOT escalated
    const complaintsSnapshot = await db
        .collection("complaints")
        .where("status", "not-in", ["closed", "escalated"])
        .get();
    const batch = db.batch();
    let writeCount = 0;
    for (const doc of complaintsSnapshot.docs) {
        const c = doc.data();
        const complaintId = doc.id;
        let modified = false;
        // 1. SLA Breach Check
        if (c.slaDeadline && new Date(c.slaDeadline) < now && c.slaStatus !== "breached") {
            modified = true;
            // Update complaint
            batch.update(doc.ref, {
                slaStatus: "breached",
                status: "escalated",
                updatedAt: nowStr,
                timeline: firestore_1.FieldValue.arrayUnion({
                    action: "Auto-escalated due to SLA breach",
                    performedBy: "System",
                    role: "admin",
                    timestamp: nowStr,
                }),
            });
            // Create Escalation entry
            const escRef = db.collection("escalations").doc();
            batch.set(escRef, {
                id: escRef.id,
                complaintId,
                flatId: c.flatId,
                type: "sla_breach",
                severity: c.urgency === "emergency" ? "critical" : c.urgency === "high" ? "high" : "medium",
                reason: `Resolution deadline breached. Expected by ${new Date(c.slaDeadline).toLocaleString()}`,
                worker: c.assignedWorker || "",
                resolved: false,
                resolvedBy: "",
                createdAt: nowStr,
                resolvedAt: "",
            });
            // Create Notifications
            const notifResRef = db.collection("notifications").doc();
            batch.set(notifResRef, {
                id: notifResRef.id,
                targetUserId: `resident_${c.flatId}`,
                type: "sla_breach",
                title: `SLA Breached - ${complaintId}`,
                message: `Your complaint is delayed beyond the expected resolution timeline. Admin has been alerted.`,
                read: false,
                complaintId,
                createdAt: nowStr,
            });
            const notifAdminRef = db.collection("notifications").doc();
            batch.set(notifAdminRef, {
                id: notifAdminRef.id,
                targetUserId: "admin_committee_1",
                type: "sla_breach",
                title: `SLA Breach Alert - ${complaintId}`,
                message: `Complaint for Flat ${c.flatId} has breached its resolution SLA timeline.`,
                read: false,
                complaintId,
                createdAt: nowStr,
            });
            // Create Activity Log
            const logRef = db.collection("activity_logs").doc();
            batch.set(logRef, {
                id: logRef.id,
                complaintId,
                action: "sla_breach",
                performedBy: "System",
                role: "admin",
                previousValue: c.slaStatus || "within_sla",
                newValue: "breached",
                note: `Auto-escalated due to SLA breach`,
                createdAt: nowStr,
            });
            writeCount++;
        }
        // 2. Emergency Timeout Check (15 mins)
        if (!modified && c.urgency === "emergency" && (c.status === "submitted" || c.status === "queued")) {
            const createdAt = new Date(c.createdAt);
            const ageMinutes = (now.getTime() - createdAt.getTime()) / (60 * 1000);
            if (ageMinutes >= 15) {
                // Update complaint
                batch.update(doc.ref, {
                    slaStatus: "breached",
                    status: "escalated",
                    updatedAt: nowStr,
                    timeline: firestore_1.FieldValue.arrayUnion({
                        action: "Auto-escalated due to acknowledgment timeout",
                        performedBy: "System",
                        role: "admin",
                        timestamp: nowStr,
                    }),
                });
                // Create Escalation entry
                const escRef = db.collection("escalations").doc();
                batch.set(escRef, {
                    id: escRef.id,
                    complaintId,
                    flatId: c.flatId,
                    type: "emergency",
                    severity: "critical",
                    reason: "Emergency complaint not acknowledged by worker within 15 minutes.",
                    worker: c.assignedWorker || "",
                    resolved: false,
                    resolvedBy: "",
                    createdAt: nowStr,
                    resolvedAt: "",
                });
                // Create notification to admin
                const notifAdminRef = db.collection("notifications").doc();
                batch.set(notifAdminRef, {
                    id: notifAdminRef.id,
                    targetUserId: "admin_committee_1",
                    type: "emergency_alert",
                    title: `CRITICAL: Emergency Timeout - ${complaintId}`,
                    message: `Emergency complaint for Flat ${c.flatId} has not been acknowledged within 15 minutes!`,
                    read: false,
                    complaintId,
                    createdAt: nowStr,
                });
                // Create Activity Log
                const logRef = db.collection("activity_logs").doc();
                batch.set(logRef, {
                    id: logRef.id,
                    complaintId,
                    action: "sla_breach",
                    performedBy: "System",
                    role: "admin",
                    previousValue: c.status || "",
                    newValue: "escalated",
                    note: "Emergency acknowledgment timeout (15 mins)",
                    createdAt: nowStr,
                });
                writeCount++;
            }
        }
    }
    if (writeCount > 0) {
        await batch.commit();
    }
});
/**
 * Scheduled monthly cron job.
 * Deletes complaints older than 180 days (6 months) for data retention policies.
 */
exports.cleanupOldComplaints = (0, scheduler_1.onSchedule)("0 0 1 * *", async (event) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    const cutoffDateStr = sixMonthsAgo.toISOString();
    // Query complaints older than 6 months
    const querySnapshot = await db
        .collection("complaints")
        .where("createdAt", "<", cutoffDateStr)
        .get();
    const batch = db.batch();
    let deleteCount = 0;
    for (const doc of querySnapshot.docs) {
        batch.delete(doc.ref);
        deleteCount++;
        // Prevent batch sizing limits (500 write limit)
        if (deleteCount >= 450) {
            await batch.commit();
            return;
        }
    }
    if (deleteCount > 0) {
        await batch.commit();
    }
});
//# sourceMappingURL=index.js.map