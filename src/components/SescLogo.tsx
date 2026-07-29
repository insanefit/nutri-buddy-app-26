interface SescLogoProps {
  className?: string;
  alt?: string;
}

export function SescLogo({ className = "h-10", alt = "Logo Oficial Sesc" }: SescLogoProps) {
  return <img src="/sesc-logo-official.png" alt={alt} className={`object-contain ${className}`} />;
}
