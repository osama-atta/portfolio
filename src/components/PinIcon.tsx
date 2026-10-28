/** A small map pin, used next to the location. Decorative: the city name is always written next to it. */
export function PinIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`flex-none text-copper ${className}`}>
      <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5A4.5 4.5 0 0 0 8 1.5Z" fill="currentColor" />
      <circle cx="8" cy="6" r="1.7" fill="var(--color-board)" />
    </svg>
  );
}
