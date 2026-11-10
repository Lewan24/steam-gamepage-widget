import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorPage } from './features/editor/EditorPage';
import { EmbedPage } from './features/widget/EmbedPage';
import './styles.css';

const params = new URLSearchParams(window.location.search);
const embedId = /^\/embed\/([^/]+)\/?$/.exec(window.location.pathname)?.[1];
if (embedId) {
  document.documentElement.classList.add('embed-page');
  document.title = 'Widget gry Steam';
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {embedId ? <EmbedPage id={embedId} params={params} /> : <EditorPage params={params} />}
  </StrictMode>,
);
