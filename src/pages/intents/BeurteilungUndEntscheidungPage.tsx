/**
 * Beurteilen und entscheiden — 6-Schritt-Wizard.
 * Steps: 1) Anfrage wählen → 2) Anforderungen, offene Punkte, Quellen → 3) Beurteilung erfassen
 *        → 4) Entscheidung anlegen → 5) Ersetzte Entscheidung kennzeichnen → 6) Prüfen & speichern.
 * Reads: kundenanfragen, technische_anforderungen, offene_punkte, informationsquellen, entscheidungen.
 * Writes (via useBeurteilungUndEntscheidungFlow): beurteilungen, entscheidungen, entscheidungen (ersetzt), kundenanfragen (status).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldRef } from '@/lib/journey';
import { useBeurteilungUndEntscheidungFlow } from '@/lib/journey/flows/BeurteilungUndEntscheidung';
import { tx } from '@/i18n';

export default function BeurteilungUndEntscheidungPage() {
  const [step, setStep] = useState(1);
  const flow = useBeurteilungUndEntscheidungFlow({
    steps: {
      anfrage: 1, kundenanfragen: 1,
      betroffene_anforderungen: 2, betroffene_offene_punkte: 2, zugrunde_liegende_quellen: 2,
      beurteilungsgegenstand: 3, beurteilungsart: 3, einschaetzung: 3, fachliche_begruendung: 3,
      annahmen: 3, unsicherheiten: 3, alternativen: 3, empfehlung: 3, ist_ki_vorschlag: 3, erstellt_von: 3,
      titel: 4, entscheidungsgegenstand: 4, entscheidungstyp: 4, entscheidung: 4, begruendung: 4,
      entscheidungsverantwortlicher: 4, kompetenz_geprueft: 4, entscheidungsstatus: 4, auflagen: 4, gueltig_bis: 4,
      entscheidungen2: 5,
    },
    items: {
      anfrage: r => ({ id: r.id, title: fieldText(r, 'anfragenummer'), subtitle: fieldText(r, 'produktfamilie') }),
      kundenanfragen: r => ({ id: r.id, title: fieldText(r, 'anfragenummer'), subtitle: fieldText(r, 'produktfamilie') }),
      betroffene_anforderungen: r => ({ id: r.id, title: fieldText(r, 'bezeichnung'), subtitle: fieldLookup(r, 'pruefstatus')?.label }),
      betroffene_offene_punkte: r => ({
        id: r.id,
        title: fieldText(r, 'kurztitel'),
        subtitle: fieldLookup(r, 'prioritaet')?.label,
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      zugrunde_liegende_quellen: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldLookup(r, 'quellentyp')?.label }),
      entscheidungen2: r => ({ id: r.id, title: fieldText(r, 'titel'), subtitle: fieldLookup(r, 'entscheidungsstatus')?.label }),
    },
  });

  const anfrageId = flow.pick('anfrage').selectedId as string | undefined;
  const pickAnfrage = (id: string) => {
    flow.pick('anfrage').onSelect(id);
    flow.pick('kundenanfragen').onSelect(id);
    flow.forms.entscheidungen.set('anfrage', id, flow.picks.anfrage.labelOf(id));
  };
  const checkAnfrage = () => {
    if (!anfrageId) return tx('Bitte zuerst eine Anfrage wählen.');
    const rec = flow.picks.anfrage.recordOf(anfrageId);
    if (rec && !fieldRef(rec, 'kunde')) return tx('Bitte zuerst einen Kunden wählen.');
    return true;
  };

  return (
    <IntentWizardShell
      title={tx('Beurteilen und entscheiden')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Beurteilung dokumentieren und die Entscheidung mit Begründung festhalten.'),
        needs: [tx('Anfrage'), tx('Fachliche Einschätzung'), tx('Verantwortliche Person')],
      }}
    >
      <WizardStep label={tx('Anfrage')} description={tx('Zu welcher Anfrage beurteilst und entscheidest du?')}>
        <EntitySelectStep
          {...flow.picks.anfrage.select}
          selectedId={anfrageId}
          onSelect={pickAnfrage}
          searchPlaceholder={tx('Anfragenummer suchen …')}
        />
        <StepNav hideBack onNext={checkAnfrage} nextStepLabel={tx('Anforderungen und Punkte')} />
      </WizardStep>

      <WizardStep label={tx('Grundlagen')} description={tx('Welche Anforderungen, offenen Punkte und Quellen sind betroffen?')}>
        <div className="space-y-6">
          <EntitySelectStep
            {...flow.picks.betroffene_anforderungen.select}
            {...flow.pickMany('betroffene_anforderungen')}
            searchPlaceholder={tx('Anforderung suchen …')}
          />
          <EntitySelectStep
            {...flow.picks.betroffene_offene_punkte.select}
            {...flow.pickMany('betroffene_offene_punkte')}
            searchPlaceholder={tx('Offenen Punkt suchen …')}
          />
          <EntitySelectStep
            {...flow.picks.zugrunde_liegende_quellen.select}
            {...flow.pickMany('zugrunde_liegende_quellen')}
            searchPlaceholder={tx('Quelle suchen …')}
          />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Beurteilung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Beurteilung')} description={tx('Fachliche Einschätzung mit Begründung, Annahmen und Unsicherheiten.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.beurteilungen} name="beurteilungsgegenstand" />
          <Bound form={flow.forms.beurteilungen} name="beurteilungsart" />
          <Bound form={flow.forms.beurteilungen} name="einschaetzung" />
          <Bound form={flow.forms.beurteilungen} name="fachliche_begruendung" rows={4} />
          <Bound form={flow.forms.beurteilungen} name="annahmen" rows={3} />
          <Bound form={flow.forms.beurteilungen} name="unsicherheiten" rows={3} />
          <Bound form={flow.forms.beurteilungen} name="alternativen" rows={3} />
          <Bound form={flow.forms.beurteilungen} name="empfehlung" rows={3} />
          <Bound form={flow.forms.beurteilungen} name="ist_ki_vorschlag" />
          <Bound form={flow.forms.beurteilungen} name="erstellt_von" />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Entscheidung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Entscheidung')} description={tx('Die verbindliche Entscheidung mit Verantwortlichem und Begründung festhalten.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.entscheidungen} name="titel" />
          <Bound form={flow.forms.entscheidungen} name="entscheidungsgegenstand" rows={3} />
          <Bound form={flow.forms.entscheidungen} name="entscheidungstyp" />
          <Bound form={flow.forms.entscheidungen} name="alternativen" rows={3} />
          <Bound form={flow.forms.entscheidungen} name="entscheidung" rows={3} />
          <Bound form={flow.forms.entscheidungen} name="begruendung" rows={4} />
          <Bound form={flow.forms.entscheidungen} name="entscheidungsverantwortlicher" />
          <Bound form={flow.forms.entscheidungen} name="kompetenz_geprueft" />
          <Bound form={flow.forms.entscheidungen} name="entscheidungsstatus" />
          <Bound form={flow.forms.entscheidungen} name="auflagen" rows={3} />
          <Bound form={flow.forms.entscheidungen} name="gueltig_bis" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Ersetzte Entscheidung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Ersetzt')} description={tx('Ersetzt die neue Entscheidung eine frühere? Dann wähle sie hier — sonst überspringe den Schritt.')}>
        <EntitySelectStep
          {...flow.picks.entscheidungen2.select}
          {...flow.pick('entscheidungen2')}
          searchPlaceholder={tx('Entscheidung suchen …')}
        />
        <StepNav onBack={() => setStep(4)} onNext={() => flow.validateStep(5)} nextStepLabel={tx('Prüfen')} />
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'pruefstatus', label: tx('Prüfstatus der Beurteilung'), value: tx('Entwurf') },
              { key: 'anfragestatus', label: tx('Neuer Status der Anfrage'), value: tx('Entscheidungsbedarf') },
            ]}
            whatHappensNext={tx('Beurteilung und Entscheidung werden gespeichert. Eine technische Freigabe erteilt das System nicht.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Technischen Abschluss prüfen'), href: '#/intents/technischen-abschluss-pruefen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Prüfe als Nächstes, ob der technische Abschluss möglich ist.')}
        />
      )}
    </IntentWizardShell>
  );
}
