export class UIEvents {
  events: { [id: string] : () => any } = {};

  on(event: string, callback: (...args: any) => any) {
      this.events[event] = callback;
  }

  send(event: string, ...args: any) {
      if (event in this.events) {
          this.events[event](...args);
      }
  }

  removeAllListeners(event: string) {
    delete this.events[event];
  }
}
