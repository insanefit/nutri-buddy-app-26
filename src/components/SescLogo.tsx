import sescLogoUrl from "@/assets/sesc-logo-v2.png";

interface SescLogoProps {
  className?: string;
  alt?: string;
}

export function SescLogo({ className = "h-10", alt = "Logo Oficial Sesc" }: SescLogoProps) {
  return <img src={sescLogoUrl} alt={alt} className={`object-contain ${className}`} />;
}
