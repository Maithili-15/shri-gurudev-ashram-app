# IMPLEMENTATION.md

# Objective

Complete the remaining mobile application work.

Do NOT stop after completing one item.

Continue implementing the next incomplete task until every checklist item below is finished.

Do NOT replace existing working functionality.

Do NOT introduce temporary workarounds.

Do NOT duplicate business logic.

The backend remains the single source of truth.

Mark each task complete only after it has been fully implemented.

---

# Phase A — Critical Fixes (Highest Priority)

## A1. Notification Type Failure

Current error:

```text
null value in column "type" of relation "notifications"
```

Tasks

- [ ] Find every notification creation path.
- [ ] Ensure every notification includes a valid `type`.
- [ ] Standardize notification types using a shared enum/constants file.
- [ ] Update all booking/payment/verification notifications.
- [ ] Remove duplicated notification creation logic.

Goal

No notification insertion should ever fail because of a missing notification type.

---

## A2. Payment Confirmation Consistency

Some payments become Confirmed immediately.

Others remain Pending.

Tasks

- [ ] Audit Travel payment flow.
- [ ] Audit Seva payment flow.
- [ ] Audit Annadan payment flow.
- [ ] Audit Donation payment flow.
- [ ] Standardize order creation.
- [ ] Standardize payment verification.
- [ ] Standardize webhook processing.
- [ ] Ensure idempotent webhook handling.
- [ ] Prevent duplicate payment processing.
- [ ] Ensure booking status changes exactly once.
- [ ] Ensure payment status changes exactly once.

Goal

Every module should follow the same payment lifecycle.

---

## A3. Date Accuracy

Current issues:

- inaccurate dates
- timezone inconsistencies

Tasks

- [ ] Review all backend date storage.
- [ ] Review frontend parsing.
- [ ] Standardize UTC storage.
- [ ] Standardize IST display.
- [ ] Fix receipts.
- [ ] Fix booking history.
- [ ] Fix dashboards.
- [ ] Fix review screens.

Goal

Dates must be identical everywhere.

---

## A4. Seva Booking Restrictions

Yatra-linked Sevas should only be bookable during the selected Yatra.

Tasks

- [ ] Restrict frontend date picker.
- [ ] Validate on backend.
- [ ] Reject invalid dates.
- [ ] Display clear validation message.

Applies to

- Guruji Aarti
- Yajman Pad
- Every Yatra-linked Seva

---

# Phase B — User Experience

## B1. Autofill

When signed in automatically populate:

- [ ] Name
- [ ] Phone

Across

- [ ] Travel
- [ ] Seva
- [ ] Donation
- [ ] Nitya Annadan

---

## B2. Phone Number

Current issue:

+91 causes truncation.

Tasks

- [ ] Separate country code.
- [ ] Accept only 10 digits.
- [ ] Normalize backend value.
- [ ] Fix validation.

---

## B3. Required Fields

Where applicable require:

- [ ] Name
- [ ] Phone

Email remains optional.

---

# Phase C — Dashboard Improvements

## C1. Donation Dashboard

Implement

- [ ] Total donations
- [ ] Donation history
- [ ] Payment status
- [ ] Receipts
- [ ] Search
- [ ] Filters

---

## C2. Travel Dashboard

Display linked Seva.

Include

- [ ] Seva Name
- [ ] Date
- [ ] Amount
- [ ] Status
- [ ] Navigation

---

## C3. My Activity

Current issue:

Out of sync.

Tasks

- [ ] Refactor My Activity.
- [ ] Use backend history APIs.
- [ ] Synchronize Travel.
- [ ] Synchronize Seva.
- [ ] Synchronize Donations.
- [ ] Synchronize Annadan.

Goal

My Activity should exactly reflect backend data.

---

# Completion Rules

Continue implementing tasks until every checkbox is complete.

Do not stop after finishing one section.

If a task reveals additional required work, complete that work before marking the parent task complete.

Maintain existing architecture:

- Backend is authoritative.
- No duplicated business logic.
- No placeholder implementations.
- No temporary fixes.

Only stop when every task in this document has been completed.