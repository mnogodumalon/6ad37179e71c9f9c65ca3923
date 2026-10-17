/**
 * useAntwortZuordnenFlow — the plumbing of the flow « Antwort zuordnen », generated from the plan.
 *
 * Changes `rueckfragen_und_kommunikation`: the record to change is picked (`flow.pick('rueckfragen_und_kommunikation')`), the form is prefilled with its values; asks `antwortstatus`, `antworttext`, `antwort_geprueft`, `folgeklaerung_erforderlich`; sets `antwort_erhalten_am` itself.
Changes `offene_punkte` (only when the person fills it): the record to change is picked (`flow.pick('offene_punkte')`), the form is prefilled with its values; asks `antwort_geprueft`, `status`, `loesung_oder_ergebnis`, `abschluss_durch`; sets `abgeschlossen_am` itself.
Writes `aufgaben` (only when the person fills it): asks `anfrage`, `offener_punkt`, `titel`, `erwartetes_ergebnis`, `verantwortlicher`; sets `status` itself.
Changes `technische_anforderungen` (only when the person fills it): the record to change is picked (`flow.pick('technische_anforderungen')`), the form is prefilled with its values; asks `aenderungsgrund`, `pruefstatus`; sets `erneute_pruefung_erforderlich` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 7)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useAntwortZuordnenFlow({
 *     steps: { rueckfragen_und_kommunikation: 1, offene_punkte: 2, technische_anforderungen: 3, anfrage: 4, offener_punkt: 5, antwortstatus: 6, antworttext: 6, antwort_geprueft: 6, folgeklaerung_erforderlich: 6, status: 6, loesung_oder_ergebnis: 6, abschluss_durch: 6, titel: 6, erwartetes_ergebnis: 6, verantwortlicher: 6, aenderungsgrund: 6, pruefstatus: 6 },
 *     items: { rueckfragen_und_kommunikation: r => ({ id: r.id, title: fieldText(r, 'betreff') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.rueckfragen_und_kommunikation.select} {...flow.pick('rueckfragen_und_kommunikation')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.offene_punkte.select} {...flow.pick('offene_punkte')} />
 *     <EntitySelectStep {...flow.picks.anfrage.select} {...flow.pick('anfrage')} />
 *     <EntitySelectStep {...flow.picks.offener_punkt.select} {...flow.pick('offener_punkt')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.technische_anforderungen.select} {...flow.pick('technische_anforderungen')} />
 *     <Bound form={flow.forms.rueckfragen_und_kommunikation} name="antwortstatus" />
 *     <Bound form={flow.forms.rueckfragen_und_kommunikation} name="antworttext" />
 *     <Bound form={flow.forms.rueckfragen_und_kommunikation} name="antwort_geprueft" />
 *     <Bound form={flow.forms.rueckfragen_und_kommunikation} name="folgeklaerung_erforderlich" />
 *     <Bound form={flow.forms.offene_punkte} name="antwort_geprueft" />
 *     <Bound form={flow.forms.offene_punkte} name="status" />
 *     <Bound form={flow.forms.offene_punkte} name="loesung_oder_ergebnis" />
 *     <Bound form={flow.forms.offene_punkte} name="abschluss_durch" />
 *     <Bound form={flow.forms.aufgaben} name="titel" />
 *     <Bound form={flow.forms.aufgaben} name="erwartetes_ergebnis" />
 *     <Bound form={flow.forms.aufgaben} name="verantwortlicher" />
 *     <Bound form={flow.forms.technische_anforderungen} name="aenderungsgrund" />
 *     <Bound form={flow.forms.technische_anforderungen} name="pruefstatus" />
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
export type AntwortZuordnenFieldKey = 'abschluss_durch' | 'aenderungsgrund' | 'anfrage' | 'antwort_geprueft' | 'antwortstatus' | 'antworttext' | 'erwartetes_ergebnis' | 'folgeklaerung_erforderlich' | 'loesung_oder_ergebnis' | 'offene_punkte' | 'offener_punkt' | 'pruefstatus' | 'rueckfragen_und_kommunikation' | 'status' | 'technische_anforderungen' | 'titel' | 'verantwortlicher';

export interface AntwortZuordnenForms {
  rueckfragen_und_kommunikation: StepForm<'rueckfragen_und_kommunikation'>;
  offene_punkte: StepForm<'offene_punkte'>;
  aufgaben: StepForm<'aufgaben'>;
  technische_anforderungen: StepForm<'technische_anforderungen'>;
}

// Alias so the option generics stay readable.
type Key = AntwortZuordnenFieldKey;

export interface AntwortZuordnenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    rueckfragen_und_kommunikation?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    offene_punkte?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    anfrage?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    offener_punkt?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    technische_anforderungen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"abschluss_durch": 6, "aenderungsgrund": 6, "anfrage": 4, "antwort_geprueft": 6, "antwortstatus": 6, "antworttext": 6, "erwartetes_ergebnis": 6, "folgeklaerung_erforderlich": 6, "loesung_oder_ergebnis": 6, "offene_punkte": 2, "offener_punkt": 5, "pruefstatus": 6, "rueckfragen_und_kommunikation": 1, "status": 6, "technische_anforderungen": 3, "titel": 6, "verantwortlicher": 6};
export const ANTWORTZUORDNEN_REVIEW_STEP = 7;

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

export function useAntwortZuordnenFlow(options: AntwortZuordnenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [rueckfragen_und_kommunikationTargetId, setRueckfragenUndKommunikationTargetId] = useState<string | null>(null);
  const [offene_punkteTargetId, setOffenePunkteTargetId] = useState<string | null>(null);
  const [technische_anforderungenTargetId, setTechnischeAnforderungenTargetId] = useState<string | null>(null);
  const rueckfragen_und_kommunikation = useStepForm('rueckfragen_und_kommunikation', {
    fields: ["antwortstatus", "antworttext", "antwort_geprueft", "folgeklaerung_erforderlich"],
    steps: only(steps, ["antwortstatus", "antworttext", "antwort_geprueft", "folgeklaerung_erforderlich"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["antwortstatus", "antworttext", "antwort_geprueft", "folgeklaerung_erforderlich"]),
    messages: only(options.messages as Record<string, string> | undefined, ["antwortstatus", "antworttext", "antwort_geprueft", "folgeklaerung_erforderlich"]),
  });
  const offene_punkte = useStepForm('offene_punkte', {
    fields: ["antwort_geprueft", "status", "loesung_oder_ergebnis", "abschluss_durch"],
    steps: only(steps, ["antwort_geprueft", "status", "loesung_oder_ergebnis", "abschluss_durch"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["antwort_geprueft", "status", "loesung_oder_ergebnis", "abschluss_durch"]),
    messages: only(options.messages as Record<string, string> | undefined, ["antwort_geprueft", "status", "loesung_oder_ergebnis", "abschluss_durch"]),
  });
  const aufgaben = useStepForm('aufgaben', {
    fields: ["anfrage", "offener_punkt", "titel", "erwartetes_ergebnis", "verantwortlicher"],
    steps: only(steps, ["anfrage", "offener_punkt", "titel", "erwartetes_ergebnis", "verantwortlicher"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["anfrage", "offener_punkt", "titel", "erwartetes_ergebnis", "verantwortlicher"]),
    messages: only(options.messages as Record<string, string> | undefined, ["anfrage", "offener_punkt", "titel", "erwartetes_ergebnis", "verantwortlicher"]),
  });
  const technische_anforderungen = useStepForm('technische_anforderungen', {
    fields: ["aenderungsgrund", "pruefstatus"],
    steps: only(steps, ["aenderungsgrund", "pruefstatus"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["aenderungsgrund", "pruefstatus"]),
    messages: only(options.messages as Record<string, string> | undefined, ["aenderungsgrund", "pruefstatus"]),
  });
  const forms: AntwortZuordnenForms = { rueckfragen_und_kommunikation, offene_punkte, aufgaben, technische_anforderungen };
  const formList: StepForm[] = [rueckfragen_und_kommunikation, offene_punkte, aufgaben, technische_anforderungen];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    rueckfragen_und_kommunikation: useRecordSearch(servicePort, 'rueckfragen_und_kommunikation', withPickPolicy('rueckfragen_und_kommunikation', {
      searchFields: ["betreff", "empfaenger"] as never,
      filter: "r.v_versandstatus == 'versendet' and r.v_antwortstatus in ['offen', 'teilweise_beantwortet']",
      where: (r: JourneyRecord) => (fieldLookup(r, "versandstatus")?.key ?? null) === "versendet" && ["offen", "teilweise_beantwortet"].includes(fieldLookup(r, "antwortstatus")?.key ?? ''),
      toItem: options.items?.rueckfragen_und_kommunikation as never,
    })),
    offene_punkte: useRecordSearch(servicePort, 'offene_punkte', withPickPolicy('offene_punkte', {
      searchFields: ["kurztitel"] as never,
      toItem: options.items?.offene_punkte as never,
    })),
    anfrage: useRecordSearch(servicePort, 'kundenanfragen', withPickPolicy('anfrage', {
      searchFields: ["anfragenummer"] as never,
      toItem: options.items?.anfrage as never,
    })),
    offener_punkt: useRecordSearch(servicePort, 'offene_punkte', withPickPolicy('offener_punkt', {
      searchFields: ["kurztitel"] as never,
      toItem: options.items?.offener_punkt as never,
    })),
    technische_anforderungen: useRecordSearch(servicePort, 'technische_anforderungen', withPickPolicy('technische_anforderungen', {
      searchFields: ["bezeichnung"] as never,
      toItem: options.items?.technische_anforderungen as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:antwort-zuordnen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:antwort-zuordnen:write:${entity}.${field}`,
  });
  const picks = {
    rueckfragen_und_kommunikation: { ...searches.rueckfragen_und_kommunikation, select: { ...searches.rueckfragen_und_kommunikation.select, create: false as boolean, hint: hintFor('rueckfragen_und_kommunikation', 'rueckfragen_und_kommunikation', {"conditions": [{"field": "versandstatus", "op": "eq", "value": "versendet"}, {"field": "antwortstatus", "op": "in", "value": ["offen", "teilweise_beantwortet"]}], "mode": "all"} as PickWhere | null) } },
    offene_punkte: { ...searches.offene_punkte, select: { ...searches.offene_punkte.select, create: false as boolean, hint: hintFor('offene_punkte', 'offene_punkte', null as PickWhere | null) } },
    anfrage: { ...searches.anfrage, select: { ...searches.anfrage.select, create: false as boolean, hint: hintFor('anfrage', 'kundenanfragen', null as PickWhere | null) } },
    offener_punkt: { ...searches.offener_punkt, select: { ...searches.offener_punkt.select, create: false as boolean, hint: hintFor('offener_punkt', 'offene_punkte', null as PickWhere | null) } },
    technische_anforderungen: { ...searches.technische_anforderungen, select: { ...searches.technische_anforderungen.select, create: false as boolean, hint: hintFor('technische_anforderungen', 'technische_anforderungen', null as PickWhere | null) } },
  };

  const offene_punkteFilled = hasValues(offene_punkte);
  const aufgabenFilled = hasValues(aufgaben);
  const technische_anforderungenFilled = hasValues(technische_anforderungen);
  const plan: PlanStep[] = [
    {
      key: 'rueckfragen_und_kommunikation', entity: 'rueckfragen_und_kommunikation', form: rueckfragen_und_kommunikation,
      updates: () => rueckfragen_und_kommunikationTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => rueckfragen_und_kommunikationTargetId
        ? { key: 'target:rueckfragen_und_kommunikation', label: entityLabel('rueckfragen_und_kommunikation'), value: picks.rueckfragen_und_kommunikation.labelOf(rueckfragen_und_kommunikationTargetId) ?? rueckfragen_und_kommunikationTargetId, step: steps.rueckfragen_und_kommunikation }
        : undefined,
      values: (): FormValues => ({
        antwort_erhalten_am: policyFixedValue('rueckfragen_und_kommunikation', 'antwort_erhalten_am') ?? nowIso(),
      }),
    },
    ...(offene_punkteFilled ? [{
      key: 'offene_punkte', entity: 'offene_punkte', form: offene_punkte,
      updates: () => offene_punkteTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => offene_punkteTargetId
        ? { key: 'target:offene_punkte', label: entityLabel('offene_punkte'), value: picks.offene_punkte.labelOf(offene_punkteTargetId) ?? offene_punkteTargetId, step: steps.offene_punkte }
        : undefined,
      values: (): FormValues => ({
        abgeschlossen_am: policyFixedValue('offene_punkte', 'abgeschlossen_am') ?? nowIso(),
      }),
    } as PlanStep] : []),
    ...(aufgabenFilled ? [{
      key: 'aufgaben', entity: 'aufgaben', form: aufgaben,
      values: (): FormValues => ({
        status: policyFixedValue('aufgaben', 'status') ?? "offen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('aufgaben', 'status', policyFixedValue('aufgaben', 'status') ?? "offen")],
    } as PlanStep] : []),
    ...(technische_anforderungenFilled ? [{
      key: 'technische_anforderungen', entity: 'technische_anforderungen', form: technische_anforderungen, primary: true,
      updates: () => technische_anforderungenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => technische_anforderungenTargetId
        ? { key: 'target:technische_anforderungen', label: entityLabel('technische_anforderungen'), value: picks.technische_anforderungen.labelOf(technische_anforderungenTargetId) ?? technische_anforderungenTargetId, step: steps.technische_anforderungen }
        : undefined,
      values: (): FormValues => ({
        erneute_pruefung_erforderlich: policyFixedValue('technische_anforderungen', 'erneute_pruefung_erforderlich') ?? true,
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('technische_anforderungen', 'erneute_pruefung_erforderlich', policyFixedValue('technische_anforderungen', 'erneute_pruefung_erforderlich') ?? true)],
    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'antwort-zuordnen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    rueckfragen_und_kommunikation: {
      selectedId: rueckfragen_und_kommunikationTargetId,
      onSelect: (id: string) => {
        setRueckfragenUndKommunikationTargetId(id);
        const rec = picks.rueckfragen_und_kommunikation.recordOf(id);
        if (rec) rueckfragen_und_kommunikation.reset({ antwortstatus: fieldLookup(rec, "antwortstatus")?.key, antworttext: fieldText(rec, "antworttext"), antwort_geprueft: rec.fields["antwort_geprueft"] === true, folgeklaerung_erforderlich: rec.fields["folgeklaerung_erforderlich"] === true, });
      },
      get record(): JourneyRecord | undefined { return rueckfragen_und_kommunikationTargetId ? picks.rueckfragen_und_kommunikation.recordOf(rueckfragen_und_kommunikationTargetId) : undefined; },
    },
    offene_punkte: {
      selectedId: offene_punkteTargetId,
      onSelect: (id: string) => {
        setOffenePunkteTargetId(id);
        const rec = picks.offene_punkte.recordOf(id);
        if (rec) offene_punkte.reset({ antwort_geprueft: rec.fields["antwort_geprueft"] === true, status: fieldLookup(rec, "status")?.key, loesung_oder_ergebnis: fieldText(rec, "loesung_oder_ergebnis"), abschluss_durch: fieldText(rec, "abschluss_durch"), });
      },
      get record(): JourneyRecord | undefined { return offene_punkteTargetId ? picks.offene_punkte.recordOf(offene_punkteTargetId) : undefined; },
    },
    technische_anforderungen: {
      selectedId: technische_anforderungenTargetId,
      onSelect: (id: string) => {
        setTechnischeAnforderungenTargetId(id);
        const rec = picks.technische_anforderungen.recordOf(id);
        if (rec) technische_anforderungen.reset({ aenderungsgrund: fieldText(rec, "aenderungsgrund"), pruefstatus: fieldLookup(rec, "pruefstatus")?.key, });
      },
      get record(): JourneyRecord | undefined { return technische_anforderungenTargetId ? picks.technische_anforderungen.recordOf(technische_anforderungenTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: AntwortZuordnenFieldKey) => {
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
  const pickMany = (field: AntwortZuordnenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setRueckfragenUndKommunikationTargetId(null); setOffenePunkteTargetId(null); setTechnischeAnforderungenTargetId(null); };

  return {
    slug: 'antwort-zuordnen' as const,
    draftKey: 'antwort-zuordnen' as const,
    entity: 'technische_anforderungen' as const,
    form: technische_anforderungen,
    forms, formList, picks, submit, steps, targets,    reviewStep: ANTWORTZUORDNEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type AntwortZuordnenFlow = ReturnType<typeof useAntwortZuordnenFlow>;
