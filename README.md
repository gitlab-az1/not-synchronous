# Asynchronous Utility Library

## Overview

### Concurrency

- **mapPromises**: Executes an array of promise-returning functions concurrently while limiting the concurrency to a specified number.

- **promiseConcurrency**: Executes an array of promise-returning functions concurrently with concurrency control.


### Deferred

Provides a controllable promise whose resolution can be externally managed, facilitating resolution, rejection, and cancellation.


### Event Loop

Facilitates asynchronous job execution in subsequent iterations of the event loop.

- **schedule**: Schedules a function to be invoked in the next iteration of the event loop.
- **immediate**: Schedules a function to be invoked immediately following the current event loop iteration.


### Events

- **EventEmitter**: A simple event emitter implementation.
- **BaseEvent**: A base class for creating custom events.


### Iterable 

- **forEachArray**: An asynchronous alternative to `Array.prototype.forEach`.
- **forEachArraySafe**: An asynchronous alternative to `Array.prototype.forEach` that handles errors gracefully.

- **forEachObject**: An asynchronous alternative to `Object.entries`.
- **forEachObjectSafe**: An asynchronous alternative to `Object.entries` that gracefully handles errors.
