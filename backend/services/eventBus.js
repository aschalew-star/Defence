const EventEmitter = require("events");

/**
 * Enterprise Non-Blocking Event Bus for Multi-Channel Notifications
 * Decouples core HTTP business logic (orders, payments, disputes) from
 * I/O-heavy operations (Email, SMS, in-app push, socket broadcasts).
 */
class AppEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Publish an event asynchronously without blocking the event loop.
   * Emits on setImmediate so the HTTP response is sent with zero added latency.
   */
  publish(eventName, payload = {}) {
    setImmediate(() => {
      try {
        const start = Date.now();
        this.emit(eventName, payload);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV !== "production") {
          console.log(`[EventBus] 🚀 Event "${eventName}" dispatched in ${duration}ms`);
        }
      } catch (err) {
        console.error(`[EventBus Error] Failed to dispatch "${eventName}":`, err.message);
      }
    });
  }

  /**
   * Safe subscriber wrapper that prevents unhandled errors in async
   * mail or SMS listeners from affecting the server.
   */
  subscribe(eventName, asyncListener) {
    this.on(eventName, async (payload) => {
      try {
        await asyncListener(payload);
      } catch (err) {
        console.error(`[EventBus Listener Error] "${eventName}" handler failed:`, err.message);
      }
    });
  }
}

const eventBus = new AppEventBus();
module.exports = eventBus;
