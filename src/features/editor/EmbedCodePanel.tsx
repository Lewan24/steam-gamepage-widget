import { useRef } from 'react';
import { Check, Code2, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { createEmbedCode, type Config } from '../../config';
import { useClipboard } from '../../hooks/useClipboard';

type Props = { source: string; config: Config; gameName?: string; ready: boolean };

export function EmbedCodePanel({ source, config, gameName, ready }: Props) {
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const { copy, copied, error } = useClipboard();
  const code = createEmbedCode(source, config, gameName);
  async function copyContent(text: string, target: string) {
    if (await copy(text, target)) return;
    codeRef.current?.focus();
    codeRef.current?.select();
  }
  return (
    <div className="embed-panel" id="embed-code">
      <div className="embed-heading">
        <div>
          <h2>
            <Code2 size={19} /> Gotowy do osadzenia
          </h2>
          <p>Wklej kod w blok „Własny HTML” na swoim blogu lub stronie.</p>
        </div>
        <button
          className="button primary"
          onClick={() => copyContent(code, 'code')}
          disabled={!ready}
        >
          {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
          {copied === 'code' ? 'Skopiowano' : 'Kopiuj kod'}
        </button>
      </div>
      <textarea
        ref={codeRef}
        className="code-output"
        aria-label="Kod HTML iframe do skopiowania"
        value={code}
        readOnly
        spellCheck={false}
        onFocus={(event) => event.currentTarget.select()}
      />
      <div className="embed-footer">
        <span>
          <ShieldCheck size={14} /> Bez skryptów na Twojej stronie
        </span>
        <button onClick={() => copyContent(source, 'link')}>
          {copied === 'link' ? <Check size={14} /> : <Copy size={14} />}
          {copied === 'link' ? 'Link skopiowany' : 'Kopiuj link'}
        </button>
        <a href={source} target="_blank" rel="noopener noreferrer">
          Otwórz widget <ExternalLink size={13} />
        </a>
      </div>
      <p className="sr-only" role="status">
        {copied ? 'Skopiowano do schowka' : ''}
      </p>
      {error && (
        <p className="input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
