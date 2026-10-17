/**
 * useBeurteilungUndEntscheidungFlow — the plumbing of the flow « Beurteilen und entscheiden », generated from the plan.
 *
 * Writes `beurteilungen`: asks `anfrage`, `betroffene_anforderungen`, `betroffene_offene_punkte`, `zugrunde_liegende_quellen`, `beurteilungsgegenstand`, `beurteilungsart`, `einschaetzung`, `fachliche_begruendung`, `annahmen`, `unsicherheiten`, `alternativen`, `empfehlung`, `ist_ki_vorschlag`, `erstellt_von`; sets `pruefstatus` itself.
Writes `entscheidungen` (only when the person fills it): asks `anfrage`, `betroffene_anforderungen`, `betroffene_offene_punkte`, `titel`, `entscheidungsgegenstand`, `entscheidungstyp`, `alternativen`, `entscheidung`, `begruendung`, `entscheidungsverantwortlicher`, `kompetenz_geprueft`, `entscheidungsstatus`, `auflagen`, `gueltig_bis`; sets `entscheidungsdatum` itself; links `zugrunde_liegende_beurteilungen` ← the created `beurteilungen`.
Changes `entscheidungen` (only when the person fills it): the record to change is picked (`flow.pick('entscheidungen2')`), the form is prefilled with its values; asks `ersetzt_durch_entscheidung`; sets `entscheidungsstatus` itself; links `ersetzt_durch_entscheidung` ← the created `entscheidungen`.
Changes `kundenanfragen` (only when the person fills it): the record to change is picked (`flow.pick('kundenanfragen')`), the form is prefilled with its values; ; sets `status` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 12)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useBeurteilungUndEntscheidungFlow({
 *     steps: { entscheidungen2: 1, kundenanfragen: 2, anfrage: 7, betroffene_anforderungen: 8, betroffene_offene_punkte: 9, zugrunde_liegende_quellen: 6, ersetzt_durch_entscheidung: 10, beurteilungsgegenstand: 11, beurteilungsart: 11, einschaetzung: 11, fachliche_begruendung: 11, annahmen: 11, unsicherheiten: 11, alternativen: 11, empfehlung: 11, ist_ki_vorschlag: 11, erstellt_von: 11, titel: 11, entscheidungsgegenstand: 11, entscheidungstyp: 11, entscheidung: 11, begruendung: 11, entscheidungsverantwortlicher: 11, kompetenz_geprueft: 11, entscheidungsstatus: 11, auflagen: 11, gueltig_bis: 11 },
 *     items: { anfrage: r => ({ id: r.id, title: fieldText(r, 'anfragenummer') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.anfrage.select} {...flow.pick('anfrage')} />
 *     <EntitySelectStep {...flow.picks.betroffene_anforderungen.select} {...flow.pickMany('betroffene_anforderungen')} />
 *     <EntitySelectStep {...flow.picks.betroffene_offene_punkte.select} {...flow.pickMany('betroffene_offene_punkte')} />
 *     <EntitySelectStep {...flow.picks.zugrunde_liegende_quellen.select} {...flow.pickMany('zugrunde_liegende_quellen')} />
 *     <EntitySelectStep {...flow.picks.entscheidungen_anfrage.select} {...flow.pick('anfrage')} />
 *     <EntitySelectStep {...flow.picks.entscheidungen_betroffene_anforderungen.select} {...flow.pickMany('betroffene_anforderungen')} />
 *     <EntitySelectStep {...flow.picks.entscheidungen_betroffene_offene_punkte.select} {...flow.pickMany('betroffene_offene_punkte')} />
 *     <EntitySelectStep {...flow.picks.ersetzt_durch_entscheidung.select} {...flow.pick('ersetzt_durch_entscheidung')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.entscheidungen2.select} {...flow.pick('entscheidungen2')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.kundenanfragen.select} {...flow.pick('kundenanfragen')} />
 *     <Bound form={flow.forms.beurteilungen} name="beurteilungsgegenstand" />
 *     <Bound form={flow.forms.beurteilungen} name="beurteilungsart" />
 *     <Bound form={flow.forms.beurteilungen} name="einschaetzung" />
 *     <Bound form={flow.forms.beurteilungen} name="fachliche_begruendung" />
 *     <Bound form={flow.forms.beurteilungen} name="annahmen" />
 *     <Bound form={flow.forms.beurteilungen} name="unsicherheiten" />
 *     <Bound form={flow.forms.beurteilungen} name="alternativen" />
 *     <Bound form={flow.forms.beurteilungen} name="empfehlung" />
 *     <Bound form={flow.forms.beurteilungen} name="ist_ki_vorschlag" />
 *     <Bound form={flow.forms.beurteilungen} name="erstellt_von" />
 *     <Bound form={flow.forms.entscheidungen} name="titel" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheidungsgegenstand" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheidungstyp" />
 *     <Bound form={flow.forms.entscheidungen} name="alternativen" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheidung" />
 *     <Bound form={flow.forms.entscheidungen} name="begruendung" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheidungsverantwortlicher" />
 *     <Bound form={flow.forms.entscheidungen} name="kompetenz_geprueft" />
 *     <Bound form={flow.forms.entscheidungen} name="entscheidungsstatus" />
 *     <Bound form={flow.forms.entscheidungen} name="auflagen" />
 *     <Bound form={flow.forms.entscheidungen} name="gueltig_bis" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type BeurteilungUndEntscheidungFieldKey = 'alternativen' | 'anfrage' | 'annahmen' | 'auflagen' | 'begruendung' | 'betroffene_anforderungen' | 'betroffene_offene_punkte' | 'beurteilungsart' | 'beurteilungsgegenstand' | 'einschaetzung' | 'empfehlung' | 'entscheidung' | 'entscheidungen2' | 'entscheidungsgegenstand' | 'entscheidungsstatus' | 'entscheidungstyp' | 'entscheidungsverantwortlicher' | 'ersetzt_durch_entscheidung' | 'erstellt_von' | 'fachliche_begruendung' | 'gueltig_bis' | 'ist_ki_vorschlag' | 'kompetenz_geprueft' | 'kundenanfragen' | 'titel' | 'unsicherheiten' | 'zugrunde_liegende_quellen';

export interface BeurteilungUndEntscheidungForms {
  beurteilungen: StepForm<'beurteilungen'>;
  entscheidungen: StepForm<'entscheidungen'>;
  entscheidungen2: StepForm<'entscheidungen'>;
  kundenanfragen: StepForm<'kundenanfragen'>;
}

// Alias so the option generics stay readable.
type Key = BeurteilungUndEntscheidungFieldKey;

export interface BeurteilungUndEntscheidungFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    anfrage?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    betroffene_anforderungen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    betroffene_offene_punkte?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    zugrunde_liegende_quellen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    entscheidungen_anfrage?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    entscheidungen_betroffene_anforderungen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    entscheidungen_betroffene_offene_punkte?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    ersetzt_durch_entscheidung?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    entscheidungen2?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    kundenanfragen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"alternativen": 11, "anfrage": 7, "annahmen": 11, "auflagen": 11, "begruendung": 11, "betroffene_anforderungen": 8, "betroffene_offene_punkte": 9, "beurteilungsart": 11, "beurteilungsgegenstand": 11, "einschaetzung": 11, "empfehlung": 11, "entscheidung": 11, "entscheidungen2": 1, "entscheidungsgegenstand": 11, "entscheidungsstatus": 11, "entscheidungstyp": 11, "entscheidungsverantwortlicher": 11, "ersetzt_durch_entscheidung": 10, "erstellt_von": 11, "fachliche_begruendung": 11, "gueltig_bis": 11, "ist_ki_vorschlag": 11, "kompetenz_geprueft": 11, "kundenanfragen": 2, "titel": 11, "unsicherheiten": 11, "zugrunde_liegende_quellen": 6};
export const BEURTEILUNGUNDENTSCHEIDUNG_REVIEW_STEP = 12;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useBeurteilungUndEntscheidungFlow(options: BeurteilungUndEntscheidungFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [entscheidungen2TargetId, setEntscheidungen2TargetId] = useState<string | null>(null);
  const [kundenanfragenTargetId, setKundenanfragenTargetId] = useState<string | null>(null);
  const beurteilungen = useStepForm('beurteilungen', {
    fields: ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "zugrunde_liegende_quellen", "beurteilungsgegenstand", "beurteilungsart", "einschaetzung", "fachliche_begruendung", "annahmen", "unsicherheiten", "alternativen", "empfehlung", "ist_ki_vorschlag", "erstellt_von"],
    steps: only(steps, ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "zugrunde_liegende_quellen", "beurteilungsgegenstand", "beurteilungsart", "einschaetzung", "fachliche_begruendung", "annahmen", "unsicherheiten", "alternativen", "empfehlung", "ist_ki_vorschlag", "erstellt_von"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "zugrunde_liegende_quellen", "beurteilungsgegenstand", "beurteilungsart", "einschaetzung", "fachliche_begruendung", "annahmen", "unsicherheiten", "alternativen", "empfehlung", "ist_ki_vorschlag", "erstellt_von"]),
    messages: only(options.messages as Record<string, string> | undefined, ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "zugrunde_liegende_quellen", "beurteilungsgegenstand", "beurteilungsart", "einschaetzung", "fachliche_begruendung", "annahmen", "unsicherheiten", "alternativen", "empfehlung", "ist_ki_vorschlag", "erstellt_von"]),
  });
  const entscheidungen = useStepForm('entscheidungen', {
    fields: ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "titel", "entscheidungsgegenstand", "entscheidungstyp", "alternativen", "entscheidung", "begruendung", "entscheidungsverantwortlicher", "kompetenz_geprueft", "entscheidungsstatus", "auflagen", "gueltig_bis"],
    steps: only(steps, ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "titel", "entscheidungsgegenstand", "entscheidungstyp", "alternativen", "entscheidung", "begruendung", "entscheidungsverantwortlicher", "kompetenz_geprueft", "entscheidungsstatus", "auflagen", "gueltig_bis"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "titel", "entscheidungsgegenstand", "entscheidungstyp", "alternativen", "entscheidung", "begruendung", "entscheidungsverantwortlicher", "kompetenz_geprueft", "entscheidungsstatus", "auflagen", "gueltig_bis"]),
    messages: only(options.messages as Record<string, string> | undefined, ["anfrage", "betroffene_anforderungen", "betroffene_offene_punkte", "titel", "entscheidungsgegenstand", "entscheidungstyp", "alternativen", "entscheidung", "begruendung", "entscheidungsverantwortlicher", "kompetenz_geprueft", "entscheidungsstatus", "auflagen", "gueltig_bis"]),
  });
  const entscheidungen2 = useStepForm('entscheidungen', {
    fields: ["ersetzt_durch_entscheidung"],
    steps: only(steps, ["ersetzt_durch_entscheidung"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["ersetzt_durch_entscheidung"]),
    messages: only(options.messages as Record<string, string> | undefined, ["ersetzt_durch_entscheidung"]),
  });
  const kundenanfragen = useStepForm('kundenanfragen', {
    fields: [],
    steps: only(steps, []) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, []),
    messages: only(options.messages as Record<string, string> | undefined, []),
  });
  const forms: BeurteilungUndEntscheidungForms = { beurteilungen, entscheidungen, entscheidungen2, kundenanfragen };
  const formList: StepForm[] = [beurteilungen, entscheidungen, entscheidungen2, kundenanfragen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    anfrage: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('anfrage', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.anfrage as never,
    })),
    betroffene_anforderungen: useRecordSearch(servicePort, 'technische_anforderungen', withPickPolicy('betroffene_anforderungen', {
      searchFields: ["bezeichnung"] as never,
      toItem: options.items?.betroffene_anforderungen as never,
    })),
    betroffene_offene_punkte: useRecordSearch(servicePort, 'offene_punkte', withPickPolicy('betroffene_offene_punkte', {
      searchFields: ["kurztitel"] as never,
      filter: "r.v_status in ['zur_entscheidung', 'in_bearbeitung', 'wartet_intern']",
      where: (r: JourneyRecord) => ["zur_entscheidung", "in_bearbeitung", "wartet_intern"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.betroffene_offene_punkte as never,
    })),
    zugrunde_liegende_quellen: useRecordSearch(servicePort, 'informationsquellen', withPickPolicy('zugrunde_liegende_quellen', {
      searchFields: ["titel"] as never,
      toItem: options.items?.zugrunde_liegende_quellen as never,
    })),
    entscheidungen_anfrage: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('entscheidungen_anfrage', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.entscheidungen_anfrage as never,
    })),
    entscheidungen_betroffene_anforderungen: useRecordSearch(servicePort, 'technische_anforderungen', withPickPolicy('entscheidungen_betroffene_anforderungen', {
      searchFields: ["bezeichnung"] as never,
      toItem: options.items?.entscheidungen_betroffene_anforderungen as never,
    })),
    entscheidungen_betroffene_offene_punkte: useRecordSearch(servicePort, 'offene_punkte', withPickPolicy('entscheidungen_betroffene_offene_punkte', {
      searchFields: ["kurztitel"] as never,
      filter: "r.v_status in ['zur_entscheidung', 'in_bearbeitung', 'wartet_intern']",
      where: (r: JourneyRecord) => ["zur_entscheidung", "in_bearbeitung", "wartet_intern"].includes(fieldLookup(r, "status")?.key ?? ''),
      toItem: options.items?.entscheidungen_betroffene_offene_punkte as never,
    })),
    ersetzt_durch_entscheidung: useRecordSearch(servicePort, 'entscheidungen', withPickPolicy('ersetzt_durch_entscheidung', {
      searchFields: ["titel"] as never,
      toItem: options.items?.ersetzt_durch_entscheidung as never,
    })),
    entscheidungen2: useRecordSearch(servicePort, 'entscheidungen', withPickPolicy('entscheidungen2', {
      searchFields: ["titel"] as never,
      toItem: options.items?.entscheidungen2 as never,
    })),
    kundenanfragen: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('kundenanfragen', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.kundenanfragen as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:beurteilung-und-entscheidung:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:beurteilung-und-entscheidung:write:${entity}.${field}`,
  });
  const picks = {
    anfrage: { ...searches.anfrage, select: { ...searches.anfrage.select, create: false as boolean, hint: hintFor('anfrage', 'kundenanfragen', null as PickWhere | null) } },
    betroffene_anforderungen: { ...searches.betroffene_anforderungen, select: { ...searches.betroffene_anforderungen.select, create: false as boolean, hint: hintFor('betroffene_anforderungen', 'technische_anforderungen', null as PickWhere | null) } },
    betroffene_offene_punkte: { ...searches.betroffene_offene_punkte, select: { ...searches.betroffene_offene_punkte.select, create: false as boolean, hint: hintFor('betroffene_offene_punkte', 'offene_punkte', {"conditions": [{"field": "status", "op": "in", "value": ["zur_entscheidung", "in_bearbeitung", "wartet_intern"]}], "mode": "all"} as PickWhere | null) } },
    zugrunde_liegende_quellen: { ...searches.zugrunde_liegende_quellen, select: { ...searches.zugrunde_liegende_quellen.select, create: false as boolean, hint: hintFor('zugrunde_liegende_quellen', 'informationsquellen', null as PickWhere | null) } },
    entscheidungen_anfrage: { ...searches.entscheidungen_anfrage, select: { ...searches.entscheidungen_anfrage.select, create: false as boolean, hint: hintFor('entscheidungen_anfrage', 'kundenanfragen', null as PickWhere | null) } },
    entscheidungen_betroffene_anforderungen: { ...searches.entscheidungen_betroffene_anforderungen, select: { ...searches.entscheidungen_betroffene_anforderungen.select, create: false as boolean, hint: hintFor('entscheidungen_betroffene_anforderungen', 'technische_anforderungen', null as PickWhere | null) } },
    entscheidungen_betroffene_offene_punkte: { ...searches.entscheidungen_betroffene_offene_punkte, select: { ...searches.entscheidungen_betroffene_offene_punkte.select, create: false as boolean, hint: hintFor('entscheidungen_betroffene_offene_punkte', 'offene_punkte', {"conditions": [{"field": "status", "op": "in", "value": ["zur_entscheidung", "in_bearbeitung", "wartet_intern"]}], "mode": "all"} as PickWhere | null) } },
    ersetzt_durch_entscheidung: { ...searches.ersetzt_durch_entscheidung, select: { ...searches.ersetzt_durch_entscheidung.select, create: false as boolean, hint: hintFor('ersetzt_durch_entscheidung', 'entscheidungen', null as PickWhere | null) } },
    entscheidungen2: { ...searches.entscheidungen2, select: { ...searches.entscheidungen2.select, create: false as boolean, hint: hintFor('entscheidungen2', 'entscheidungen', null as PickWhere | null) } },
    kundenanfragen: { ...searches.kundenanfragen, select: { ...searches.kundenanfragen.select, create: false as boolean, hint: hintFor('kundenanfragen', 'kundenanfragen', null as PickWhere | null) } },
  };

  const entscheidungenFilled = hasValues(entscheidungen);
  const entscheidungen2Filled = hasValues(entscheidungen2);
  const kundenanfragenFilled = hasValues(kundenanfragen);
  const plan: PlanStep[] = [
    {
      key: 'beurteilungen', entity: 'beurteilungen', form: beurteilungen, primary: true,
      values: (): FormValues => ({
        pruefstatus: policyFixedValue('beurteilungen', 'pruefstatus') ?? "entwurf",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('beurteilungen', 'pruefstatus', policyFixedValue('beurteilungen', 'pruefstatus') ?? "entwurf")],

      // the planner's assumptions that first act here — shown once with „Passt“ / „ändern“
      notices: () => [{"assumed": "manuell durch Personen, nicht automatisch", "id": "ki-funktionen", "question": "Sollen KI-Vorschl\u00e4ge automatisch erzeugt werden?"}],
    },
    ...(entscheidungenFilled ? [{
      key: 'entscheidungen', entity: 'entscheidungen', form: entscheidungen,      needs: ['beurteilungen'],
      link: { zugrunde_liegende_beurteilungen: 'beurteilungen' },

      values: (): FormValues => ({
        entscheidungsdatum: policyFixedValue('entscheidungen', 'entscheidungsdatum') ?? nowIso(),
      }),
    } as PlanStep] : []),
    ...(entscheidungen2Filled ? [{
      key: 'entscheidungen2', entity: 'entscheidungen', form: entscheidungen2,
      updates: () => entscheidungen2TargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => entscheidungen2TargetId
        ? { key: 'target:entscheidungen2', label: entityLabel('entscheidungen'), value: picks.entscheidungen2.labelOf(entscheidungen2TargetId) ?? entscheidungen2TargetId, step: steps.entscheidungen2 }
        : undefined,      needs: [entscheidungenFilled ? 'entscheidungen' : null].filter((x): x is string => !!x),
      link: { ...(entscheidungenFilled ? { ersetzt_durch_entscheidung: 'entscheidungen' } : {}) },

      values: (): FormValues => ({
        entscheidungsstatus: policyFixedValue('entscheidungen', 'entscheidungsstatus') ?? "ersetzt",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('entscheidungen', 'entscheidungsstatus', policyFixedValue('entscheidungen', 'entscheidungsstatus') ?? "ersetzt")],
    } as PlanStep] : []),
    ...(kundenanfragenFilled ? [{
      key: 'kundenanfragen', entity: 'kundenanfragen', form: kundenanfragen,
      updates: () => kundenanfragenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => kundenanfragenTargetId
        ? { key: 'target:kundenanfragen', label: entityLabel('kundenanfragen'), value: picks.kundenanfragen.labelOf(kundenanfragenTargetId) ?? kundenanfragenTargetId, step: steps.kundenanfragen }
        : undefined,
      values: (): FormValues => ({
        status: policyFixedValue('kundenanfragen', 'status') ?? "entscheidungsbedarf",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('kundenanfragen', 'status', policyFixedValue('kundenanfragen', 'status') ?? "entscheidungsbedarf")],
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'beurteilung-und-entscheidung' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    entscheidungen2: {
      selectedId: entscheidungen2TargetId,
      onSelect: (id: string) => {
        setEntscheidungen2TargetId(id);
        const rec = picks.entscheidungen2.recordOf(id);
        if (rec) entscheidungen2.reset({ ersetzt_durch_entscheidung: fieldRef(rec, "ersetzt_durch_entscheidung"), });
      },
      get record(): JourneyRecord | undefined { return entscheidungen2TargetId ? picks.entscheidungen2.recordOf(entscheidungen2TargetId) : undefined; },
    },
    kundenanfragen: {
      selectedId: kundenanfragenTargetId,
      onSelect: (id: string) => {
        setKundenanfragenTargetId(id);
        const rec = picks.kundenanfragen.recordOf(id);
        if (rec) kundenanfragen.reset({ });
      },
      get record(): JourneyRecord | undefined { return kundenanfragenTargetId ? picks.kundenanfragen.recordOf(kundenanfragenTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: BeurteilungUndEntscheidungFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: BeurteilungUndEntscheidungFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setEntscheidungen2TargetId(null); setKundenanfragenTargetId(null); };

  return {
    slug: 'beurteilung-und-entscheidung' as const,
    draftKey: 'beurteilung-und-entscheidung' as const,
    entity: 'beurteilungen' as const,
    form: beurteilungen,
    forms, formList, picks, submit, steps, targets,    reviewStep: BEURTEILUNGUNDENTSCHEIDUNG_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type BeurteilungUndEntscheidungFlow = ReturnType<typeof useBeurteilungUndEntscheidungFlow>;
