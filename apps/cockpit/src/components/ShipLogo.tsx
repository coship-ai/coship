type ShipLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
};

export function ShipLogo({
  className = "",
  size = "md",
  animated = true,
}: ShipLogoProps) {
  return (
    <>
      <svg
        viewBox="0 0 64 64"
        className={`${sizeClasses[size]} ${className}`}
        aria-label="CoShip Logo"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main sail */}
        <path
          d="M32 6 L32 38 L50 38 Z"
          fill="url(#sailGradient)"
          className={animated ? "animate-sail" : ""}
          style={{ transformOrigin: "32px 38px" }}
        />

        {/* Secondary sail */}
        <path
          d="M30 12 L30 34 L18 34 Z"
          fill="url(#sailGradient2)"
          className={animated ? "animate-sail-secondary" : ""}
          style={{ transformOrigin: "30px 34px" }}
          opacity="0.7"
        />

        {/* Mast */}
        <line
          x1="32"
          y1="6"
          x2="32"
          y2="44"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ocean-300"
        />

        {/* Hull */}
        <path d="M12 44 L52 44 L48 54 L16 54 Z" fill="url(#hullGradient)" />

        {/* Hull accent line */}
        <path
          d="M14 47 L50 47"
          stroke="currentColor"
          strokeWidth="1"
          className="text-ocean-400"
          opacity="0.5"
        />

        {/* Wave lines */}
        <g className={animated ? "animate-float" : ""}>
          <path
            d="M4 58 Q16 52 28 58 Q40 64 52 58 Q58 55 60 56"
            stroke="url(#waveGradient)"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            className={animated ? "animate-wave" : ""}
          />
          <path
            d="M8 62 Q18 57 28 62 Q38 67 48 62"
            stroke="url(#waveGradient)"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
            className={animated ? "animate-wave-delayed" : ""}
          />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="sailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient
            id="sailGradient2"
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f2035" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {animated && (
        <style>{`
          @keyframes sail-sway {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes wave-flow {
            0%, 100% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          .animate-sail {
            animation: sail-sway 4s ease-in-out infinite;
          }
          .animate-sail-secondary {
            animation: sail-sway 4s ease-in-out infinite;
            animation-delay: -0.5s;
          }
          .animate-wave {
            animation: wave-flow 2.5s ease-in-out infinite;
          }
          .animate-wave-delayed {
            animation: wave-flow 2.5s ease-in-out infinite;
            animation-delay: -1s;
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      )}
    </>
  );
}
