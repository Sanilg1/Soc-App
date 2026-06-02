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



---

# 23. Additions Implemented (V1.1)

## 23.1 Image Uploads
- Residents can capture or upload images for both Flat-Level Complaints and Society/Common Area Complaints.
- Images are stored in Firebase Cloud Storage.

## 23.2 Ironing Services & Ledger
- The system tracks ironing requests and maintains a ledger for each flat.
- Admins can update flat ironing balances, manage rates by cloth type, and record payments.

## 23.3 Analytics & Data Export
- Admin dashboard includes a **CSV Export** feature.
- Admins can export monthly/all-time Complaint Data (including SLAs, status, urgency).
- Admins can export the complete Ironing Ledger/Billing records.

## 23.4 Flat Registration & Mock Authentication Constraints
- **Strict Pre-seeding:** Admins cannot dynamically create new flats. The system assumes a pre-seeded flat database.
- Admins can only add or update Authorized Phone Numbers and Resident Names for existing flats.
- **Standardized Mock Authentication:** For testing, authentication strictly uses hardcoded phone numbers:
  - Resident: +919999999901`n  - Electrical Worker: +919999999902`n  - Plumbing Worker: +919999999903`n  - Housekeeping Worker: +919999999904`n  - Ironing Worker: +919999999905`n
## 23.5 Admin Session Security
- Admin authentication creates a genuine, persistent anonymous Firebase session linked securely via the dmins collection.
- Firestore security rules rigorously enforce isAdmin() validation instead of relying on open mock rules.

 #   2 4 .   A d d i t i o n s   I m p l e m e n t e d   ( P h a s e   2   /   V 1 . 2 ) 
 
 # #   2 4 . 1   G a t e   /   V i s i t o r   M a n a g e m e n t   ( M y G a t e   f u n c t i o n a l i t y ) 
 -   * * G u a r d   P e r s o n a : * *   A d d e d   a   n e w   S e c u r i t y   G u a r d   r o l e   l o g i n   ( m o c k   n u m b e r :   \ + 9 1 9 9 9 9 9 9 9 9 0 6 \ ) . 
 -   * * V i s i t o r   E n t r y : * *   G u a r d s   h a v e   a   d e d i c a t e d   d a s h b o a r d   t o   r e c o r d   i n c o m i n g   v i s i t o r s ,   d e l i v e r y   p e r s o n n e l ,   a n d   g u e s t s ,   a s s i g n i n g   t h e m   t o   s p e c i f i c   f l a t s . 
 -   * * R e s i d e n t   A p p r o v a l : * *   R e s i d e n t s   r e c e i v e   a   p r o m i n e n t   p e n d i n g   r e q u e s t   b a n n e r   o n   t h e i r   d a s h b o a r d   w h e r e   t h e y   c a n   t a p   * * A p p r o v e * *   o r   * * D e n y * *   f o r   v i s i t o r   e n t r y .   T h e   f a l l b a c k   f o r   a   l a c k   o f   r e s p o n s e   r e m a i n s   t h e   p h y s i c a l   i n t e r c o m . 
 
 # #   2 4 . 2   O f f l i n e   M o d e   &   L o c a l   C a c h i n g 
 -   * * N e t w o r k   R e s i l i e n c e : * *   A p p   l e v e r a g e s   F i r e s t o r e ' s   b u i l t - i n   o f f l i n e   p e r s i s t e n c e   t o   i n s t a n t l y   l o a d   d a t a   f r o m   c a c h e   w h e n   n e t w o r k   c o n n e c t i v i t y   d r o p s   ( e . g . ,   i n   e l e v a t o r s   o r   b a s e m e n t s ) . 
 -   * * N e t w o r k   A w a r e n e s s : * *   A   g l o b a l   n e t w o r k   l i s t e n e r   d e t e c t s   o f f l i n e   s t a t u s   a n d   d i s p l a y s   a   w a r n i n g   b a n n e r   t o   t h e   u s e r .   D a t a   o p e r a t i o n s   m a d e   o f f l i n e   w i l l   a u t o m a t i c a l l y   s y n c   t o   F i r e b a s e   o n c e   c o n n e c t i v i t y   i s   r e s t o r e d . 
 
 # #   2 4 . 3   R e a l - t i m e   P u s h   N o t i f i c a t i o n s   ( F C M ) 
 -   * * F r o n t e n d   I n t e g r a t i o n : * *   T h e   \  i r e b a s e _ m e s s a g i n g \   S D K   i s   i n t e g r a t e d   t o   a u t o m a t i c a l l y   r e q u e s t   p u s h   n o t i f i c a t i o n   p e r m i s s i o n s   f r o m   u s e r s   ( i O S / A n d r o i d   1 3 + )   a n d   s e c u r e l y   c a p t u r e   d e v i c e   F C M   t o k e n s   t o   t h e   F i r e s t o r e   \ u s e r s \   c o l l e c t i o n . 
 -   * * B a c k e n d   T r i g g e r s : * *   F i r e b a s e   C l o u d   F u n c t i o n s   a u t o m a t i c a l l y   d i s p a t c h   P u s h   N o t i f i c a t i o n s   d i r e c t l y   t o   s p e c i f i c   d e v i c e s   i n   t h e   f o l l o w i n g   s c e n a r i o s : 
     1 .   A   G a t e   G u a r d   c r e a t e s   a   n e w   V i s i t o r   r e q u e s t   ( a l e r t s   t h e   t a r g e t e d   r e s i d e n t ) . 
     2 .   A   W o r k e r   o r   A d m i n   u p d a t e s   t h e   s t a t u s   o f   a   c o m p l a i n t   ( a l e r t s   t h e   r e s i d e n t ) . 
     3 .   A   n e w   c o m p l a i n t   i s   a s s i g n e d   t o   a   w o r k e r   e i t h e r   i n s t a n t l y   o r   b y   a n   A d m i n   ( a l e r t s   t h e   w o r k e r ) . 
  
 