/**
 * Anforderungen und offene Punkte erfassen — 4-Schritt-Wizard + Prüfen.
 * Steps: 1) Anfrage wählen → 2) Anforderung mit Sollwert, Ursprung und Quellen → 3) Offenen Punkt anlegen (optional)
 *        → 4) Verantwortliche und Aufgabe (optional) → 5) Prüfen & anlegen.
 * Reads: kundenanfragen, informationsquellen. Writes: technische_anforderungen, offene_punkte, aufgaben (optional),
 *        kundenanfragen (status, vollstaendigkeit) — alles über useAnforderungenUndPunkteErfassenFlow.
 * Composes: IntentWizardShell, EntitySelectStep, Bound, Field, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IconAlertTriangle, IconChecklist } from '@tabler/icons-react';
import { Checkbox } from '@/components/ui/checkbox';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldRef } from '@/lib/journey';
import { useAnforderungenUndPunkteErfassenFlow } from '@/lib/journey/flows/AnforderungenUndPunkteErfassen';
import { tx } from '@/i18n';

type AnfrageSetter = { set: unknown };
const setAnfrage = (form: AnfrageSetter, id: string, label?: string) =>
  (form.set as (k: string, v: unknown, l?: string) => void)('anfrage', id, label);

export default function AnforderungenUndPunkteErfassenPage() {
  const [step, setStep] = useState(1);
  const [withPunkt, setWithPunkt] = useState(false);
  const [withAufgabe, setWithAufgabe] = useState(false);

  const flow = useAnforderungenUndPunkteErfassenFlow({
    steps: {
      kundenanfragen: 1, anfrage: 1, quellen: 2,
      bezeichnung: 2, beschreibung: 2, anforderungstyp: 2, ursprung: 2, sollwert: 2, einheit: 2,
      vergleichsoperator: 2, min_wert: 2, max_wert: 2, ist_pflichtanforderung: 2,
      betroffene_quellen: 3, kurztitel: 3, punktetyp: 3, auswirkung: 3, zustaendige_rolle: 3, erledigungskriterium: 3,
      verantwortlicher: 4, titel: 4, erwartetes_ergebnis: 4, aufgabentyp: 4, prioritaet: 4, faellig_am: 4,
    },
    items: {
      kundenanfragen: r => ({
        id: r.id,
        title: fieldText(r, 'anfragenummer'),
        subtitle: fieldText(r, 'produktfamilie'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      quellen: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'quellentyp')?.label,
        status: fieldLookup(r, 'quellenstatus') ?? undefined,
      }),
      betroffene_quellen: r => ({
        id: r.id,
        title: fieldText(r, 'titel'),
        subtitle: fieldLookup(r, 'quellentyp')?.label,
        status: fieldLookup(r, 'quellenstatus') ?? undefined,
      }),
    },
  });

  const { technische_anforderungen: anf, offene_punkte: punkt, aufgaben } = flow.forms;
  const anfrageId = flow.targets.kundenanfragen.selectedId;
  const anfrageLabel = anfrageId ? flow.picks.kundenanfragen.labelOf(anfrageId) : undefined;

  const onPickAnfrage = (id: string) => {
    flow.targets.kundenanfragen.onSelect(id);
    const label = flow.picks.kundenanfragen.labelOf(id);
    setAnfrage(anf, id, label);
    if (withPunkt) setAnfrage(punkt, id, label);
    if (withAufgabe) setAnfrage(aufgaben, id, label);
  };

  const togglePunkt = (on: boolean) => {
    setWithPunkt(on);
    if (on && anfrageId) setAnfrage(punkt, anfrageId, anfrageLabel);
    if (!on) punkt.reset();
  };
  const toggleAufgabe = (on: boolean) => {
    setWithAufgabe(on);
    if (on && anfrageId) setAnfrage(aufgaben, anfrageId, anfrageLabel);
    if (!on) aufgaben.reset();
  };

  const activeForms = [anf, ...(withPunkt ? [punkt] : []), ...(withAufgabe ? [aufgaben] : []), flow.forms.kundenanfragen];

  const restart = () => {
    flow.reset();
    setWithPunkt(false);
    setWithAufgabe(false);
    setStep(1);
  };

  const checkAnfrage = (): boolean | string => {
    const rec = flow.targets.kundenanfragen.record;
    if (!anfrageId || !rec) return tx('Bitte zuerst eine Anfrage wählen.');
    if (!fieldRef(rec, 'kunde')) return tx('Bitte zuerst einen Kunden wählen.');
    return true;
  };

  const optionToggle = (on: boolean, onChange: (v: boolean) => void, label: string) => (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
      <Checkbox checked={on} onCheckedChange={v => onChange(v === true)} />
      {label}
    </label>
  );

  return (
    <IntentWizardShell
      title={tx('Anforderungen und offene Punkte erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Anforderung zur Anfrage festhalten und Lücken als offenen Punkt melden.'),
        needs: [tx('Anfragenummer'), tx('Sollwert und Quellen der Anforderung'), tx('Verantwortliche Person')],
      }}
    >
      <WizardStep label={tx('Anfrage')} description={tx('Zu welcher Anfrage gehört die Anforderung?')}>
        <Field form={anf} name="anfrage" hideLabel>
          <EntitySelectStep
            {...flow.picks.kundenanfragen.select}
            selectedId={anfrageId}
            onSelect={onPickAnfrage}
            searchPlaceholder={tx('Anfragenummer …')}
          />
        </Field>
        <StepNav onNext={checkAnfrage} nextStepLabel={tx('Anforderung')} />
      </WizardStep>

      <WizardStep label={tx('Anforderung')} description={tx('Was soll gelten — mit Sollwert, Ursprung und Quellen?')}>
        <div className="space-y-4">
          <Bound form={anf} name="bezeichnung" />
          <Bound form={anf} name="beschreibung" rows={3} />
          <Bound form={anf} name="anforderungstyp" />
          <Bound form={anf} name="ursprung" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={anf} name="sollwert" />
            <Bound form={anf} name="einheit" />
          </div>
          <Bound form={anf} name="vergleichsoperator" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Bound form={anf} name="min_wert" hint={tx('Nur bei „zwischen“')} />
            <Bound form={anf} name="max_wert" hint={tx('Nur bei „zwischen“')} />
          </div>
          <Bound form={anf} name="ist_pflichtanforderung" />
          <Field form={anf} name="quellen">
            <EntitySelectStep {...flow.picks.quellen.select} {...flow.pickMany('quellen')} searchPlaceholder={tx('Quelle suchen …')} />
          </Field>
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => anf.validate(['anfrage', 'bezeichnung', 'beschreibung', 'anforderungstyp', 'ursprung', 'sollwert', 'einheit', 'vergleichsoperator', 'min_wert', 'max_wert', 'ist_pflichtanforderung', 'quellen'])}
            nextStepLabel={tx('Offener Punkt')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Offener Punkt')} description={tx('Fehlt eine Angabe oder widerspricht sich etwas?')}>
        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            {optionToggle(withPunkt, togglePunkt, tx('Offenen Punkt anlegen'))}
            {!withPunkt && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconAlertTriangle size={16} className="shrink-0" />
                {tx('Ohne offenen Punkt wird nur die Anforderung angelegt.')}
              </p>
            )}
          </div>
          {withPunkt && (
            <>
              <Bound form={punkt} name="kurztitel" />
              <Bound form={punkt} name="beschreibung" rows={3} label={tx('Beschreibung und Grund')} />
              <Bound form={punkt} name="punktetyp" />
              <Bound form={punkt} name="prioritaet" label={tx('Priorität des offenen Punkts')} />
              <Bound form={punkt} name="auswirkung" />
              <Bound form={punkt} name="zustaendige_rolle" />
              <Bound form={punkt} name="faellig_am" label={tx('Fällig am (offener Punkt)')} />
              <Bound form={punkt} name="erledigungskriterium" rows={2} />
              <Field form={punkt} name="betroffene_quellen">
                <EntitySelectStep {...flow.picks.betroffene_quellen.select} {...flow.pickMany('betroffene_quellen')} searchPlaceholder={tx('Quelle suchen …')} />
              </Field>
            </>
          )}
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => !withPunkt || punkt.validate(['anfrage', 'kurztitel', 'beschreibung', 'punktetyp', 'prioritaet', 'auswirkung', 'zustaendige_rolle', 'faellig_am', 'erledigungskriterium', 'betroffene_quellen'])}
            nextStepLabel={tx('Verantwortliche')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Verantwortliche & Aufgabe')} description={tx('Wer kümmert sich — und was ist konkret zu tun?')}>
        <div className="space-y-4">
          <Bound form={anf} name="verantwortlicher" label={tx('Verantwortlich für die Anforderung')} />
          {withPunkt && <Bound form={punkt} name="verantwortlicher" label={tx('Verantwortlich für den offenen Punkt')} />}
          <div className="space-y-3 rounded-2xl border bg-card p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <IconChecklist size={16} className="shrink-0" />
              {tx('Aufgabe zur Klärung')}
            </p>
            {optionToggle(withAufgabe, toggleAufgabe, tx('Aufgabe anlegen'))}
            {withAufgabe && (
              <>
                <Bound form={aufgaben} name="titel" />
                <Bound form={aufgaben} name="beschreibung" rows={2} label={tx('Beschreibung der Aufgabe')} />
                <Bound form={aufgaben} name="erwartetes_ergebnis" rows={2} />
                <Bound form={aufgaben} name="aufgabentyp" />
                <Bound form={aufgaben} name="verantwortlicher" label={tx('Verantwortlich für die Aufgabe')} />
                <Bound form={aufgaben} name="prioritaet" label={tx('Priorität der Aufgabe')} />
                <Bound form={aufgaben} name="faellig_am" label={tx('Fällig am (Aufgabe)')} />
              </>
            )}
          </div>
          <StepNav
            onBack={() => setStep(3)}
            onNext={() =>
              anf.validate(['verantwortlicher'])
              && (!withPunkt || punkt.validate(['verantwortlicher']))
              && (!withAufgabe || aufgaben.validate(['anfrage', 'titel', 'beschreibung', 'erwartetes_ergebnis', 'aufgabentyp', 'verantwortlicher', 'prioritaet', 'faellig_am']))
            }
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={activeForms}
            submit={flow.submit}
            whatHappensNext={tx('Die Anfrage wechselt auf „In Prüfung“ und „In Klärung“; die Anforderung startet als „Ungeprüft“.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={activeForms}
          submit={flow.submit}
          next={[
            { label: tx('Noch eine Anforderung'), onClick: restart },
            { label: tx('Rückfrage vorbereiten'), href: '#/intents/rueckfrage-vorbereiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
