# 🚲 RadTour Deutschland – Fahrrad-Navi & Tourenplaner

Eine moderne, vollwertige Fahrrad-Navigations- und Tourenplanungs-App speziell für Fahrräder mit Fokus auf **maximale Radwege und fahrradfreundliche Strecken in Deutschland**, basierend auf **OpenStreetMap & OpenMaps**.

---

## ✨ Hauptfunktionen

### 1. 🛡️ Bikes-Only Routing mit maximalen Radwegen
- **BRouter-Integration & FOSSGIS-Server**: Nutzt die führende Fahrrad-Routing-Engine (BRouter `safety`, `trekking`, `gravel`, `fastbike`) kombiniert mit dem deutschen OSM-Radserver von FOSSGIS.
- **Routing-Profile**:
  - 🛡️ **Max. Radwege (Safety First)**: Maximiert baulich getrennte Radwege (`cycleway=track`), Radfahrstreifen, Fahrradstraßen und autofreie Wege; meidet verkehrsreiche Straßen.
  - 🚴 **Radfernwege & Touring (`trekking`)**: Bevorzugt offizielle deutsche Radfernwege (D-Netz, Flussradwege, EuroVelo).
  - 🌲 **Gravel & Wald (`gravel`)**: Schotter-, Wald- und Naturwege abseits des Straßenverkehrs.
  - ⚡ **Schnelles Rad (`fastbike`)**: Glatter Asphalt mit geringstem Rollwiderstand für Pendler und sportliche Fahrer.
- **Detaillierte Streckenanalytik**:
  - **Radwege-Anteil**: Prozentualer Anteil an Radinfrastruktur (z. B. *92% Radwege / autofrei*).
  - **Oberflächen-Zusammensetzung**: Verteilung nach Asphalt, Pflaster, Kies/Schotter und unbefestigten Naturwegen.
  - **Höhenmeter & Fahrzeit**: Steigung, Gefälle und realistische Fahrzeitberechnung bei konfigurierbarer Geschwindigkeit.

### 2. 🗺️ OpenMaps & Radnetz-Darstellung
- **CyclOSM (Standard)**: Spezialisierte Fahrradkarte mit farblicher Hervorhebung von Radwegen, Radspuren, Oberflächenqualitäten und Fahrrad-Infrastruktur.
- **OpenStreetMap Standard**: Universelle topaktuelle Vektor- und Rasterkarten.
- **OpenTopoMap**: Höhenlinien und Gelände-Schummerung für anspruchsvolle Touren in den Mittelgebirgen und Alpen.
- **Radnetz Deutschland Overlay**: Einblendbare Radrouten von *Waymarked Trails* (D-Routen 1–12, EuroVelo, regionale Knotenpunktnetze).

### 3. 🧭 Live-Navigation & GPS-Cockpit
- **Turn-by-Turn HUD**:
  - Große Richtungsanzeigen (Rechts/Links/Kreisverkehr/Geradeaus)
  - Distanz-Countdown zur nächsten Abbiegung (z. B. *"In 140 m rechts abbiegen auf Elberadweg"*)
  - Straßen- und Radwegnamen
  - Digitaler Tacho (km/h) und dynamische Ankunftszeit (ETA)
- **Fahrt-Simulator (GPS-Simulation)**:
  - Teste jede Tour vorab mit virtueller Fahrradfahrt bei 1x, 2x, 5x oder 10x Geschwindigkeit!
  - Sanfte Richtungsrotation (Bearing) des Fahrradsymbols entlang des Tracks.
- **Sprachausgabe (Audio-Navi)**:
  - Automatische akustische Abbiegehinweise via Web Speech API auf Deutsch und Englisch.

### 4. 📈 Interaktives Höhenprofil
- Dynamisches SVG-Höhenprofil am unteren Bildschirmrand.
- **Live-Scrubber**: Wenn du mit der Maus über das Diagramm fährst, siehst du sofort Höhe, Kilometerstand, Steigung (%) und die exakte Position wird auf der Karte markiert.

### 5. 🌟 Kuratierte deutsche Premium-Radtouren
Mit einem Klick ladbare Mehrtages- und Tagestouren:
- **Elberadweg (Sächsische Schweiz)**: Dresden – Pillnitz – Kurort Rathen (Bastei) – Königstein – Bad Schandau
- **Berliner Mauerradweg**: Brandenburger Tor – Checkpoint Charlie – East Side Gallery – Tempelhofer Feld
- **Münchner Isarradweg**: Odeonsplatz – Flaucher – Großhesselohe – Pupplinger Au – Wolfratshausen
- **Bodensee-Radweg**: Konstanz – Insel Mainau – Meersburg – Friedrichshafen – Lindau
- **Rheinradweg (Romantischer Mittelrhein)**: Deutsches Eck Koblenz – Schloss Stolzenfels – Boppard – Loreley
- **Mosel-Radweg**: Traben-Trarbach – Zell (Mosel) – Bremm am Calmont – Cochem
- **Hamburg Alster- & Elberadweg**: Landungsbrücken – HafenCity – Außenalster – Blankenese

### 6. 🔄 Rundtour-Generator
- Gib einfach die gewünschte Distanz ein (z. B. 30 km oder 50 km) und die App berechnet automatisch eine landschaftlich attraktive Rundtour ab deinem Startpunkt!

### 7. 💾 GPX Export & Import
- **Export**: Generiert valides GPX 1.1 mit Wegpunkten, Trackpoints, Höhenmetern und Zeitstempeln – kompatibel mit Garmin Edge, Wahoo ELEMNT, Hammerhead Karoo, Komoot und Strava.
- **Import**: Lade jede GPX-Datei per Drag & Drop oder Klick direkt in die Karte.

### 8. 🔧 Fahrrad-POIs (Overpass API)
- Fahrrad-Reparaturstationen mit Werkzeug & Luftpumpe
- Öffentliche Trinkwasserbrunnen
- Schutzhütten & Rastplätze
- Sichere Fahrradabstellplätze

---

## 🚀 Installation & Start

### Entwicklungsserver starten
```bash
npm install
npm run dev
```
Öffne [http://localhost:5173](http://localhost:5173) im Browser.

### Produktions-Build
```bash
npm run build
npm run preview
```

### Tests ausführen

**Unit- und Integrationstests (Vitest):**
```bash
npm test
```

**End-to-End Browser-Tests (Playwright mit Chrome):**
```bash
npm run test:e2e
```

---

## 🛠️ Verwendete Technologien
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Karten**: Leaflet, CyclOSM, OpenStreetMap, OpenTopoMap, Waymarked Trails
- **Routing**: BRouter API (`safety`, `trekking`, `gravel`, `fastbike`) & FOSSGIS OSM Bike Routing
- **Geokodierung**: Komoot Photon OSM Geocoding & OpenStreetMap Nominatim
- **Audio & Sensoren**: HTML5 Web Speech API & W3C Geolocation API
- **Testing**: Vitest & Playwright E2E
