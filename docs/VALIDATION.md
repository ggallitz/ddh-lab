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
