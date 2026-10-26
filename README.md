# Depth-Dependent Halos Lab

Startpaket für Georg Gallitz · Visual Computing Seminar · Stand 26.10.2026

## Was dieses Paket ist

Ein konkreter Entwicklungsauftrag für Codex mit Quelleninventar, Arbeitsplan,
Gestaltung und Qualitätskriterien. Die Anwendung ist noch nicht implementiert.
Die Originalarchive und das Paper wurden für die Vorbereitung heruntergeladen
und untersucht. Ihre Programme wurden nicht ausgeführt. Auf Georgs VM wurde
noch nichts eingerichtet oder getestet.

## Ziel der Anwendung

Eine lokal laufende wissenschaftliche Lehrdemo mit drei Ansichten:

1. **Verstehen:** zwei sich im Bild kreuzende Linien, ein Regler für ihren
   Tiefenabstand und eine schematische Seitenansicht.
2. **Vergleichen:** identische Daten und Kamera mit einfachen Linien,
   herkömmlichen Halos und DDH; zusätzliches Depth Cueing separat schaltbar.
3. **Grenzen:** wenige vorbereitete Fälle mit verdeckten oder unübersichtlichen
   Strukturen und einer klaren Untersuchungsfrage.

Synthetische Szenen liefern kontrollierte Beispiele. Mindestens ein kleiner
Original-Knotendatensatz und die Office-Strömung sollen lokal importierbar sein.
Danach wird der mitgelieferte Fiber-tracts-Datensatz erprobt. Quelle, Datentyp,
eventuelle Auswahl und tatsächliche Anzahl dargestellter Elemente sind sichtbar.
Gespeicherte Ansichten und PNG-Export unterstützen einen kurzen Seminarvortrag.

## Einrichtung auf der VM

Das ZIP enthält bereits den obersten Ordner `ddh-lab`. Lade das Paket auf die VM.
Die folgenden Befehle nehmen an, dass es unter
`~/Downloads/DDH-Lab-Startpaket.zip` liegt und `~/projects/ddh-lab` noch nicht
existiert. Bei einem anderen Downloadpfad nur diesen Pfad anpassen.

```bash
mkdir -p "$HOME/projects"
python3 -m zipfile -e "$HOME/Downloads/DDH-Lab-Startpaket.zip" "$HOME/projects"
cd "$HOME/projects/ddh-lab"
git init
codex --version
codex --help
```

Dann Codex im Projekt starten. Die aktuell dokumentierte Variante mit
automatischer Genehmigungsprüfung lautet:

```bash
codex --sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=auto_review
```

Die Unterstützung dieser Einstellung in deiner installierten CLI wurde nicht
geprüft. Falls sie nicht unterstützt wird, den dokumentierten Basisstart nutzen:

```bash
codex --sandbox workspace-write --ask-for-approval on-request
```

Im Codex-Chat anschließend eingeben:

> Lies AGENTS.md und CODEX_START.md. Führe den dort beschriebenen Auftrag durch
> M0 bis M5 eigenständig aus. Prüfe die Abschlusskriterien jeder Phase und gehe
> bei erfüllten Kriterien ohne erneute Rückfrage zur nächsten über. Beginne jetzt.

Auto-review entscheidet über notwendige Genehmigungen; es erweitert die
Sandbox nicht. Der Projektauftrag erlaubt lokale Entwicklung und Commits.
Technische Genehmigungen können trotzdem nötig sein. Die globale
Codex-Konfiguration muss für diesen Start nicht geändert werden.

## Originalmaterialien reproduzierbar bereitstellen

Diese Schritte kann Codex selbst übernehmen:

```bash
python3 scripts/fetch_references.py --extract
python3 scripts/inspect_references.py
```

Das erste Skript lädt drei festgelegte öffentliche Quellen, verifiziert Größe
und SHA-256 und entpackt die ZIPs unter `references/upstream/`. Das zweite
untersucht die lokalen Archive und schreibt `references/local-inspection.json`.
Es wird kein Originalprogramm gestartet. Die historischen Ressourcen werden
nicht mit diesem Starterpaket neu verteilt.

Wenn ein Download nicht möglich ist, die drei Dateien anhand der URLs in
`references/sources.json` manuell nach `references/downloads/` legen und die
Befehle erneut ausführen. Abweichende Prüfsummen werden untersucht und nicht
automatisch als gültig übernommen.

## Technischer Ausgangspunkt

Empfehlung: TypeScript, Vite und Three.js mit eigenen Shadern; eine kleine
Oberfläche reicht. Codex prüft zuerst WebGL2 und die veränderte Fragmenttiefe
in der tatsächlichen Umgebung. Eine begründete schlankere Alternative ist
zulässig und wird in `docs/PLAN.md` festgehalten. Versionen erst nach Prüfung
auswählen und im Lockfile festschreiben. Das spätere Ziel ist ein dokumentierter
Start mit `npm ci` und `npm run dev`; diese Befehle existieren im Starterpaket
noch nicht.

## Dateien und Zuständigkeit

| Datei | Zweck |
|---|---|
| `AGENTS.md` | Dauerhafte Arbeitsvereinbarung für Codex |
| `CODEX_START.md` | Vollständiger Startauftrag |
| `docs/PLAN.md` | Meilensteine, Status und wesentliche Entscheidungen |
| `docs/RESEARCH.md` | Geprüfte Ressourcen, offene Fragen, fachliche Fundstellen |
| `docs/DESIGN.md` | Wissenschaftliche Gestaltung und Bedienung |
| `docs/VALIDATION.md` | Aussagekräftige fachliche und technische Prüfung |
| `references/sources.json` | URLs, Größen und SHA-256 der geprüften Quellen |
| `references/inspection-2026-10-26.json` | Bei der Vorbereitung erzeugtes Archiv-/Dateninventar |
| `scripts/` | Bezug und Inspektion der Quellen |

## Geprüfte Dokumentation

- [Codex CLI](https://developers.openai.com/codex/cli/reference)
- [Codex Auto-review](https://developers.openai.com/codex/sandboxing/auto-review)
- [AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Three.js ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)

Diese Quellen wurden am 26.10.2026 geprüft. Die lokale VM-/CLI-Konfiguration
bleibt separat zu prüfen.
