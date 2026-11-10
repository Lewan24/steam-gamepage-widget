import { ShieldCheck } from 'lucide-react';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteFooter';
import { SettingsPanel } from './SettingsPanel';
import { WidgetPreview } from './WidgetPreview';
import { EmbedCodePanel } from './EmbedCodePanel';
import { HowItWorks } from './HowItWorks';
import { useWidgetEditor } from './useWidgetEditor';

export function EditorPage({ params }: { params: URLSearchParams }) {
  const { id, config, state, source, update, selectGame, reset } = useWidgetEditor(params);
  return (
    <>
      <SiteHeader />
      <main className="page-shell" id="generator">
        <section className="intro">
          <div>
            <h1>
              Twoja gra.
              <br className="mobile-break" /> Na Twojej stronie<span>.</span>
            </h1>
            <p>Jeden App ID. Własny styl. Gotowy widget, który łączy z grą na Steam.</p>
          </div>
          <span className="no-login">
            <ShieldCheck size={16} /> Bez logowania i klucza API
          </span>
        </section>
        <div className="workspace">
          <SettingsPanel
            id={id}
            config={config}
            game={state.game}
            loading={state.loading}
            update={update}
            onSelectGame={selectGame}
            onReset={reset}
          />
          <WidgetPreview config={config} state={state}>
            <EmbedCodePanel
              source={source}
              config={config}
              gameName={state.game?.name}
              ready={!!state.game && !state.loading}
            />
          </WidgetPreview>
        </div>
        <HowItWorks />
      </main>
      <SiteFooter />
    </>
  );
}
