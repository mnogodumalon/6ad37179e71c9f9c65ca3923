/**
 * Anfrage aufnehmen — 4-Schritt-Wizard.
 * Steps: 1) Kunden auswählen → 2) Anfrage erfassen → 3) Verantwortlichen, Priorität, Zieltermin → 4) Erste Quelle (optional) → Prüfen & anlegen.
 * Reads: kunden. Writes: kundenanfragen, informationsquellen (optional, verknüpft).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useAnfrageAufnehmenFlow } from '@/lib/journey/flows/AnfrageAufnehmen';
import { tx } from '@/i18n';

export default function AnfrageAufnehmenPage() {
  const [step, setStep] = useState(1);
  const flow = useAnfrageAufnehmenFlow({
    steps: {
      kunde: 1,
      eingangskanal: 2, kundenreferenz: 2, produktfamilie: 2, produktvariante: 2,
      gewuenschte_menge: 2, gewuenschter_liefertermin: 2, anfragebeschreibung: 2,
      urspruengliche_kundenanforderungen: 2,
      prioritaet: 3, verantwortlicher: 3, zieltermin_klaerung: 3,
      quellentyp: 4, titel: 4, datei: 4, referenz_url: 4, absender_oder_urheber: 4, quellendatum: 4,
    },
    items: {
      kunde: k => ({
        id: k.id,
        title: fieldText(k, 'firmenname'),
        subtitle: [fieldText(k, 'kundennummer'), fieldText(k, 'ansprechpartner_nachname')].filter(Boolean).join(' · '),
      }),
    },
  });
  const f = flow.forms.kundenanfragen;
  const q = flow.forms.informationsquellen;

  return (
    <IntentWizardShell
      title={tx('Anfrage aufnehmen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine neue Kundenanfrage erfassen und die erste Quelle zuordnen.'),
        needs: [tx('Kunde'), tx('Anfragebeschreibung'), tx('Kundenanforderungen')],
      }}
    >
      <WizardStep label={tx('Kunde')} description={tx('Von welchem Kunden kommt die Anfrage?')}>
        <EntitySelectStep
          {...flow.picks.kunde.select}
          {...flow.pick('kunde')}
          searchPlaceholder={tx('Firmenname oder Kundennummer …')}
        />
      </WizardStep>

      <WizardStep label={tx('Anfrage')} description={tx('Worum geht es und was verlangt der Kunde?')} needs={['kunde']}>
        <div className="space-y-4">
          <Bound form={f} name="eingangskanal" />
          <Bound form={f} name="kundenreferenz" />
          <Bound form={f} name="produktfamilie" />
          <Bound form={f} name="produktvariante" />
          <Bound form={f} name="gewuenschte_menge" />
          <Bound form={f} name="gewuenschter_liefertermin" />
          <Bound form={f} name="anfragebeschreibung" rows={4} />
          <Bound form={f} name="urspruengliche_kundenanforderungen" rows={4} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Verantwortlicher')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Zuständigkeit')} description={tx('Wer kümmert sich darum, wie dringend ist es und bis wann?')}>
        <div className="space-y-4">
          <Bound form={f} name="prioritaet" />
          <Bound form={f} name="verantwortlicher" />
          <Bound form={f} name="zieltermin_klaerung" />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Erste Quelle')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Erste Quelle')} description={tx('Optional: E-Mail, Zeichnung oder Notiz, die zur Anfrage gehört.')}>
        <div className="space-y-4">
          <Bound form={q} name="quellentyp" />
          <Bound form={q} name="titel" />
          <Bound form={q} name="datei" />
          <Bound form={q} name="referenz_url" />
          <Bound form={q} name="absender_oder_urheber" />
          <Bound form={q} name="quellendatum" />
          <StepNav onBack={() => setStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'status', label: tx('Status'), value: tx('Neu') },
              { key: 'vollstaendigkeit', label: tx('Vollständigkeit'), value: tx('Ungeprüft') },
            ]}
            whatHappensNext={tx('Die Anfragenummer vergibt das System. Die Anfrage startet im Status „Neu“.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Anforderungen erfassen'), href: '#/intents/anforderungen-und-punkte-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
