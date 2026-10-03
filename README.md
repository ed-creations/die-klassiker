# Persönliches Meme-Soundboard

Eine schlanke, deutschsprachige PWA für das persönliche Hochzeitsgeschenk. Die
Anwendung ist eine statische Vanilla-JavaScript-Seite ohne Backend, Accounts,
Analytics oder Mikrofonaufnahmen.

## Lokal testen

```sh
npm test
npm run validate
npm run build
```

Für Browser- und Service-Worker-Tests die erzeugte Seite über einen lokalen
HTTP-Server öffnen, nicht direkt über `file://`.

## GitHub Pages

Pull Requests führen Tests und Katalogprüfung aus, veröffentlichen aber nichts.
Für eine Veröffentlichung: im Repository unter **Actions** den Workflow
**Validate and deploy** auswählen und **Run workflow** auf dem Branch `main`
anklicken. Pushes auf `main` veröffentlichen nicht automatisch.

Die Seite wird unter der standardmäßigen GitHub-Pages-Projektadresse verfügbar,
typischerweise `https://USERNAME.github.io/REPOSITORY-NAME/`.

## Sounds ersetzen

Die drei WAV-Dateien im Ordner `audio/`, die drei Vorschaubilder in `images/`
und die Einträge in `sounds.json` sind
temporäre Entwicklungsbeispiele. Der finale Soundkatalog kann später ersetzt
werden, ohne Anwendungscode zu ändern. Danach `npm run validate` ausführen und
den Workflow manuell starten.
