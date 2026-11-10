import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { parseAppId } from '../../config';

const examples = [
  { id: '413150', name: 'Stardew Valley' },
  { id: '367520', name: 'Hollow Knight' },
  { id: '1091500', name: 'Cyberpunk 2077' },
];
type Props = { initialId: string; loading: boolean; onSelect: (id: string) => void };

export function GamePicker({ initialId, loading, onSelect }: Props) {
  const [input, setInput] = useState(initialId);
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    const id = parseAppId(input);
    if (!id) {
      setError('Podaj App ID, np. 413150, lub pełny link do gry na Steam.');
      return;
    }
    setError('');
    onSelect(id);
  }
  return (
    <section className="game-input-section">
      <label htmlFor="app-id">Gra na Steam</label>
      <form onSubmit={submit} className="app-form">
        <input
          id="app-id"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="App ID lub link do gry"
          aria-invalid={!!error}
          aria-describedby="input-help"
        />
        <button
          className="load-button"
          type="submit"
          aria-label="Pobierz grę"
          title="Pobierz grę"
          disabled={loading}
        >
          <ArrowRight size={19} />
        </button>
      </form>
      <p
        id="input-help"
        className={error ? 'input-error' : 'help'}
        role={error ? 'alert' : undefined}
      >
        {error || 'Wklej ID lub adres strony gry w sklepie.'}
      </p>
      <div className="examples">
        <span>Wypróbuj:</span>
        {examples.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              setInput(game.id);
              setError('');
              onSelect(game.id);
            }}
          >
            {game.name}
          </button>
        ))}
      </div>
    </section>
  );
}
