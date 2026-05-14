// Utility functions for status display across the app

export const getStatusText = (status) => {
  switch (status) {
    case 'Scheduled':
      return 'Scheduled';
    case 'Confirmed':
      return 'Confirmed';
    case 'CheckedIn':
      return 'Checked In';
    case 'InProgress':
      return 'In Progress';
    case 'Completed':
      return 'Completed';
    case 'Cancelled':
      return 'Cancelled';
    case 'Payment Pending':
      return 'Payment Pending';
    case 'Paid':
      return 'Paid';
    default:
      return status || 'Unknown';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'Scheduled':
      return '#f59e0b';
    case 'Confirmed':
      return '#16a34a';
    case 'CheckedIn':
      return '#2563eb';
    case 'InProgress':
      return '#7c3aed';
    case 'Completed':
      return '#16a34a';
    case 'Cancelled':
      return '#dc2626';
    case 'Payment Pending':
      return '#f59e0b';
    case 'Paid':
      return '#16a34a';
    default:
      return '#6b7280';
  }
};
