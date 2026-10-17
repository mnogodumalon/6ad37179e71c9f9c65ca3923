/**
 * Rückfrage vorbereiten — 4-Schritt-Wizard.
 * Steps: 1) Anfrage wählen → 2) Offene Punkte bündeln → 3) Betreff, Inhalt, Empfänger → 4) Prüfen & als Entwurf speichern.
 * Reads: kundenanfragen, offene_punkte. Writes: rueckfragen_und_kommunikation (Versandstatus fix „Entwurf“, nie versendet).
 * Composes: IntentWizardShell, EntitySelectStep, Field, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldDate, fieldRef } from '@/lib/journey';
import { useRueckfrageVorbereitenFlow } from '@/lib/journey/flows/RueckfrageVorbereiten';
import { tx } from '@/i18n';

export default function RueckfrageVorbereitenPage() {
  const [step, setStep] = useState(1);
  const flow = useRueckfrageVorbereitenFlow({
    steps: {
      anfrage: 1, offene_punkte: 2, offener_punkt: 2,
      kommunikationstyp: 3, kanal: 3, absender: 3, empfaenger: 3, betreff: 3, inhalt: 3, antwort_erwartet_bis: 3,
    },
    items: {
      anfrage: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'anfragenummer'),
        subtitle: ctx.ref('kunde'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      offene_punkte: r => ({
        id: r.id,
        title: fieldText(r, 'kurztitel'),
        subtitle: [fieldText(r, 'verantwortlicher'), fieldDate(r, 'faellig_am')].filter(Boolean).join(' · '),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
    },
  });
  const rueck = flow.forms.rueckfragen_und_kommunikation;

  const checkAnfrage = (): boolean | string => {
    const id = rueck.get('anfrage');
    if (typeof id !== 'string' || !id) return rueck.validate(['anfrage']);
    const rec = flow.picks.anfrage.recordOf(id);
    if (rec && !fieldRef(rec, 'kunde')) return tx('Bitte zuerst einen Kunden wählen.');
    return true;
  };

  const checkPunkte = (): boolean => {
    if (!flow.validateStep(2)) return false;
    // the first picked point becomes the main point of the question
    const ids = rueck.get('offene_punkte');
    const first = Array.isArray(ids) ? (ids[0] as string | undefined) : undefined;
    if (first) rueck.set('offener_punkt', first, flow.picks.offene_punkte.labelOf(first));
    return true;
  };

  return (
    <IntentWizardShell
      title={tx('Rückfrage vorbereiten')}
      currentStep={step} onStepChange={setStep}
      forms={flow.formList} draftKey={flow.draftKey}
      intro={{
        description: tx('Offene Punkte bündeln und als Entwurf speichern — nichts wird versendet.'),
        needs: [tx('Die betroffene Anfrage'), tx('Die offenen Punkte'), tx('Empfänger der Rückfrage')],
      }}
    >
      <WizardStep label={tx('Anfrage')} description={tx('Zu welcher Anfrage gehört die Rückfrage?')}>
        <EntitySelectStep {...flow.picks.anfrage.select} {...flow.pick('anfrage')} searchPlaceholder={tx('Anfragenummer …')} />
        <StepNav onNext={checkAnfrage} nextStepLabel={tx('Offene Punkte')} />
      </WizardStep>
      <WizardStep label={tx('Offene Punkte')} description={tx('Wähle alle Punkte, die du in einer Rückfrage bündeln willst.')} needs={['anfrage']}>
        <Field form={rueck} name="offene_punkte">
          <EntitySelectStep {...flow.picks.offene_punkte.select} {...flow.pickMany('offene_punkte')} searchPlaceholder={tx('Titel oder Verantwortlicher …')} />
        </Field>
        <StepNav onBack={() => setStep(1)} onNext={checkPunkte} nextStepLabel={tx('Nachricht')} />
      </WizardStep>
      <WizardStep label={tx('Nachricht')} description={tx('Betreff, Inhalt und Empfänger festlegen.')}>
        <div className="space-y-4">
          <Bound form={rueck} name="kommunikationstyp" />
          <Bound form={rueck} name="kanal" />
          <Bound form={rueck} name="absender" />
          <Bound form={rueck} name="empfaenger" />
          <Bound form={rueck} name="betreff" />
          <Bound form={rueck} name="inhalt" rows={6} />
          <Bound form={rueck} name="antwort_erwartet_bis" />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList} submit={flow.submit}
            whatHappensNext={tx('Die Rückfrage wird als Entwurf gespeichert und nicht versendet.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result} forms={flow.formList} submit={flow.submit}
          next={[
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Prüfe den Entwurf und versende ihn, dann kannst du die Antwort zuordnen.')}
        />
      )}
    </IntentWizardShell>
  );
}
