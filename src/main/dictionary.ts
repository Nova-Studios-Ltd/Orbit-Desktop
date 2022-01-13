interface IDictionary<V> {
  _dict: {[key: string]: V};
  get(key: string) : V;
  set(key: string, value: V) : void;
  empty() : void;
  clear(key: string) : boolean;
  containsKey(key: string) : boolean;
}

export class Dictionary<V> implements IDictionary<V> {
  _dict: { [key: string]: V; };

  constructor() {
    this._dict = {};
  }

  get(key: string) : V {
    return this._dict[key];
  }

  set(key: string, value: V) : void {
    this._dict[key] = value;
  }

  empty() : void {
    this._dict = {};
  }

  clear(key: string) : boolean {
    delete this._dict[key];
    return true;
  }

  containsKey(key: string): boolean {
    return this._dict[key] != undefined;
  }
}

