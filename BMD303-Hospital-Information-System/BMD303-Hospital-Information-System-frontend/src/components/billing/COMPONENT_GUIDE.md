# Billing Module Component Library

This document outlines all reusable components in the billing module and their usage patterns.

## Design System

All components follow these design principles:
- **Border Radius**: `rounded-2xl` for containers, `rounded-xl` for inputs
- **Shadows**: `shadow-sm` for cards, `shadow-lg` for modals
- **Spacing**: `px-4 py-3` for table cells, `px-6 py-6` for page padding
- **Typography**: `text-xs` (labels), `text-sm` (body), `text-lg` (headings), `text-2xl` (titles)
- **Colors**: Emerald (success), Amber (pending), Rose (error/delete), Slate (neutral), Blue (primary)

## Components

### Core Components

#### `FormInput.jsx`
Unified form input component supporting multiple types.

**Props:**
- `label` (string): Field label
- `type` (string): 'text', 'number', 'email', 'password', 'select', 'textarea'
- `value` (any): Current value
- `onChange` (function): Change handler
- `placeholder` (string): Placeholder text
- `required` (boolean): Mark as required
- `disabled` (boolean): Disable field
- `error` (boolean): Show error state
- `helperText` (string): Helper or error message
- `options` (array): For select type - [{value, label}]

**Example:**
```jsx
<FormInput
  label="Service Price"
  type="number"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  placeholder="0"
  required
/>
```

#### `ActionButton.jsx`
Unified button component with variants.

**Props:**
- `children` (node): Button text
- `variant` (string): 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
- `size` (string): 'sm' | 'md' | 'lg'
- `disabled` (boolean): Disable button
- `isLoading` (boolean): Show loading spinner
- `onClick` (function): Click handler
- `type` (string): 'button' | 'submit' | 'reset'

**Example:**
```jsx
<ActionButton variant="primary" onClick={handleSave}>
  Save Changes
</ActionButton>
```

#### `SectionHeader.jsx`
Consistent page and section header component.

**Props:**
- `title` (string): Main heading
- `subtitle` (string): Optional subheading
- `action` (node): Optional action element (button, etc.)
- `icon` (node): Optional icon

**Example:**
```jsx
<SectionHeader
  title="Service Pricing"
  subtitle="Manage clinic services and dynamic pricing"
  action={<ActionButton>Add Service</ActionButton>}
/>
```

#### `BillingTable.jsx`
Reusable table component for displaying structured data.

**Props:**
- `columns` (array): [{key, header, className, render}]
- `data` (array): Table rows
- `onRowClick` (function): Row click handler
- `emptyState` (node): Custom empty state
- `loading` (boolean): Show loading spinner

**Example:**
```jsx
<BillingTable
  columns={[
    { key: 'serviceName', header: 'Service', className: 'font-semibold' },
    { key: 'department', header: 'Department' },
    { key: 'price', header: 'Price', render: (val) => formatCurrency(val) },
  ]}
  data={services}
/>
```

### Card Components

#### `StatsCard.jsx`
Display statistical information.

**Props:**
- `title` (string): Card title
- `value` (string|number): Main value
- `subtitle` (string): Optional subtitle
- `icon` (node): Optional icon
- `trend` (string): Optional trend text

#### `BillingCard.jsx`
Display billing information.

**Props:**
- `title` (string): Card title
- `value` (string|number): Main value
- `note` (string): Optional note
- `action` (node): Optional action element

#### `InvoiceCard.jsx`
Display individual invoice details with actions.

**Props:**
- `invoice` (object): Invoice data
- `onClick` (function): Card click handler
- `onAction` (array): [{label, onClick, variant}]
- `showActions` (boolean): Show action buttons
- `compact` (boolean): Compact layout

#### `ServiceCard.jsx`
Display individual service details with actions.

**Props:**
- `service` (object): Service data
- `onClick` (function): Card click handler
- `onEdit` (function): Edit handler
- `onToggleStatus` (function): Toggle status handler
- `onDelete` (function): Delete handler
- `compact` (boolean): Compact layout

#### `InsuranceSummaryCard.jsx`
Display insurance information and pricing breakdown.

**Props:**
- `invoice` (object): Invoice with insurance data
- `hasInsurance` (boolean): Show insurance section

### Utility Components

#### `InvoiceStatusBadge.jsx`
Display invoice status with appropriate color.

**Props:**
- `status` (string): 'Pending' | 'Paid' | 'Cancelled'

#### `EmptyState.jsx`
Display empty state message.

**Props:**
- `title` (string): Empty state title
- `description` (string): Empty state description

#### `SearchBar.jsx`
Input component for search functionality.

**Props:**
- `value` (string): Search value
- `onChange` (function): Change handler
- `placeholder` (string): Placeholder text

#### `LoadingSpinner.jsx`
Display loading indicator.

### Modal Components

#### `CreateInvoiceModal.jsx`
Modal for creating new invoices with optional insurance selection.

#### `PaymentModal.jsx`
Modal for recording payments with method selection.

#### `CancellationModal.jsx`
Modal for cancelling invoices with reason selection.

#### `InvoiceDetailsModal.jsx`
Modal for viewing invoice details.

#### `PatientBillingHistoryModal.jsx`
Modal for displaying patient billing history.

## Color Palette

| Status | Background | Text |
|--------|-----------|------|
| Pending | `bg-amber-50` | `text-amber-700` |
| Paid | `bg-emerald-50` | `text-emerald-700` |
| Cancelled | `bg-rose-50` | `text-rose-700` |
| Active | `bg-emerald-50` | `text-emerald-700` |
| Inactive | `bg-rose-50` | `text-rose-700` |

## Responsive Breakpoints

- **Mobile**: `sm:` prefix (< 640px)
- **Tablet**: `md:` prefix (640px - 1024px)
- **Desktop**: `lg:` prefix (> 1024px)

## Best Practices

1. Always use semantic components (FormInput, ActionButton) over raw HTML
2. Use consistent spacing with grid layouts (gap-3, gap-4, gap-6)
3. Implement error states with helper text for form fields
4. Provide loading states for async operations
5. Use role-based visibility utility for access control
6. Follow the color palette for status indicators
7. Keep modals focused with single responsibility

## Testing Checklist

- [ ] Components render without errors
- [ ] Props are properly typed and documented
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works for interactive elements
- [ ] Loading and error states display correctly
