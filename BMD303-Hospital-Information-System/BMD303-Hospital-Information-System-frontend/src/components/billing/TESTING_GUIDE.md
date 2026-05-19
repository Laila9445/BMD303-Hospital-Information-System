# Billing Module - Testing & Validation Guide

## Comprehensive Test Scenarios

### 1. Invoice Management Workflow

#### 1.1 Create Consultation Invoice
- [ ] Navigate to Billing → Invoices → Create Invoice
- [ ] Fill form: Patient Name, Service (Consultation), Price
- [ ] Submit and verify invoice is created
- [ ] Check status is "Pending"
- [ ] Verify invoice appears in list

#### 1.2 Create Referral Invoice
- [ ] Navigate to Billing → Invoices → Create Invoice
- [ ] Select service type: Referral
- [ ] Fill form with referral-specific details
- [ ] Optional: Select insurance provider
- [ ] Verify insurance discount is applied correctly
- [ ] Verify finalAmount = price - discount

#### 1.3 Create Invoice with Insurance
- [ ] Create invoice and select insurance (e.g., Arig, 20%)
- [ ] Verify discount is calculated: discount = price * 20% / 100
- [ ] Verify finalAmount = price - discount
- [ ] Check InsuranceSummaryCard shows all details
- [ ] Submit and verify insurance data is persisted

#### 1.4 Create Invoice Without Insurance
- [ ] Create invoice without selecting insurance
- [ ] Verify finalAmount = price (no discount)
- [ ] Verify insuranceName is empty/null
- [ ] Verify discount is 0%

### 2. Invoice Payment Workflow

#### 2.1 Mark Pending Invoice as Paid
- [ ] Open invoice with status "Pending"
- [ ] Click "Mark as Paid" button
- [ ] Verify amount field is pre-filled with finalAmount
- [ ] Verify amount field is READ-ONLY (cannot edit)
- [ ] Select payment method: "Cash"
- [ ] Submit payment
- [ ] Verify status changes to "Paid"
- [ ] Verify payment record is created

#### 2.2 Payment Method Selection
- [ ] Open PaymentModal
- [ ] Verify only two options: "Cash" and "InstaPay"
- [ ] Select "Cash" and verify it's selected
- [ ] Select "InstaPay" and verify it's selected
- [ ] No other payment methods should appear

#### 2.3 Payment Amount Lock
- [ ] Open invoice worth 500 EGP
- [ ] Click "Mark as Paid"
- [ ] Verify amount field shows "500"
- [ ] Try to edit amount field - should not allow editing
- [ ] Verify field styling shows read-only state
- [ ] Submit with locked amount
- [ ] Verify payment of 500 is recorded

### 3. Invoice Cancellation Workflow

#### 3.1 Cancel Referral Invoice
- [ ] Create a referral invoice
- [ ] Set status to "Pending" (not paid, not cancelled)
- [ ] Click "Cancel" button
- [ ] CancellationModal should appear
- [ ] Select reason from predefined list
- [ ] Click submit
- [ ] Verify status changes to "Cancelled"
- [ ] Verify reason is stored and displayed

#### 3.2 Cancel Consultation Invoice
- [ ] Create a consultation invoice
- [ ] Click "Cancel" button
- [ ] NO Cancel button should appear
- [ ] Only referrals can be cancelled

#### 3.3 Cannot Cancel Paid Invoice
- [ ] Create referral invoice and mark as paid
- [ ] Cancel button should NOT appear
- [ ] Cannot cancel paid invoices

#### 3.4 Cannot Cancel Already Cancelled Invoice
- [ ] Create referral invoice and cancel it
- [ ] Click "Cancel" again
- [ ] NO Cancel button should appear
- [ ] Cannot cancel already cancelled invoices

#### 3.5 Cancellation Reasons
- [ ] Open CancellationModal
- [ ] Verify all predefined reasons appear
- [ ] Select "Other" option
- [ ] Text input should appear for custom reason
- [ ] Type custom reason and submit
- [ ] Verify custom reason is stored

### 4. Service Pricing Management

#### 4.1 Add Service
- [ ] Navigate to Billing → Services
- [ ] Fill form: Name, Department, Price, Description
- [ ] Submit
- [ ] Verify service appears in table
- [ ] Verify activeStatus = true
- [ ] Verify data is persisted

#### 4.2 Edit Service
- [ ] Click "Actions" → "Edit" for a service
- [ ] Form should pre-fill with existing data
- [ ] Change price value
- [ ] Submit
- [ ] Verify service is updated
- [ ] Verify change is reflected in table

#### 4.3 Deactivate Service
- [ ] Click "Actions" → "Deactivate"
- [ ] Verify status badge changes to "Inactive"
- [ ] Verify activeStatus = false
- [ ] Service should NOT appear in invoice creation anymore

#### 4.4 Reactivate Service
- [ ] Click "Actions" → "Activate" on inactive service
- [ ] Verify status badge changes to "Active"
- [ ] Verify activeStatus = true
- [ ] Service should appear in invoice creation

#### 4.5 Department Filtering
- [ ] Filter by "Doctor" department
- [ ] Only Doctor services should appear
- [ ] Filter by "Radiology"
- [ ] Only Radiology services should appear
- [ ] Reset to "All Departments"
- [ ] All active services should appear

### 5. Role-Based Access Control

#### 5.1 Doctor Role
- [ ] Login as doctor
- [ ] Navigate to Billing → Services
- [ ] Only "Doctor" department should appear in filters
- [ ] Only Doctor services should be visible
- [ ] Department dropdown should only show "Doctor"

#### 5.2 Radiology Role
- [ ] Login as radiology user
- [ ] Navigate to Billing → Services
- [ ] Only "Radiology" department should appear in filters
- [ ] Only Radiology services should be visible

#### 5.3 Physiotherapy Role
- [ ] Login as physiotherapy user
- [ ] Only "Physiotherapy" department should appear in filters
- [ ] Only Physiotherapy services should be visible

#### 5.4 Nurse Role (Full Access)
- [ ] Login as nurse
- [ ] All departments should appear in filters
- [ ] All services should be visible
- [ ] Can create invoices for any department

#### 5.5 Patient Role (No Access)
- [ ] Login as patient
- [ ] Navigate to Services page
- [ ] Message: "Access Restricted: Patients cannot view internal service pricing"
- [ ] Form should not appear
- [ ] Cannot create services

#### 5.6 Patient Invoice View
- [ ] Patient views own invoices
- [ ] Should see finalAmount only
- [ ] Should NOT see internal service pricing

### 6. Invoice Type System

#### 6.1 Consultation Invoice Type
- [ ] Create invoice with Consultation service
- [ ] Verify Type column shows "Consultation"
- [ ] Verify it cannot be cancelled

#### 6.2 Referral Invoice Type
- [ ] Create invoice with Referral service
- [ ] Verify Type column shows "Referral"
- [ ] Verify Cancel button appears for Pending referrals

#### 6.3 Invoice Type Display
- [ ] Navigate to Invoice list
- [ ] Verify Type column shows correct type for each
- [ ] Verify invoice card shows type badge

### 7. Dashboard Verification

#### 7.1 Dashboard Stats
- [ ] Pending Invoices card shows correct count
- [ ] Paid Invoices card shows correct count
- [ ] Cancelled Invoices card shows correct count
- [ ] Cards should NOT show "Today's Revenue"

#### 7.2 Dashboard Cards Layout
- [ ] 3 cards are visible (Pending, Paid, Cancelled)
- [ ] Cards are equally sized in grid
- [ ] No "Today's Revenue" card
- [ ] No "Total Patients Today" card

#### 7.3 Dashboard Recent Activity
- [ ] Recent Billing Activity section shows latest invoices
- [ ] Latest Invoices section shows recent invoice list
- [ ] Both sections update when new invoices are created

### 8. Data Persistence & Consistency

#### 8.1 LocalStorage Persistence
- [ ] Create invoice and refresh page
- [ ] Invoice should still exist
- [ ] Create payment and refresh page
- [ ] Payment should still exist
- [ ] Edit service and refresh page
- [ ] Changes should persist

#### 8.2 Invoice Data Integrity
- [ ] Create invoice with insurance
- [ ] Refresh and verify: id, type, status, insuranceId, insuranceName, finalAmount
- [ ] All fields should be persisted correctly

#### 8.3 Payment Data Integrity
- [ ] Create payment with amount and method
- [ ] Refresh and verify: invoiceId, amount, method, date
- [ ] All fields should be persisted correctly

#### 8.4 Service Data Integrity
- [ ] Create service with all fields
- [ ] Refresh and verify: id, serviceName, department, price, activeStatus
- [ ] All fields should be persisted correctly

### 9. Status System Validation

#### 9.1 Invoice Status Transitions
- [ ] Pending → (Mark as Paid) → Paid ✓
- [ ] Pending → (Cancel Referral) → Cancelled ✓
- [ ] Paid → (Cannot Mark as Pending) ✓
- [ ] Cancelled → (Cannot Un-Cancel) ✓

#### 9.2 Status Badge Display
- [ ] Pending status shows amber/yellow color
- [ ] Paid status shows emerald/green color
- [ ] Cancelled status shows rose/red color
- [ ] Badges have correct text labels

### 10. UI/UX Validation

#### 10.1 Form Validation
- [ ] Required fields marked with asterisk (*)
- [ ] Cannot submit form with empty required fields
- [ ] Error messages appear for invalid input
- [ ] Helper text appears for field guidance

#### 10.2 Modal Behavior
- [ ] Modals open without errors
- [ ] Modals close on cancel/submit
- [ ] Form data is cleared after successful submit
- [ ] Modal form is pre-filled for edit operations

#### 10.3 Loading States
- [ ] Loading spinner appears during async operations
- [ ] Buttons are disabled while loading
- [ ] Success/error messages appear after operations
- [ ] Page refreshes correctly after data changes

#### 10.4 Empty States
- [ ] Empty state appears when no invoices exist
- [ ] Empty state appears when search returns no results
- [ ] Empty state message is helpful and actionable

#### 10.5 Search & Filter
- [ ] Search works for patient names
- [ ] Search works for invoice IDs
- [ ] Filters apply correctly (status, department)
- [ ] Multiple filters work together
- [ ] Clearing filters shows all results

### 11. Responsive Design Validation

#### 11.1 Mobile (375px)
- [ ] No horizontal scroll on main page
- [ ] Forms stack vertically
- [ ] Buttons are touch-friendly (≥44px)
- [ ] Tables have horizontal scroll
- [ ] Modals fit viewport

#### 11.2 Tablet (768px)
- [ ] 2-column grids display correctly
- [ ] Forms show 2 columns
- [ ] All content is accessible
- [ ] Navigation is functional

#### 11.3 Desktop (1920px)
- [ ] 4-column grids display correctly
- [ ] Forms show multi-column layout
- [ ] Proper whitespace maintained
- [ ] No content overflow

### 12. Edge Cases & Error Handling

#### 12.1 Missing Data
- [ ] Invoice with missing serviceName - should show placeholder
- [ ] Invoice with missing department - should show placeholder
- [ ] Service with empty description - shows "—"

#### 12.2 Invalid Numbers
- [ ] Service with price = 0 - should allow (lab tests can be free)
- [ ] Negative prices - should be rejected
- [ ] Non-numeric prices - should be rejected

#### 12.3 Duplicate Prevention
- [ ] Cannot create two identical services
- [ ] Can create same-named service in different department
- [ ] Service ID must be unique

#### 12.4 Cancellation Edge Cases
- [ ] Cannot cancel consultation invoice
- [ ] Cannot cancel paid referral
- [ ] Cannot cancel already cancelled referral
- [ ] Cancellation reason is required

#### 12.5 Payment Edge Cases
- [ ] Cannot record payment for non-existent invoice
- [ ] Cannot record duplicate payments for same amount
- [ ] Payment method is required

## Performance Checklist

- [ ] Page loads in < 2 seconds
- [ ] Search results filter instantly (< 300ms)
- [ ] Form submission completes in < 1 second
- [ ] No console errors or warnings
- [ ] No layout thrashing/excessive reflows
- [ ] Smooth animations/transitions

## Security Checklist

- [ ] Patient cannot access other patients' invoices
- [ ] Patient cannot view internal service pricing
- [ ] Doctor cannot edit services of other departments
- [ ] Protected routes redirect unauthenticated users
- [ ] No sensitive data in localStorage (only invoice IDs, not amounts)

## Regression Testing

After changes, verify:
1. All previous tests still pass
2. No new console errors introduced
3. Existing workflows still work
4. UI looks consistent after changes
5. Performance hasn't degraded

## Sign-Off Criteria

✅ All 13 task groups completed
✅ 100% of test scenarios pass
✅ Zero critical bugs
✅ Zero high-priority issues
✅ Responsive design verified at 3+ breakpoints
✅ Code follows design system
✅ Production-ready for deployment

