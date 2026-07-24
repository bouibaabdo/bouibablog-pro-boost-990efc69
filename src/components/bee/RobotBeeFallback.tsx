export function RobotBeeFallback() {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 pointer-events-none opacity-85 transition-opacity duration-300"
      aria-hidden="true"
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse"
      >
        {/* Robot Body */}
        <ellipse cx="32" cy="36" rx="14" ry="20" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
        <rect x="18" y="28" width="28" height="5" fill="#1E293B" rx="1.5" />
        <rect x="19" y="37" width="26" height="5" fill="#1E293B" rx="1.5" />
        
        {/* Robot Head & Cyan LED Visor */}
        <circle cx="32" cy="18" r="10" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
        <ellipse cx="32" cy="18" rx="7" ry="3" fill="#06B6D4" />
        
        {/* Antennae */}
        <line x1="26" y1="10" x2="20" y2="4" stroke="#334155" strokeWidth="1.5" />
        <circle cx="20" cy="4" r="2" fill="#14B8A6" />
        <line x1="38" y1="10" x2="44" y2="4" stroke="#334155" strokeWidth="1.5" />
        <circle cx="44" cy="4" r="2" fill="#14B8A6" />

        {/* Wings */}
        <ellipse cx="16" cy="22" rx="12" ry="6" fill="#E0F2FE" fillOpacity="0.75" transform="rotate(-25 16 22)" stroke="#0D6E6E" strokeWidth="1" />
        <ellipse cx="48" cy="22" rx="12" ry="6" fill="#E0F2FE" fillOpacity="0.75" transform="rotate(25 48 22)" stroke="#0D6E6E" strokeWidth="1" />
      </svg>
    </div>
  );
}
