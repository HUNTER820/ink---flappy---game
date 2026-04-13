import { useEffect, useRef } from "react";

export function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ["#00B8D4", "#0080FF", "#6B00FF", "#FFD700", "#FF6B6B", "#00FF88"];
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 10 + 5;
      const isCircle = Math.random() > 0.5;

      piece.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${isCircle ? size : size * 0.4}px;
        background: ${color};
        border-radius: ${isCircle ? "50%" : "2px"};
        left: ${Math.random() * 100}vw;
        top: -20px;
        animation: confetti-fall ${Math.random() * 3 + 2}s linear ${Math.random() * 2}s forwards;
        z-index: 9999;
        pointer-events: none;
      `;
      container.appendChild(piece);
      pieces.push(piece);
    }

    return () => {
      pieces.forEach(p => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none" />;
}
