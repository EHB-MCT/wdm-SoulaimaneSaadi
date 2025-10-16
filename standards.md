1) Overzicht

Project: SunnySpeelplein Check-in & Uitleen App

Doel:
Kinderen in-/uitchecken via QR-badge.

Uitleen/retour van materiaal (fietsen, ballen, …).

Inzichten in aanwezigheden, piekuren en gebruikspatronen.


2) Technologieën

Frontend (mobiel): React Native (Expo), JavaScript (ES6+), React Navigation.

Styling: React Native StyleSheet (optioneel: Tailwind RN).

Backend: Node.js + Express.

Database: MongoDB (Atlas of lokaal).

Auth: JWT (rollen: animator, admin).

Versiebeheer: Git + GitHub.


3) Data (MongoDB)

Collections: children, users, checkEvents, items, loans

Voorbeeld check-in event (compact):

{ "childId": "K123", "type": "in", "timestamp": "2025-07-14T09:12:00Z", "scannedBy": "animator_05" }


Voorbeeld uitleen (compact):

{ "itemId": "M002", "childId": "K123", "borrowTime": "2025-07-14T10:00:00Z", "returnTime": "2025-07-14T11:30:00Z" }


4) Architectuur

Mobiel (Expo):

App.js – navigatie & auth-flow.

ScanScreen.jsx – QR scannen → POST naar /api/check/scan.

MaterialScreen.jsx – uitleen/retour acties.

OverviewScreen.jsx – huidige aanwezigheid.

StatsScreen.jsx (later) – eenvoudige grafieken.

Backend (API):

/api/auth/login – JWT.

/api/check/scan, /api/check/presence/now, /api/check/today.

/api/items, /api/loans/borrow, /api/loans/return, /api/loans/open.

/api/stats/* (later).

Flow:
QR → client leest payload → API registreert server-timestamp → zichtbaar in overzicht/statistiek.


5) Styling & Typografie

Font: 

Kleuren:

Primair:

Secundair:

Achtergrond:

Tekst:

UI: 

Animatie: 


6) Testplan

Controleren of:

QR correct gelezen → juist API-request.

Server timestamp en type (in/out) kloppen in DB.

Aanwezigheden real-time verversen (polling of SWR).

Uitleen/retour status correct (open vs returned).

Offline scenario: queue op device → sync bij reconnect.

UI schaalt goed op verschillende schermgroottes.


7) Beslissingen

Start simpel (MVP):

QR check-in/out + overzicht aanwezigheden.

Basisauth (login + ).


Later toevoegen:

Materiaalbeheer (uitleen/retour).

Stats (piekuren, frequentie, itemgebruik).

Rollen & rechten (ouder/animator/admin waar relevant).

Export (CSV/Sheets), notificaties, betere offline.


8) Roadmap

Prototype: QR-scan → /api/check/scan → lijst met aanwezig.

Materiaal: materiaal lenen (borrow/return/open).

Live overzicht: auto-refresh

Dashboard:  (later web)

Extra: offline queue, role-based UI, basis-analytics.