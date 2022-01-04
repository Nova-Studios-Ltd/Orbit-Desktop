export class UIEvents {
  events: { [id: string] : () => unknown } = {};

  on(event: string, callback: () => unknown) {
      this.events[event] = callback;
  }

  send(event: string, ...args: unknown[]) {
      if (event in this.events) {
          this.events[event](...args);
      }
  }

  removeAllListeners(event: string) {
    delete this.events[event];
  }
}
