# Society Maintenance App — Future Possibilities (Phase 3+)

This document captures valuable feature ideas that are intentionally deferred from Phase 1 and Phase 2. These features can significantly enhance user engagement and monetization but require more complex infrastructure (like payment gateways) or shift the operational dynamics of the app.

---

## 1. Payment Gateway Integration

### Concept
Allow residents to pay society dues directly from the app.

### Use Cases
- **Ironing Bills:** Residents can view their outstanding ironing balance (tracked in the Admin Ledger) and tap "Pay Now" via UPI, Credit Card, or Netbanking.
- **Monthly Maintenance Fees:** Society maintenance invoices can be generated and settled within the app.
- **Facility Booking:** Paid bookings for the clubhouse, party hall, or badminton court.

### Technical Requirements
- Integration with a Payment Gateway (e.g., Razorpay, Stripe, or PayU).
- Secure backend webhooks (Firebase Cloud Functions) to verify payment success and automatically update the `ledgers` in Firestore.
- Legal/Tax compliance for invoicing (GST splits if applicable).

---

## 2. Worker Ratings & Quality Tracking

### Concept
Shift focus from just tracking *speed* (SLA) to also tracking *quality*. 

### Use Cases
- **Post-Resolution Rating:** When a resident confirms a complaint is resolved, they are prompted to leave a 1-5 star rating and an optional comment.
- **Admin Analytics:** The Admin Dashboard will aggregate these scores to show the average rating for each worker.
- **Performance Bonuses:** Management Committees can use this data for worker appraisals and bonuses, rather than relying solely on anecdotal feedback.

### Technical Requirements
- Update the `complaint` lifecycle to enforce a rating prompt upon `Closed` status.
- New `ratings` collection in Firestore or appending a `rating` object to the `complaint` document.
- Updates to the `workers` collection to track `averageRating` and `totalRatings`.
- UI updates in the Admin Analytics and Worker Management tabs.
