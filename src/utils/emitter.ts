class EventEmitter {
  events: { [key: string]: Array<Function> };

  constructor() {
    this.events = {};
  }

  on(name: string, fn: Function) {
    const event = this.events[name];
    if (event) event.push(fn);
    else this.events[name] = [fn];
  }

  emmit(name: string, ...data: any[]) {
    const event = this.events[name];
    if (!event) return;
    for (const listener of event) listener(...data);
  }

  off(name: string) {
    delete this.events[name];
  }
}

const ee = new EventEmitter();

export { ee };
