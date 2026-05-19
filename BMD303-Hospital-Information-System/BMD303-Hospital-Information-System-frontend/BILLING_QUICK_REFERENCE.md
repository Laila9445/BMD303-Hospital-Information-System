# Billing Module - Quick Reference Guide

## 🚀 Quick Start for Developers

### Project Structure
```
src/
├── api/
│   ├── billingApi.js              # API layer for billing operations
│   └── ...
├── billing/
│   ├── BillingContext.jsx          # State management
│   ├── billingService.js           # Business logic
│   ├── billingApi.js               # Mock API
│   ├── billingMockData.js          # Test data
│   ├── billingUtils.js             # Utility functions
│   ├── models.js                   # Type definitions
│   └── index.js                    # Exports
├── components/billing/
│   ├── COMPONENT_GUIDE.md          # Component reference
│   ├── RESPONSIVE_DESIGN.md        # Mobile design guide
│   ├── TESTING_GUIDE.md            # Test scenarios
│   ├── FormInput.jsx               # Form field component
│   ├── ActionButton.jsx            # Button component
│   ├── SectionHeader.jsx           # Header component
│   ├── BillingTable.jsx            # Table component
│   ├── InvoiceCard.jsx             # Invoice display
│   ├── ServiceCard.jsx             # Service display
│   ├── InvoiceTable.jsx            # Invoice list table
│   ├── PaymentModal.jsx            # Payment form
│   ├── CancellationModal.jsx       # Cancellation form
│   ├── CreateInvoiceModal.jsx      # Create invoice form
│   ├── InsuranceSummaryCard.jsx    # Insurance breakdown
│   ├── InvoiceStatusBadge.jsx      # Status indicator
│   ├── EmptyState.jsx              # Empty state UI
│   ├── SearchBar.jsx               # Search input
│   └── ...
├── pages/nurse/billing/
│   ├── BillingDashboard.jsx        # Dashboard
│   ├── BillingInvoices.jsx         # Invoice management
│   ├── BillingServices.jsx         # Service pricing
│   ├── BillingPayments.jsx         # Payment tracking
│   └── ...
├── pages/patient/billing/
│   ├── PatientBilling.jsx          # Patient dashboard
│   ├── PatientInvoices.jsx         # Patient invoices
│   └── ...
├── utils/
│   └── roleBasedVisibility.js      # Role-based filtering
└── context/
    └── BillingContext.jsx
```

---

## 🔑 Key Functions & Hooks

### Using BillingContext
```javascript
import { useBilling } from '../billing';

const { 
  invoicesState,      // All invoices
  servicesState,      // All services
  paymentsState,      // All payments
  patients,           // Patient list
  insurances,         // Insurance providers
  addPayment,         // Record payment
  createInvoice,      // Create invoice
  cancelInvoice,      // Cancel invoice
  addService,         // Create service
  updateService,      // Edit service
  toggleService,      // Activate/deactivate
  markInvoicePaid,    // Mark as paid (legacy)
} = useBilling();
```

### Using Role-Based Visibility
```javascript
import { 
  getVisibleServices,      // Filter services by role
  getVisibleDepartments,   // Get allowed departments
  canViewService,          // Check if role can view
  getRoleServiceDescription, // Get role description
  ROLE_SERVICE_MAPPING,    // Role mappings
} from '../utils/roleBasedVisibility';

const { user } = useAuth();
const visibleServices = getVisibleServices(services, user?.role);
```

### Using Format Utilities
```javascript
import { formatCurrency } from '../billing/billingUtils';

const amount = formatCurrency(1500); // "1,500.00 EGP"
```

---

## 📝 Common Tasks

### Create a New Invoice
```javascript
const handleCreate = async (formData) => {
  await createInvoice({
    patientName: formData.patient,
    serviceName: formData.service,
    department: formData.department,
    type: 'Consultation', // or 'Referral'
    price: formData.price,
    insuranceId: formData.insuranceId,
    insuranceName: formData.insuranceName,
    insuranceDiscount: formData.discount,
    finalAmount: formData.finalAmount,
  });
};
```

### Record a Payment
```javascript
const handlePayment = async (invoiceId, { amount, method }) => {
  await addPayment({
    invoiceId,
    amount,
    method, // 'Cash' or 'InstaPay'
    patientId: invoice.patientId,
    patientName: invoice.patientName,
  });
};
```

### Cancel an Invoice
```javascript
const handleCancellation = async (invoiceId, reason) => {
  await cancelInvoice(invoiceId, reason);
};
```

### Filter Services by Role
```javascript
const visibleServices = useMemo(() => {
  return getVisibleServices(services, user?.role);
}, [services, user?.role]);
```

### Create a Form Input
```jsx
<FormInput
  label="Service Price"
  type="number"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  required
  helperText="Enter price in EGP"
/>
```

### Create a Button
```jsx
<ActionButton 
  variant="primary" 
  size="md"
  onClick={handleSave}
>
  Save Changes
</ActionButton>
```

---

## 🧪 Testing Checklist

### Before Deployment
- [ ] All 13 test groups from TESTING_GUIDE.md pass
- [ ] No console errors in DevTools
- [ ] Responsive design tested on 3+ devices
- [ ] Role-based access verified with test users
- [ ] Insurance discount calculations verified
- [ ] Payment recording tested
- [ ] Invoice cancellation tested
- [ ] Search/filter functionality works
- [ ] LocalStorage persistence verified
- [ ] Performance acceptable (< 2s load time)

### Quick Test Script
1. Create consultation invoice (final amount = price)
2. Create referral invoice with insurance (final amount = price - discount)
3. Mark consultation as paid with Cash
4. Cancel referral with reason
5. Search by patient name
6. Filter by department
7. Test with doctor, radiology, patient roles

---

## 🎨 Styling Quick Reference

### Use These Classes
✅ `rounded-2xl` - Container border radius
✅ `rounded-xl` - Input/button border radius
✅ `shadow-sm` - Card shadow
✅ `px-4 py-3` - Table cell padding
✅ `text-sm` - Body text
✅ `text-xs` - Label text
✅ `gap-4` - Grid spacing
✅ `border border-slate-100` - Card border

### Avoid These
❌ `rounded` - Too small (use `rounded-xl` instead)
❌ `shadow-md` - Too large (use `shadow-sm` instead)
❌ `px-2 py-1` - Too small (use `px-4 py-3` instead)
❌ `text-base` - Use `text-sm` or `text-lg`
❌ `gap-2` - Use `gap-3` or `gap-4`

### Color Classes
- Status badges: `bg-emerald-50 text-emerald-700` (Active)
- Status badges: `bg-rose-50 text-rose-700` (Inactive)
- Status badges: `bg-amber-50 text-amber-700` (Pending)
- Buttons: `bg-blue-600 text-white hover:bg-blue-700`
- Danger: `bg-rose-600 text-white hover:bg-rose-700`

---

## 🐛 Common Issues & Fixes

### Issue: Invoice not appearing after creation
**Solution**: Check if localStorage is enabled, verify invoice status is 'Pending'

### Issue: Role-based filtering not working
**Solution**: Verify user?.role is set correctly, check ROLE_SERVICE_MAPPING

### Issue: Insurance discount not calculated
**Solution**: Verify insuranceId is selected, check coverage % in mockInsuranceProviders

### Issue: Payment amount field not locked
**Solution**: Ensure isMarkingPaid prop is passed to PaymentModal

### Issue: Mobile table overflow
**Solution**: Verify `overflow-x-auto` wrapper is applied, use `min-w-full` on table

---

## 📚 Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| COMPONENT_GUIDE.md | Component reference | src/components/billing/ |
| RESPONSIVE_DESIGN.md | Mobile design guide | src/components/billing/ |
| TESTING_GUIDE.md | Test scenarios | src/components/billing/ |
| BILLING_REFACTOR_COMPLETE.md | Project summary | root/ |

---

## 🔄 Data Flow

### Invoice Creation Flow
```
User fills form
    ↓
CreateInvoiceModal validates
    ↓
createInvoice() called
    ↓
billingService.createInvoice()
    ↓
billingApi.createInvoice()
    ↓
Add to invoicesState
    ↓
Save to localStorage
    ↓
Invoice appears in list
```

### Payment Recording Flow
```
User clicks "Mark as Paid"
    ↓
PaymentModal opens (amount locked, method required)
    ↓
User selects method (Cash/InstaPay)
    ↓
handlePaymentSubmit() called
    ↓
addPayment() updates invoice status to "Paid"
    ↓
Payment record created
    ↓
Invoice table updated
```

### Cancellation Flow
```
User clicks "Cancel" (referral only)
    ↓
CancellationModal opens
    ↓
User selects/enters reason
    ↓
handleCancellationSubmit() called
    ↓
cancelInvoice() updates status to "Cancelled"
    ↓
Reason stored with invoice
    ↓
Invoice table updated
```

---

## 💡 Pro Tips

1. **Always use role-based visibility when filtering services**
   ```javascript
   const filtered = getVisibleServices(services, user?.role);
   ```

2. **Use FormInput for all form fields** - ensures consistency
   ```jsx
   <FormInput type="select" options={departments} />
   ```

3. **Always show loading state during async operations**
   ```jsx
   <ActionButton isLoading={loading}>Save</ActionButton>
   ```

4. **Use SectionHeader for page titles** - maintains consistency
   ```jsx
   <SectionHeader title="Service Pricing" subtitle="..." />
   ```

5. **Remember: Consultation = cannot cancel, Referral = can cancel**

6. **Insurance is optional** - always check before accessing

7. **Payment method is required** - cannot submit without selection

8. **Amount is locked** - user cannot edit payment amount

---

## 🚀 Deployment Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Mock data seed included
- [ ] Documentation complete
- [ ] Role-based access working
- [ ] Payment recording verified
- [ ] LocalStorage persistence confirmed
- [ ] Backup of production data taken
- [ ] Rollback plan documented
- [ ] User training completed

---

## 📞 Support

For questions or issues:
1. Check TESTING_GUIDE.md for similar scenarios
2. Review COMPONENT_GUIDE.md for component usage
3. Check roleBasedVisibility.js for role mappings
4. Review billingMockData.js for data structure

---

**Last Updated**: 2024
**Status**: ✅ Production Ready
**Version**: 1.0.0

