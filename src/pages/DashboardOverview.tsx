import { useMemo, useState } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconInbox, IconMessage, IconScale, IconHelpCircle } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { OffenePunkte, Aufgaben, Kundenanfragen } from '@/types/app';
import { lookupOption } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { formatDate, lookupKey } from '@/lib/formatters';
import { LOOKUP_OPTIONS } from '@/types/app';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { tx, appLabel } from '@/i18n';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import type { WorkListItem } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { KanbanWidget } from '@/components/widgets/KanbanWidget';
import type { KanbanCard, KanbanColumn } from '@/components/widgets/KanbanWidget';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Focus = 'anfragen' | 'antworten' | 'entscheidungen' | 'anforderungen';

const PUNKT_CLOSED = ['erledigt', 'entschieden_akzeptiert', 'nicht_mehr_relevant'];
const AUFGABE_CLOSED = ['erledigt', 'abgebrochen'];
// Next workflow step of an open point. Abschluss (erledigt) is NEVER automatic:
// it needs a documented result and a checked answer, so it stays a manual step.
const PUNKT_NEXT: Record<string, string> = {
  neu: 'in_bearbeitung',
  zugewiesen: 'in_bearbeitung',
  in_bearbeitung: 'zur_entscheidung',
  wartet_intern: 'in_bearbeitung',
};

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const {
    kundenanfragen, offenePunkte, aufgaben, technischerAbschluss, technischeAnforderungen,
    rueckfragenUndKommunikation, entscheidungen,
    setOffenePunkte, setAufgaben, setKundenanfragen, fetchAll,
  } = data;

  const clock = useClock();
  const today = format(clock, 'yyyy-MM-dd');
  const [focus, setFocus] = useState<Focus>('entscheidungen');
  const [owner, setOwner] = useState('all');

  // ── Shared advance helpers (hero, work lists, kanban, overlay footer) ──
  const setPunktStatus = (p: OffenePunkte, nextKey: string, msg: string) => {
    const prev = p.fields.status;
    const prevKey = lookupKey(prev);
    setOffenePunkte(list => list.map(r => r.record_id === p.record_id ? { ...r, fields: { ...r.fields, status: lookupOption('offene_punkte', 'status', nextKey) } } : r));
    LivingAppsService.updateOffenePunkteEntry(p.record_id, { status: nextKey }).catch(() => fetchAll());
    undoToast(msg, () => {
      setOffenePunkte(list => list.map(r => r.record_id === p.record_id ? { ...r, fields: { ...r.fields, status: prev } } : r));
      if (prevKey) LivingAppsService.updateOffenePunkteEntry(p.record_id, { status: prevKey }).catch(() => fetchAll());
    });
  };
  const punktNext = (p: OffenePunkte) => PUNKT_NEXT[lookupKey(p.fields.status) ?? ''];
  const advancePunkt = (p: OffenePunkte) => {
    const next = punktNext(p);
    if (!next) { crud.offenePunkte.openDetail(p); return; }
    const label = lookupOption('offene_punkte', 'status', next).label;
    setPunktStatus(p, next, tx`${p.fields.kurztitel ?? ''} — ${label}`);
  };
  const punktActionLabel = (p: OffenePunkte) => {
    const next = punktNext(p);
    return next ? lookupOption('offene_punkte', 'status', next).label : tx('Öffnen');
  };

  const setAufgabeStatus = (a: Aufgaben, nextKey: string) => {
    const prev = a.fields.status;
    const prevKey = lookupKey(prev);
    setAufgaben(list => list.map(r => r.record_id === a.record_id ? { ...r, fields: { ...r.fields, status: lookupOption('aufgaben', 'status', nextKey) } } : r));
    LivingAppsService.updateAufgabenEntry(a.record_id, { status: nextKey }).catch(() => fetchAll());
    const label = lookupOption('aufgaben', 'status', nextKey).label;
    undoToast(tx`${a.fields.titel ?? ''} — ${label}`, () => {
      setAufgaben(list => list.map(r => r.record_id === a.record_id ? { ...r, fields: { ...r.fields, status: prev } } : r));
      if (prevKey) LivingAppsService.updateAufgabenEntry(a.record_id, { status: prevKey }).catch(() => fetchAll());
    });
  };
  const aufgabeNext = (a: Aufgaben) => (lookupKey(a.fields.status) === 'offen' ? 'in_bearbeitung' : 'erledigt');
  const advanceAufgabe = (a: Aufgaben) => setAufgabeStatus(a, aufgabeNext(a));
  const aufgabeActionLabel = (a: Aufgaben) => (aufgabeNext(a) === 'in_bearbeitung' ? tx('Starten') : tx('Erledigt'));

  const startPruefung = (k: Kundenanfragen) => {
    const prev = k.fields.status;
    const prevKey = lookupKey(prev);
    setKundenanfragen(list => list.map(r => r.record_id === k.record_id ? { ...r, fields: { ...r.fields, status: lookupOption('kundenanfragen', 'status', 'in_pruefung') } } : r));
    LivingAppsService.updateKundenanfragenEntry(k.record_id, { status: 'in_pruefung' }).catch(() => fetchAll());
    undoToast(tx`${k.fields.anfragenummer ?? ''} — in Prüfung`, () => {
      setKundenanfragen(list => list.map(r => r.record_id === k.record_id ? { ...r, fields: { ...r.fields, status: prev } } : r));
      if (prevKey) LivingAppsService.updateKundenanfragenEntry(k.record_id, { status: prevKey }).catch(() => fetchAll());
    });
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'offenePunkte') {
        const p = top.record as OffenePunkte;
        return punktNext(p) ? { label: punktActionLabel(p), onClick: () => advancePunkt(p) } : undefined;
      }
      if (top.type === 'aufgaben') {
        const a = top.record as Aufgaben;
        return AUFGABE_CLOSED.includes(lookupKey(a.fields.status) ?? '') ? undefined : { label: aufgabeActionLabel(a), onClick: () => advanceAufgabe(a) };
      }
      return undefined;
    },
  });
  const enrichedPunkte = crud.enriched.offenePunkte;
  const enrichedAufgaben = crud.enriched.aufgaben;
  const enrichedAnfragen = crud.enriched.kundenanfragen;
  const enrichedKomm = crud.enriched.rueckfragenUndKommunikation;
  const enrichedEnts = crud.enriched.entscheidungen;
  const enrichedAnf = crud.enriched.technischeAnforderungen;

  // ── Derived sets ──
  const openPunkte = enrichedPunkte.filter(p => !PUNKT_CLOSED.includes(lookupKey(p.fields.status) ?? ''));
  const kritisch = openPunkte.filter(p => lookupKey(p.fields.prioritaet) === 'kritisch');
  const overdueTasks = enrichedAufgaben
    .filter(a => !AUFGABE_CLOSED.includes(lookupKey(a.fields.status) ?? '') && a.fields.faellig_am && a.fields.faellig_am.slice(0, 10) < today)
    .sort((a, b) => (a.fields.faellig_am ?? '').localeCompare(b.fields.faellig_am ?? ''));
  const neueAnfragen = enrichedAnfragen.filter(k => lookupKey(k.fields.status) === 'neu');
  const offeneAntworten = enrichedKomm.filter(c => lookupKey(c.fields.versandstatus) === 'versendet' && (!c.fields.antwortstatus || ['offen', 'teilweise_beantwortet', 'unklar', 'widerspruechlich'].includes(lookupKey(c.fields.antwortstatus) ?? '')));
  const offeneEntscheidungen = enrichedEnts.filter(e => ['vorbereitung', 'zur_entscheidung'].includes(lookupKey(e.fields.entscheidungsstatus) ?? ''));
  const unklareAnf = enrichedAnf.filter(a => ['unklar', 'widerspruechlich'].includes(lookupKey(a.fields.pruefstatus) ?? ''));
  const hasFreigabeAbschluss = (id: string) => technischerAbschluss.some(t => extractRecordId(t.fields.anfrage) === id && lookupKey(t.fields.freigabestatus) === 'freigegeben');
  const freigabeFaelle = enrichedAnfragen.filter(k => {
    const s = lookupKey(k.fields.status);
    return s === 'technisch_geklaert' || (s === 'freigegeben' && !hasFreigabeAbschluss(k.record_id));
  });

  const owners = useMemo(() => Array.from(new Set(openPunkte.map(p => p.fields.verantwortlicher).filter((v): v is string => !!v))).sort(), [openPunkte]);

  // ── Kanban (Klärungsboard) ──
  const columns: KanbanColumn[] = [
    'neu', 'zugewiesen', 'in_bearbeitung', 'wartet_auf_kunde', 'wartet_intern', 'zur_entscheidung', 'erledigt', 'entschieden_akzeptiert', 'nicht_mehr_relevant',
  ].map(k => ({ key: k, label: lookupOption('offene_punkte', 'status', k).label }));
  void LOOKUP_OPTIONS;

  const cards: KanbanCard[] = enrichedPunkte
    .filter(p => owner === 'all' || p.fields.verantwortlicher === owner)
    .sort((a, b) => (a.fields.faellig_am ?? '9999').localeCompare(b.fields.faellig_am ?? '9999'))
    .map(p => {
      const prio = lookupKey(p.fields.prioritaet);
      const late = p.fields.faellig_am && p.fields.faellig_am.slice(0, 10) < today && !PUNKT_CLOSED.includes(lookupKey(p.fields.status) ?? '');
      const parts = [
        p.fields.prioritaet?.label,
        p.fields.verantwortlicher ?? tx('Nicht zugewiesen'),
        p.fields.faellig_am ? formatDate(p.fields.faellig_am) : null,
        p.betroffene_anforderungenName || p.anfrageName || null,
      ].filter(Boolean);
      return {
        id: `punkt:${p.record_id}`,
        column: lookupKey(p.fields.status) ?? 'neu',
        title: p.fields.kurztitel ?? '—',
        subtitle: <span className={late ? 'text-destructive' : undefined}>{parts.join(' · ')}</span>,
        tone: prio === 'kritisch' ? 'destructive' : prio === 'hoch' ? 'warning' : 'default',
      };
    });

  const moveCard = (cardId: string, newColumn: string) => {
    const p = openPunkteAll(cardId);
    if (!p) return;
    if (['erledigt', 'entschieden_akzeptiert'].includes(newColumn) && !p.fields.loesung_oder_ergebnis?.trim()) {
      return tx('Abschluss nur mit dokumentiertem Ergebnis — bitte im Detail eintragen.');
    }
    if (newColumn === 'erledigt' && lookupKey(p.fields.status) === 'wartet_auf_kunde' && !p.fields.antwort_geprueft) {
      return tx('Die Kundenantwort wurde noch nicht geprüft — erst prüfen, dann erledigen.');
    }
    setPunktStatus(p, newColumn, tx`${p.fields.kurztitel ?? ''} — ${lookupOption('offene_punkte', 'status', newColumn).label}`);
  };
  const openPunkteAll = (cardId: string) => offenePunkte.find(p => p.record_id === cardId.split(':')[1]);

  // ── Header / hero ──
  const names = (xs: (string | undefined)[]) => namen(xs.filter((x): x is string => !!x));
  let context: string;
  if (kritisch.length === 1) context = tx`Kritisch: ${names(kritisch.map(p => p.fields.kurztitel))} braucht Klärung.`;
  else if (kritisch.length > 1) context = tx`Kritisch: ${names(kritisch.map(p => p.fields.kurztitel))} brauchen Klärung.`;
  else if (overdueTasks.length > 0) context = tx`Überfällig: ${names(overdueTasks.map(a => a.fields.titel))}.`;
  else if (neueAnfragen.length > 0) context = tx`Neu eingegangen: ${names(neueAnfragen.map(k => k.kundeName))}.`;
  else if (openPunkte.length > 0) context = tx`Alles im Plan — in Arbeit: ${names(openPunkte.map(p => p.fields.kurztitel))}.`;
  else context = tx`Aktuell ist nichts zu klären — nimm die nächste Kundenanfrage auf.`;

  const newAnfrage = () => crud.kundenanfragen.openCreate({ status: 'neu', eingangsdatum: format(clock, 'yyyy-MM-dd') });

  const heroTarget = kritisch.find(p => punktNext(p)) ?? kritisch[0];
  const hero = kundenanfragen.length === 0 ? (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center">
      <IconInbox size={48} className="text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{tx('Noch keine Kundenanfrage — starte die technische Auftragsklärung mit der ersten Anfrage.')}</p>
      {crud.kundenanfragen.canWrite && <Button onClick={newAnfrage}>{tx('Erste Anfrage aufnehmen')}</Button>}
    </div>
  ) : kritisch.length > 0 && heroTarget ? (
    <HeroBanner
      icon={<IconAlertTriangle size={18} />}
      action={{ label: punktActionLabel(heroTarget), onClick: () => advancePunkt(heroTarget) }}
    >
      {kritisch.length === 1
        ? <><b>{names(kritisch.map(p => p.fields.kurztitel))}</b> {tx('ist ein kritischer offener Punkt und blockiert den Abschluss.')}</>
        : <><b>{names(kritisch.map(p => p.fields.kurztitel))}</b> {tx('sind kritische offene Punkte und blockieren den Abschluss.')}</>}
    </HeroBanner>
  ) : undefined;

  // ── Aside lists ──
  const lateWord = (iso?: string) => {
    if (!iso) return null;
    const d = differenceInCalendarDays(clock, new Date(iso.slice(0, 10) + 'T00:00:00'));
    return d > 0 ? <span className="font-medium text-destructive">{tx`${d} Tage überfällig`}</span> : <span className="text-muted-foreground">{formatDate(iso)}</span>;
  };

  const taskItems: WorkListItem[] = overdueTasks.map(a => ({
    id: a.record_id,
    title: a.fields.titel ?? '—',
    secondLine: <>{lateWord(a.fields.faellig_am)}<span className="text-muted-foreground"> · {a.fields.verantwortlicher ?? tx('Nicht zugewiesen')}{a.anfrageName ? ` · ${a.anfrageName}` : ''}</span></>,
    action: { label: aufgabeActionLabel(a), onClick: () => advanceAufgabe(a) },
  }));

  const focusList = (() => {
    if (focus === 'anfragen') return {
      title: tx('Neu eingegangene Anfragen'),
      items: neueAnfragen.map<WorkListItem>(k => ({
        id: k.record_id,
        title: k.kundeName || k.fields.anfragenummer || '—',
        secondLine: <span className="text-muted-foreground">{[k.fields.anfragenummer, k.fields.produktfamilie, k.fields.eingangsdatum ? formatDate(k.fields.eingangsdatum) : null].filter(Boolean).join(' · ')}</span>,
        action: { label: tx('In Prüfung'), onClick: () => startPruefung(k) },
      })),
      onClick: (id: string) => { const r = kundenanfragen.find(x => x.record_id === id); if (r) crud.kundenanfragen.openDetail(r); },
      empty: tx('Keine neuen Anfragen.'),
    };
    if (focus === 'antworten') return {
      title: tx('Ausstehende Kundenantworten'),
      items: offeneAntworten.map<WorkListItem>(c => ({
        id: c.record_id,
        title: c.fields.betreff ?? '—',
        secondLine: <>{lateWord(c.fields.antwort_erwartet_bis)}<span className="text-muted-foreground"> · {c.fields.empfaenger ?? tx('Ohne Empfänger')}</span></>,
      })),
      onClick: (id: string) => { const r = rueckfragenUndKommunikation.find(x => x.record_id === id); if (r) crud.rueckfragenUndKommunikation.openDetail(r); },
      empty: tx('Keine Antwort ausstehend.'),
    };
    if (focus === 'anforderungen') return {
      title: tx('Unklare oder widersprüchliche Anforderungen'),
      items: unklareAnf.map<WorkListItem>(a => ({
        id: a.record_id,
        title: a.fields.bezeichnung ?? '—',
        secondLine: <><span className="font-medium text-amber-600">{a.fields.pruefstatus?.label}</span><span className="text-muted-foreground"> · {a.anfrageName}</span></>,
      })),
      onClick: (id: string) => { const r = technischeAnforderungen.find(x => x.record_id === id); if (r) crud.technischeAnforderungen.openDetail(r); },
      empty: tx('Alle Anforderungen sind geprüft.'),
    };
    return {
      title: tx('Offene Entscheidungen'),
      items: offeneEntscheidungen.map<WorkListItem>(e => ({
        id: e.record_id,
        title: e.fields.titel ?? '—',
        secondLine: <><span className="font-medium text-amber-600">{e.fields.entscheidungsstatus?.label}</span><span className="text-muted-foreground"> · {e.fields.entscheidungsverantwortlicher ?? tx('Ohne Verantwortliche/n')}</span></>,
      })),
      onClick: (id: string) => { const r = entscheidungen.find(x => x.record_id === id); if (r) crud.entscheidungen.openDetail(r); },
      empty: tx('Keine Entscheidung offen.'),
    };
  })();

  const freigabeItems: WorkListItem[] = freigabeFaelle.map(k => {
    const orphan = lookupKey(k.fields.status) === 'freigegeben';
    return {
      id: k.record_id,
      title: k.kundeName || k.fields.anfragenummer || '—',
      secondLine: orphan
        ? <span className="font-medium text-destructive">{tx('Freigegeben ohne dokumentierten Abschluss')}</span>
        : <span className="text-muted-foreground">{tx('Technisch geklärt — Freigabe durch verantwortliche Person ausstehend')}</span>,
    };
  });

  const kpis = (
    <StatStrip>
      <StatStripItem title={tx('Neue Anfragen')} value={neueAnfragen.length} icon={<IconInbox size={16} />}
        onClick={() => setFocus(f => f === 'anfragen' ? 'entscheidungen' : 'anfragen')} active={focus === 'anfragen'} />
      <StatStripItem title={tx('Ausstehende Antworten')} value={offeneAntworten.length} icon={<IconMessage size={16} />}
        tone={offeneAntworten.some(c => c.fields.antwort_erwartet_bis && c.fields.antwort_erwartet_bis.slice(0, 10) < today) ? 'warning' : 'default'}
        onClick={() => setFocus(f => f === 'antworten' ? 'entscheidungen' : 'antworten')} active={focus === 'antworten'} />
      <StatStripItem title={tx('Offene Entscheidungen')} value={offeneEntscheidungen.length} icon={<IconScale size={16} />}
        onClick={() => setFocus('entscheidungen')} active={focus === 'entscheidungen'} />
      <StatStripItem title={tx('Unklare Anforderungen')} value={unklareAnf.length} icon={<IconHelpCircle size={16} />}
        tone={unklareAnf.length > 0 ? 'warning' : 'default'}
        onClick={() => setFocus(f => f === 'anforderungen' ? 'entscheidungen' : 'anforderungen')} active={focus === 'anforderungen'} />
    </StatStrip>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{context}</p>
        </div>
        {crud.kundenanfragen.canWrite && (
          <Button onClick={newAnfrage} className="shrink-0">
            <IconPlus size={16} className="mr-1 shrink-0" />{tx('Neue Anfrage')}
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={hero}
        kpis={kundenanfragen.length > 0 ? kpis : undefined}
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['erledigt', 'entschieden_akzeptiert', 'nicht_mehr_relevant']}
            onCardClick={card => { const r = offenePunkte.find(p => p.record_id === card.id.split(':')[1]); if (r) crud.offenePunkte.openDetail(r); }}
            onCardMove={moveCard}
            onAddCard={crud.offenePunkte.canWrite ? (column => crud.offenePunkte.openCreate({ status: column })) : undefined}
          >
            {owners.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-sm font-medium">{appLabel('offene_punkte')}</span>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger className="h-8 w-full sm:w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tx('Alle Verantwortlichen')}</SelectItem>
                    {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </KanbanWidget>
        }
        aside={
          <>
            <WorkList
              title={tx('Überfällige Aufgaben')}
              items={taskItems}
              onItemClick={id => { const r = aufgaben.find(x => x.record_id === id); if (r) crud.aufgaben.openDetail(r); }}
              empty={{ text: tx('Keine Aufgabe überfällig.') }}
            />
            <WorkList
              title={focusList.title}
              items={focusList.items}
              onItemClick={focusList.onClick}
              empty={{ text: focusList.empty }}
            />
            <WorkList
              title={tx('Freigabe-Prüfung')}
              items={freigabeItems}
              onItemClick={id => { const r = kundenanfragen.find(x => x.record_id === id); if (r) crud.kundenanfragen.openDetail(r); }}
              empty={{ text: tx('Keine Anfrage wartet auf Freigabe.') }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
