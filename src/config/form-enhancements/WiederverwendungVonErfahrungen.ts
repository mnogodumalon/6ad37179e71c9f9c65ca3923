// Auto-generated. Per-entity form-enhancements config for "Wiederverwendung von Erfahrungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["erfahrung", "zielanfrage", {"row": ["abrufdatum", "aehnlichkeitseinschaetzung"], "cols": "1fr 1fr"}, "verwendungsergebnis", {"row": ["gueltigkeit_geprueft", "geprueft_von"], "cols": "1fr 1fr"}, {"row": ["ersparnis_schaetzung_min", "ersparnis_tatsaechlich_min"], "cols": "1fr 1fr"}, "bewertet_am", "abrufgrund", "kontextunterschiede", "begruendung", "beobachteter_nutzen", "negative_folgen"],
  defaults: {
    'abrufdatum': { kind: 'today', withTime: true },
    'bewertet_am': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
