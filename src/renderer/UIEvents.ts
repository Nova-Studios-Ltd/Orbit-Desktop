export class UIEvents {
    events: { [id: string] : any; } = {};

    on(event: string, callback: any) {
        this.events[event] = callback;
    }

    send(event: string, ...args: any) {
        if (event in this.events) {
            this.events[event](...args);
        }
    }
}
