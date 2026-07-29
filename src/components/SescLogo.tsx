interface SescLogoProps {
  className?: string;
  variant?: "horizontal" | "vertical";
  alt?: string;
}

export function SescLogo({
  className = "h-10",
  variant = "horizontal",
  alt = "Logo Oficial Sesc Fecomércio Senac",
}: SescLogoProps) {
  const logoSrc = variant === "vertical" ? "/sesc-logo-vertical.png" : "/sesc-logo-horizontal.png";

  return <img src={logoSrc} alt={alt} className={`object-contain ${className}`} />;
}
