import { ChevronDown } from 'lucide-react';
export function HowItWorks() {
  return (
    <>
      <section className="how-section" id="how-it-works">
        <div>
          <h2>
            Od gry do Twojej strony.
            <br />W trzech prostych krokach.
          </h2>
          <p>Ty wybierasz wygląd. My pobieramy resztę.</p>
        </div>
        <ol>
          <li>
            <strong>Wklej App ID lub link</strong>
            <p>Pobierz oficjalne grafiki, opis, oceny i cenę prosto ze Steam.</p>
          </li>
          <li>
            <strong>Dopasuj do swojej strony</strong>
            <p>Wybierz motyw, układ, kolor przycisku i widoczne informacje.</p>
          </li>
          <li>
            <strong>Wklej gotowy iframe</strong>
            <p>Osadź kartę w blogu lub stronie gry. Dane odświeżają się automatycznie.</p>
          </li>
        </ol>
      </section>
      <details className="faq">
        <summary>
          Czy widget wymaga logowania do Steam?
          <ChevronDown size={16} />
        </summary>
        <p>
          Generator i podgląd działają bez logowania. Przycisk otwiera oficjalną stronę gry w nowej
          karcie. Gracz dodaje ją do listy życzeń na Steam po zalogowaniu na swoje konto. Ceny
          zależą od wybranego regionu i mogą różnić się od ceny widocznej dla odwiedzającego. Dane
          są buforowane przez około 10 minut.
        </p>
      </details>
    </>
  );
}
