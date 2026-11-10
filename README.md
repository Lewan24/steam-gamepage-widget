# Steam Game Widget

Samodzielna aplikacja React + TypeScript z generatorem interaktywnych widgetów stron gier Steam. Projekt `steam-widget-main-reference` obok służy wyłącznie jako referencja: nie jest zależnością i nie jest modyfikowany. Nowy projekt nie korzysta z jego kodu Java, logowania ani bazy danych.

## Uruchomienie

Wymagany Node.js 22.12+ i dostęp serwera do internetu.

```powershell
cd steam-game-widget
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

Hostuj jako **Node.js Web Service**, np. na VPS, Render lub Railway. Katalog główny usługi: `steam-game-widget`; build: `npm ci && npm run build`; start: `npm start`. Serwer respektuje zmienne `PORT` (domyślnie 3000) i `HOST` (domyślnie 0.0.0.0). Użyj HTTPS w reverse proxy/hostingu. Zwykły hosting statyczny samego `dist` nie wystarczy: API musi działać na serwerze, aby przeglądarka nie napotykała blokady CORS Steam. Nie jest wymagany klucz Steam API, konto ani baza danych.

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
