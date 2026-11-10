# Steam Game Widget

Samodzielna aplikacja React + TypeScript z generatorem interaktywnych widgetów stron gier Steam. Projekt `steam-widget-main-reference` obok służy wyłącznie jako referencja: nie jest zależnością i nie jest modyfikowany. Nowy projekt nie korzysta z jego kodu Java, logowania ani bazy danych.

## Uruchomienie

Wymagany Node.js 22.12+ i dostęp serwera do internetu.

```powershell
npm install
npm run dev
```

Otwórz http://localhost:3000. Ten sam serwer obsługuje React/Vite i API; nie uruchamiasz drugiego procesu.

## Produkcja / hosting

```sh
npm ci
npm run build
npm start
```

Hostuj jako **Node.js Web Service**, np. na VPS, Render lub Railway, albo użyj opisanej poniżej obsługi Cloudflare. Katalog główny usługi: katalog tego repozytorium; build: `npm ci && npm run build`; start: `npm start`. Serwer Node.js respektuje zmienne `PORT` (domyślnie 3000) i `HOST` (domyślnie 0.0.0.0). Użyj HTTPS w reverse proxy/hostingu. Sam frontend statyczny nie wystarczy: endpoint `/api/games/:id` musi obsługiwać Node.js, Pages Function lub Worker. Nie jest wymagany klucz Steam API, konto ani baza danych.

### Cloudflare Pages — integracja Git

W ustawieniach projektu Pages wybierz:

- **Root directory:** katalog repozytorium (pozostaw puste, jeśli `package.json` jest w jego głównym katalogu).
- **Build command:** `npm run build`.
- **Build output directory:** `dist`.
- **Node.js:** 22.12 lub nowszy, np. zmienna `NODE_VERSION=22`.

Wdróż ponownie repozytorium wraz z katalogami `functions`, `cloudflare` i `server`. Cloudflare zbuduje funkcję `functions/api/[[path]].js`, która obsługuje `/api/*`, używając tej samej logiki Steam co lokalny serwer. `public/_routes.json` trafia do `dist` podczas budowania i ogranicza uruchamianie Functions do API. Frontend oraz adresy `/embed/:id` korzystają z domyślnej obsługi SPA Pages. Nie dodawaj nadrzędnego `404.html` ani przekierowania `/api/*` do `index.html`.

Samo ponowne przesłanie `dist` metodą drag-and-drop w panelu Cloudflare **nie wdraża katalogu `functions`**. Użyj integracji Git albo z głównego katalogu repozytorium wykonaj:

```sh
npm run build
npx wrangler pages deploy dist --project-name TWOJ_PROJEKT_PAGES
```

CLI Wrangler może poprosić o logowanie do Twojego konta Cloudflare. Nie uruchamiasz `npm start` na Pages. Konfiguracja Pages znajduje się w `wrangler.jsonc`.

### Cloudflare Workers — Static Assets

Jeśli Twój projekt jest Workerem, a nie Pages, ustaw:

- **Build command:** `npm run build`.
- **Deploy command:** `npx wrangler deploy --config wrangler.worker.jsonc`.
- **Root directory:** katalog tego repozytorium.

Ten wariant wdraża `cloudflare/worker.mjs` wraz z plikami `dist`. `run_worker_first` kieruje `/api` i `/api/*` do Workera przed obsługą SPA; pozostałe adresy obsługuje binding `ASSETS`. Nie wdrażaj samego `dist` jako statycznego Workera bez skryptu API. Pole `name` w `wrangler.worker.jsonc` dopasuj do nazwy istniejącego Workera na swoim koncie.

### Sprawdzenie po wdrożeniu

Otwórz `https://TWOJA_DOMENA/api/games/413150`. Oczekiwany wynik: JSON zawierający `id`, `name`, grafikę i pozostałe dane gry. `<!doctype html>` oznacza, że backend nie został wdrożony lub `/api/*` nadal trafia do fallbacku SPA. Nieznany endpoint `/api/unknown` powinien zwrócić błąd 404 w JSON. Następnie sprawdź generator i `/embed/413150`.

Na Cloudflare cache i prosty limit zapytań działają w pamięci danej instancji, a nie jako globalny licznik wszystkich instancji. Pobieranie Steam działa bez modułów Node.js i nie wymaga flagi `nodejs_compat`.

Docker:

```sh
docker build -t steam-game-widget .
docker run --rm -p 3000:3000 steam-game-widget
```

Nie dodawaj `X-Frame-Options: SAMEORIGIN` / `DENY` ani blokującego `frame-ancestors` do ścieżki `/embed/`, bo uniemożliwi to osadzanie. Na stronie bloga CSP `frame-src` musi pozwalać na domenę Twojego widgetu. Użyj publicznego, stabilnego adresu hostingu: iframe wskazuje domenę, na której korzystasz z generatora. Kod z localhost działa wyłącznie na Twoim komputerze.

## Funkcje

- App ID lub pełny link `https://store.steampowered.com/app/413150/`.
- Oficjalna grafika, do pięciu zrzutów ekranu, opis, gatunki, premiera, cena/promocja i procent pozytywnych ocen.
- Pięć motywów, trzy układy, własny kolor przycisku z automatycznym kontrastem, zaokrąglenia i szerokość 280–1000 px (plakat: do 380 px).
- Widoczność opisu, gatunków, ceny i ocen; link sklepu lub CTA listy życzeń.
- Język danych Steam, region cen i źródło UTM.
- Podgląd mobilny, jasne/ciemne otoczenie, kopiowanie iframe i linku. Konfiguracja zapisywana w URL edytora.
- `/embed/:appId` wyświetla sam widget z przezroczystym tłem strony.
- `/api/games/:appId?lang=polish&country=PL` udostępnia znormalizowane dane gry.

## Osadzanie

Wklej kod z generatora w blok „Własny HTML” bloga. Szerokość dopasowuje się do rodzica, wysokość iframe ma bezpieczny zapas. Przy wąskich kontenerach (minimum 280 px), długim tytule lub niestandardowych fontach sprawdź wysokość w docelowej stronie i ewentualnie zwiększ atrybut `height`. Treść iframe może przewijać się, jeśli przekroczy wysokość. Układ kompaktowy celowo pomija grafikę, opis i gatunki.

Przycisk listy życzeń **otwiera stronę gry na Steam**. Nie udaje anonimowego dodania gry: zapisanie gry do listy wymaga konta gracza i odbywa się na Steam. Jest to niezależny projekt, nie oficjalny produkt Valve. Grafiki i treści pozostają własnością ich właścicieli. Informacje Valve: https://partner.steamgames.com/doc/marketing/widget oraz https://partner.steamgames.com/doc/marketing/wishlist.

## Dane i ograniczenia

Serwer pobiera publiczne `store.steampowered.com/api/appdetails` i podsumowanie recenzji z aktualnego `api.steampowered.com/IUserReviewsService/GetAppReviews/v1/`, bez zewnętrznych publicznych proxy. Aktualne API recenzji nie wymaga klucza: https://partner.steamgames.com/doc/webapi/IUserReviewsService. Store API jest nieoficjalnym, niegwarantowanym interfejsem: gry usunięte, ograniczone regionalnie i część treści mogą nie być dostępne. Limit czasu zapytań: 10 sekund. Awaria ocen nie blokuje reszty karty. Nie ma fałszywych danych przykładowych zastępujących błąd API.

Cache w pamięci: 10 minut, maksymalnie 500 wariantów gry, współdzielenie równoczesnych zapytań. Odpowiedzi HTTP również pozwalają na krótkie buforowanie (do kilku dodatkowych minut). Brak trwałego zapisu. Ceny są z wybranego regionu; Steam może pokazać odwiedzającemu inną walutę/cenę. Limit 120 zapytań API/min na adres połączenia; za reverse proxy limit dotyczy adresu proxy — przed większym ruchem skonfiguruj limity per klient w reverse proxy/CDN. Endpoint nie jest otwartym proxy: akceptuje tylko App ID i ograniczony zestaw języków/regionów.

Interfejs widgetu jest po polsku; wybór języka zmienia treść otrzymywaną ze Steam. Font Manrope ładuje się z Google Fonts z fallbackiem sans-serif; materiały gry z CDN Steam. Do działania po wdrożeniu potrzebny jest dostęp do tych usług. Brak śledzenia, analityki, logowania i ciasteczek aplikacji.

## Sprawdzanie

```sh
npm test
npm run build
```

Testy obejmują walidację, normalizację, bezpieczne URL-e grafik, cache, równoczesne zapytania, awarie ocen i błędy Steam. Testy jednostkowe API używają kontrolowanych odpowiedzi i nie zależą od dostępności Steam.
