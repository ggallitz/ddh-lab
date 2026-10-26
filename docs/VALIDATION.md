# Fachliche und technische Prüfung

## Was wir nachweisen wollen

Die Implementierung muss ausgewählte, vorab formulierte Erwartungen erfüllen.
Die Tatsache, dass das Programm läuft oder Bilder ähnlich aussehen, genügt nicht.
Prüfungen dienen der Implementierungskorrektheit; sie belegen keine allgemeine
Überlegenheit für menschliche Wahrnehmungsaufgaben.

## Erst explizite Definitionen

Codex dokumentiert die Bedeutung, Einheit und den Wertebereich von Linienbreite,
Streifenbreite und maximaler Tiefenverschiebung. Welt-, Kamera-, Clip- und
Fenstertiefe dürfen nicht stillschweigend gleichgesetzt werden. Der Tiefenabstand
für ein analytisches Beispiel und der Shader müssen im selben Raum arbeiten.
Besonders die Parameterabbildung zwischen Paper und historischer Demo prüfen.

## Unabhängige kleine Referenz

Nutze zuerst eine orthografische Kamera, zwei gerade sich kreuzende Linien,
festgelegte Tiefenrichtung, lineare Tiefenverschiebung, deaktiviertes Depth
Cueing und deaktiviertes Antialiasing. Leite erwartete Übergangspositionen
aus der gewählten Geometrie und den Sichtbarkeitsbedingungen her.

Ein geeigneter eigener Ansatz für die einseitige zusätzliche Halo-Breite ist
unter den oben genannten Bedingungen und d_max > 0:

    h = max(0, min(w_strip / 2,
                   w_strip * delta_depth / (2 * d_max)) - w_line / 2)

Dabei gilt w_strip > w_line > 0 und delta_depth >= 0. Dies ist eine eigene
konsistenzbasierte Herleitung, keine wörtliche Wiedergabe von Paper-Gl.(4).
Codex muss die Annahmen und Herleitung vor Verwendung als Orakel prüfen und
im Projekt erklären. Die wissenschaftlichen Auffälligkeiten stehen in RESEARCH.md.

Die Referenz darf nicht den Shadercode in einer anderen Sprache wiederholen.
Prüfe wenige erwartete Übergänge beziehungsweise eindeutige Pixelpositionen.
Lege eine aus Rasterauflösung und Position abgeleitete Toleranz vor dem Vergleich
fest. Vermeide empfindliche Vollbildvergleiche über unterschiedliche GPUs.

## Kernfälle

| Fall | Zu prüfende Erwartung |
|---|---|
| Gleiche bzw. sehr nahe Tiefe | Keine zusätzliche weiße Trennung benachbarter Linien |
| Mittlerer Tiefenabstand | Sichtbarer Übergang an analytisch erwarteter Position |
| Großer Tiefenabstand | Halo-Breite sättigt an der Streifengrenze |
| Vorder-/Hintergrund vertauscht | Sichtbare Verdeckungsbeziehung vertauscht sich |
| Herkömmliche Halos | Bei positiven Tiefenabständen konstante Randbreite unter fester Projektion |
| Depth Cueing aus | DDH-Kern funktioniert ohne Linienverjüngung |
| Modi umschalten | Datensatz, Kamera und gemeinsame Parameter bleiben gleich |

Exakte Tiefengleichheit und Rastergrenzen können Tie-Breaks erzeugen. Einen
konkreten solchen Fall gesondert dokumentieren, statt die generelle Prüfung
durch eine ungeprüfte Epsilon-Änderung zu erzwingen.

## Datenintegrität

- SOP: Header, Endianness, Offsets, Längen und Dateigrenzen prüfen.
- Counts und Bounding Boxes mit dem unabhängigen Inventar vergleichen.
- Punktwolken nicht als Polylinien interpretieren; description.ini beachten.
- Leere, zu kurze oder wiederholte Punkte und beinahe blickparallele Segmente
  behandeln, ohne ungültige Vektoren oder Grafikfehler zu erzeugen.
- Auswahlen dokumentieren und deterministisch erzeugen. Skalierung/Normalisierung
  beschreiben; Datensatzherkunft erhalten.
- Die Bedeutung eines Zusatzattributs erst nach belastbarer Klärung verwenden.

## Grafik und Bedienung

Eine tatsächlich gerenderte Aufnahme prüfen; Shaderkompilierung und
Browserkonsole auf Fehler prüfen. Gleiche Kamera, Reset, Größenwechsel,
Datensatzwechsel und PNG-Export gezielt durchgehen. Die Seitenansicht muss mit
der aktuellen Szene übereinstimmen. Build und Typprüfung durchführen; zusätzliche
Tests nur bei konkreten Risiken.

## Umgebungsnachweis

Für Grafiktests Browser, Betriebssystem, Renderingbackend und verfügbare
Hardware-/Softwarebeschleunigung festhalten, soweit zuverlässig auslesbar.
Headless-Tests und ein normaler Präsentationsbrowser sind getrennte Nachweise.
Ein fehlender GPU-Zugang ist ein offenes Gate, kein bestandener Test.
Unabhängige Import-, Dokumentations- und UI-Arbeiten trotzdem fortsetzen.

## Abschluss

Dokumentierter Neustart, funktionierender Offline-Demo-Ablauf nach Installation,
korrekter Export, kurze Bedienanleitung und Liste der bekannten Einschränkungen.
Ein unabhängiges Review konzentriert sich auf die fachlichen Übergänge und
verbleibenden Risiken. Keine weiteren Prüfschleifen ohne konkreten Anlass.

## Tatsächlich ausgeführt · 26.10.2026

### Umgebung und Reproduzierbarkeit

Ubuntu 26.04.1, Linux 7.0.0-38-generic, ARM64/aarch64, 4 sichtbare CPUs
(Vendor Apple; kein Modellname ausgegeben). Node 24.21.0/npm 11.19.0,
Python 3.14.4. Browser `--version`: **Google Chrome for Testing 156.0.8078.4**,
Playwright-Cachebuild 1248. WebGL2: `WebGL 2.0 (OpenGL ES 3.0 Chromium)`;
Backend: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (LLVM 10.0.0)
(0x0000C0DE)), SwiftShader driver)`. Dies ist Softwaregrafik; eine Hardware-GPU
oder interaktive Desktop-Browserprüfung wurde nicht nachgewiesen.

Fehlende Chromium-Bibliotheken und Fonts nur unter `.cache/browser-libs`
entpackt. `scripts/setup_browser_libs.py` dokumentiert die Wiederholung;
SHA-256 der lokalen DEBs in `.cache/browser-library-manifest.json`.
Keine Systempakete installiert, keine globale Fontkonfiguration verändert.
Ein erster Shaderlinkfehler (unterschiedliche int-Präzision) wurde behoben.
Die erste Aufnahme ohne Fonts wurde verworfen; spätere Bilder mit sichtbarer
Testschrift geprüft. Die normale App nutzt weiterhin die lokale Systemschrift.

Erfolgreich: `npm ci --offline --cache .cache/npm` nach vorhandener Installation
(Neuinstallation aus Cache), `npm test`, `npm run build`, `npm run test:gpu`,
`npm run test:production`. Der esbuild-Unterprozess der Neuinstallation war in
der Sandbox mit EPERM blockiert und lief nach regulärer Eskalation erfolgreich.
Vite 7.3.7/TypeScript 5.9.3/Playwright 1.58.2 im Lockfile; geprüfter npm-Auditstand:
keine bekannten gemeldeten Schwachstellen. Kein externer Laufzeitabruf nötig.

### Analytischer Kern

Orthografische Frontkamera, 512×512, AA/Cueing aus, L=4px, S=28px, dmax=.12.
Fenstertiefe ist `0.5+z_camera/4`; delta der Szene ist exakt ihre Differenz.
Aus der unabhängigen Sichtbarkeitsungleichung in RESEARCH folgt:

| Fall | Vorab erwartete Grenze ab Mittellinie | GPU-Ergebnis |
|---|---|---|
| DDH, delta=.001 | r=2px, kein zusätzlicher weißer Rand | Pixel bei r=2.5px schwarz |
| DDH, delta=.06 | r=7px, Zusatzrand 5px | r=5.5 weiß, r=9.5 schwarz |
| DDH, delta=.2 | r=14px, gesättigter Zusatzrand 12px | r=12.5 weiß, r=16.5 schwarz |
| Halo, delta=.001/.06 | r=14px, konstanter Zusatzrand 12px | r=12.5 weiß, r=16.5 schwarz |
| Linien | r=2px | außerhalb schwarz durch kreuzende Hintergrundlinie |
| DDH, Rollen vertauscht | Verdeckung vertauscht | Horizontalprobe weiß, Vertikalprobe schwarz |

Pixelzentren wurden vor Vergleich gewählt, keine Probe genau auf einer Grenze:
Nahfall 0.5px Abstand, mittlere/gesättigte Fälle mindestens 1.5px Abstand. Keine
nachträgliche Toleranzanpassung und kein empfindlicher Vollbildvergleich.
Diagnose: bei delta=.06 schwarze Mitte 120/255 (z=.47), weißes Fragment r=5.5
132/255 (z≈.51714). Das belegt geänderte Fragmenttiefe auch numerisch.

Exakte Tiefe gesondert: DDH zeigt im geprüften Randpixel keine weiße Trennung;
herkömmliche Halos ergeben bei gleicher Tiefe und `LESS` je nach Zeichenfolge
weiß bzw. schwarz. Keine Epsilon-Korrektur wurde eingesetzt.
Leere/einzelne/wiederholte Punkte und ganz blickparallele Segmente liefern keine
ungültige Rasterausgabe. Bei einem nur lokal blickparallelen Tangentenpaar wurde
in der Office-Aufnahme ein falscher langer Streifen gefunden: Offscreen-Sentinel
an einem mit gültigen Nachbardreiecken verbundenen Vertex. Der Vertex kollabiert
nun an seiner tatsächlichen Projektion. Eine kleine Teilsegment-Regression und
Pixel-Bounds-Prüfungen der vollständigen Originale sichern den Fehler ab.
Cueing wirkt separat auch im einfachen Linienmodus; S bleibt in Halo-Modi fest.

### Vergleich zum Originalshader

`tests/browser/original.spec.ts` liest die unveränderte lokale Originaldatei
zur Laufzeit. Nur GLSL-Schnittstellensyntax, analytisches Schwarz-Weiß-Profil
und konstante Endmaske werden angepasst. Der aktive Originalcode für
Verschiebung, `gl_FragDepth` und Farbe bleibt erhalten und wird wirklich auf
WebGL2 ausgeführt. Ergebnis für Radien .5/5.5/9.5px bei z_front=.47/z_back=.53:
**schwarz/weiß/schwarz**; gleiche Ausgabe bei umgekehrter Zeichenfolge.
Mit dmax=0: schwarz/weiß/weiß; vertauschte Tiefen: schwarz/schwarz/schwarz.
Keine Aussage über identische Texturfilterung, Hostparameter oder das Bild der
historischen Anwendung. Bei fehlenden Originalquellen ist der Test explizit
skipped, nicht bestanden.

### Daten und Bedienung

14 Node-Tests bestanden, keine Skips in dieser Umgebung. SOP-Testfälle prüfen
Header, unaligned Offset 35, Counts, Attribute nach Koordinatenblock, Endlichkeit,
Dateigrenzen, Restbytes, Punktwolkenablehnung und Punktbudget vor Allokation.
Alle fünf originalen Linienfiles stimmen exakt in Counts und Bounds mit dem
unabhängigen Python-Inventar überein. Dragon wird anhand des INI-Typs abgewiesen.
Faserattribut erhält keine erfundene Bedeutung.

Sechs Browserprüfungen bestanden auf Entwicklungs- und Produktionsserver:

- Seminarablauf, beide Grenzfälle, gemeinsame Kamera beim Methodenwechsel,
  getrenntes Cueing, globaler reproduzierbarer Reset.
- 1280×720 und 1920×1080: Aspect Ratio nach Resize, sichtbare Kernbedienung,
  Aufnahmen tatsächlich betrachtet; gewöhnliche UI-Schrift 16px.
- Vollständige Knoten-/Office-/Fiber-Daten: Counts sichtbar, SHA/Bounds im Loader
  geprüft, tatsächlich schwarze Pixel gelesen; Bildgrenzen gegen normalisierte
  Geometrie plus maximalen Miter-Offset geprüft. Keine Auswahl der Faserdaten.
- Point-Cloud-Deklaration und kaputter SOP-Import abgewiesen; erfolgreiche
  lokale Datei nach Szenenwechsel erneut gewählt.
- PNG heruntergeladen, Signatur und Bilddimensionen geprüft. Diagnose im
  Dateinamen markiert; Export enthält die Zeichenfläche ohne Bedienelemente.
- Seite neu geladen und Zustand reproduziert; externe Netzabrufe im Demo-Test
  blockiert. Eigene Entwicklungs-/Preview-Server nacheinander neu gestartet.
  Keine Browserseitenfehler im Demo-/Originaldatenablauf.

Aufnahmen: `.artifacts/app-1280.png`, `app-1920.png`, `data-knot.png`,
`data-office.png`, `data-fibers.png`, `core.png` (lokale, ignorierte Artefakte).
Gemessene Lade-/Renderlaufzeiten sind reine Testdiagnostik und keine publizierte
Performanzevaluation. Tests sind Implementierungsnachweise, keine Studie zur
menschlichen Wahrnehmung.

### Bekannte Abweichungen und offene Umgebungstore

- Orthografische Kamera und konstante Framebuffer-Pixelbreiten statt
  modellraumabhängiger Streifen. Analytisches Profil, flache Enden, begrenzte
  Miter-Joins und eigene begrenzte Cueing-Funktion. Kein Antialiasing.
- Scharfe Umkehrungen, nahezu blickparallele Segmente und vollständig verdeckte
  Geometrie bleiben Grenzen. Bei großen L/kleinen S kann Cueing den ganzen
  Streifen schwarz machen. Tiefenverschiebung und Kamera sind nicht metrische
  Abstandsmaße; Fensterraum ist ausdrücklich beschriftet.
- Point Clouds und Water-Rendering nicht implementiert. Water nur als
  Datenintegritätstest. Browserbudget 600.000 Punkte/Segmente; keine behauptete
  Unterstützung beliebig großer SOP-Dateien.
- Historische Binäranwendung weder ausgeführt noch modernisiert. Kein
  pixelidentischer historischer Renderer, keine Wahrnehmungs- oder
  Leistungsüberlegenheitsbehauptung.
- **Offen auf dem Präsentationsrechner:** normaler Desktop-Browser/Grafiktreiber,
  tatsächliche Beamerauflösung und Export dort. Ausführbare Prüfung:
  `npm ci`, Referenzen/Daten vorbereiten, `npm run build`,
  `npm run preview -- --port 4178 --strictPort`; dann den fünfteiligen Ablauf
  aus README inklusive Fenstergrößenwechsel und PNG durchgehen. Optional
  `DDH_CHROMIUM=/pfad/zum/zielbrowser npm run test:production` für denselben
  automatisierten Kern auf dem Zielrechner. Softwaretest ist kein bestandenes
  Hardware-/Präsentationsgate.
