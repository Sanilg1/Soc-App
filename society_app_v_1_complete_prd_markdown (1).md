# Society Maintenance App — V1 Complete Context

# 1. Product Goal

Build a residential society maintenance coordination platform that solves:
- forgotten complaints
- lack of prioritization
- no centralized complaint system
- poor visibility for residents
- emergency escalation handling
- maintenance coordination inefficiencies

The system should:
- help workers manage complaints
- help residents track complaints
- help admins monitor operations
- preserve worker autonomy
- improve accountability and transparency

The app is NOT:
- a rigid task dispatcher
- a sequential task manager
- an AI-first system
- a worker micromanagement tool

The app IS:
- an operational coordination platform
- a complaint lifecycle system
- a maintenance workboard
- an escalation and transparency system

---

# 2. V1 Scope

## Included Categories
### Flat-Level Complaints
- Electrical
- Plumbing

### Society/Common Area Complaints
Examples:
- lift issue
- parking lights
- water supply issue
- gate issue
- common-area leakage

---

# 3. Platforms

## Mobile App
Cross-platform app for:
- Residents
- Workers

Recommended:
- Flutter

---

## Admin Dashboard
Web dashboard for:
- Admin committee

Recommended:
- Next.js

---

# 4. User Roles

# Resident
Residents can:
- login/authenticate
- create complaints
- upload photos
- select urgency
- set availability
- track complaint progress
- receive worker updates
- respond to reschedule requests
- confirm completion
- reopen complaints
- view society issues

---

# Worker
Workers:
- electrician
- plumber

Workers can:
- view category-specific workboard
- prioritize complaints manually
- mark complaints visited
- add worker notes
- request revisits
- request reschedules
- mark resident unavailable
- complete complaints
- request temporary pause

## Worker Philosophy
Workers retain final operational control.
The app helps workers prioritize and avoid forgetting tasks.
The app does NOT enforce sequential execution.

---

# Admin Committee
Admins can:
- monitor complaints
- monitor escalations
- approve pauses
- reassign complaints
- manage society issues
- monitor emergencies
- view analytics

---

# Guards
Guards are outside normal workflows.

Guards only receive escalation visibility during unresolved emergencies.

---

# 5. Authentication & Accounts

# Account Structure
Accounts are flat-based.

The primary identity is the flat/home.

Multiple family devices allowed under one flat account.

---

# Account Creation
Accounts are created by admin.

---

# First-Time Login
Requires:
- invite code
- flat number
- registered phone number
- resident name
- OTP verification

---

# Login Persistence
Users remain logged in after authentication.

---

# 6. Complaint Types

# Type 1 — Flat Complaints
Examples:
- switch issue
- fan issue
- leakage
- plumbing issue
- sparking

Flow:
Resident → Worker → Resolution

---

# Type 2 — Society/Common Area Complaints
Examples:
- lift malfunction
- parking light failure
- common-area leakage
- gate issue

Flow:
Resident → Admin Review → Worker/Vendor Assignment

---

# 7. Resident Workflow

# Complaint Creation
Resident selects:
- category
- description
- urgency
- availability
- optional photos

---

# Complaint Description Validation
Description rules:
- minimum 10 characters
- maximum 500 characters

---

# Photo Upload Failure Handling
If image upload fails:
- complaint still submits successfully
- resident informed image upload failed

---

# Urgency Levels
- Low
- Medium
- High
- Emergency

---

# Availability Options
Examples:
- Anytime Today
- Morning
- Evening
- Custom Slot

---

# Complaint Tracking
Residents can view:
- current status
- assigned worker
- latest worker note
- complaint timeline
- reschedule requests

---

# Completion Flow
Worker marks complaint completed.

Resident must:
- confirm completion
OR
- reopen complaint

---

# Reopen Escalation Logic
After 3 complaint reopenings:
- complaint auto-escalates to admin
- complaint flagged as high attention

---

# Reopening Complaint
Residents can reopen complaints if:
- issue still unresolved
- issue returned
- partial fix

Optional reopen note allowed.

---

# Worker Assignment Logic

## V1 Default Behavior
Flat complaints auto-map by category:
- electrical complaints → electrician workboard
- plumbing complaints → plumber workboard

---

## Multi-Worker Future Support
Architecture should support multiple workers per category.

If multiple workers exist:
- complaints visible to all workers in same category
- workers may accept complaint voluntarily
- no reject flow required in V1

---

# 8. Worker Workflow

# Worker Workboard
Workers see:
- critical complaints
- pending complaints
- revisits
- waiting-long complaints
- scheduled visits

Workers decide task execution order.

---

# Worker Complaint Actions
Workers can:
- Mark Visited
- Need Tools
- Schedule Return
- Mark Resident Unavailable
- Complete Work

---

# Worker Notes
Every major update can include a worker note.

Examples:
- "Need replacement switch part"
- "Will revisit after 5 PM"
- "Major leakage identified"
- "Switchboard replaced successfully"

---

# Need Tools/Revisit Flow
Worker may:
- mark need tools
- schedule return visit
- add note

Resident receives update.

---

# Resident Unavailable Flow
If resident unavailable:
- worker marks resident unavailable
- complaint reopens
- resident notified
- repeated misses visible to admin

Residents are NOT deprioritized.

---

# Worker Pause Requests
Workers may request temporary pause.

Examples:
- handling major outage
- emergency workload
- temporary unavailability

Pause requires admin approval.

---

# Worker Unavailability Banner
If worker is on approved leave or unavailable:
- complaints still enter queue
- residents shown warning banner before submission

Example:
"Worker currently unavailable. Delays may occur."

---

# Worker Leave Requests
Workers can apply for leave through the app.

## Leave Request Fields
- leave start date
- leave end date
- reason for leave
- optional note

---

## Admin Actions
Admins can:
- approve leave
- reject leave
- view upcoming worker leaves

---

## Operational Impact
During approved leave:
- workers marked unavailable
- new complaints continue entering queue
- admins may arrange backup/vendor support
- residents may see increased wait times

---

# 9. Complaint Lifecycle

# Flat Complaint States
| State | Meaning |
|---|---|
| Submitted | Complaint created |
| Queued | Awaiting worker |
| Visited | Worker inspected issue |
| Need Tools | Additional tools/parts required |
| Revisit Scheduled | Return visit planned |
| Awaiting Confirmation | Worker marked completed |
| Closed | Resident confirmed completion |
| Reopened | Resident reopened complaint |
| Escalated | Delayed/problematic complaint |

---

# Society Issue States
| State | Meaning |
|---|---|
| Reported | Resident submitted issue |
| Under Review | Admin reviewing |
| Assigned | Worker/vendor assigned |
| In Progress | Work ongoing |
| Resolved | Issue resolved |

---

# SLA Definitions

## Default V1 SLA Rules
| Priority | Initial Response Expectation | Escalation Threshold |
|---|---|---|
| Emergency | Immediate | 15 mins |
| High | Same day | 12 hrs |
| Medium | 24 hrs | 2 days |
| Low | Flexible | 4 days |

## SLA Definition — Initial Response
"Initial Response" means the assigned worker has acknowledged the complaint by taking any action (e.g., marking "Visited", adding a note, or scheduling a return visit). The SLA timer starts from complaint creation.

---

## SLA Configuration
Initially fixed in V1.

Architecture should support future admin configurability per:
- society
- category
- urgency level

---

# 10. Priority Philosophy

# Priority Inputs
## Resident Suggestion
Residents select urgency.

---

## AI Suggestion
AI only assists for emergency detection.

---

## Final Authority
Worker has final operational priority decision.

---

# Queue Philosophy
The system is NOT FIFO/sequential.

The workboard behaves like a dynamic operational workspace.

Workers see:
- emergencies
- waiting-long complaints
- revisits
- scheduled tasks
- pending complaints

Workers decide actual execution order.

---

# 11. Emergency Handling

# Emergency Triggers
Triggered by:
- resident selecting emergency
- AI detecting dangerous keywords

Examples:
- smoke
- sparks
- flooding
- gas smell
- burning smell

---

# Emergency Actions
System:
- sends push notifications
- alerts worker
- alerts admin
- pins complaint to top

---

# Emergency Escalation
If emergency not acknowledged within ~15 minutes:
- automatic phone call triggered
- admin escalated
- guards notified if needed

---

# Emergency Abuse Handling
No aggressive punishment system in V1.

Instead:
- worker retains final authority
- warning shown for emergency selection
- admin visibility maintained

---

# 12. Society/Common Area Issue Handling

# Flow
Resident → Admin Review → Assignment → Resolution

---

# Visibility
Residents can view:
- active society issues
- current status
- admin updates

Purpose:
- reduce duplicate complaints
- improve transparency

---

# Duplicate Complaint Detection
Applies to both flat-level and society/common-area complaints.

System should detect:
- existing unresolved complaint of same category for same flat (flat complaints)
- existing unresolved society issue of same type (society/common-area complaints)

Instead of hard blocking:
- resident receives warning
- resident may continue anyway
- resident may edit/add details to existing complaint

If resident updates existing complaint:
- worker receives push notification
- complaint timeline updated

---

# 13. Notifications

# Notification Center

## Resident Notification Inbox
Residents have access to notification history screen.

Displays:
- worker updates
- revisit requests
- completion requests
- escalations
- complaint updates

---

# Resident Notifications
Residents receive notifications for:
- complaint submitted
- worker updates
- revisit scheduling
- completion requests
- resident unavailable status
- reopened complaint updates

Residents do NOT receive:
- internal worker acceptance notifications

---

# Worker Notifications
Workers receive:
- new complaints
- emergency alerts
- resident responses
- escalation alerts
- admin actions

---

# Role-Based Access Control (RBAC)

## Resident Access
Residents:
- can only view complaints belonging to their flat
- can view public society/common-area issues

---

## Worker Access
Workers:
- can only view complaints belonging to their assigned category/categories

---

## Admin Access
Admins have full operational visibility.

---

# Multi-Device Sync
Multiple devices under same flat account should stay synchronized.

Examples:
- complaint created on one device visible on others
- worker updates visible across all logged-in devices
- complaint reopen status synchronized

Implemented through Firestore sync.

---

# Admin Notifications
Admins receive:
- emergencies
- SLA breaches
- repeated reopenings
- unresolved complaints
- pause requests

---

# 14. Resident App Screens

# Resident Screens
- Splash Screen
- Invite Code Screen
- Authentication Screen
- OTP Verification Screen
- Home Screen
- Complaint Creation Screen
- Complaint Submitted Screen
- Complaint Details Screen
- Society Issues Screen
- Notification Inbox Screen
- History Screen
- Profile Screen

---

# Resident Home Screen
Displays:
- active complaints
- latest updates
- worker notes
- quick complaint actions
- society issue previews

---

# Complaint Details Screen
Displays:
- complaint timeline
- current status
- worker notes
- revisit scheduling
- completion confirmation
- reopen option

---

# 15. Worker App Screens

# Worker Screens
- Login Screen
- Workboard Screen
- Complaint Details Screen
- Visit Update Screen
- Need Tools/Revisit Screen
- Resident Unavailable Flow
- Completion Screen
- Scheduled Visits Screen
- Pause Request Screen
- Leave Request Screen
- Leave History Screen
- Notification Inbox
- History Screen

---

# Worker Workboard Sections
- Critical
- Pending
- Revisits
- Waiting Long
- Scheduled

---

# 16. Admin Dashboard Screens

# Admin Screens
- Dashboard Overview
- Complaints Management
- Complaint Detail View
- Escalation Dashboard
- Society Issues Management
- Worker Management
- Analytics
- Settings

---

# Escalation Dashboard
Displays:
- emergency not acknowledged
- long pending complaints
- repeated reopenings
- worker inactivity

---

# 17. Media Support

## Included
Optional image upload.

Recommended:
- maximum 3 images
- automatic compression

---

## Not Included
- videos
- image annotations
- advanced image analysis

---

# 18. Data Retention

Complaint history retained for:
- 6 months

---

# 19. Connectivity Assumptions

V1 assumes reliable internet.

Offline support not included.

---

# 20. AI Usage In V1

## Included AI
ONLY:
- keyword-based emergency detection

---

## Not Included
- voice complaints
- speech-to-text
- conversational AI
- automatic prioritization
- predictive maintenance
- smart dispatching

---

# 21. Recommended Technical Stack

# Mobile App
Flutter

---

# Admin Dashboard
Next.js

---

# Backend
Firebase

Recommended services:
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Cloud Messaging

---

# 22. Long-Term Expansion Direction

Future expansion may include:
- visitor management
- announcements
- billing
- parking management
- vendor coordination
- amenity booking
- voice complaints
- multilingual support
- predictive analytics

