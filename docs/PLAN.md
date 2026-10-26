# Entwicklungsplan und Status

## Ziel und Reihenfolge

Ein fachlich überprüfbarer Renderer, eine verständliche Lehransicht und eine
verlässliche kurze Vorführung. Der Aufwand liegt zunächst beim Renderingkern.
Die Oberfläche soll diesen Kern sichtbar und bedienbar machen.

| Phase | Ergebnis | Abschlusskriterium |
|---|---|---|
| M0 Grundlagen | VM-Inventar, lokale Referenzen, fachliche Festlegungen | Quellen verifiziert; Tiefenraum, Parameter, Datenherkunft und Abweichungen beschrieben |
| M1 Machbarkeit | Kleine WebGL2-Probe mit eigenen Shadern | Shader laufen; geänderte Fragmenttiefe beeinflusst die Verdeckung nachweisbar |
| M2 DDH-Kern | Zwei-Linien-Szene und drei Darstellungsmodi | Erwartetes Verhalten in ausgewählten Fällen unabhängig hergeleitet und gegen GPU-Ausgabe geprüft |
| M3 Daten und Vergleiche | Synthetische Bündel, Originaldatenimport, gemeinsame Kamera | Knoten und Office-Flow korrekt gelesen und dargestellt; Counts/Bounds stimmen; Reset reproduzierbar |
| M4 Lehranwendung | Verstehen/Vergleichen/Grenzen, Seitenansicht, Depth Cueing | Aussagen und Bild bleiben beim Ändern der Parameter konsistent; Gestaltung geprüft |
| M5 Vortragsfassung | Presets, Export, Startanleitung, Abschlussreview | Demo vollständig durchlaufen; Export und Neustart geprüft; bekannte Grenzen benannt |

Meilensteine sind Selbstprüfungen des Agenten, keine menschlichen Freigabetermine.
Ein bestandenes Kriterium erlaubt die nächste Phase unmittelbar.

## Bewusster Umfang

M3 enthält mindestens einen Knoten und den Office-Flow-Datensatz. Den
Fiber-tracts-Datensatz anschließend erproben; bei Leistungsproblemen eine
reproduzierbare und ausdrücklich bezeichnete Auswahl verwenden oder die
begrenzte Unterstützung benennen. Das ungeklärte Zusatzattribut nicht fachlich
interpretieren. Wasserströmung kann danach folgen. Point-Cloud-Rendering,
Stereo, umfangreiches Filtering und neue Visualisierungstechniken sind
Erweiterungen nach einer fertigen Kernversion.

## Technische Leitentscheidung

Ausgangspunkt ist eine statische lokale Browseranwendung mit TypeScript,
Vite, Three.js und eigenen Shadern. Gemeinsamer Szenenzustand enthält Kamera,
Datensatzkennung, Seed und Parameter. Rendering, Datenimport und Bedienelemente
werden so getrennt, dass jede Ansicht denselben Kern nutzt. Wähle nur so viele
Module wie für diese Trennung nötig. Ein zusätzlicher UI-Framework-Einsatz
braucht einen konkreten Nutzen.

Abhängigkeiten nach der Umgebungsprüfung auswählen, im Lockfile fixieren und
eine konsistente Installationsanleitung pflegen. Keine Abhängigkeit von externen
CDNs zur Laufzeit. Die vorführbare Version soll nach lokaler Installation ohne
Internetzugang arbeiten können.

## Aktueller Stand bei Übergabe

- Vorbereitung abgeschlossen: Originalarchive und Paper heruntergeladen,
  Hashes ermittelt, Archivstruktur, Shader, README und SOP-Dateien untersucht.
- Vorläufiges Dateninventar liegt in references/inspection-2026-10-26.json.
- Die Originalprogramme wurden nicht ausgeführt.
- Die VM wurde nicht aufgerufen. Keine Anwendung implementiert.
- M0 bis M5 sind auf der VM noch offen.

## Laufender Status — von Codex fortschreiben

| Phase | Status | Konkreter Nachweis / offene Prüfung |
|---|---|---|
| M0 | erfüllt | ARM64 Ubuntu 26.04.1, Node 24.21.0/npm 11.19.0, Python 3.14.4; drei Quellen hashverifiziert; Fachkonventionen in RESEARCH |
| M1 | erfüllt | WebGL2/GLSL kompiliert; Diagnosepixel 120→132 belegt veränderte Fenstertiefe und Verdeckung auf Chromium/SwiftShader |
| M2 | erfüllt | GPU-Pixel gegen unabhängige Verdeckungsungleichung: nah/mittel/gesättigt, Rollenwechsel, konstante Halos; Quellenreview bestanden |
| M3 | erfüllt | SOP-Integrität für 5 Original-Liniendateien; Knoten/Office/Fiber vollständig im Browser gerendert; SHA, Counts, Bounds geprüft |
| M4 | erfüllt | Drei Ansichten, zwei Grenzfälle, Seitenschema mit Rollenwechsel, getrenntes Cueing/Diagnose; 1280×720 und 1920×1080 aufgenommen/geprüft |
| M5 | lokal erfüllt; Präsentationsgerät offen | Offline-Neuinstallation, Build, 14 Node-Tests und 6 Browserprüfungen; Produktionsneustart/Export bestanden; Desktop-/Beamercheck explizit offen |

Aktueller nächster Schritt: Auf dem Präsentationsrechner den dokumentierten Demo-Ablauf inklusive Resize und PNG prüfen. Lokaler Entwicklungsauftrag M0–M5 abgeschlossen; keine Veröffentlichung.

## Wesentliche Entscheidungen

Nur Entscheidungen mit Auswirkung auf wissenschaftliche Aussage, Architektur
oder Umfang hier ergänzen: Datum, Entscheidung, Grund und praktische Konsequenz.
Keine zweite Statusdatei anlegen.

### 26.10.2026 — M0 Architekturreview

Direktes WebGL2 statt Three.js: orthografische Projektion und wenige Polylinien benötigen keinen Szenengraph; eigene Shader und expliziter Tiefentest erleichtern wissenschaftliche Messungen. TypeScript/Vite bleiben, kein UI-Framework. Offline-Ressourcen werden lokal vorbereitet, keine CDNs. S/L sind vollständige Breiten in Framebuffer-Pixeln; dmax und delta verwenden Fenstertiefe. Orthografisch gilt nach Kamerarotation z_window=0.5+z_camera/4. Analytisches Profil, Bildschirmbreite, Miter-Joins und begrenztes Cueing sind eigene Abweichungen. Risiken: Raster-Ties, Joins an scharfen Ecken, CPU/GPU-Speicher großer Daten, browserabhängige Software-Grafik. Historische x86-Binärdateien auf ARM64 nicht ausgeführt.

Git-Identität lokal vorhanden (Georg Gallitz). Die vorgefundenen unversionierten Vorgabedateien werden als explizite Projektgrundlage aufgenommen; Originalarchive und lokale Daten bleiben ignoriert.

### M1 — Grafikprobe und Review

Chromium Headless Shell / Google Chrome for Testing 156.0.8078.4 (Build 1248; mit --version ausgelesen), WebGL 2.0, ANGLE Vulkan 1.3.0 / SwiftShader LLVM 10.0.0. Keine Hardwarebeschleunigung behauptet. Fehlende dynamische Bibliotheken ausschließlich als Projektdateien unter .cache/browser-libs entpackt; keine Systempakete installiert. Lokaler Testserver Port 4178, kein fremder Server wiederverwendet. GLSL-Review behob unterschiedliche int-Uniform-Präzision. Gemessene Diagnosewerte bei delta=.06: schwarze Mitte 120/255 (z=.47), weißes Fragment r=5.5px 132/255 (z≈.51714). Eine unveränderte Tiefe könnte dieses Ergebnis nicht liefern. Unabhängiger Quellenreview bestätigt den Kern; Cueing korrigiert, sodass nur L variiert und S konstant bleibt.

### M2 — wissenschaftlicher Kern

Kontrollprobe unter /probe.html. S=28px, L=4px, dmax=.12: delta=.001 ergibt keinen Zusatzrand, delta=.06 Radius 7px (5px Zusatzrand), delta=.2 Radius14px (12px Zusatzrand). GPU prüft eindeutige Pixelzentren beiderseits der Grenzen, Rollenwechsel und konstante herkömmliche Halos. Keine Vollbildähnlichkeit als Orakel. Eigenständiger Review bestätigte Gleichung und Tiefenraum; feste Pixelbreiten/Zoomverhalten und analytische Enden bleiben explizite Abweichungen. Miter-Verbindungen sind begrenzt und nicht als Paper-Geometrie ausgegeben.

### M3 — Daten und gemeinsame Kamera

Eigener SOP-v0-Leser gegen Original-I/O-Quelle und unabhängiges Python-Inventar geprüft. Alle fünf Linienoriginale gelesen, Dragon explizit als Punkte abgewiesen. Browser lädt Knoten 752 Punkte/1 Linie, Office 278.849/786 und Fiber 548.013/17.176 vollständig; keine Auswahl. Für die Browserdarstellung: Schwerpunkt der Bounds auf Ursprung, uniforme Skalierung längster Achse auf 1,7; Rohdaten unverändert. Browser verifiziert SHA-256, Counts und Bounds vor Normalisierung. Das Fiber-Zusatzattribut wird nur auf Endlichkeit geprüft. Private Importgrenze 64MiB/600.000 Punkte/100.000 Sequenzen, Renderer 600.000 Segmente; Water wird im Parser getestet, nicht als Browserpreset unterstützt. Vorallokierte Float32-Geometrie begrenzt Speicherspitzen. Original-README bleibt lokal verlinkt. Gemeinsame Kamera über alle Methoden nachgewiesen; Reset reproduzierbar.

### M4 — Lehranwendung und unabhängiges Review

Verstehen/Vergleichen/Grenzen sind reproduzierbare Vortragszustände mit Front- und Schrägkamera. Vergleich als große Einzelansicht; Methodenwechsel bewahrt Daten/Kamera/Breiten. Grenzfälle Verdeckung und exakte Tiefengleichheit getrennt. Seitenschema bildet auch negative delta korrekt auf den jeweiligen Vordergrund ab; ungültiges Orakel bei Kameraänderung/Cueing numerisch ausgeblendet. Diagnose hat Grauwertlegende. Tastatur-, Zeiger- und Zoomsteuerung, Resize, Importfehler und Wiederwahl importierter Daten geprüft. Ruhige monochrome Darstellung bei 1280×720/1920×1080 visuell geprüft; die wesentlichen Regler bleiben sichtbar. VM hatte keine Fonts: private Testschrift über Fontconfig nur für den Browserprozess, keine Änderung der App-Schriftvorgabe.

Unabhängige Reviews korrigierten Cueing im Linienmodus, das Seitenschema bei Rollenwechsel, gespeicherte Importdaten und Punktbudget vor Objektallokation. Zusätzlich wurde der unveränderte aktive Tiefen-/Farbkern des Originalfragmentshaders mit adaptierter GLSL-Syntax und analytisch ersetztem Profil/Endmaske ausgeführt. Er stimmt in den geprüften Fällen mit dem unabhängigen Orakel überein; keine Behauptung von Textur-/Demo-Pixelidentität.

### M5 — Vortragsfassung und Abschlussreview

Start-/Produktionsanleitung und Zwei-bis-drei-Minuten-Demo im README. Lokale Cache-Neuinstallation ohne Netzwerk, Typprüfung/Build und vollständiger Ablauf gegen neu gestarteten Produktionsserver bestanden. Kontrollprobe im Mehrseitenbuild enthalten; vorbereitete Originaldaten im dist, keine CDN-Laufzeitabhängigkeit. 14 Node-Fälle, sechs Browserfälle; zusätzlicher gezielter Produktionslauf der Kernregression. Abschließender unabhängiger Dokumentations-/Packagingreview fand keine blockierende Diskrepanz.

Die tatsächliche Bildprüfung entdeckte nach dem ersten bestandenen Ablauf einen Office-Streifenfehler an lokalen blickparallelen Tangenten; Ursache behoben und sowohl kleine Regressionsszene als auch Bild-Bounds gegen normalisierte Originale ergänzt. Kein schwächerer Test oder umetikettiertes Gate. Vollständige Nachweise, behobene Fehler und Grenzen in VALIDATION; wissenschaftliche Interpretation in RESEARCH.

Offen bleiben normaler Präsentationsbrowser, dessen Grafiktreiber und Beamer; automatisierte Grafikbelege stammen ausdrücklich aus SwiftShader. Keine Hardware-GPU- oder Wahrnehmungsevaluation behauptet. Alle Meilensteine lokal versioniert, keine Roharchive/Binärprogramme/Originaldaten eingecheckt, kein Push.
