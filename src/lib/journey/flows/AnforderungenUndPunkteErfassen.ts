/**
 * useAnforderungenUndPunkteErfassenFlow — the plumbing of the flow « Anforderungen und offene Punkte erfassen », generated from the plan.
 *
 * Writes `technische_anforderungen`: asks `anfrage`, `quellen`, `bezeichnung`, `beschreibung`, `anforderungstyp`, `ursprung`, `sollwert`, `einheit`, `vergleichsoperator`, `min_wert`, `max_wert`, `ist_pflichtanforderung`, `verantwortlicher`; sets `pruefstatus` itself.
Writes `offene_punkte` (only when the person fills it): asks `anfrage`, `betroffene_quellen`, `kurztitel`, `beschreibung`, `punktetyp`, `prioritaet`, `auswirkung`, `zustaendige_rolle`, `verantwortlicher`, `faellig_am`, `erledigungskriterium`; sets `status` itself; links `betroffene_anforderungen` ← the created `technische_anforderungen`.
Writes `aufgaben` (only when the person fills it): asks `anfrage`, `offener_punkt`, `titel`, `beschreibung`, `erwartetes_ergebnis`, `aufgabentyp`, `verantwortlicher`, `prioritaet`, `faellig_am`; sets `status` itself; links `offener_punkt` ← the created `offene_punkte`.
Changes `kundenanfragen`: the record to change is picked (`flow.pick('kundenanfragen')`), the form is prefilled with its values; ; sets `status`, `vollstaendigkeit` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 9)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useAnforderungenUndPunkteErfassenFlow({
 *     steps: { kundenanfragen: 1, anfrage: 6, quellen: 3, betroffene_quellen: 5, offener_punkt: 7, bezeichnung: 8, beschreibung: 8, anforderungstyp: 8, ursprung: 8, sollwert: 8, einheit: 8, vergleichsoperator: 8, min_wert: 8, max_wert: 8, ist_pflichtanforderung: 8, verantwortlicher: 8, kurztitel: 8, punktetyp: 8, prioritaet: 8, auswirkung: 8, zustaendige_rolle: 8, faellig_am: 8, erledigungskriterium: 8, titel: 8, erwartetes_ergebnis: 8, aufgabentyp: 8 },
 *     items: { anfrage: r => ({ id: r.id, title: fieldText(r, 'anfragenummer') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.anfrage.select} {...flow.pick('anfrage')} />
 *     <EntitySelectStep {...flow.picks.quellen.select} {...flow.pickMany('quellen')} />
 *     <EntitySelectStep {...flow.picks.offene_punkte_anfrage.select} {...flow.pick('anfrage')} />
 *     <EntitySelectStep {...flow.picks.betroffene_quellen.select} {...flow.pickMany('betroffene_quellen')} />
 *     <EntitySelectStep {...flow.picks.aufgaben_anfrage.select} {...flow.pick('anfrage')} />
 *     <EntitySelectStep {...flow.picks.offener_punkt.select} {...flow.pick('offener_punkt')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.kundenanfragen.select} {...flow.pick('kundenanfragen')} />
 *     <Bound form={flow.forms.technische_anforderungen} name="bezeichnung" />
 *     <Bound form={flow.forms.technische_anforderungen} name="beschreibung" />
 *     <Bound form={flow.forms.technische_anforderungen} name="anforderungstyp" />
 *     <Bound form={flow.forms.technische_anforderungen} name="ursprung" />
 *     <Bound form={flow.forms.technische_anforderungen} name="sollwert" />
 *     <Bound form={flow.forms.technische_anforderungen} name="einheit" />
 *     <Bound form={flow.forms.technische_anforderungen} name="vergleichsoperator" />
 *     <Bound form={flow.forms.technische_anforderungen} name="min_wert" />
 *     <Bound form={flow.forms.technische_anforderungen} name="max_wert" />
 *     <Bound form={flow.forms.technische_anforderungen} name="ist_pflichtanforderung" />
 *     <Bound form={flow.forms.technische_anforderungen} name="verantwortlicher" />
 *     <Bound form={flow.forms.offene_punkte} name="kurztitel" />
 *     <Bound form={flow.forms.offene_punkte} name="beschreibung" />
 *     <Bound form={flow.forms.offene_punkte} name="punktetyp" />
 *     <Bound form={flow.forms.offene_punkte} name="prioritaet" />
 *     <Bound form={flow.forms.offene_punkte} name="auswirkung" />
 *     <Bound form={flow.forms.offene_punkte} name="zustaendige_rolle" />
 *     <Bound form={flow.forms.offene_punkte} name="verantwortlicher" />
 *     <Bound form={flow.forms.offene_punkte} name="faellig_am" />
 *     <Bound form={flow.forms.offene_punkte} name="erledigungskriterium" />
 *     <Bound form={flow.forms.aufgaben} name="titel" />
 *     <Bound form={flow.forms.aufgaben} name="beschreibung" />
 *     <Bound form={flow.forms.aufgaben} name="erwartetes_ergebnis" />
 *     <Bound form={flow.forms.aufgaben} name="aufgabentyp" />
 *     <Bound form={flow.forms.aufgaben} name="verantwortlicher" />
 *     <Bound form={flow.forms.aufgaben} name="prioritaet" />
 *     <Bound form={flow.forms.aufgaben} name="faellig_am" />
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
export type AnforderungenUndPunkteErfassenFieldKey = 'anforderungstyp' | 'anfrage' | 'aufgabentyp' | 'auswirkung' | 'beschreibung' | 'betroffene_quellen' | 'bezeichnung' | 'einheit' | 'erledigungskriterium' | 'erwartetes_ergebnis' | 'faellig_am' | 'ist_pflichtanforderung' | 'kundenanfragen' | 'kurztitel' | 'max_wert' | 'min_wert' | 'offener_punkt' | 'prioritaet' | 'punktetyp' | 'quellen' | 'sollwert' | 'titel' | 'ursprung' | 'verantwortlicher' | 'vergleichsoperator' | 'zustaendige_rolle';

export interface AnforderungenUndPunkteErfassenForms {
  technische_anforderungen: StepForm<'technische_anforderungen'>;
  offene_punkte: StepForm<'offene_punkte'>;
  aufgaben: StepForm<'aufgaben'>;
  kundenanfragen: StepForm<'kundenanfragen'>;
}

// Alias so the option generics stay readable.
type Key = AnforderungenUndPunkteErfassenFieldKey;

export interface AnforderungenUndPunkteErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    anfrage?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    quellen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    offene_punkte_anfrage?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    betroffene_quellen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    aufgaben_anfrage?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    offener_punkt?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    kundenanfragen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"anforderungstyp": 8, "anfrage": 6, "aufgabentyp": 8, "auswirkung": 8, "beschreibung": 8, "betroffene_quellen": 5, "bezeichnung": 8, "einheit": 8, "erledigungskriterium": 8, "erwartetes_ergebnis": 8, "faellig_am": 8, "ist_pflichtanforderung": 8, "kundenanfragen": 1, "kurztitel": 8, "max_wert": 8, "min_wert": 8, "offener_punkt": 7, "prioritaet": 8, "punktetyp": 8, "quellen": 3, "sollwert": 8, "titel": 8, "ursprung": 8, "verantwortlicher": 8, "vergleichsoperator": 8, "zustaendige_rolle": 8};
export const ANFORDERUNGENUNDPUNKTEERFASSEN_REVIEW_STEP = 9;

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

export function useAnforderungenUndPunkteErfassenFlow(options: AnforderungenUndPunkteErfassenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [kundenanfragenTargetId, setKundenanfragenTargetId] = useState<string | null>(null);
  const technische_anforderungen = useStepForm('technische_anforderungen', {
    fields: ["anfrage", "quellen", "bezeichnung", "beschreibung", "anforderungstyp", "ursprung", "sollwert", "einheit", "vergleichsoperator", "min_wert", "max_wert", "ist_pflichtanforderung", "verantwortlicher"],
    steps: only(steps, ["anfrage", "quellen", "bezeichnung", "beschreibung", "anforderungstyp", "ursprung", "sollwert", "einheit", "vergleichsoperator", "min_wert", "max_wert", "ist_pflichtanforderung", "verantwortlicher"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["anfrage", "quellen", "bezeichnung", "beschreibung", "anforderungstyp", "ursprung", "sollwert", "einheit", "vergleichsoperator", "min_wert", "max_wert", "ist_pflichtanforderung", "verantwortlicher"]),
    messages: only(options.messages as Record<string, string> | undefined, ["anfrage", "quellen", "bezeichnung", "beschreibung", "anforderungstyp", "ursprung", "sollwert", "einheit", "vergleichsoperator", "min_wert", "max_wert", "ist_pflichtanforderung", "verantwortlicher"]),
  });
  const offene_punkte = useStepForm('offene_punkte', {
    fields: ["anfrage", "betroffene_quellen", "kurztitel", "beschreibung", "punktetyp", "prioritaet", "auswirkung", "zustaendige_rolle", "verantwortlicher", "faellig_am", "erledigungskriterium"],
    steps: only(steps, ["anfrage", "betroffene_quellen", "kurztitel", "beschreibung", "punktetyp", "prioritaet", "auswirkung", "zustaendige_rolle", "verantwortlicher", "faellig_am", "erledigungskriterium"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["anfrage", "betroffene_quellen", "kurztitel", "beschreibung", "punktetyp", "prioritaet", "auswirkung", "zustaendige_rolle", "verantwortlicher", "faellig_am", "erledigungskriterium"]),
    messages: only(options.messages as Record<string, string> | undefined, ["anfrage", "betroffene_quellen", "kurztitel", "beschreibung", "punktetyp", "prioritaet", "auswirkung", "zustaendige_rolle", "verantwortlicher", "faellig_am", "erledigungskriterium"]),
  });
  const aufgaben = useStepForm('aufgaben', {
    fields: ["anfrage", "offener_punkt", "titel", "beschreibung", "erwartetes_ergebnis", "aufgabentyp", "verantwortlicher", "prioritaet", "faellig_am"],
    steps: only(steps, ["anfrage", "offener_punkt", "titel", "beschreibung", "erwartetes_ergebnis", "aufgabentyp", "verantwortlicher", "prioritaet", "faellig_am"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["anfrage", "offener_punkt", "titel", "beschreibung", "erwartetes_ergebnis", "aufgabentyp", "verantwortlicher", "prioritaet", "faellig_am"]),
    messages: only(options.messages as Record<string, string> | undefined, ["anfrage", "offener_punkt", "titel", "beschreibung", "erwartetes_ergebnis", "aufgabentyp", "verantwortlicher", "prioritaet", "faellig_am"]),
  });
  const kundenanfragen = useStepForm('kundenanfragen', {
    fields: [],
    steps: only(steps, []) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, []),
    messages: only(options.messages as Record<string, string> | undefined, []),
  });
  const forms: AnforderungenUndPunkteErfassenForms = { technische_anforderungen, offene_punkte, aufgaben, kundenanfragen };
  const formList: StepForm[] = [technische_anforderungen, offene_punkte, aufgaben, kundenanfragen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    anfrage: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('anfrage', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.anfrage as never,
    })),
    quellen: useRecordSearch(servicePort, 'informationsquellen', withPickPolicy('quellen', {
      searchFields: ["titel"] as never,
      filter: "r.v_quellenstatus not in ['ersetzt', 'ungueltig']",
      where: (r: JourneyRecord) => !["ersetzt", "ungueltig"].includes(fieldLookup(r, "quellenstatus")?.key ?? ''),
      toItem: options.items?.quellen as never,
    })),
    offene_punkte_anfrage: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('offene_punkte_anfrage', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.offene_punkte_anfrage as never,
    })),
    betroffene_quellen: useRecordSearch(servicePort, 'informationsquellen', withPickPolicy('betroffene_quellen', {
      searchFields: ["titel"] as never,
      filter: "r.v_quellenstatus not in ['ersetzt', 'ungueltig']",
      where: (r: JourneyRecord) => !["ersetzt", "ungueltig"].includes(fieldLookup(r, "quellenstatus")?.key ?? ''),
      toItem: options.items?.betroffene_quellen as never,
    })),
    aufgaben_anfrage: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('aufgaben_anfrage', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.aufgaben_anfrage as never,
    })),
    offener_punkt: useRecordSearch(servicePort, 'offene_punkte', withPickPolicy('offener_punkt', {
      searchFields: ["kurztitel"] as never,
      toItem: options.items?.offener_punkt as never,
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
    `#/verwaltung/anwendung?line=intent:anforderungen-und-punkte-erfassen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:anforderungen-und-punkte-erfassen:write:${entity}.${field}`,
  });
  const picks = {
    anfrage: { ...searches.anfrage, select: { ...searches.anfrage.select, create: false as boolean, hint: hintFor('anfrage', 'kundenanfragen', null as PickWhere | null) } },
    quellen: { ...searches.quellen, select: { ...searches.quellen.select, create: false as boolean, hint: hintFor('quellen', 'informationsquellen', {"conditions": [{"field": "quellenstatus", "op": "not_in", "value": ["ersetzt", "ungueltig"]}], "mode": "all"} as PickWhere | null) } },
    offene_punkte_anfrage: { ...searches.offene_punkte_anfrage, select: { ...searches.offene_punkte_anfrage.select, create: false as boolean, hint: hintFor('offene_punkte_anfrage', 'kundenanfragen', null as PickWhere | null) } },
    betroffene_quellen: { ...searches.betroffene_quellen, select: { ...searches.betroffene_quellen.select, create: false as boolean, hint: hintFor('betroffene_quellen', 'informationsquellen', {"conditions": [{"field": "quellenstatus", "op": "not_in", "value": ["ersetzt", "ungueltig"]}], "mode": "all"} as PickWhere | null) } },
    aufgaben_anfrage: { ...searches.aufgaben_anfrage, select: { ...searches.aufgaben_anfrage.select, create: false as boolean, hint: hintFor('aufgaben_anfrage', 'kundenanfragen', null as PickWhere | null) } },
    offener_punkt: { ...searches.offener_punkt, select: { ...searches.offener_punkt.select, create: false as boolean, hint: hintFor('offener_punkt', 'offene_punkte', null as PickWhere | null) } },
    kundenanfragen: { ...searches.kundenanfragen, select: { ...searches.kundenanfragen.select, create: false as boolean, hint: hintFor('kundenanfragen', 'kundenanfragen', null as PickWhere | null) } },
  };

  const offene_punkteFilled = hasValues(offene_punkte);
  const aufgabenFilled = hasValues(aufgaben);
  const plan: PlanStep[] = [
    {
      key: 'technische_anforderungen', entity: 'technische_anforderungen', form: technische_anforderungen, primary: true,
      values: (): FormValues => ({
        pruefstatus: policyFixedValue('technische_anforderungen', 'pruefstatus') ?? "ungeprueft",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('technische_anforderungen', 'pruefstatus', policyFixedValue('technische_anforderungen', 'pruefstatus') ?? "ungeprueft")],
    },
    ...(offene_punkteFilled ? [{
      key: 'offene_punkte', entity: 'offene_punkte', form: offene_punkte,      needs: ['technische_anforderungen'],
      link: { betroffene_anforderungen: 'technische_anforderungen' },

      values: (): FormValues => ({
        status: policyFixedValue('offene_punkte', 'status') ?? "neu",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('offene_punkte', 'status', policyFixedValue('offene_punkte', 'status') ?? "neu")],
    } as PlanStep] : []),
    ...(aufgabenFilled ? [{
      key: 'aufgaben', entity: 'aufgaben', form: aufgaben,      needs: [offene_punkteFilled ? 'offene_punkte' : null].filter((x): x is string => !!x),
      link: { ...(offene_punkteFilled ? { offener_punkt: 'offene_punkte' } : {}) },

      values: (): FormValues => ({
        status: policyFixedValue('aufgaben', 'status') ?? "offen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('aufgaben', 'status', policyFixedValue('aufgaben', 'status') ?? "offen")],
    } as PlanStep] : []),
    {
      key: 'kundenanfragen', entity: 'kundenanfragen', form: kundenanfragen,
      updates: () => kundenanfragenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => kundenanfragenTargetId
        ? { key: 'target:kundenanfragen', label: entityLabel('kundenanfragen'), value: picks.kundenanfragen.labelOf(kundenanfragenTargetId) ?? kundenanfragenTargetId, step: steps.kundenanfragen }
        : undefined,
      values: (): FormValues => ({
        status: policyFixedValue('kundenanfragen', 'status') ?? "in_pruefung",
        vollstaendigkeit: policyFixedValue('kundenanfragen', 'vollstaendigkeit') ?? "in_klaerung",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('kundenanfragen', 'status', policyFixedValue('kundenanfragen', 'status') ?? "in_pruefung"), setting('kundenanfragen', 'vollstaendigkeit', policyFixedValue('kundenanfragen', 'vollstaendigkeit') ?? "in_klaerung")],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'anforderungen-und-punkte-erfassen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
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
  const pick = (field: AnforderungenUndPunkteErfassenFieldKey) => {
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
  const pickMany = (field: AnforderungenUndPunkteErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setKundenanfragenTargetId(null); };

  return {
    slug: 'anforderungen-und-punkte-erfassen' as const,
    draftKey: 'anforderungen-und-punkte-erfassen' as const,
    entity: 'technische_anforderungen' as const,
    form: technische_anforderungen,
    forms, formList, picks, submit, steps, targets,    reviewStep: ANFORDERUNGENUNDPUNKTEERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type AnforderungenUndPunkteErfassenFlow = ReturnType<typeof useAnforderungenUndPunkteErfassenFlow>;
