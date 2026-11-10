const clean = (value) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
const imageUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      /(^|\.)(steamstatic\.com|steamcdn-a\.akamaihd\.net|steampowered\.com)$/.test(url.hostname)
      ? url.href
      : '';
  } catch {
    return '';
  }
};
export function normalizeGame(id, data, summary) {
  return {
    id,
    name: clean(data.name),
    description: clean(data.short_description),
    header: imageUrl(data.header_image),
    screenshots: (data.screenshots ?? [])
      .slice(0, 5)
      .map((s) => imageUrl(s.path_full))
      .filter(Boolean),
    developers: (data.developers ?? []).map(clean),
    genres: (data.genres ?? []).map((g) => clean(g.description)).slice(0, 3),
    platforms: data.platforms ?? {},
    release: clean(data.release_date?.date),
    comingSoon: !!data.release_date?.coming_soon,
    price: data.is_free
      ? { formatted: 'Free to play', discount: 0 }
      : data.price_overview
        ? {
            formatted: clean(data.price_overview.final_formatted),
            original: clean(data.price_overview.initial_formatted),
            discount: data.price_overview.discount_percent,
          }
        : null,
    reviews:
      summary?.total_reviews > 0
        ? {
            total: summary.total_reviews,
            positive: Math.round((summary.total_positive / summary.total_reviews) * 100),
          }
        : null,
  };
}
