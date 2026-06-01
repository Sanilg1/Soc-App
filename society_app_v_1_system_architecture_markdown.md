# Society Maintenance App V1 — System Architecture

# 1. Core Stack

| Layer | Recommendation |
|---|---|
| Mobile App | Flutter |
| Admin Dashboard | Next.js |
| Backend | Firebase |
| Database | Firestore |
| Storage | Firebase Storage |
| Notifications | Firebase Cloud Messaging |
| Authentication | Firebase Auth (OTP) |
| State Management | Riverpod |
| Hosting | Firebase Hosting / Vercel |

---

# 2. High-Level Architecture

```text
                ┌────────────────────┐
                │   Resident App     │
                │      Flutter       │
                └─────────┬──────────┘
                          │
                          │
                ┌─────────▼──────────┐
                │     Firebase       │
                │--------------------│
                │ Auth               │
                │ Firestore          │
                │ Storage            │
                │ FCM Notifications  │
                └─────────┬──────────┘
                          │
         ┌────────────────┼────────────────┐
         │                                 │
┌────────▼────────┐             ┌──────────▼─────────┐
│   Worker App    │             │  Admin Dashboard   │
│     Flutter     │             │      Next.js       │
└─────────────────┘             └────────────────────┘
```

---

# 3. Firestore Collections

```text
users/
flats/
complaints/
society_issues/
workers/
admins/
guards/
notifications/
leave_requests/
escalations/
activity_logs/
```

---

# 4. Firestore Data Models

# users/

```text
users/{userId}
```

```json
{
  "role": "resident",
  "flatId": "A302",
  "phone": "",
  "name": "",
  "devices": [],
  "createdAt": ""
}
```

---

# workers/

```text
workers/{workerId}
```

```json
{
  "name": "",
  "category": "electrical",
  "phone": "",
  "active": true,
  "onLeave": false,
  "pauseStatus": false
}
```

---

# complaints/

```text
complaints/{complaintId}
```

```json
{
  "flatId": "A302",
  "category": "electrical",
  "description": "",
  "urgency": "high",
  "isEmergency": false,
  "workerPriority": "medium",
  "status": "visited",
  "assignedWorker": "",
  "images": [],
  "availability": {
    "type": "anytime_today",
    "customSlot": ""
  },
  "workerNotes": [],
  "timeline": [],
  "reopenCount": 0,
  "slaDeadline": "",
  "slaStatus": "within_sla",
  "createdAt": "",
  "updatedAt": ""
}
```

---

# society_issues/

```text
society_issues/{issueId}
```

```json
{
  "title": "",
  "description": "",
  "status": "under_review",
  "reportedBy": "",
  "updates": [],
  "createdAt": ""
}
```

---

# notifications/

```text
notifications/{notificationId}
```

```json
{
  "targetUserId": "",
  "type": "worker_update",
  "title": "",
  "message": "",
  "read": false,
  "createdAt": ""
}
```

---

# activity_logs/

```text
activity_logs/{logId}
```

```json
{
  "complaintId": "",
  "action": "status_change",
  "performedBy": "",
  "role": "worker",
  "previousValue": "",
  "newValue": "",
  "note": "",
  "createdAt": ""
}
```

Tracks:
- status changes
- reopen events
- worker updates
- admin escalations
- complaint lifecycle history

---

# flats/

```text
flats/{flatId}
```

```json
{
  "flatNumber": "A302",
  "building": "",
  "residents": [],
  "phone": "",
  "createdAt": ""
}
```

---

# admins/

```text
admins/{adminId}
```

```json
{
  "name": "",
  "phone": "",
  "role": "admin",
  "createdAt": ""
}
```

---

# guards/

```text
guards/{guardId}
```

```json
{
  "name": "",
  "phone": "",
  "active": true,
  "createdAt": ""
}
```

---

# leave_requests/

```text
leave_requests/{requestId}
```

```json
{
  "workerId": "",
  "startDate": "",
  "endDate": "",
  "reason": "",
  "note": "",
  "status": "pending",
  "adminActionBy": "",
  "createdAt": "",
  "updatedAt": ""
}
```

---

# escalations/

```text
escalations/{escalationId}
```

```json
{
  "complaintId": "",
  "type": "sla_breach",
  "severity": "high",
  "reason": "",
  "resolved": false,
  "resolvedBy": "",
  "createdAt": "",
  "resolvedAt": ""
}
```

---

# 5. Flutter Mobile App Structure

```text
lib/
│
├── core/
│   ├── constants/
│   ├── theme/
│   ├── utils/
│   ├── services/
│   ├── widgets/
│   └── models/
│
├── features/
│   ├── auth/
│   ├── resident/
│   ├── worker/
│   ├── complaints/
│   ├── notifications/
│   ├── profile/
│   └── common/
│
├── firebase/
│
├── routes/
│
├── providers/
│
└── main.dart
```

---

# Feature Module Example

```text
features/complaints/
│
├── screens/
├── widgets/
├── models/
├── services/
├── providers/
└── repositories/
```

---

# 6. Admin Dashboard Structure (Next.js)

```text
src/
│
├── app/
│
├── components/
│
├── modules/
│   ├── dashboard/
│   ├── complaints/
│   ├── escalations/
│   ├── workers/
│   ├── societyIssues/
│   └── analytics/
│
├── services/
│
├── firebase/
│
├── hooks/
│
├── types/
│
└── utils/
```

---

# 7. State Management

## Flutter
Use:
- Riverpod

Reasons:
- scalable
- clean async handling
- Firebase-friendly
- lower boilerplate

---

# 8. Backend Logic Strategy

Use Firebase Cloud Functions for:
- SLA timers
- emergency escalation
- reopen escalation
- automatic notifications
- cleanup jobs
- worker unavailability logic

---

# 9. Role-Based Access Control (RBAC)

# Residents
Can:
- only access complaints belonging to their flat
- view public society issues

---

# Workers
Can:
- only access complaints belonging to their assigned category/categories

---

# Admins
Have:
- full operational access

---

# 10. Multi-Device Sync

Multiple devices under same flat account should stay synchronized.

Examples:
- complaint created on one device visible on others
- worker updates visible across devices
- complaint reopen status synchronized

Implemented through Firestore sync.

---

# 11. Notification Architecture

Use:
- Firebase Cloud Messaging (FCM)

Notifications include:
- complaint updates
- revisit requests
- escalations
- completion requests
- emergency alerts

---

# 12. Emergency Escalation Architecture

Emergency triggers:
- resident selecting emergency
- keyword-based emergency detection

Examples:
- smoke
- sparks
- flooding
- gas smell
- burning smell

---

# Emergency Escalation Flow

If unresolved after ~15 minutes:
- automatic worker call triggered
- admin escalation triggered
- guards notified for on-ground emergency visibility
- complaint highlighted as critical

---

# 13. Connectivity Assumptions

V1 assumes:
- reliable internet access

Offline mode not included in V1.

---

# 14. Media Handling

## Included
- optional image uploads
- maximum 3 images
- automatic compression

---

## Upload Failure Handling
If image upload fails:
- complaint still submits
- user informed upload failed

---

# 15. Queue Philosophy

The system is NOT FIFO/sequential.

Worker workboards act as:
- dynamic operational workspaces

Workers see:
- emergencies
- revisits
- waiting-long complaints
- scheduled tasks
- pending complaints

Workers decide execution order.

---

# 16. Generic Category Architecture

Do NOT hardcode:
- electrical workflows
- plumbing workflows

Use category-based architecture.

Benefits:
- scalability
- easier expansion
- reduced refactoring

---

# 17. Future Scalability Considerations

Architecture should support future modules:
- visitor management
- announcements
- parking
- billing
- vendors
- multilingual support
- voice complaints
- predictive analytics
- amenity booking

---

# 18. Duplicate Complaint Detection

System should detect existing unresolved complaints of same category for same flat before allowing new submission.

Behavior:
- soft warning shown to resident
- resident may continue or update existing complaint
- updating existing complaint triggers worker notification and timeline update

Applies to both flat-level and society/common-area complaints.

---

# 19. Data Retention

Complaint history retained for 6 months.

Architecture must support:
- automated cleanup/archival Cloud Functions
- scheduled batch deletion or TTL-based expiry
- archived data moved to cold storage or permanently deleted

