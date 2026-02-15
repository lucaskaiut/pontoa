type CartEvents = {
  'item-added': { cartId?: string };
};

class EventService {
  private listeners: {
    [K in keyof CartEvents]?: Array<(data: CartEvents[K]) => void>;
  } = {};

  on<K extends keyof CartEvents>(event: K, callback: (data: CartEvents[K]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);

    return () => this.off(event, callback);
  }

  off<K extends keyof CartEvents>(event: K, callback: (data: CartEvents[K]) => void) {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter((listener) => listener !== callback);
    }
  }

  dispatch<K extends keyof CartEvents>(event: K, data: CartEvents[K]) {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }
}

export const eventService = new EventService();
