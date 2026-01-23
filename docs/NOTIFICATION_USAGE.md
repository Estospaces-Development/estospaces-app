# Notification System Usage Guide

The notification system provides a comprehensive end-to-end solution for displaying toast notifications throughout the application.

## Features

- ✅ Multiple notification types: `success`, `error`, `warning`, `info`
- ✅ Customizable positioning: `top-right`, `top-left`, `top-center`, `bottom-right`, `bottom-left`, `bottom-center`
- ✅ Auto-dismiss with configurable duration
- ✅ Manual dismissal
- ✅ Smooth animations
- ✅ Multiple toasts support with stacking
- ✅ Integration with database notifications

## Basic Usage

### 1. Import the hook

```jsx
import { useToast } from '../contexts/ToastContext';
// or
import { useToast } from '../hooks/useToast';
```

### 2. Use in your component

```jsx
function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please check your input');
  };

  const handleInfo = () => {
    toast.info('New update available');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

## Advanced Usage

### With Title and Custom Options

```jsx
toast.success('Your profile has been updated', {
  title: 'Profile Updated',
  duration: 3000,
  position: 'top-center',
});

toast.error('Failed to save changes', {
  title: 'Error',
  duration: 0, // Don't auto-dismiss
  position: 'bottom-right',
});
```

### All Available Options

```jsx
toast.showToast(message, {
  type: 'success' | 'error' | 'warning' | 'info', // Default: 'success'
  title: string, // Optional title
  duration: number, // Duration in ms (0 = no auto-dismiss), Default: 5000
  position: 'top-right' | 'top-left' | 'top-center' | 
           'bottom-right' | 'bottom-left' | 'bottom-center', // Default: 'top-right'
});
```

### Convenience Methods

```jsx
// Shortcuts for each type
toast.success(message, options);
toast.error(message, options);
toast.warning(message, options);
toast.info(message, options);

// Generic method
toast.showToast(message, { type: 'success', ...options });

// Clear all toasts
toast.clearAll();
```

## Examples

### Form Submission

```jsx
const handleSubmit = async (data) => {
  try {
    await saveData(data);
    toast.success('Data saved successfully!', {
      title: 'Success',
      duration: 3000,
    });
  } catch (error) {
    toast.error('Failed to save data', {
      title: 'Error',
      duration: 5000,
    });
  }
};
```

### API Response

```jsx
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    toast.success('Data loaded successfully');
    return response.data;
  } catch (error) {
    toast.error(error.message || 'Failed to load data', {
      title: 'Network Error',
    });
    throw error;
  }
};
```

### User Action Feedback

```jsx
const handleSaveProperty = async (propertyId) => {
  try {
    await saveProperty(propertyId);
    toast.success('Property saved to favorites', {
      title: 'Saved',
      position: 'top-right',
    });
  } catch (error) {
    toast.error('Failed to save property', {
      title: 'Error',
    });
  }
};
```

### Validation Warning

```jsx
const validateForm = (formData) => {
  if (!formData.email) {
    toast.warning('Please enter your email address', {
      title: 'Validation Error',
      duration: 4000,
    });
    return false;
  }
  return true;
};
```

## Integration with Database Notifications

The notification system automatically shows toast notifications when new database notifications arrive (via `NotificationDropdown`). The toast type is determined based on the notification type:

- `error`, `rejected`, `failed` → Error toast
- `warning`, `reminder` → Warning toast
- `approved`, `verified`, `success` → Success toast
- Others → Info toast

## Component Structure

```
src/
├── contexts/
│   └── ToastContext.jsx          # Toast context and provider
├── components/
│   └── ui/
│       ├── Toast.jsx              # Individual toast component
│       └── NotificationContainer.jsx  # Container for all toasts
└── hooks/
    └── useToast.js                # Re-export for convenience
```

## Notes

- Toasts are automatically removed after the specified duration
- Multiple toasts stack vertically at the same position
- Toasts can be manually dismissed by clicking the X button
- The system supports unlimited concurrent toasts
- Position determines where toasts appear on screen
