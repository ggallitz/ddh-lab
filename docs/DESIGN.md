# Gestaltung: wissenschaftliches Visualisierungswerkzeug

## Charakter

Ruhig, präzise und funktional. Die Visualisierung ist der Hauptinhalt.
Orientierung: wissenschaftliche Grafiksoftware und interaktive Paper-Abbildungen.

- Weißer Renderhintergrund, schwarze Ergebnislinien, dezente graue Trennlinien.
- Eine gedeckte Akzentfarbe für aktive Bedienzustände. Diagnosefarben nur mit
  klarer Legende; die normale Ergebnisdarstellung bleibt monochrom.
- Lokal verfügbare Systemschrift, moderate Schriftgewichte. Zahlen tabellarisch;
  Symbole/Formeln bei Bedarf in passender mathematischer Darstellung.
- Rechteckige, kompakte Bedienelemente. Keine Verläufe, großen Schmuckkarten,
  Schatteneffekte, Chatblasen, Emojis, dekorativen Illustrationen oder
  automatisch laufenden Kamerafahrten.
- Achsen, Maßeinheiten und Bildunterschriften unmittelbar an der Darstellung.
- Nutzeroberfläche zunächst Deutsch. Fachbegriffe wie DDH und Depth Cueing
  dürfen bestehen bleiben. Texte zentral halten, damit Englisch später leicht ist.

## Aufbau

Schmale Titel-/Werkzeugzeile; Ansichten Verstehen, Vergleichen und Grenzen;
große Zeichenfläche; kompakter Parameterbereich; kurze Bildunterschrift.
Die App startet direkt mit einer sinnvollen Szene. Keine zusätzliche Startseite.

### Verstehen

Zwei-Linien-Szene als Hauptbild. Eine kleinere, klar als schematisch bezeichnete
Seitenansicht zeigt den Tiefenabstand. Ein zusätzlicher Diagnosemodus kann das
Tiefenprofil erklären. Originalgeometrie und manipulierte Fragmenttiefe müssen
unterscheidbar bleiben. Grundbedienung: Tiefenabstand, Modus, Zurücksetzen.

### Vergleichen

Umschaltbare große Ansicht oder nebeneinander dargestellte Vergleichsbilder mit
identischer Kamera. Bei zu geringer Breite die große Einzelansicht bevorzugen.
Datensatzquelle, Modus und aktives Depth Cueing eindeutig beschriften.

### Grenzen

Wenige vorbereitete Fälle mit je einer Frage. Beispielsweise:
„Welche Struktur bleibt hinter dem Vordergrundbündel verdeckt?“ Ein gespeicherter
anderer Blickwinkel kann die verborgene Geometrie zeigen.

## Prüfkriterien

- Bei 1280 × 720 Pixeln sind Hauptszene, Modus und die wesentlichen Bedienelemente
  ohne Scrollen sichtbar; Layout auch bei 1920 × 1080 prüfen.
- Gewöhnliche Beschriftungen mindestens 16 CSS-Pixel; Präsentationsmodus kann
  sie vergrößern. Keine wichtigen Aussagen in winzigen Fußnoten.
- Kein Überlappen oder Abschneiden von Beschriftungen und Reglern.
- Bildproportionen stimmen nach Fenstergrößenwechseln.
- Jeder Regler besitzt eine eindeutige Bezeichnung und sichtbaren Wert.
- Bedeutung hängt nicht allein von Farbe ab. Bedienelemente per Tastatur nutzbar.
- Jeder Vortragszustand ist mit wenigen eindeutigen Aktionen erreichbar und
  mit einem Klick wiederherstellbar.

## Vorführung

Etwa zwei bis drei Minuten: Tiefenabstand in der Zwei-Linien-Szene ändern;
zur Bündelszene wechseln; Modi bei fester Kamera vergleichen; optional Depth
Cueing isolieren; einen Grenzfall zeigen. Gespeicherte Zustände machen diesen
Ablauf reproduzierbar. Ein kurzer Mitschnitt kann später dieselbe Abfolge sichern.

## Umgesetzter Stand

Drei Tabulatoransichten starten unmittelbar im Renderer. Methodenvergleich als umschaltbare große Ansicht mit gemeinsamem Zustand; keine redundanten Vergleichskameras. Zwei Grenzfall-Presets (Verdeckung/Tiefengleichheit), Front-/Schrägkamera und globales Reset machen die Vorführung reproduzierbar. Parameter zeigen Einheiten/Werte. Diagnoselegende und Quellen-/Auswahlkennzeichnung stehen an der Zeichenfläche. Aufnahmen bei1280×720 und1920×1080 wurden geprüft; Hauptszene, Methodenwahl und Kernregler sind ohne Scrollen erreichbar. Ausführliche Herkunft und Grenzen liegen in aufklappbaren Bereichen.
