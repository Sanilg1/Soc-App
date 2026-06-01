# Society Maintenance App V1 — Phase-Wise Development Plan

# Development Philosophy

Build the system in operational layers.

Prioritize:
- workflow correctness
- stability
- role separation
- complaint lifecycle reliability

Avoid prioritizing:
- fancy UI
- animations
- unnecessary AI
- overengineering

The complaint lifecycle is the core product.

---

# PHASE 1 — Project Foundation

# Goal
Set up clean scalable architecture.

---

# Build

## Flutter App Setup
- initialize Flutter project
- configure routing
- configure theming
- setup folder structure
- environment configuration
- state management setup (Riverpod)

---

## Next.js Admin Dashboard Setup
- initialize Next.js app
- setup dashboard routing
- configure layout system

---

## Firebase Setup
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Cloud Messaging
- Firebase project configuration

---

## Backend Foundation
- base Firestore collections
- initial indexes
- security rules skeleton
- cloud functions setup

---

# Deliverables
- working project architecture
- Firebase connected
- scalable folder structure
- environment ready for feature development

---

# PHASE 2 — Authentication & RBAC

# Goal
Implement secure role-based authentication.

---

# Build

## Resident Authentication
- invite code flow
- OTP login
- flat-based authentication
- persistent sessions

---

## Worker Authentication
- worker OTP login
- role detection

---

## Admin Authentication
- protected admin routes
- admin role checks

---

## RBAC Rules
### Residents
- access only own flat complaints

### Workers
- access only assigned categories

### Admins
- full access

---

# Deliverables
- resident login flow
- worker login flow
- admin login flow
- secure role separation

---

# PHASE 3 — Resident Core Features

# Goal
Enable residents to create and track complaints.

---

# Build

## Resident Screens
- splash screen
- invite code screen
- login screen
- OTP verification
- resident home screen
- complaint creation screen
- complaint submitted screen
- complaint details screen
- history screen
- society issues screen
- notification inbox
- profile screen

---

## Complaint Creation Features
- category selection
- urgency selection
- availability selection
- image upload
- complaint validation
- duplicate complaint warnings

---

## Complaint Tracking Features
- timeline view
- worker notes
- complaint status updates
- reopen complaint flow
- completion confirmation

---

## Society Issues
- society issue listing
- issue status visibility
- admin update visibility

---

# Deliverables
- complete resident operational flow
- complaint lifecycle visibility
- notification integration foundation

---

# PHASE 4 — Worker Workboard & Operations

# Goal
Enable workers to manage operational workflows.

---

# Build

## Worker Screens
- worker home/workboard
- complaint detail screen
- visit update screen
- need tools/revisit screen
- resident unavailable flow
- completion screen
- scheduled visits screen
- pause request screen
- leave request screen
- leave history screen
- notification inbox
- history screen
- profile screen

---

## Workboard Sections
- critical complaints
- pending complaints
- revisits
- scheduled tasks
- waiting-long complaints

---

## Complaint Actions
- mark visited
- add worker notes
- request revisit
- request reschedule
- mark resident unavailable
- complete complaint

---

## Worker Pause Requests
- pause request creation
- admin approval flow
- pause status tracking

## Worker Leave System
- leave requests
- leave history
- unavailable state
- delay warning banners

---

# Deliverables
- complete worker operational workflow
- dynamic workboard
- complaint lifecycle actions

---

# PHASE 5 — Admin Dashboard

# Goal
Provide operational oversight and escalation management.

---

# Build

## Admin Screens
- dashboard overview
- complaints management
- escalation dashboard
- society issue management
- worker management
- leave approvals
- analytics
- settings

---

## Dashboard Features
- KPI cards
- long pending complaints
- emergency complaints
- reopen tracking
- SLA monitoring

---

## Complaint Management
- complaint filters
- reassignment
- escalation highlighting
- complaint detail views

---

## Worker Management
- worker status
- leave approvals
- pause approvals
- worker activation/deactivation

---

## Society Issue Management
- review issues
- assign workers/vendors
- update status
- resident visibility updates

---

# Deliverables
- operational admin dashboard
- escalation management
- worker management system

---

# PHASE 6 — Notifications & Escalation Logic

# Goal
Implement operational communication reliability.

---

# Build

## Notification System
- Firebase Cloud Messaging integration
- resident notifications
- worker notifications
- admin notifications
- notification inbox sync

---

## Escalation Logic
- SLA breach detection
- emergency escalation
- reopen escalation
- critical highlighting

---

## Emergency Handling
- emergency alerts
- critical complaint pinning
- automatic escalation triggers
- worker call trigger architecture
- guard notification for on-ground emergencies

---

# Deliverables
- reliable notification workflows
- operational escalation system
- emergency handling flows

---

# PHASE 7 — Cloud Functions & Background Automation

# Goal
Implement backend operational automation.

---

# Build

## Cloud Functions
- SLA tracking jobs
- escalation jobs
- reopen escalation logic
- cleanup jobs (including 6-month data retention enforcement)
- notification automation
- activity log population

---

## Automated Operational Logic
- complaint aging tracking
- waiting-long detection
- emergency timeout checks
- worker unavailability logic

---

# Deliverables
- automated backend operational flows
- stable escalation logic
- background system reliability

---

# PHASE 8 — QA, Security & Production Preparation

# Goal
Prepare production-ready MVP.

---

# Build

## QA
- edge-case testing
- complaint lifecycle testing
- reopen testing
- escalation testing
- notification testing

---

## Security
- Firestore rules testing
- RBAC validation
- route protection
- input validation

---

## Reliability
- loading states
- retry logic
- upload failure handling
- crash handling
- responsiveness

---

## Deployment
- Firebase deployment setup
- Vercel deployment setup
- environment configs
- production environment testing

---

# Deliverables
- production-ready MVP
- stable deployment
- secure operational workflows

---

# Recommended Development Order

```text
Phase 1: Project Foundation
↓
Phase 2: Authentication & RBAC
↓
Phase 3: Resident Core Features
↓
Phase 4: Worker Workboard & Operations
↓
Phase 5: Admin Dashboard
↓
Phase 6: Notifications & Escalation Logic
↓
Phase 7: Cloud Functions & Background Automation
↓
Phase 8: QA, Security & Production Preparation
```

---

# Important Engineering Principles

# Prioritize
- operational simplicity
- reliability
- clean state management
- maintainable architecture
- scalable data models

---

# Avoid
- unnecessary realtime complexity
- enterprise-style workflow bloat
- excessive animations
- unnecessary AI systems
- premature optimization

---

# Core Product Principle

The system should:
- assist human operational decision-making
- improve visibility
- improve accountability
- reduce forgotten complaints

The system should NOT:
- fully automate worker decisions
- rigidly dispatch work
- replace operational judgment

