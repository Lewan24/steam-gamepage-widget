export function SteamMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="16.5" cy="7.5" r="4.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="17" r="3.3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m10.6 18.1 7.2-6M6 14l-5-2m4.7 8-5-2M9 13.9l3.3-5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
