export type Indexable<V> = {[key in string]: V};

export interface IDictionary<V> {
  _dict: Indexable<V>;
  getValue(key: string) : V;
  setValue(key: string, value: V) : void;
  empty() : void;
  clear(key: string) : boolean;
  containsKey(key: string) : boolean;
  forEach(callback: (pair: KeyValuePair<V>) => void) : void
}


export class KeyValuePair<V> {
  readonly Key: string;
  readonly Value: V;

  constructor(key: string, value: V) {
    this.Key = key;
    this.Value = value;
  }
}

export enum DictionaryKeyChange {
  UPDATED = 0,
  ADDED = 1,
  REMOVED = 2,
  EMPTY_DICTIONARY = 3
}

export class Dictionary<V> implements IDictionary<V> {
  _dict: Indexable<V>;
  public OnUpdate?: (key: string, value: V, state: DictionaryKeyChange) => void;

  constructor(dict?: IDictionary<V> | Indexable<V>, onUpdate?: (key: string, value: V, state: DictionaryKeyChange) => void) {
    this.OnUpdate = onUpdate;
    this._dict = {} as Indexable<V>;
    if (dict !== undefined)
      if (dict instanceof Dictionary)
        dict.forEach((pair: KeyValuePair<V>) => {
          this._dict[pair.Key] = pair.Value;
        });
      else
        this._dict = <Indexable<V>>dict;
  }

  toJSON() {
    return {_dict: this._dict};
  }

  static fromJSON<V>(json: string) : Dictionary<V> | undefined {
    const d = new Dictionary<V>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dic = <Indexable<V>>JSON.parse(json, (key: string, value: any) => {
      if (key != "" && value._dict != undefined)
        return Dictionary.fromJSON(JSON.stringify(value));
      return value;
    })._dict;
    if (dic == undefined) return undefined;
    d._dict = <Indexable<V>>dic;
    return d;
  }

  getValue(key: string) : V {
    return this._dict[key];
  }

  setValue(key: string, value: V) : void {
    const state = (key in this._dict)? DictionaryKeyChange.UPDATED : DictionaryKeyChange.ADDED;
    this._dict[key] = value;
    if (this.OnUpdate != undefined) this.OnUpdate(key, value, state);
  }

  empty() : void {
    this._dict = {} as Indexable<V>;
    if (this.OnUpdate != undefined) this.OnUpdate("", <V><unknown>undefined, DictionaryKeyChange.EMPTY_DICTIONARY);
  }

  clear(key: string) : boolean {
    const v = this._dict[key];
    delete this._dict[key];
    if (this.OnUpdate != undefined) this.OnUpdate(key, v, DictionaryKeyChange.REMOVED);
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
