export function RobotBeeFallback() {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 pointer-events-none opacity-90 transition-opacity duration-300"
      aria-hidden="true"
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-bounce"
      >
        {/* Real Organic Honeybee Body */}
        <ellipse
          cx="32"
          cy="38"
          rx="14"
          ry="20"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="1.5"
        />
        <ellipse cx="32" cy="28" rx="13.5" ry="4" fill="#271C19" />
        <ellipse cx="32" cy="37" rx="13" ry="4" fill="#271C19" />
        <ellipse cx="32" cy="46" rx="10" ry="3.5" fill="#271C19" />

        {/* Thorax & Organic Head */}
        <circle cx="32" cy="20" r="10" fill="#D97706" stroke="#451A03" strokeWidth="1.2" />
        <circle cx="32" cy="14" r="8" fill="#291603" />
        <circle cx="28" cy="13" r="3" fill="#090D16" />
        <circle cx="27" cy="12" r="1" fill="#FFFFFF" />
        <circle cx="36" cy="13" r="3" fill="#090D16" />
        <circle cx="35" cy="12" r="1" fill="#FFFFFF" />

        {/* Antennae */}
        <path d="M28 8 Q22 4 18 2" stroke="#291603" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="2" r="1.5" fill="#D97706" />
        <path d="M36 8 Q42 4 46 2" stroke="#291603" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="46" cy="2" r="1.5" fill="#D97706" />

        {/* Translucent Wings */}
        <ellipse
          cx="16"
          cy="20"
          rx="13"
          ry="6"
          fill="#FEF3C7"
          fillOpacity="0.8"
          transform="rotate(-25 16 20)"
          stroke="#B45309"
          strokeWidth="1"
        />
        <ellipse
          cx="48"
          cy="20"
          rx="13"
          ry="6"
          fill="#FEF3C7"
          fillOpacity="0.8"
          transform="rotate(25 48 20)"
          stroke="#B45309"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
