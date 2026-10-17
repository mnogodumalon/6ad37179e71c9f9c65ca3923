// Auto-generated. Per-entity form-enhancements config for "Kundenanfragen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["anfragenummer", "kunde", "eingangsdatum", "anfragebeschreibung", "urspruengliche_kundenanforderungen", "eingangskanal", "kundenreferenz", {"row": ["anfrage_ansprechpartner_vorname", "anfrage_ansprechpartner_nachname"]}, "anfrage_email", {"row": ["produktfamilie", "produktvariante"], "cols": "1fr 1fr"}, {"row": ["gewuenschte_menge", "gewuenschter_liefertermin"], "cols": "1fr 1fr"}, "prioritaet", "status", "verantwortlicher", {"row": ["klaeraufwand", "vollstaendigkeit"], "cols": "1fr 1fr"}, {"row": ["zieltermin_klaerung", "klaerung_abgeschlossen_am"], "cols": "1fr 1fr"}, "aktive_bearbeitungszeit_min", {"row": ["wartezeit_kunde_min", "wartezeit_intern_min"], "cols": "1fr 1fr"}, {"row": ["anzahl_nachtraeglicher_aenderungen", "anzahl_nacharbeiten"], "cols": "1fr 1fr"}, "erneute_pruefung_erforderlich", "erneute_pruefung_grund", "statusbegruendung"],
  defaults: {
    'eingangsdatum': { kind: 'today' },
    'zieltermin_klaerung': { kind: 'todayOffset', days: 14 },
    'gewuenschte_menge': { kind: 'literal', value: 1 },
    'status': { kind: 'lookup', key: 'neu', label: 'Neu' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
