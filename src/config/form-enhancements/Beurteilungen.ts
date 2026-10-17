// Auto-generated. Per-entity form-enhancements config for "Beurteilungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["anfrage", "beurteilungsgegenstand", {"row": ["beurteilungsart", "einschaetzung"], "cols": "1fr 1fr"}, "pruefstatus", {"row": ["erstellt_von", "geprueft_von"], "cols": "1fr 1fr"}, "geprueft_am", "ist_ki_vorschlag", "erneute_pruefung_erforderlich", "betroffene_anforderungen", "betroffene_offene_punkte", "zugrunde_liegende_quellen", "fachliche_begruendung", "annahmen", "unsicherheiten", "alternativen", "empfehlung", "erneute_pruefung_grund"],
  defaults: {
    'pruefstatus': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
