import { useEffect, useRef, useState } from 'react';

/** Copy feedback belongs to the panel, rather than the whole editor. */
export function useClipboard() {
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(text: string, target: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
      setError('');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(''), 2500);
      return true;
    } catch {
      setError('Przeglądarka zablokowała schowek. Zaznacz kod i skopiuj go ręcznie.');
      return false;
    }
  }
  return { copy, copied, error };
}
