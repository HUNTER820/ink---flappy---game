import { useState, useCallback, useEffect } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { SoneiumLogo } from "@/components/SoneiumLogo";
import { submitScore } from "@/lib/leaderboard";

interface GamePageProps {
  walletAddress: string;
  onExit: () => void;
}

type GameState = "ready" | "playing" | "dead";

function SpaceBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: "url('/space-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      }} />
      <div className="absolute inset-0" style={{ background: "rgba(8,0,20,0.45)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,0,30,0.55) 0%, transparent 40%, transparent 70%, rgba(6,0,16,0.6) 100%)" }} />

      <div style={{
        position: "absolute", top: "5%", right: "8%",
        width: 88, height: 88, borderRadius: "50%",
        background: "radial-gradient(circle at 32% 32%, #c060ff, #7020d0, #3a0088, #150025)",
        boxShadow: "0 0 40px rgba(180,80,255,0.55), 0 0 80px rgba(140,0,220,0.2)",
        opacity: 0.88,
      }} />
      <div style={{
        position: "absolute", top: "10%", right: "4%",
        width: 160, height: 40, borderRadius: "50%",
        border: "8px solid rgba(200,120,255,0.42)",
        transform: "rotate(-22deg)",
      }} />

      <div style={{
        position: "absolute", top: "15%", left: "5%",
        width: 36, height: 36, borderRadius: "50%",
        background: "radial-gradient(circle at 33% 33%, #ff99ff, #cc44cc, #660066)",
        boxShadow: "0 0 14px rgba(220,100,255,0.6)",
        opacity: 0.80,
      }} />

      <div style={{
        position: "absolute", top: "2%", left: "38%",
        width: 20, height: 20, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #ff7040, #cc2200, #550000)",
        boxShadow: "0 0 10px rgba(255,80,30,0.5)",
        opacity: 0.75,
      }} />

      <div style={{
        position: "absolute", top: "40%", right: "2%",
        width: 46, height: 46, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #70e8ff, #2090c0, #004466)",
        boxShadow: "0 0 20px rgba(60,200,255,0.4)",
        opacity: 0.70,
      }} />

      <div style={{
        position: "absolute", bottom: "20%", left: "2%",
        width: 18, height: 18, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 35%, #d0e8ff, #8090c0, #202848)",
        boxShadow: "0 0 8px rgba(160,190,255,0.4)",
        opacity: 0.65,
      }} />

      {[
        { top: "8%",  left: "22%", s: 2.2, o: 0.85 },
        { top: "3%",  left: "60%", s: 1.5, o: 0.65 },
        { top: "18%", left: "72%", s: 1.8, o: 0.75 },
        { top: "25%", left: "10%", s: 1.2, o: 0.55 },
        { top: "12%", left: "45%", s: 2.0, o: 0.80 },
        { top: "30%", left: "55%", s: 1.4, o: 0.60 },
        { top: "6%",  left: "80%", s: 1.6, o: 0.70 },
        { top: "22%", left: "30%", s: 1.0, o: 0.50 },
        { top: "35%", left: "15%", s: 1.8, o: 0.72 },
        { top: "48%", left: "42%", s: 1.2, o: 0.48 },
        { top: "55%", left: "70%", s: 1.5, o: 0.58 },
        { top: "62%", left: "8%",  s: 1.0, o: 0.42 },
        { top: "70%", left: "85%", s: 1.3, o: 0.52 },
        { top: "78%", left: "30%", s: 1.6, o: 0.60 },
        { top: "85%", left: "55%", s: 1.1, o: 0.45 },
        { top: "15%", left: "88%", s: 2.0, o: 0.78 },
        { top: "45%", left: "28%", s: 1.4, o: 0.56 },
        { top: "58%", left: "48%", s: 1.7, o: 0.65 },
        { top: "72%", left: "62%", s: 1.2, o: 0.50 },
        { top: "88%", left: "18%", s: 1.5, o: 0.55 },
      ].map((star, i) => (
        <div key={i} style={{
          position: "absolute",
          top: star.top, left: star.left,
          width: star.s, height: star.s,
          borderRadius: "50%",
          background: ["#ffffff","#e8d5ff","#ffccff","#d4b0ff","#ffe0ff"][i % 5],
          opacity: star.o,
          animation: `star-twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 3}s infinite`,
        }} />
      ))}

      <div style={{
        position: "absolute", top: "20%", left: "15%",
        width: 180, height: 80,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(160,0,255,0.08) 0%, transparent 70%)",
        filter: "blur(8px)",
      }} />
      <div style={{
        position: "absolute", top: "55%", right: "10%",
        width: 150, height: 70,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(220,0,180,0.07) 0%, transparent 70%)",
        filter: "blur(8px)",
      }} />
    </div>
  );
}

export function GamePage({ walletAddress, onExit }: GamePageProps) {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, [showHint]);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState("dead");
    if (finalScore > bestScore) setBestScore(finalScore);
    submitScore(walletAddress, finalScore);
  }, [walletAddress, bestScore]);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleStart = () => {
    setGameState("playing");
    setShowHint(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />

      {gameState === "ready" && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm" style={{ background: "rgba(10,0,25,0.55)" }}>
          <div
            className="rounded-3xl p-8 text-center max-w-sm mx-4"
            style={{
              background: "linear-gradient(135deg, rgba(45,0,90,0.97), rgba(26,0,53,0.97))",
              border: "1px solid rgba(160,80,255,0.45)",
              boxShadow: "0 0 50px rgba(140,0,220,0.35), 0 8px 40px rgba(0,0,0,0.4)",
              animation: "celebrate 0.4s ease-out",
            }}
          >
            <div className="flex justify-center mb-4" style={{ animation: "float 2s ease-in-out infinite" }}>
              <SoneiumLogo size={64} />
            </div>
            <h2 className="font-black text-2xl mb-2 text-white" style={{ textShadow: "0 0 16px rgba(180,80,255,0.8)" }}>
              Ready to Fly!
            </h2>
            <p className="text-sm mb-1" style={{ color: "#c8a0ff" }}>Single Play Session</p>
            <p className="text-xs mb-6" style={{ color: "#9060cc" }}>Tap / Click / Space to flap</p>

            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl text-xl font-black text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #a020f0, #7000cc, #4400aa)",
                boxShadow: "0 4px 24px rgba(160,32,240,0.55)",
              }}
            >
              START
            </button>

            <button
              onClick={onExit}
              className="mt-3 text-sm hover:underline transition-colors"
              style={{ color: "#8050aa" }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {gameState === "dead" && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm" style={{ background: "rgba(10,0,25,0.6)" }}>
          <div
            className="rounded-3xl p-8 text-center max-w-sm mx-4"
            style={{
              background: "linear-gradient(135deg, rgba(45,0,90,0.97), rgba(26,0,53,0.97))",
              border: "1px solid rgba(160,80,255,0.45)",
              boxShadow: "0 0 50px rgba(140,0,220,0.35), 0 8px 40px rgba(0,0,0,0.4)",
              animation: "celebrate 0.4s ease-out",
            }}
          >
            <div className="text-5xl mb-3">💥</div>
            <h2 className="font-black text-3xl mb-1 text-white" style={{ textShadow: "0 0 16px rgba(180,80,255,0.7)" }}>
              Game Over!
            </h2>

            <div className="flex justify-center gap-8 my-5">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: "#9060cc" }}>Score</p>
                <p className="font-black text-4xl" style={{ color: "#e060ff" }}>{score}</p>
              </div>
              <div className="w-px" style={{ background: "rgba(160,80,255,0.3)" }} />
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: "#9060cc" }}>Best</p>
                <p className="font-black text-4xl" style={{ color: "#80ffcc" }}>{bestScore}</p>
              </div>
            </div>

            {score === bestScore && score > 0 && (
              <div
                className="mb-4 py-2 px-4 rounded-xl text-sm font-bold"
                style={{ background: "rgba(160,80,255,0.15)", color: "#d090ff", border: "1px solid rgba(160,80,255,0.3)" }}
              >
                New Personal Best!
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={onExit}
                className="w-full py-4 rounded-2xl text-xl font-black text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #a020f0, #7000cc, #4400aa)",
                  boxShadow: "0 4px 24px rgba(160,32,240,0.55)",
                }}
              >
                Buy Another Play
              </button>
              <button
                onClick={onExit}
                className="w-full py-2 rounded-xl text-sm hover:underline transition-colors"
                style={{ color: "#8050aa" }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === "playing" && showHint && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <p
            className="text-lg font-bold animate-pulse px-5 py-2 rounded-2xl"
            style={{
              background: "rgba(45,0,90,0.82)",
              color: "#e0aaff",
              border: "1px solid rgba(160,80,255,0.4)",
            }}
          >
            Tap to Flap!
          </p>
        </div>
      )}

      {gameState !== "ready" && (
        <div className="relative z-10">
          <GameCanvas
            onGameOver={handleGameOver}
            onScoreUpdate={handleScoreUpdate}
          />
        </div>
      )}
    </div>
  );
}
