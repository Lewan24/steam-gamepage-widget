import { useState, type CSSProperties } from 'react';
import { ArrowUpRight, Heart, Image } from 'lucide-react';
import { foreground, themes, type Config } from '../../config';
import type { Game } from '../../types/game';
import { SteamMark } from '../../components/SteamMark';

export function GameWidget({ game, config }: { game: Game; config: Config }) {
  const theme = themes[config.theme];
  const [failed, setFailed] = useState('');
  const artwork =
    config.artwork > 0 ? (game.screenshots[config.artwork - 1] ?? game.header) : game.header;
  const link = new URL(`https://store.steampowered.com/app/${game.id}/`);
  if (config.utm) {
    link.searchParams.set('utm_source', config.utm);
    link.searchParams.set('utm_medium', 'widget');
  }
  if (config.action === 'wishlist') link.hash = 'game_area_purchase';
  const style = {
    '--card-bg': theme.background,
    '--card-fg': theme.foreground,
    '--card-muted': theme.muted,
    '--card-line': theme.line,
    '--accent': config.accent,
    '--accent-fg': foreground(config.accent),
    borderRadius: config.radius,
  } as CSSProperties;
  return (
    <article
      className={`game-widget ${config.layout}`}
      style={style}
      aria-label={`Gra ${game.name}`}
    >
      {config.layout !== 'compact' && (
        <a
          href={link.href}
          className="game-artwork"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${game.name} — otwórz na Steam`}
        >
          {artwork && failed !== artwork ? (
            <img
              src={artwork}
              alt={`Materiały gry ${game.name}`}
              onError={() => setFailed(artwork)}
            />
          ) : (
            <span className="artwork-fallback">
              <Image size={36} />
              {game.name}
            </span>
          )}
          <span className="artwork-label">
            <SteamMark size={15} /> DOSTĘPNE NA STEAM
          </span>
        </a>
      )}
      <div className="game-content">
        <div className="game-heading">
          <div>
            <span className="developer">{game.developers.join(', ') || 'Steam'}</span>
            <h2>{game.name}</h2>
          </div>
          <SteamMark size={26} />
        </div>
        {config.genres && config.layout !== 'compact' && game.genres.length > 0 && (
          <div className="genres">
            {game.genres.map((genre) => (
              <span key={genre}>{genre}</span>
            ))}
          </div>
        )}
        {config.description && config.layout !== 'compact' && (
          <p className="game-description">{game.description}</p>
        )}
        <div className="game-meta">
          {config.reviews && game.reviews && (
            <span className="review">
              <span className="review-dot" />
              {game.reviews.positive}% pozytywnych{' '}
              <small>({new Intl.NumberFormat('pl').format(game.reviews.total)})</small>
            </span>
          )}
          <span>{game.comingSoon ? 'Wkrótce' : game.release}</span>
        </div>
        <div className="game-bottom">
          <div className="game-price">
            {config.price &&
              (game.comingSoon ? (
                <span>Już wkrótce</span>
              ) : game.price ? (
                <>
                  {game.price.discount > 0 && (
                    <span className="discount">−{game.price.discount}%</span>
                  )}
                  <div>
                    {game.price.discount > 0 && <s>{game.price.original}</s>}
                    <strong>{game.price.formatted}</strong>
                  </div>
                </>
              ) : (
                <span>Sprawdź na Steam</span>
              ))}
          </div>
          <a
            className="game-cta"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={
              config.action === 'wishlist'
                ? 'Otwórz Steam, aby dodać grę do swojej listy życzeń'
                : 'Przejdź do sklepu Steam'
            }
          >
            {config.action === 'wishlist' ? <Heart size={17} /> : <SteamMark size={17} />}
            <span>
              {config.action === 'wishlist' ? 'Dodaj do listy życzeń' : 'Zobacz na Steam'}
            </span>
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
