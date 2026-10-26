# Startauftrag: DDH-Labor autonom umsetzen

Du arbeitest in Georgs lokalem VM-Projekt. Ziel ist eine wissenschaftlich
nachvollziehbare, vorführbare Umsetzung zu „Depth-Dependent Halos“ von
Everts et al. (2009). Die Anwendung soll dem Verständnis dienen und eine kurze
praktische Vorführung im Visual-Computing-Seminar ermöglichen.

Führe den Auftrag gemäß AGENTS.md und docs/PLAN.md bis zur überprüften Version
M5 aus. Zwischen Meilensteinen ist keine neue Zustimmung nötig. Umfang und
Qualitätskriterien sind verbindlich; Implementierungsdetails entscheidest du.

## Beginne konkret

1. Prüfe das vorhandene Projekt und seinen Git-Status. Bewahre vorhandene Arbeit.
   Erfasse Betriebssystem, CPU-Architektur, Node/npm, Python und die tatsächlich
   verfügbare Browser-/Grafikumgebung. Erfinde keine Versionen oder GPU-Fähigkeiten.
2. Lies die mitgelieferten Vorgaben. Beziehe und inventarisiere die Originalquellen
   mit den Skripten. Ergänze docs/RESEARCH.md nur um neue wesentliche Erkenntnisse.
3. Lies zuerst die relevanten Paperstellen und Originalshader. Kläre die
   Parameterkonventionen und wähle einen expliziten Tiefenraum. Dokumentiere
   Paper, Demo-Verhalten und eigene Entscheidungen getrennt.
4. Erstelle eine minimale technische Probe: zwei Linien, eigene Shader und
   messbar veränderte Fragmenttiefe. Prüfe WebGL2 im ausführbaren Zielkontext.
5. Implementiere danach den Renderer und die wenigen Kontrollszenen. Sichere
   das Verhalten anhand unabhängig hergeleiteter Erwartungen ab.
6. Ergänze lokale Originaldaten, die Erkläransicht, die Gestaltung und die
   vorbereiteten Vortragszustände. Prüfe den vollständigen Ablauf.

## Erwartungen an das Ergebnis

- Drei Ansichten: Verstehen, Vergleichen und Grenzen.
- Modi: einfache Linien, herkömmliche Halos, DDH. Depth Cueing getrennt.
- Identische Daten und Kamera im Methodenvergleich; reproduzierbarer Reset.
- Synthetische Beispielszenen sowie lokal ladbare Original-Liniendaten.
- Weiße Zeichenfläche, schwarze Linien, sachliche Typografie und kompakte
  Bedienelemente gemäß docs/DESIGN.md.
- Nachvollziehbare Abgrenzung zwischen Nachimplementierung und Lehrergänzungen.
- PNG-Export, dokumentierter Start und eine vorbereitete Vorführung.

Arbeite durch alle erreichbaren Meilensteine. Wenn GPU-Prüfungen in der VM
wirklich unmöglich sind, liefere die übrigen Bestandteile mit präzisem Status
und einer kurzen ausführbaren Prüfung für den Präsentationsrechner. Behaupte
in diesem Fall keine vollständig validierte Grafikimplementierung.

Die historische Desktop-Anwendung darf hilfreich sein, ist aber keine
Voraussetzung. Eine zeitaufwendige Wiederherstellung ihrer alten Laufzeit gehört
nicht zum Auftrag. Plane keine Betriebssystemänderungen nur für dieses Programm.
