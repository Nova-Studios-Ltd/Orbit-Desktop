import { Dictionary, Indexable } from "../shared/dictionary";

import { Theme } from "../types/enums";

export const defaultSettings = new Dictionary<number | string | boolean | Dictionary<number | string | boolean>>(<Indexable<number | string | boolean | Dictionary<number | string | boolean>>>{
  "Theme": Theme.Dark,
  "DefaultChannel": "",
  "Test": "Test"
});
