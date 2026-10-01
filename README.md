# Mark van Dis Trouwfotografie

Deze website is geschikt voor GitHub Pages als statische site. Houd de bestaande
mapstructuur in de Mark van Dis-website repository intact; verplaats
`index.html`, `mijnwerk/` of `images/` niet.

## Publiceren via GitHub Pages

1. Push wijzigingen naar de branch van de bestaande website repository.
2. Open in GitHub **Settings → Pages**.
3. Kies bij **Build and deployment** voor **Deploy from a branch**.
4. Selecteer de branch waarop de website staat en de map `/(root)`, en sla op.
5. Wacht tot GitHub de website-URL toont. Bij een projectrepository is die
   doorgaans `https://gebruikersnaam.github.io/repositorynaam/`.

De portfolio-pagina's staan als gewone statische pagina's in de repository en
werken daarom zonder Express-server:

- `mijnwerk/`
- `mijnwerk/trouwfotos/`
- `mijnwerk/prijswinnende-fotos/`
- `mijnwerk/persoonlijke-favorieten/`

`github-pages-paths.js` houdt interne links en lokale afbeeldingen binnen de
repository-URL. Dit voorkomt 404-fouten bij een GitHub Pages-projectsite,
waarbij de repositorynaam onderdeel is van de URL.

## Contactformulier

GitHub Pages kan geen Node/Express-server of e-mail-endpoint uitvoeren. Het
contactformulier toont daarom, wanneer de automatische verzending niet
beschikbaar is, een knop waarmee de bezoeker het bericht via het eigen
mailprogramma naar `contact@markvandis.nl` kan sturen. Voor volledig
automatisch verzenden is later een externe formulierdienst of serverhosting
nodig.
