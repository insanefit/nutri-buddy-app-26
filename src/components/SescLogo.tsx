interface SescLogoProps {
  className?: string;
  variant?: "color" | "white" | "dark";
  showSubLabel?: boolean;
}

export function SescLogo({
  className = "h-10",
  variant = "white",
  showSubLabel = true,
}: SescLogoProps) {
  const textColor = variant === "white" ? "#FFFFFF" : "#003366";
  const subTextColor = variant === "white" ? "#93C5FD" : "#475569";
  const arcColor = "#FFCC00"; // Amarelo Ouro Sesc

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <svg
        viewBox="0 0 160 55"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-full max-h-12"
      >
        {/* Arco Amarelo Característico no Topo do Sesc */}
        <path d="M 12 16 C 55 4, 115 4, 148 16 C 115 8, 55 8, 12 16 Z" fill={arcColor} />
        {/* Tipografia Sesc */}
        <text
          x="10"
          y="46"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="36"
          fontStyle="italic"
          fill={textColor}
          letterSpacing="-1.5"
        >
          Sesc
        </text>
      </svg>
      {showSubLabel && (
        <span
          className="text-[9px] font-bold tracking-tight uppercase leading-none pl-2"
          style={{ color: subTextColor }}
        >
          Fecomércio Senac
        </span>
      )}
    </div>
  );
}
