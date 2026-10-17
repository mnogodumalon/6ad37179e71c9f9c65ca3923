// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {
  "kundenanfragen": [
    "anfragenummer"
  ],
  "kunden": [
    "kundennummer"
  ]
};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "anfrage-aufnehmen": [
    "Legt an: informationsquellen, kundenanfragen",
    "Automatisch: eingangsdatum (heutiges Datum, automatisch), status (fester Wert „neu“), vollstaendigkeit (fester Wert „ungeprueft“), eingangsdatum (aktueller Zeitpunkt, automatisch)"
  ],
  "anforderungen-und-punkte-erfassen": [
    "Legt an: aufgaben, offene_punkte, technische_anforderungen",
    "Ändert: kundenanfragen",
    "Automatisch: pruefstatus (fester Wert „ungeprueft“), status (fester Wert „neu“), status (fester Wert „offen“), status (fester Wert „in_pruefung“), vollstaendigkeit (fester Wert „in_klaerung“)"
  ],
  "rueckfrage-vorbereiten": [
    "Legt an: rueckfragen_und_kommunikation",
    "Ändert: kundenanfragen",
    "Automatisch: versandstatus (fester Wert „entwurf“), antwortstatus (fester Wert „offen“), status (fester Wert „rueckfragen_offen“)"
  ],
  "antwort-zuordnen": [
    "Legt an: aufgaben",
    "Ändert: offene_punkte, rueckfragen_und_kommunikation, technische_anforderungen",
    "Automatisch: antwort_erhalten_am (aktueller Zeitpunkt, automatisch), abgeschlossen_am (aktueller Zeitpunkt, automatisch), status (fester Wert „offen“), erneute_pruefung_erforderlich (fester Wert „true“)"
  ],
  "beurteilung-und-entscheidung": [
    "Legt an: beurteilungen, entscheidungen",
    "Ändert: entscheidungen, kundenanfragen",
    "Automatisch: pruefstatus (fester Wert „entwurf“), entscheidungsdatum (aktueller Zeitpunkt, automatisch), entscheidungsstatus (fester Wert „ersetzt“), status (fester Wert „entscheidungsbedarf“)"
  ],
  "technischen-abschluss-pruefen": [
    "Legt an: technischer_abschluss",
    "Ändert: kundenanfragen",
    "Automatisch: pruefdatum (aktueller Zeitpunkt, automatisch), status (fester Wert „technisch_geklaert“), klaerung_abgeschlossen_am (aktueller Zeitpunkt, automatisch), vollstaendigkeit (fester Wert „vollstaendig_geprueft“)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung begleitet die technische Auftragsklärung: von der Kundenanfrage über Quellen, Anforderungen, offene Punkte, Aufgaben, Rückfragen, Beurteilungen und Entscheidungen bis zum dokumentierten technischen Abschluss. Erfahrungen aus Vorhaben werden gesichert und bei späteren Anfragen auf Wiederverwendung geprüft. Freigaben erteilt nie das System, sondern immer eine verantwortliche Person.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "anfrage-aufnehmen": [
    "informationsquellen",
    "kundenanfragen"
  ],
  "anforderungen-und-punkte-erfassen": [
    "aufgaben",
    "kundenanfragen",
    "offene_punkte",
    "technische_anforderungen"
  ],
  "rueckfrage-vorbereiten": [
    "kundenanfragen",
    "rueckfragen_und_kommunikation"
  ],
  "antwort-zuordnen": [
    "aufgaben",
    "offene_punkte",
    "rueckfragen_und_kommunikation",
    "technische_anforderungen"
  ],
  "beurteilung-und-entscheidung": [
    "beurteilungen",
    "entscheidungen",
    "kundenanfragen"
  ],
  "technischen-abschluss-pruefen": [
    "kundenanfragen",
    "technischer_abschluss"
  ]
};
