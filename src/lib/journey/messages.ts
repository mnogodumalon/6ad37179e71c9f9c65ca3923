/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - kunden: firmenname (Firmenname)
 *   - kundenanfragen: kunde (Kunde), eingangsdatum (Eingangsdatum), anfragebeschreibung (Anfragebeschreibung), urspruengliche_kundenanforderungen (Ursprüngliche Kundenanforderungen)
 *   - technischer_abschluss: anfrage (Anfrage), pruefdatum (Prüfdatum), geprueft_von (Geprüft von)
 *   - informationsquellen: anfrage (Anfrage), titel (Titel)
 *   - technische_anforderungen: anfrage (Anfrage), bezeichnung (Bezeichnung), beschreibung (Beschreibung)
 *   - offene_punkte: anfrage (Anfrage), kurztitel (Kurztitel), beschreibung (Beschreibung und Grund), verantwortlicher (Verantwortlicher)
 *   - aufgaben: anfrage (Anfrage), titel (Titel), verantwortlicher (Verantwortlicher)
 *   - beurteilungen: anfrage (Anfrage), beurteilungsgegenstand (Beurteilungsgegenstand), fachliche_begruendung (Fachliche Begründung)
 *   - rueckfragen_und_kommunikation: anfrage (Anfrage), betreff (Betreff), inhalt (Inhalt (Entwurf oder Nachricht))
 *   - entscheidungen: anfrage (Anfrage), titel (Titel), entscheidungsgegenstand (Entscheidungsgegenstand), entscheidung (Entscheidung), begruendung (Begründung), entscheidungsverantwortlicher (Entscheidungsverantwortlicher)
 *   - erfahrungen: ursprungsanfrage (Ursprüngliche Anfrage), titel (Titel), sachverhalt (Sachverhalt)
 *   - wiederverwendung_von_erfahrungen: erfahrung (Erfahrung), zielanfrage (Spätere Anfrage)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "kunden": "kundennummer" | "firmenname" | "ansprechpartner_vorname" | "ansprechpartner_nachname" | "email" | "telefon" | "strasse" | "hausnummer" | "plz" | "ort" | "branche" | "interne_bemerkung" | "aktiv";
  "kundenanfragen": "anfragenummer" | "kunde" | "eingangsdatum" | "eingangskanal" | "kundenreferenz" | "anfrage_ansprechpartner_vorname" | "anfrage_ansprechpartner_nachname" | "anfrage_email" | "produktfamilie" | "produktvariante" | "gewuenschte_menge" | "gewuenschter_liefertermin" | "anfragebeschreibung" | "urspruengliche_kundenanforderungen" | "prioritaet" | "verantwortlicher" | "status" | "statusbegruendung" | "klaeraufwand" | "zieltermin_klaerung" | "vollstaendigkeit" | "erneute_pruefung_erforderlich" | "erneute_pruefung_grund" | "aktive_bearbeitungszeit_min" | "wartezeit_kunde_min" | "wartezeit_intern_min" | "anzahl_nachtraeglicher_aenderungen" | "anzahl_nacharbeiten" | "klaerung_abgeschlossen_am";
  "technischer_abschluss": "anfrage" | "pruefdatum" | "geprueft_von" | "anforderungen_geprueft" | "kritische_punkte_geklaert" | "entscheidungen_vorhanden" | "freigaben_vorhanden" | "verbleibende_abweichungen" | "verbleibende_risiken" | "uebergabeempfaenger" | "uebergabestatus" | "uebergabedatum" | "zusammenfassung" | "freigabestatus";
  "informationsquellen": "ersetzt_quelle" | "anfrage" | "quellentyp" | "titel" | "referenz_url" | "absender_oder_urheber" | "quellendatum" | "eingangsdatum" | "versionskennung" | "quellenstatus" | "zusammenfassung" | "extraktionsstatus" | "pruefung_durch" | "pruefung_am" | "bemerkung";
  "technische_anforderungen": "quellen" | "anfrage" | "bezeichnung" | "beschreibung" | "anforderungstyp" | "ursprung" | "sollwert" | "einheit" | "vergleichsoperator" | "min_wert" | "max_wert" | "ist_pflichtanforderung" | "pruefstatus" | "begruendung_pruefstatus" | "verantwortlicher" | "gueltig_ab" | "gueltig_bis" | "erneute_pruefung_erforderlich" | "aenderungsgrund";
  "offene_punkte": "betroffene_anforderungen" | "betroffene_quellen" | "anfrage" | "kurztitel" | "beschreibung" | "punktetyp" | "prioritaet" | "auswirkung" | "zustaendige_rolle" | "verantwortlicher" | "faellig_am" | "status" | "erledigungskriterium" | "loesung_oder_ergebnis" | "antwort_geprueft" | "abgeschlossen_am" | "abschluss_durch" | "erneute_pruefung_erforderlich" | "erneute_pruefung_grund";
  "aufgaben": "anfrage" | "titel" | "beschreibung" | "erwartetes_ergebnis" | "aufgabentyp" | "verantwortlicher" | "mitwirkende" | "prioritaet" | "status" | "blockierungsgrund" | "faellig_am" | "ergebnis" | "abgeschlossen_am" | "offener_punkt" | "vorgaengeraufgabe";
  "beurteilungen": "anfrage" | "beurteilungsgegenstand" | "beurteilungsart" | "einschaetzung" | "fachliche_begruendung" | "annahmen" | "unsicherheiten" | "alternativen" | "empfehlung" | "ist_ki_vorschlag" | "erstellt_von" | "pruefstatus" | "geprueft_von" | "geprueft_am" | "erneute_pruefung_erforderlich" | "erneute_pruefung_grund" | "betroffene_anforderungen" | "betroffene_offene_punkte" | "zugrunde_liegende_quellen";
  "rueckfragen_und_kommunikation": "offener_punkt" | "offene_punkte" | "quelle" | "anfrage" | "kommunikationstyp" | "kanal" | "absender" | "empfaenger" | "betreff" | "inhalt" | "versandstatus" | "versanddatum" | "antwort_erwartet_bis" | "antwort_erhalten_am" | "antwortstatus" | "antworttext" | "antwort_geprueft" | "folgeklaerung_erforderlich" | "notizen";
  "entscheidungen": "betroffene_anforderungen" | "betroffene_offene_punkte" | "zugrunde_liegende_beurteilungen" | "ersetzt_durch_entscheidung" | "anfrage" | "titel" | "entscheidungsgegenstand" | "entscheidungstyp" | "alternativen" | "entscheidung" | "begruendung" | "entscheidungsverantwortlicher" | "kompetenz_geprueft" | "entscheidungsstatus" | "entscheidungsdatum" | "auflagen" | "gueltig_bis" | "erneute_pruefung_erforderlich" | "ergebnis";
  "erfahrungen": "wiederverwendungsstatus" | "kommentar_wiederverwendung" | "belegquellen" | "belegbeurteilungen" | "belegentscheidungen" | "ursprungsanfrage" | "titel" | "sachverhalt" | "erfahrungstyp" | "produktfamilie" | "anforderungstyp" | "schlagwoerter" | "ursprengliches_problem" | "vorgehen" | "beobachtetes_ergebnis" | "erkenntnis" | "belegabschluesse" | "gueltigkeitsbedingungen" | "bekannte_grenzen" | "risiko_der_uebertragung" | "bestaetigungsstatus" | "bestaetigt_von" | "bestaetigt_am" | "gueltig_ab" | "gueltig_bis";
  "wiederverwendung_von_erfahrungen": "erfahrung" | "zielanfrage" | "abrufdatum" | "abrufgrund" | "aehnlichkeitseinschaetzung" | "kontextunterschiede" | "gueltigkeit_geprueft" | "geprueft_von" | "verwendungsergebnis" | "begruendung" | "beobachteter_nutzen" | "ersparnis_schaetzung_min" | "ersparnis_tatsaechlich_min" | "negative_folgen" | "bewertet_am";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
