# Quellenprüfung und offene wissenschaftliche Fragen

Stand: 26.10.2026. Dieses Dokument trennt beobachtete Ressourceninhalte von
Empfehlungen für unsere Umsetzung. Noch keine Grafikprüfung auf Georgs VM.

## Primärquellen

| Kennung | Quelle | Verwendung |
|---|---|---|
| P | [Originalpaper, Everts et al. 2009](https://tobias.isenberg.cc/personal/papers/Everts_2009_DDH.pdf) | Fachlicher Ausgangspunkt |
| W | [Projektseite](https://tobias.isenberg.cc/VideosAndDemos/Everts2009DDH) | Links, ergänzende Bilder, Videos und Folien |
| D | [DepthDependentHalos.zip](https://tobias.isenberg.cc/personal/demos/DepthDependentHalos.zip) | Ausführbare Programme, Shader, Texturen, Daten, README |
| I | [sop_lines_io.zip](https://tobias.isenberg.cc/uploads/VideosAndDemos/sop_lines_io.zip) | C-/Python-Beispiele für Datenformate |

URLs, Dateigrößen und SHA-256 sind in references/sources.json festgeschrieben.
Die Datenstatistiken wurden direkt aus den enthaltenen SOP-Dateien berechnet.
Die historische Anwendung wurde nicht gestartet; es wurden keine Aussagen zu
ihrem tatsächlichen Laufverhalten auf heutigen Systemen geprüft.

## Was tatsächlich im Demo-Archiv liegt

Das ZIP enthält 89 Einträge einschließlich Verzeichnissen. Es enthält
plattformabhängige Programme, sechs Datensatzverzeichnisse und jeweils acht
GLSL-Dateien pro Plattform. Ein vollständiger Host-Anwendungsquellcode liegt
im untersuchten Archiv nicht vor. Die vorhandenen Shader sind dennoch eine
wertvolle zusätzliche Implementierungsreferenz.

Relevante Pfade relativ zum entpackten Demo-Archiv:

- `illuvis-program/README.txt`
- `illuvis-program/linux/shaders/vertexshader-lines.glsl`
- `illuvis-program/linux/shaders/fragmentshader-lines.glsl`
- `illuvis-program/linux/shaders/*-filter.glsl`
- `illuvis-program/linux/textures/`
- `illuvis-program/data/<Datensatz>/description.ini`

Die INI-Dateien enthalten Datentyp, Dateiname, Renderparameter und teilweise
Kameraeinstellungen. Diese Parameter sind Konventionen der Demo und nicht
automatisch identisch mit gleichnamigen Papergrößen.

### Tatsächlich enthaltene Datensätze

| Verzeichnis | Typ laut INI | Sequenzen | Punkte insgesamt |
|---|---|---:|---:|
| Air flow in office | Linien | 786 | 278.849 |
| Fiber tracts | Linien | 17.176 | 548.013 |
| Knot 10_136 | Linie | 1 | 752 |
| Knot 9_31 | Linie | 1 | 960 |
| Pointdata - Dragon | Punkte | 1 Speicherblock | 437.645 |
| Water flow | Linien | 1.400 | 1.301.445 |

„Punkte“ bezeichnet hier die gespeicherten Vertices, keine Dreiecke. Der Dragon
ist eine Punktwolke und darf trotz einer SOP-Sequenz nicht als durchgehende
Linie interpretiert werden. Das vollständige maschinenlesbare Inventar enthält
Dateipfade, Headerdaten, Bounding Boxes, Hashes und Dateigrößen.

Die Demo-README nennt folgende Herkunft beziehungsweise Abweichungen:

- Office-Flow: Stromlinien aus dem mit VTK 5.4.2 verteilten Office-Vektorfeld.
- Fiber tracts: anderer Datensatz als im Paper, aus dem Patient-A-Material des
  VIS-2009-Wettbewerbs. Die README enthält die zu bewahrende Anerkennung der
  Datenbereitsteller.
- Knoten: Datenbezug auf The Knot Server.
- Dragon: Stanford Computer Graphics Laboratory.
- Water flow: Daten von Martin Rumpf; geringere Vertexanzahl als im Paper.

Die ursprünglichen Herkunftswebseiten wurden nicht zusätzlich auf heutige
Erreichbarkeit oder Nutzungsbedingungen geprüft. Für den praktischen Teil
zunächst die vorhandenen Dateien verwenden und ihre README-Hinweise bewahren.

### Zusatzattribut der Faserdaten

Die SOP-Datei enthält ein Float-Zusatzattribut pro Punkt. Der bei der Inspektion
gemessene Bereich reicht von 0 bis etwa 1184,18. Seine Bedeutung wurde nicht
gesichert. Es darf insbesondere nicht allein wegen des Paperkontexts als
unskalierte Fractional Anisotropy bezeichnet werden. Der Linienrenderer benötigt
für die Grunddarstellung nur die Koordinaten.

## Datenlesecode

Das I/O-Archiv enthält 18 Einträge einschließlich Verzeichnissen und Beispiele
in C sowie Python mit NumPy. Das Python-Werkzeug `lineconv.py` und Teile seiner
Module verwenden Python-2-Syntax. Im C-Code wird unter anderem eine im Archiv
nicht enthaltene `errorhandling.h` referenziert. Daraus folgt keine unmittelbar
ausführbare moderne Importpipeline.

Empfehlung: Format anhand dieser Quellen nachvollziehen und einen kleinen
modernen Reader entwickeln. Rohdateien erhalten, statt den Originalcode blind
auszuführen oder stillschweigend umzuschreiben.

Für die sechs geprüften SOP-Dateien gilt: little endian; Version 0; Magic
14600958; drei Koordinaten; Float32-Nutzdaten; Datenbeginn bei Byte 35.
Der ausgerichtete Header ist 32 Byte groß. Pro Sequenz folgt auf die Punktzahl
zuerst der Koordinatenblock und danach gegebenenfalls der Attributblock.
Alle Dateien wurden ohne verbleibende Datenbytes vollständig durchlaufen.
Die Skripte sind auf diese beobachtete Formatvariante begrenzt, keine allgemeine
Spezifikation aller möglichen SOP-Dateien.

## Fachliche Ausgangspunkte aus dem Paper

Relevante Stellen: §3.1 Überblick, §3.2 Streifengeometrie, §3.3 Fragmentfarbe und
Tiefenverschiebung, §3.4 Zusatztechniken, §4.3 Parameter, §4.4 Grenzen, Appendix A.
Der Kern verwendet einen Rendering-Pass mit Vertex- und Fragmentstufe. Weiße
Randfragmente erhalten eine veränderte Tiefe; die Eingabepolylinien bleiben
unverändert. Zusätzliches Depth Cueing wird getrennt untersucht.

### Bei der visuellen PDF-Prüfung beobachtete Inkonsistenzen

Auf PDF-Seite 6 (§4.3) widerspricht die gedruckte Breitenrelation der
Streifengeometrie. Auf PDF-Seite 8 (Gl. 4) ergeben die Nichtnull-Zweige unter
der naheliegenden Definition einer größeren Streifen- als Linienbreite negative
Halo-Breiten. Die Abbildung zeigt dagegen einen positiven Abstand.

Dies ist unsere konsistenzbasierte Beobachtung, kein bekanntes offizielles
Autoren-Erratum. Codex soll die Definitionen und Abbildungen selbst abgleichen
und eine nötige Interpretation ausdrücklich begründen. Eine eigene positive
Herleitung steht als zu prüfender Ansatz in VALIDATION.md.

## Was die Originalshader zusätzlich erkennen lassen

Die folgenden Punkte wurden direkt in D gelesen und sind vor einer Übertragung
zu klären:

1. **Tiefenraum:** Die Fragmenttiefe wird auf Basis der Fenster-/Depth-Buffer-
   Tiefe verändert. Dies ist kein unmittelbar metrischer Weltabstand.
2. **Breitenkonvention:** Unter der Annahme von UV-Randwerten 0 und 1 erzeugt
   der Vertex-Shader eine Gesamtbreite von `stripWidth / 2`. Ohne die
   Host-Aufbereitung von UVs und Uniforms ist ein Fehler nicht belegt.
3. **Depth Cueing:** Die Demo verwendet die Konstanten 0,48 und 0,24 in einer
   tiefenabhängigen Breitenfunktion. Ihr gültiger Tiefenbereich muss verstanden
   werden. Eine neue Normalisierung oder Begrenzung ist eine eigene Entscheidung.
4. **Texturen:** Linienprofil und Endmaske werden aus Texturen gelesen. Filterung,
   Sampling und Koordinatenkonventionen sind für identisches Verhalten relevant.
   Analytische Schwarz-Weiß-Grenzen können unseren ersten Kern vereinfachen;
   diese Vereinfachung muss benannt werden.
5. **Aktiver Codepfad:** Der aufgerufene Verschiebungsverlauf ist linear; eine
   ebenfalls vorhandene Stufenfunktion wird in diesem Shader nicht aufgerufen.

Aufgabe für M0/M2: eine kleine Zuordnung Papergröße → Demoparameter → unsere
Definition → messbarer Effekt ergänzen. Keine behauptete Pixelidentität ohne
entsprechende Prüfung. Der Arbeitstitel ist „papernahe Nachimplementierung“.

## Originalprogramm und VM

Die Binärdateiprüfung ergab für `linux/illuvis64` x86-64 ELF und für
`osx/illuvis` ein 32-Bit-Intel-Mach-O. Die CPU-Architektur und Grafikfähigkeiten
von Georgs VM sind noch nicht geprüft. Moderne Laufzeitkompatibilität ist offen.
Ein Startversuch kann nach Prüfung der Voraussetzungen nützlich sein; das
Modernisieren des historischen Programms ist kein Projektmeilenstein.

## Herkunft und Weitergabe

Auf der Projektseite wird CC BY 4.0 für bestimmte dort neu erstellte Bilder
genannt. Das ist keine ausgewiesene Pauschallizenz für Archive, Quellcode oder
Datensätze. Im I/O-Code stehen Copyright-Hinweise. Dieses Paket dokumentiert
die Quellen und lädt sie für die lokale Analyse direkt von der Autorenseite.
Vor einer späteren öffentlichen Weitergabe Originalrechte gesondert klären.

## Erneute lokale Prüfung am 26.10.2026

Alle drei Referenzen wurden auf der VM heruntergeladen und gegen die festgelegten
Größen und SHA-256 geprüft. `scripts/inspect_references.py` bestätigt sämtliche
oben genannten Counts, Bounds und fehlende Restbytes erneut; der Nachweis liegt
in `references/local-inspection.json`. Kein Originalprogramm wurde ausgeführt.
Der SOP-Leser wurde zusätzlich gegen `lines_io/python/dataio/sopfile.py` gelesen:
Attribute folgen tatsächlich dem vollständigen Koordinatenblock jeder Sequenz.

### Verbindliche Definitionen für die Nachimplementierung

Das [Paper](https://tobias.isenberg.cc/personal/papers/Everts_2009_DDH.pdf),
§3.2–3.3, beschreibt die Gesamtstreifenbreite und lineare Verschiebung weißer
Fragmente; schwarze Fragmente behalten ihre Tiefe. Die gedruckte Breitenrelation
in §4.3 und die Vorzeichen in Appendix A passen bei dieser Definition nicht zur
Geometrie. Dies bleibt eine eigene Konsistenzbeobachtung, kein Autoren-Erratum.

| Größe | Originalshader | Explizite Lab-Konvention |
|---|---|---|
| Gesamtstreifenbreite S | bei UV 0/1: `stripWidth/2` | vollständige Breite quer zur Mittellinie |
| Schwarze Linienbreite L | `strokeWidth` plus Textursampling | vollständige analytische schwarze Breite, 0 < L < S |
| Maximalverschiebung dmax | `stripDepth` | positive Fenster-/Depth-Buffer-Tiefe, dimensionslos |
| Tiefenabstand delta | Differenz von `gl_FragCoord.z` | derselbe Fensterraum, größere Werte weiter hinten |

Direkt verifizierter Shaderpfad: `side=abs(2*(v-0.5))`; bei `stroke>0`
ist `gl_FragDepth=gl_FragCoord.z+side*stripDepth`, sonst unverändert.
Die Funktion `getDepthDisplacement2(x)=x` ist aktiv; die daneben vorhandene
Stufenfunktion wird nicht aufgerufen. Die Verschiebung beginnt am schwarzen
Rand also mit dmax*L/S, nicht mit null. Eine neu am schwarzen Rand beginnende
Rampe wäre eine andere Technik. Originalprofiltextur und Endmaske werden in
einem analytischen Kern nicht pixelidentisch reproduziert.

Die Demo-Cueing-Funktion multipliziert `strokeWidth` mit
`(1-a)+a*(1-(z-0.48)/0.24)`. Sie ist ohne Bereichsbegrenzung und damit außerhalb
des vorgesehenen Tiefenintervalls nicht als allgemeine Breitenregel geeignet.
Eine begrenzte, normierte Lab-Verjüngung muss als eigene Lehrergänzung gelten.

### Unabhängige Herleitung des Halo-Orakels

Eigene Herleitung für orthografische, rechtwinklig kreuzende gerade Linien ohne
Cueing: Ein weißes Vordergrundfragment im Abstand r von der Mittellinie verdeckt
den schwarzen Hintergrund genau dann, wenn seine Tiefe vor diesem liegt.
Damit gilt `z_front + 2*r*dmax/S < z_back`, also
`r < S*delta/(2*dmax)`. Weiße Fragmente existieren nur für `L/2 < r <= S/2`.
Die einseitige zusätzliche Trennung beträgt folglich
`h=max(0,min(S/2,S*delta/(2*dmax))-L/2)` für dmax>0.
Sie beginnt bei delta=dmax*L/S und sättigt bei delta=dmax.
Für dmax=0 und positiven Abstand entsteht der traditionelle konstante Rand
`(S-L)/2`; exakte Tiefengleichheit ist wegen des Tiefentests separat zu prüfen.
Das Orakel folgt aus der Sichtbarkeitsungleichung und den geometrischen Grenzen,
nicht aus einer Kopie der Shaderverzweigungen. Rastergrenzpixel bleiben durch
eine vorab festgelegte Pixeltoleranz auszunehmen.
