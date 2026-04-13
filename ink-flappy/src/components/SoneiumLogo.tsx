interface SoneiumLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function SoneiumLogo({ size = 48, className = "", animate = false }: SoneiumLogoProps) {
  return (
    <img
      src="/ink-logo.png"
      width={size}
      height={size}
      className="ml-[9px] mr-[9px] mt-[9px] mb-[9px]"
      alt="Ink Logo"
      style={{
        borderRadius: "22%",
        display: "block",
        ...(animate ? { animation: "wing-flap 0.3s ease-in-out infinite" } : {}),
      }}
    />
  );
}

export function SoneiumLogoCanvas({ x, y, size, rotation }: { x: number; y: number; size: number; rotation: number }) {
  return null;
}
