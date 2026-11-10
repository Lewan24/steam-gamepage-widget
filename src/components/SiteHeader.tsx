import { ArrowUpRight, Code2 } from 'lucide-react';
import { SteamMark } from './SteamMark';
export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Steam Game Widget — strona główna">
        <span className="brand-symbol">
          <Code2 size={23} />
        </span>
        <span>
          steam<span className="brand-light">/</span>widget
          <span className="brand-beta">GAME EDITION</span>
        </span>
      </a>
      <nav aria-label="Główna nawigacja">
        <a href="#generator" className="active">
          Generator
        </a>
        <a href="#how-it-works">
          Jak to działa <ArrowUpRight size={13} />
        </a>
        <a
          className="nav-steam"
          href="https://store.steampowered.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SteamMark size={19} />
          <span>Steam Store</span>
        </a>
      </nav>
    </header>
  );
}
