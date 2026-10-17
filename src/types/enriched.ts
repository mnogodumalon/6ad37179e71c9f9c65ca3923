import type { Aufgaben, Beurteilungen, Entscheidungen, Erfahrungen, Informationsquellen, Kundenanfragen, OffenePunkte, RueckfragenUndKommunikation, TechnischeAnforderungen, TechnischerAbschluss, WiederverwendungVonErfahrungen } from './app';

export type EnrichedKundenanfragen = Kundenanfragen & {
  kundeName: string;
};

export type EnrichedTechnischerAbschluss = TechnischerAbschluss & {
  anfrageName: string;
};

export type EnrichedInformationsquellen = Informationsquellen & {
  ersetzt_quelleName: string;
  anfrageName: string;
};

export type EnrichedTechnischeAnforderungen = TechnischeAnforderungen & {
  quellenName: string;
  anfrageName: string;
};

export type EnrichedOffenePunkte = OffenePunkte & {
  betroffene_anforderungenName: string;
  betroffene_quellenName: string;
  anfrageName: string;
};

export type EnrichedAufgaben = Aufgaben & {
  anfrageName: string;
  offener_punktName: string;
  vorgaengeraufgabeName: string;
};

export type EnrichedBeurteilungen = Beurteilungen & {
  anfrageName: string;
  betroffene_anforderungenName: string;
  betroffene_offene_punkteName: string;
  zugrunde_liegende_quellenName: string;
};

export type EnrichedRueckfragenUndKommunikation = RueckfragenUndKommunikation & {
  offener_punktName: string;
  offene_punkteName: string;
  quelleName: string;
  anfrageName: string;
};

export type EnrichedEntscheidungen = Entscheidungen & {
  betroffene_anforderungenName: string;
  betroffene_offene_punkteName: string;
  zugrunde_liegende_beurteilungenName: string;
  ersetzt_durch_entscheidungName: string;
  anfrageName: string;
};

export type EnrichedErfahrungen = Erfahrungen & {
  belegquellenName: string;
  belegbeurteilungenName: string;
  belegentscheidungenName: string;
  ursprungsanfrageName: string;
  belegabschluesseName: string;
};

export type EnrichedWiederverwendungVonErfahrungen = WiederverwendungVonErfahrungen & {
  erfahrungName: string;
  zielanfrageName: string;
};
