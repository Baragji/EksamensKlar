# EventBus System Documentation

## Overview

The EventBus system is an enterprise-level event management solution for ExamKlar that provides centralized communication between modules, middleware support, namespace management, and comprehensive debugging capabilities.

## Architecture

### Core Components

1. **EventBus** (`event-bus.js`) - Main event management system
2. **EventBusMiddleware** (`event-bus-middleware.js`) - Pre-built middleware functions
3. **EventBusIntegration** (`event-bus-integration.js`) - Integration helpers for existing systems
4. **Test Suite** (`test-event-bus.html`) - Comprehensive testing interface

## Features

### 🎯 Core Features
- **Namespace Management** - Organize events by domain (app, ui, data, etc.)
- **Middleware Pipeline** - Transform, validate, and monitor events
- **Event History** - Track all events with timestamps and metadata
- **Performance Monitoring** - Measure event processing times
- **Priority System** - Handle critical events first
- **Async/Sync Support** - Handle both synchronous and asynchronous events
- **Error Handling** - Comprehensive error management with retries

### 🔧 Advanced Features
- **Rate Limiting** - Prevent event spam
- **Data Validation** - Schema-based event validation
- **Caching** - Cache event results for performance
- **Security** - Access control and authentication
- **Integration Bridges** - Connect with existing systems

## Quick Start

### Basic Usage

```javascript
// Initialize EventBus
const eventBus = new EventBus({
    debug: true,
    enableHistory: true,
    enablePerformance: true
});

// Listen for events
eventBus.on('ui', 'button.click', (data) => {
    console.log('Button clicked:', data);
});

// Emit events
eventBus.emit('ui', 'button.click', { buttonId: 'submit' });
```

### With Middleware

```javascript
// Add logging middleware
eventBus.use(EventBusMiddleware.logger());

// Add rate limiting
eventBus.use(EventBusMiddleware.rateLimit({
    maxEvents: 10,
    windowMs: 1000
}));

// Add validation
eventBus.use(EventBusMiddleware.validator({
    'ui.button.click': {
        type: 'object',
        properties: {
            buttonId: { type: 'string' }
        },
        required: ['buttonId']
    }
}));
```

## Event Namespaces

### Standard Namespaces

- **`app`** - Application-level events (navigation, lifecycle)
- **`ui`** - User interface events (clicks, form submissions)
- **`data`** - Data operations (CRUD, synchronization)
- **`user`** - User-specific events (authentication, preferences)
- **`system`** - System events (errors, performance)

### Event Naming Convention

```
namespace.category.action
```

Examples:
- `app.navigation.start`
- `ui.form.submit`
- `data.user.created`
- `system.error.occurred`

## Integration with Existing Systems

### DataBridge Integration

The EventBus automatically integrates with the DataBridge system:

```javascript
// DataBridge events are automatically handled
eventBus.emit('data', 'request', {
    type: 'training',
    requestId: 'unique-id'
});

// Listen for data responses
eventBus.on('data', 'response', (response) => {
    console.log('Data received:', response.data);
});
```

### LocalStorage Integration

```javascript
// Auto-save events
eventBus.emit('storage', 'save', {
    key: 'user-preferences',
    data: { theme: 'dark' }
});

// Auto-restore on page load
eventBus.on('storage', 'restored', (data) => {
    console.log('Data restored:', data);
});
```

### DOM Integration

```javascript
// Automatic DOM event capture
eventBus.on('dom', 'click', (event) => {
    console.log('DOM click captured:', event.target);
});

// Form submission handling
eventBus.on('dom', 'submit', (event) => {
    console.log('Form submitted:', event.formData);
});
```

## Middleware System

### Available Middleware

#### Logger Middleware
```javascript
eventBus.use(EventBusMiddleware.logger({
    level: 'info', // 'debug', 'info', 'warn', 'error'
    includeData: true,
    includeTimestamp: true
}));
```

#### Rate Limit Middleware
```javascript
eventBus.use(EventBusMiddleware.rateLimit({
    maxEvents: 100,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false
}));
```

#### Validator Middleware
```javascript
eventBus.use(EventBusMiddleware.validator({
    'ui.form.submit': {
        type: 'object',
        properties: {
            formId: { type: 'string' },
            data: { type: 'object' }
        },
        required: ['formId', 'data']
    }
}));
```

#### Performance Middleware
```javascript
eventBus.use(EventBusMiddleware.performance({
    threshold: 100, // Log events taking longer than 100ms
    includeStack: true
}));
```

#### Error Handler Middleware
```javascript
eventBus.use(EventBusMiddleware.errorHandler({
    maxRetries: 3,
    retryDelay: 1000,
    onError: (error, event) => {
        console.error('Event error:', error);
    }
}));
```

### Custom Middleware

```javascript
// Create custom middleware
const customMiddleware = (options = {}) => {
    return (event, next) => {
        // Pre-processing
        console.log('Before event:', event);
        
        // Call next middleware
        const result = next();
        
        // Post-processing
        console.log('After event:', result);
        
        return result;
    };
};

// Use custom middleware
eventBus.use(customMiddleware());
```

## Event Patterns

### Request-Response Pattern

```javascript
// Request data
const requestId = eventBus.emit('data', 'request', {
    type: 'user',
    userId: '123'
});

// Handle response
eventBus.once('data', 'response', (response) => {
    if (response.requestId === requestId) {
        console.log('User data:', response.data);
    }
});
```

### Pub-Sub Pattern

```javascript
// Subscribe to user updates
eventBus.on('user', 'updated', (user) => {
    updateUI(user);
});

// Publish user update
eventBus.emit('user', 'updated', updatedUser);
```

### Command Pattern

```javascript
// Execute command
eventBus.emit('app', 'command.execute', {
    command: 'navigate',
    args: { module: 'dashboard' }
});

// Handle command
eventBus.on('app', 'command.execute', (command) => {
    executeCommand(command.command, command.args);
});
```

## Debugging and Monitoring

### Debug Mode

```javascript
const eventBus = new EventBus({
    debug: true, // Enable debug logging
    enableHistory: true, // Track event history
    enablePerformance: true // Monitor performance
});
```

### Event History

```javascript
// Get event history
const history = eventBus.getHistory();
console.log('Recent events:', history);

// Get filtered history
const uiEvents = eventBus.getHistory('ui');
console.log('UI events:', uiEvents);
```

### Performance Metrics

```javascript
// Get performance stats
const stats = eventBus.getStats();
console.log('Event statistics:', stats);

// Get namespace stats
const uiStats = eventBus.getStats('ui');
console.log('UI event stats:', uiStats);
```

### Real-time Monitoring

```javascript
// Monitor all events
eventBus.onAny((namespace, eventType, data) => {
    console.log(`Event: ${namespace}.${eventType}`, data);
});

// Monitor specific namespace
eventBus.onNamespace('ui', (eventType, data) => {
    console.log(`UI Event: ${eventType}`, data);
});
```

## Testing

Use the test page at `/core/test-event-bus.html` to:

- Test basic event emission and listening
- Verify namespace isolation
- Test middleware functionality
- Monitor performance
- Debug event flow
- Test integrations

### Test Categories

1. **Basic Events** - Simple emit/listen tests
2. **Namespaced Events** - Namespace isolation tests
3. **Async Events** - Asynchronous event handling
4. **Priority Events** - Priority-based processing
5. **Custom Events** - Complex event scenarios
6. **Middleware Tests** - All middleware functionality
7. **Integration Tests** - DataBridge, LocalStorage, DOM

## Best Practices

### Event Design

1. **Use descriptive names**: `user.profile.updated` vs `update`
2. **Include relevant data**: Always provide context
3. **Use appropriate namespaces**: Organize by domain
4. **Handle errors**: Always include error handling

### Performance

1. **Use rate limiting**: Prevent event spam
2. **Cache results**: Use caching middleware for expensive operations
3. **Monitor performance**: Track slow events
4. **Clean up listeners**: Remove unused event listeners

### Security

1. **Validate data**: Use validator middleware
2. **Control access**: Use security middleware
3. **Sanitize input**: Clean user-provided data
4. **Log security events**: Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **Events not firing**: Check namespace and event type spelling
2. **Memory leaks**: Remove event listeners when no longer needed
3. **Performance issues**: Use performance middleware to identify slow events
4. **Data validation errors**: Check event data against schemas

### Debug Tools

1. **Enable debug mode**: Set `debug: true` in EventBus options
2. **Check event history**: Use `getHistory()` method
3. **Monitor performance**: Use `getStats()` method
4. **Use test page**: Load `test-event-bus.html` for interactive testing

## API Reference

### EventBus Class

#### Constructor
```javascript
new EventBus(options)
```

#### Methods
- `on(namespace, eventType, listener)` - Add event listener
- `once(namespace, eventType, listener)` - Add one-time listener
- `off(namespace, eventType, listener)` - Remove listener
- `emit(namespace, eventType, data, options)` - Emit event
- `use(middleware)` - Add middleware
- `getHistory(namespace)` - Get event history
- `getStats(namespace)` - Get performance statistics
- `clear()` - Clear all listeners and history

### EventBusIntegration Class

#### Methods
- `setupDataBridgeIntegration()` - Setup DataBridge integration
- `setupLocalStorageIntegration()` - Setup LocalStorage integration
- `setupDOMIntegration()` - Setup DOM integration
- `createBridge(fromNs, toNs, eventMap)` - Create namespace bridge
- `disconnect()` - Disconnect all integrations

## Migration Guide

To migrate existing code to use the EventBus:

1. **Replace direct function calls** with event emissions
2. **Convert callbacks** to event listeners
3. **Add namespaces** to organize events
4. **Implement error handling** using middleware
5. **Add monitoring** for performance tracking

### Before
```javascript
// Direct function call
dataManager.saveUser(userData, (error, result) => {
    if (error) {
        console.error('Save failed:', error);
    } else {
        updateUI(result);
    }
});
```

### After
```javascript
// Event-based approach
eventBus.emit('data', 'user.save', userData);

eventBus.on('data', 'user.saved', (result) => {
    updateUI(result);
});

eventBus.on('data', 'user.save_error', (error) => {
    console.error('Save failed:', error);
});
```

This EventBus system provides a robust, scalable foundation for inter-module communication in ExamKlar, with comprehensive debugging, monitoring, and integration capabilities.