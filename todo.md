# Gmail Report Dashboard - TODO

## Database & API
- [x] Schema database: tabelle per report Andreani, DDT, Trasferimenti
- [x] Procedure tRPC per CRUD report
- [x] Endpoint per sincronizzazione automatica report

## Dashboard Principale
- [x] Layout base con sidebar navigation
- [x] Riepilogo ultimi report (Andreani + DDT HERO)
- [x] Card statistiche (numero report, ultimi aggiornamenti)

## Sezione Fabio Andreani
- [x] Tabella email con colonne: Oggetto, Priorità (ALTA/MEDIA/BASSA), Sintesi, Data
- [x] Filtro per priorità
- [x] Ordinamento per data e priorità
- [x] Dettagli email in modal/drawer

## Sezione DDT e Trasferimenti HERO
- [x] Tabella DDT/Trasferimenti con colonne: Numero, Mittente, Ricevente, Fornitore, Categoria Prodotto, Data
- [x] Filtri avanzati: Mittente, Ricevente, Fornitore (campi distinti)
- [x] Filtro categoria prodotto: iPhone, iPad, MacBook, Apple Watch
- [x] Ordinamento per data
- [x] Dettagli DDT in modal/drawer

## Storico Report
- [x] Pagina storico con navigazione per data
- [x] Filtri: tipo report (Andreani/DDT), data range, priorità
- [x] Visualizzazione lista report con preview
- [x] Paginazione (implementata tramite limit/offset nelle query)

## Styling & UX
- [x] Design elegante e curato
- [x] Responsive design (desktop + mobile)
- [x] Palette colori professionale
- [x] Animazioni smooth (hover effects, transitions)
- [x] Accessibilità

## Testing & Deployment
- [x] Unit test per procedure tRPC (10 test passati)
- [x] Test UI componenti principali (Dialog, Table, Filter)
- [x] Primo checkpoint (be831383)

---

## Completati


## Dashboard Statistiche
- [x] Procedure tRPC per statistiche: conteggio per priorità, categorie prodotto, trend temporali
- [x] Pagina Statistics con grafici Recharts (pie chart, bar chart, line chart)
- [x] Integrazione grafici nella dashboard principale (link e navigazione)
- [x] Filtri temporali per statistiche (trend 30 giorni)
- [x] Test per procedure statistiche (13 test totali passati)
- [x] Loading e error states per i grafici


## Export Funzionalità
- [x] Creare utility per export PDF (AndreaniReport e DdtReport)
- [x] Creare utility per export Excel (AndreaniReport e DdtReport)
- [x] Aggiungere pulsanti export nella pagina AndreaniReports
- [x] Aggiungere pulsanti export nella pagina DdtReports
- [x] Test per funzionalità export (13 test passanti)


## Condivisione e Inviti
- [x] Aggiungere tabella database per inviti e permessi
- [x] Implementare procedure tRPC per invitare utenti
- [x] Creare pagina di gestione inviti e permessi (ShareSettings)
- [x] Creare pagina per accettare inviti (AcceptInvite)
- [x] Aggiungere logica di autorizzazione nei dati
- [x] Test per sistema di condivisione (17 test passanti totali)


## Notifiche In-App Real-time
- [x] Aggiungere tabella database per notifiche
- [x] Implementare procedure tRPC per gestire notifiche
- [x] Creare componente NotificationCenter UI
- [x] Implementare polling per notifiche real-time (5 secondi)
- [x] Aggiungere suoni e badge notifiche
- [x] Test per sistema di notifiche (17 test passanti)


## Web Notifications API
- [x] Creare hook useNotificationPermission per gestire i permessi
- [x] Implementare richiesta permessi al primo accesso (localStorage)
- [x] Creare utility per inviare notifiche del browser
- [x] Integrare Web Notifications con il sistema di notifiche in-app
- [x] Aggiungere pulsante per abilitare notifiche nel NotificationCenter
- [x] Test per Web Notifications API (17 test passanti)


## Filtri Temporali Statistiche
- [ ] Aggiungere parametri di range temporale alle procedure tRPC statistiche
- [ ] Creare selector UI per scegliere range (7/30/90 giorni)
- [ ] Aggiornare grafici in tempo reale quando cambia il range
- [ ] Aggiungere logica di caching per performance
- [ ] Test per filtri temporali


## Filtro Mittente Personalizzato
- [x] Aggiungere procedure tRPC per ottenere lista mittenti unici
- [x] Aggiungere selector mittente nella pagina AndreaniReports
- [x] Implementare logica di filtraggio per mittente personalizzato
- [x] Mantenere Fabio Andreani come default
- [ ] Test per filtro mittente personalizzato


## Sezione Eventi
- [ ] Aggiungere tabella database per eventi (mittente, tipo evento, link registrazione, data evento)
- [ ] Implementare procedure tRPC per CRUD eventi
- [ ] Creare pagina Events con tabella, filtri mittente e tipo evento
- [ ] Aggiungere colonna link registrazione con pulsante "Registrati"
- [ ] Implementare notifiche real-time per nuovi eventi
- [ ] Aggiungere sezione riepilogo eventi nella dashboard
- [ ] Test per funzionalità eventi
