interface IDictionary<V> {
  get(key: string) : V;
  set(key: string, value: V) : void;
  empty() : void;
  clear(key: string) : boolean;
  containsKey(key: string) : boolean;
  forEach(callback: (pair: KeyValuePair<V>) => void) : void
}

class KeyValuePair<V> {
  readonly Key: string;
  readonly Value: V;

  constructor(key: string, value: V) {
    this.Key = key;
    this.Value = value;
  }
}

export class Dictionary<V> implements IDictionary<V> {
  private _dict: {[key: string] : V};

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

  forEach(callback: (pair: KeyValuePair<V>) => void): void {
    const keys = Object.keys(this._dict);
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      callback(new KeyValuePair<V>(key, this._dict[key]));
    }
  }
}
