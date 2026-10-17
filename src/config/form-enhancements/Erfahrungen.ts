// Auto-generated. Per-entity form-enhancements config for "Erfahrungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "ursprungsanfrage", {"row": ["erfahrungstyp", "bestaetigungsstatus"], "cols": "1fr 1fr"}, {"row": ["produktfamilie", "anforderungstyp"], "cols": "1fr 1fr"}, "schlagwoerter", {"row": ["wiederverwendungsstatus", "risiko_der_uebertragung"], "cols": "1fr 1fr"}, {"row": ["bestaetigt_von", "bestaetigt_am"], "cols": "1fr 1fr"}, {"row": ["gueltig_ab", "gueltig_bis"], "cols": "1fr 1fr"}, "belegquellen", "belegbeurteilungen", "belegentscheidungen", "belegabschluesse", "sachverhalt", "ursprengliches_problem", "vorgehen", "beobachtetes_ergebnis", "erkenntnis", "gueltigkeitsbedingungen", "bekannte_grenzen", "kommentar_wiederverwendung"],
  defaults: {
    'wiederverwendungsstatus': { kind: 'lookup', key: 'nicht_geprueft', label: 'Nicht geprüft' },
    'bestaetigungsstatus': { kind: 'lookup', key: 'ungeprueft', label: 'Ungeprüft' },
    'gueltig_ab': { kind: 'today' },
  },
  computed: {
    '_gueltigkeit_dauer_tage': { kind: 'dateDiff', from: 'gueltig_ab', to: 'gueltig_bis', unit: 'days' },
  },
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
