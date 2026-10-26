# Depth-Dependent Halos Lab

Lokales wissenschaftliches Lehrlabor zu Everts et al. (2009), für Georgs
Visual-Computing-Seminar. TypeScript, direktes WebGL2, Vite; keine externen
Laufzeitdienste und keine CDN-Abhängigkeit. Oberfläche auf Deutsch.

## Start

Voraussetzungen: Node.js **24** mit npm, Python **3.10+**, Browser mit WebGL2.
Getestet: Ubuntu 26.04.1 ARM64, Node 24.21.0, npm 11.19.0, Python 3.14.4.

```bash
cd /home/georg/projects/ddh-lab
npm ci --cache .cache/npm
python3 scripts/fetch_references.py --extract
python3 scripts/inspect_references.py
python3 scripts/prepare_data.py
npm run dev -- --port 4178 --strictPort
```

Im Browser **http://127.0.0.1:4178** öffnen. Beenden mit Ctrl+C.
Die Referenzskripte prüfen die festgelegten SHA-256 und führen keinen Fremdcode
aus. Archive und Originaldaten bleiben lokal und werden nicht eingecheckt.
Vorbereitete Daten liegen bereits unter `public/data/local/`. Ohne diese Daten
funktionieren die synthetischen Szenen; die Oberfläche zeigt den fehlenden
Vorbereitungsschritt an. Ein Downloadfehler wird nicht stillschweigend umgangen.

Nach der Installation und Datenvorbereitung ist kein Internet nötig.
Eine erneute Installation aus dem hier gefüllten Cache ist mit
`npm ci --offline --cache .cache/npm` möglich und wurde geprüft.

Für die Vorführung aus dem Produktionsbuild:

```bash
npm run build
npm run preview -- --port 4178 --strictPort
```

Auch hier http://127.0.0.1:4178 öffnen. `dist/` enthält die lokal vorbereiteten
Daten und die Kontrollprobe unter `/probe.html`. Nach Änderungen an den lokalen
Daten den Build erneuern. Nicht per `file://` öffnen.

## Vorführung · zwei bis drei Minuten

1. **Verstehen**: Startszene DDH. Δz von 0,001 auf 0,060 und 0,200 bewegen.
   Der zusätzliche weiße Rand wächst und sättigt. Negative Δz vertauschen
   Vorder-/Hintergrund; das Seitenschema folgt dem Wechsel.
2. **Vergleichen**: Wellenbündel. Einfache Linien → herkömmliche Halos → DDH
   schalten. Daten und Kamera bleiben gleich. Optional Depth Cueing separat
   ein- und ausschalten; es verjüngt nur die schwarze Linie.
3. Im Datensatzmenü **Knot 10_136** oder **Air flow in office** wählen.
   Optional die vollständigen **Fiber tracts** zeigen. Front-/Schrägansicht
   wechseln oder mit Ziehen drehen, mit Mausrad zoomen.
4. **Grenzen**: Verdeckte Struktur untersuchen, dann Schrägansicht.
   Zweiter Fall: **Exakt gleiche Tiefe**. Ohne Tiefenunterschied existiert keine
   Tiefenordnung. Ein Halo kann vollständig verdeckte Geometrie nicht enthüllen.
5. **PNG exportieren** speichert die aktuelle Zeichenfläche ohne UI.
   Diagnosebilder tragen `-diagnose` im Dateinamen. **Zurücksetzen** stellt
   die gesamte ursprüngliche Zwei-Linien-Szene wieder her.

Alle drei Ansichtstabs sind vorbereitete, reproduzierbare Zustände. Kamera auf
der Zeichenfläche auch per Pfeiltasten drehen; `+`/`-` zoomen. Lokaler Import
über den aufklappbaren SOP-Bereich, Typ aus `description.ini` ausdrücklich
angeben. Das SOP-Format selbst kodiert den Unterschied zu Punktwolken nicht.
Grenze: 64 MiB, 600.000 Punkte, 100.000 Sequenzen; maximal 600.000 Segmente.

## Prüfung

```bash
npm test
npm run build
npm run test:gpu
npm run test:production
```

`npm test`: 14 fachliche/Datenprüfungen, darunter alle fünf originalen
Liniendateien gegen das unabhängige Inventar. Fehlende Originale sind explizite
Skips und keine bestandenen Importprüfungen. Die Browserdaten vorher vorbereiten.
`test:gpu` startet einen eigenen lokalen Server auf Port 4178; `test:production`
prüft den zuvor gebauten Stand mit einem neuen Preview-Server. Kein anderer
Server wird wiederverwendet. Browseraufnahmen liegen unter `.artifacts/`.

Playwright benötigt einen Browser. Falls noch keiner vorhanden ist:

```bash
npx playwright install chromium
```

Optional kann `DDH_CHROMIUM=/absoluter/pfad/zum/chromium npm run test:gpu`
einen vorhandenen Browser wählen. Das Skript erkennt vorhandene Playwright
Headless Shells. Auf dieser minimalen Ubuntu-VM fehlen Browserbibliotheken und
Schriften. Sie wurden ausschließlich **projektlokal** bereitgestellt:

```bash
python3 scripts/setup_browser_libs.py
npm run test:gpu
```

Dieses optionale Ubuntu-Hilfsskript verwendet bestehende APT-Metadaten, lädt
Bibliotheksarchive und eine Testschrift nach `.cache/` und entpackt sie dort.
Es installiert keine Systempakete, benötigt kein sudo und ändert keine globale
Konfiguration. Versions-/Hashnachweis: `.cache/browser-library-manifest.json`.
Nur der Testprozess erhält private Bibliotheks-/Fontpfade. Andere Systeme mit
funktionierendem Chromium benötigen diesen Schritt nicht.

## Wissenschaftlicher Umfang und Grenzen

Papernahe Nachimplementierung des linearen DDH-Kerns: Weiße Randfragmente
erhalten eine fenstertiefenabhängige Verschiebung, schwarze Linien behalten z.
Ein Pass, expliziter Tiefentest. Drei Modi, unabhängiges Depth Cueing,
Fragmenttiefendiagnose, zwei kontrollierte Linien und deterministische Bündel.
Originale: beide Knoten, vollständiger Office-Flow und vollständige Fiber tracts;
Counts, Bounds und SHA-256 werden vor Anzeige geprüft. Quelldaten werden nur
zentriert und uniform skaliert. Das Faser-Zusatzattribut wird nicht interpretiert.

Bewusste Abweichungen: orthografische Kamera, Breiten in Framebuffer-Pixeln statt
Modellraum, analytisches Profil ohne Originaltexturen, flache Enden und begrenzte
Miter-Verbindungen, eigene begrenzte Cueing-Funktion. Kein Antialiasing; scharfe
Ecken und nahezu blickparallele Segmente bleiben geometrische Grenzen. Bei
extremen Breitenparametern kann Cueing den schwarzen Anteil bis S verbreitern.
Exakte Tiefengleichheit hat Raster-/Zeichenreihenfolge-Ties. Kein
Punktwolkenrenderer; Wasserströmung nur als Parsertest, kein Browserpreset.

Die automatisierten Grafikprüfungen bestehen auf **Chromium 156.0.8078.4 mit
ANGLE/SwiftShader**, also Softwaregrafik. Sie prüfen analytische Pixelübergänge
und den adaptierten Originalshaderkern; keine behauptete Pixelidentität zur
historischen Anwendung, keine Wahrnehmungsstudie und kein Hardware-GPU-Nachweis.
Vor dem Seminar auf dem Präsentationsrechner den obigen Demo-Ablauf, Resize und
Export durchgehen. Details/Ergebnisse in [docs/VALIDATION.md](docs/VALIDATION.md).

## Quellen und Projektstruktur

- [Originalpaper](https://tobias.isenberg.cc/personal/papers/Everts_2009_DDH.pdf),
  §§3.2–3.4; [Projektseite](https://tobias.isenberg.cc/VideosAndDemos/Everts2009DDH).
- [docs/RESEARCH.md](docs/RESEARCH.md): Quellen, Parameterabbildung, eigene
  Herleitung und beobachtete Paper-Inkonsistenzen.
- [docs/PLAN.md](docs/PLAN.md): einzige Meilenstein-/Statusquelle.
- [docs/DESIGN.md](docs/DESIGN.md): Gestaltung und Bedienkonventionen.
- `src/renderer.ts`: eigene GLSL-Shader und Streifengeometrie;
  `model.ts`: Szenen/Definitionen; `sop.ts`: validierter Reader;
  `main.ts`, `ui.ts`, `style.css`: Zustand, Bedienung und Darstellung.
- `references/sources.json`: URLs/Hashes; Originaldateien unverändert unter
  `references/upstream/`; lokale Herkunftshinweise zusätzlich in
  `public/data/local/UPSTREAM-README.txt`.

Die Bildlizenz der Projektseite gilt nicht pauschal für Code oder Datensätze.
Insbesondere die originale DTI-Anerkennung bleibt im lokal mitgelieferten README
erhalten. Keine Archive, fremden Programme oder großen Datensätze im Git-Stand;
keine externe Veröffentlichung und kein Push.
