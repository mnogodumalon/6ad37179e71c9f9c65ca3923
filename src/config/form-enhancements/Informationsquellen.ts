// Auto-generated. Per-entity form-enhancements config for "Informationsquellen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "anfrage", {"row": ["quellentyp", "quellenstatus"], "cols": "1fr 1fr"}, "ersetzt_quelle", {"row": ["absender_oder_urheber", "versionskennung"], "cols": "2fr 1fr"}, "referenz_url", {"row": ["quellendatum", "eingangsdatum"], "cols": "1fr 1fr"}, "extraktionsstatus", {"row": ["pruefung_durch", "pruefung_am"], "cols": "1fr 1fr"}, "zusammenfassung", "bemerkung"],
  defaults: {
    'eingangsdatum': { kind: 'today', withTime: true },
    'quellenstatus': { kind: 'lookup', key: 'ungeprueft', label: 'Ungeprüft' },
    'extraktionsstatus': { kind: 'lookup', key: 'nicht_verarbeitet', label: 'Nicht verarbeitet' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
