# Notification System Documentation

This project uses a custom notification store built on top of [Notyf](https://carlosroso.com/notyf/) with [FlyonUI](https://flyonui.com/docs/third-party-plugins/notyf/) integration.

## Features

- **Theme Integration**: Automatically adapts to all website themes (neon, acid, ghibli, valorant, etc.)
- **Multiple Types**: success, error, warning, info, and primary notifications
- **Auto Theme Detection**: Notifications automatically update when themes change
- **Customizable Options**: Duration, ripple effects, dismissible state
- **Global Access**: Available throughout the application via `window.notificationStore`
- **Alpine.js Integration**: Custom directive `x-notify` for easy template usage

## Usage

### Basic Usage

```javascript
// Using the global store
window.notificationStore.success('Operation completed successfully!');
window.notificationStore.error('Something went wrong!');
window.notificationStore.warning('Please check your input.');
window.notificationStore.info('Here is some information.');
window.notificationStore.primary('Primary notification message.');
```

### With Custom Options

```javascript
// Custom duration and options
window.notificationStore.success('Success message', {
    duration: 6000,      // 6 seconds
    ripple: false,       // Disable ripple effect
    dismissible: true    // Allow manual dismissal
});
```

### Alpine.js Template Usage

Use the `x-notify` directive in templates:

```html
<!-- Basic notification -->
<button x-notify="{ message: 'Success!', type: 'success' }">
    Click me
</button>

<!-- With custom options -->
<button x-notify="{ 
    message: 'Custom notification', 
    type: 'info', 
    options: { duration: 5000, ripple: false } 
}">
    Custom Notification
</button>
```

## Demo

Visit `/demo-notifications/` to test all notification types and features.

## API Reference

### NotificationStore Methods

- `success(message, options)` - Show success notification
- `error(message, options)` - Show error notification  
- `warning(message, options)` - Show warning notification
- `info(message, options)` - Show info notification
- `primary(message, options)` - Show primary notification
- `show(message, type, options)` - Generic notification method
- `dismissAll()` - Dismiss all active notifications

### Options Object

```javascript
{
    duration: 4000,        // Duration in milliseconds
    ripple: true,          // Enable/disable ripple effect
    dismissible: true      // Allow manual dismissal
}
``` 