/**
 * Technischen Abschluss prüfen — 5-Schritt-Wizard.
 * Steps: 1) Anfrage wählen → 2) Kritische offene Punkte und Entscheidungen kontrollieren →
 * 3) Abweichungen, Risiken und Zusammenfassung erfassen → 4) Übergabeempfänger festlegen →
 * 5) Anfrage als technisch geklärt setzen (Freigabe trägt eine Person ein) → Prüfen & anlegen.
 * Reads: kundenanfragen, offene_punkte, technischer_abschluss, entscheidungen.
 * Writes: technischer_abschluss (create), kundenanfragen (update) — via useTechnischenAbschlussPruefenFlow.
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, StatusBadge, SummaryStep, SuccessStep.
 */
import { useEffect, useState } from 'react';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import { fieldText, fieldLookup, fieldRef, refFilter, type JourneyRecord } from '@/lib/journey';
import { useTechnischenAbschlussPruefenFlow } from '@/lib/journey/flows/TechnischenAbschlussPruefen';
import { tx } from '@/i18n';

const SETTLED = ['erledigt', 'entschieden_akzeptiert', 'nicht_mehr_relevant'];

interface Context {
  punkte: JourneyRecord[];
  entscheidungen: JourneyRecord[];
  abschluesse: number;
}

export default function TechnischenAbschlussPruefenPage() {
  const [step, setStep] = useState(1);
  const [ctx, setCtx] = useState<Context | null>(null);
  const [ctxError, setCtxError] = useState<string | null>(null);

  const flow = useTechnischenAbschlussPruefenFlow({
    steps: {
      kundenanfragen: 1, anfrage: 1,
      anforderungen_geprueft: 2, kritische_punkte_geklaert: 2, entscheidungen_vorhanden: 2, freigaben_vorhanden: 2,
      geprueft_von: 3, verbleibende_abweichungen: 3, verbleibende_risiken: 3, zusammenfassung: 3,
      uebergabeempfaenger: 4, uebergabestatus: 4,
      freigabestatus: 5, statusbegruendung: 5,
    },
    items: {
      kundenanfragen: (r, c) => ({
        id: r.id,
        title: fieldText(r, 'anfragenummer') || tx('Ohne Nummer'),
        subtitle: c.ref('kunde') ?? undefined,
        status: fieldLookup(r, 'status') ?? undefined,
      }),
    },
  });

  const anfrageId = flow.targets.kundenanfragen.selectedId;
  const port = flow.port;

  useEffect(() => {
    if (!anfrageId) { setCtx(null); return; }
    let alive = true;
    setCtxError(null);
    Promise.all([
      port.list('offene_punkte', { filter: refFilter('anfrage', anfrageId) }),
      port.list('entscheidungen', { filter: refFilter('anfrage', anfrageId) }),
      port.list('technischer_abschluss', { filter: refFilter('anfrage', anfrageId) }),
    ]).then(([p, e, a]) => {
      if (!alive) return;
      setCtx({
        punkte: p.filter(r => fieldRef(r, 'anfrage') === anfrageId),
        entscheidungen: e.filter(r => fieldRef(r, 'anfrage') === anfrageId),
        abschluesse: a.filter(r => fieldRef(r, 'anfrage') === anfrageId).length,
      });
    }).catch(err => {
      if (alive) setCtxError(err instanceof Error ? err.message : tx('Die Daten konnten nicht geladen werden.'));
    });
    return () => { alive = false; };
  }, [anfrageId, port]);

  const kritisch = (ctx?.punkte ?? []).filter(r =>
    fieldLookup(r, 'prioritaet')?.key === 'kritisch' && !SETTLED.includes(fieldLookup(r, 'status')?.key ?? ''));
  const duplicate = (ctx?.abschluesse ?? 0) > 0;

  const abschluss = flow.forms.technischer_abschluss;

  const checkStep2 = (): boolean | string => {
    if (!ctx) return ctxError ?? tx('Die Daten der Anfrage werden noch geladen.');
    if (duplicate) return tx('Für diese Anfrage existiert bereits ein technischer Abschluss.');
    if (kritisch.length > 0) return tx('Es gibt noch ungeklärte kritische offene Punkte.');
    return flow.validateStep(2);
  };

  const needsAnfrage = (
    <StepNav onBack={() => setStep(1)} nextDisabled>
      {tx('Dieser Schritt braucht die Auswahl aus Schritt 1.')}
    </StepNav>
  );

  return (
    <IntentWizardShell
      title={tx('Technischen Abschluss prüfen')}
      currentStep={step} onStepChange={setStep}
      forms={flow.formList} draftKey={flow.draftKey}
      intro={{
        description: tx('Voraussetzungen prüfen und die Anfrage technisch klären.'),
        needs: [tx('Anfragenummer'), tx('Name der prüfenden Person'), tx('Übergabeempfänger')],
      }}
    >
      <WizardStep label={tx('Anfrage')} description={tx('Welche Anfrage soll technisch abgeschlossen werden?')}>
        <EntitySelectStep
          {...flow.picks.kundenanfragen.select}
          selectedId={anfrageId}
          onSelect={id => {
            flow.targets.kundenanfragen.onSelect(id);
            abschluss.set('anfrage', id, flow.picks.kundenanfragen.labelOf(id) ?? id);
          }}
          searchPlaceholder={tx('Anfragenummer …')}
        />
      </WizardStep>

      <WizardStep label={tx('Kontrolle')} description={tx('Kritische Punkte und Entscheidungen prüfen und die Voraussetzungen bestätigen.')}>
        {!anfrageId ? needsAnfrage : (
          <div className="space-y-4">
            {ctxError && <p className="text-sm text-destructive">{ctxError}</p>}
            {!ctx && !ctxError && <p className="text-sm text-muted-foreground">{tx('Daten der Anfrage werden geladen …')}</p>}
            {duplicate && (
              <div className="flex gap-2 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                <IconAlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>{tx('Für diese Anfrage existiert bereits ein technischer Abschluss.')}</span>
              </div>
            )}
            {ctx && (
              <div className="overflow-hidden rounded-2xl bg-card p-4 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {kritisch.length > 0
                    ? <IconAlertTriangle size={18} className="shrink-0 text-destructive" />
                    : <IconCircleCheck size={18} className="shrink-0 text-emerald-600" />}
                  <span>
                    {kritisch.length > 0
                      ? tx`${kritisch.length} kritische offene Punkte sind noch ungeklärt`
                      : tx('Alle kritischen offenen Punkte sind geklärt')}
                  </span>
                </div>
                {kritisch.length > 0 && (
                  <ul className="space-y-1.5">
                    {kritisch.map(r => (
                      <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="min-w-0 truncate">{fieldText(r, 'kurztitel')}</span>
                        <StatusBadge statusKey={fieldLookup(r, 'status')?.key} label={fieldLookup(r, 'status')?.label} />
                        <span className="text-xs text-muted-foreground">{fieldText(r, 'verantwortlicher')}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t pt-3">
                  <p className="mb-1.5 text-sm font-medium">{tx`Entscheidungen (${ctx.entscheidungen.length})`}</p>
                  {ctx.entscheidungen.length === 0
                    ? <p className="text-sm text-muted-foreground">{tx('Zu dieser Anfrage gibt es noch keine Entscheidung.')}</p>
                    : (
                      <ul className="space-y-1.5">
                        {ctx.entscheidungen.map(r => (
                          <li key={r.id} className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="min-w-0 truncate">{fieldText(r, 'titel')}</span>
                            <StatusBadge statusKey={fieldLookup(r, 'entscheidungsstatus')?.key} label={fieldLookup(r, 'entscheidungsstatus')?.label} />
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            )}
            <Bound form={abschluss} name="anforderungen_geprueft" />
            <Bound form={abschluss} name="kritische_punkte_geklaert" />
            <Bound form={abschluss} name="entscheidungen_vorhanden" />
            <Bound form={abschluss} name="freigaben_vorhanden" />
            <StepNav onBack={() => setStep(1)} onNext={checkStep2} nextStepLabel={tx('Abweichungen')} />
          </div>
        )}
      </WizardStep>

      <WizardStep label={tx('Abweichungen')} description={tx('Restabweichungen und Risiken festhalten und den Stand zusammenfassen.')} needs={['anfrage']}>
        <div className="space-y-4">
          <Bound form={abschluss} name="geprueft_von" />
          <Bound form={abschluss} name="verbleibende_abweichungen" rows={3} />
          <Bound form={abschluss} name="verbleibende_risiken" rows={3} />
          <Bound form={abschluss} name="zusammenfassung" rows={4} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Übergabe')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Übergabe')} description={tx('Wer übernimmt, und wie weit ist die Übergabe vorbereitet?')} needs={['anfrage']}>
        <div className="space-y-4">
          <Bound form={abschluss} name="uebergabeempfaenger" />
          <Bound form={abschluss} name="uebergabestatus" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Abschluss')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Abschluss')} description={tx('Freigabe eintragen und begründen — die Anfrage wird dann als technisch geklärt gesetzt.')} needs={['anfrage']}>
        <div className="space-y-4">
          <Bound form={abschluss} name="freigabestatus" />
          <Bound form={flow.forms.kundenanfragen} name="statusbegruendung" rows={3} />
          <StepNav onBack={() => setStep(4)} onNext={() => flow.validateStep(5)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Der Abschluss wird gespeichert und die Anfrage als technisch geklärt gesetzt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Weitere Anfrage abschließen'), onClick: () => { flow.reset(); setStep(1); } },
            { label: tx('Beurteilen und entscheiden'), href: '#/intents/beurteilung-und-entscheidung' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
