import { ApiError } from '../errors.mjs';
const languages = new Set(['polish', 'english', 'german', 'french', 'spanish']);
export function validId(id) {
  return /^[1-9]\d{0,9}$/.test(id);
}
export function parseRequest(id, language = 'polish', country = 'PL') {
  if (!validId(id)) throw new ApiError(400, 'Podaj poprawne App ID gry Steam.');
  if (!languages.has(language) || !['PL', 'US', 'GB', 'DE', 'FR'].includes(country))
    throw new ApiError(400, 'Nieobsługiwany język lub region.');
  return { id, language, country };
}
