import { useState } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client, BASE_CHAIN } from "@/lib/thirdweb";
import { PaymentModal } from "@/components/PaymentModal";
import { Leaderboard } from "@/components/Leaderboard";
import { SoneiumLogo } from "@/components/SoneiumLogo";
import { GamePage } from "./GamePage";

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.okex.wallet"),
  createWallet("io.rabby"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

type AppState = "menu" | "payment" | "game";

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* wallpaper image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/space-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* dark overlay so UI stays readable */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(8,0,20,0.45)" }}
      />
      {/* subtle top-vignette to blend planets */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(10,0,30,0.55) 0%, transparent 40%, transparent 70%, rgba(6,0,16,0.6) 100%)" }}
      />
      {/* twinkling stars */}
      {[
        { t:"6%",  l:"18%", s:2.2, o:0.85, c:"#ffffff" },
        { t:"2%",  l:"58%", s:1.5, o:0.65, c:"#e8d5ff" },
        { t:"10%", l:"74%", s:1.8, o:0.75, c:"#ffccff" },
        { t:"14%", l:"8%",  s:1.2, o:0.55, c:"#d4b0ff" },
        { t:"4%",  l:"44%", s:2.0, o:0.80, c:"#ffe0ff" },
        { t:"18%", l:"52%", s:1.4, o:0.60, c:"#ffffff" },
        { t:"8%",  l:"84%", s:1.6, o:0.70, c:"#e8d5ff" },
        { t:"20%", l:"32%", s:1.0, o:0.50, c:"#d4b0ff" },
        { t:"3%",  l:"92%", s:1.3, o:0.65, c:"#ffccff" },
        { t:"12%", l:"38%", s:1.7, o:0.72, c:"#ffffff" },
      ].map((star, i) => (
        <div key={i} className="absolute rounded-full" style={{
          top: star.t, left: star.l,
          width: star.s, height: star.s,
          background: star.c,
          opacity: star.o,
          animation: `star-twinkle ${2 + (i % 3)}s ease-in-out ${(i * 0.4) % 3}s infinite`,
        }} />
      ))}
    </div>
  );
}

function HomeContent() {
  const [appState, setAppState] = useState<AppState>("menu");
  const account = useActiveAccount();

  const handlePlay = () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    setAppState("payment");
  };

  const handlePaymentSuccess = () => {
    setAppState("game");
  };

  if (appState === "game" && account) {
    return (
      <GamePage
        walletAddress={account.address}
        onExit={() => setAppState("menu")}
      />
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start py-6 px-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-end mb-4">
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={BASE_CHAIN}
              connectModal={{
                size: "compact",
                title: "Connect Wallet",
                titleIcon: "",
              }}
              theme="dark"
            />
          </div>

          <div className="text-center mb-6">
            <div className="flex justify-center mb-4" style={{ animation: "float 3s ease-in-out infinite" }}>
              <div style={{ animation: "pulse-glow 3s ease-in-out infinite", borderRadius: "50%" }}>
                <SoneiumLogo size={80} />
              </div>
            </div>

            <h1
              className="mb-3 text-center leading-relaxed"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "clamp(1rem, 4vw, 1.35rem)",
                color: "#e060ff",
                textShadow: "0 0 8px rgba(220,80,255,0.9), 0 0 20px rgba(180,0,255,0.6), 0 0 40px rgba(140,0,200,0.35), 3px 3px 0px #3a0060",
                letterSpacing: "0.04em",
              }}
            >
              INK FLAPPY BIRD
            </h1>
            <p className="text-gray-400 text-sm">Fly the Ink chain. Earn your glory.</p>

            {account && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-400 text-xs font-mono">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
                <span className="text-gray-600 text-xs">Ink Mainnet</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handlePlay}
              className="w-full py-5 rounded-2xl text-xl font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #00B8D4 0%, #0080FF 50%, #6B00FF 100%)",
                boxShadow: "0 0 30px rgba(0,184,212,0.5), 0 8px 32px rgba(0,0,0,0.3)",
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            >
              {account ? "PLAY — 0.000025 ETH" : "Connect & Play"}
            </button>

            {!account && (
              <p className="text-center text-gray-500 text-xs">
                Connect your wallet to start playing on Ink Mainnet
              </p>
            )}

            <div
              className="rounded-xl p-3 text-center"
              style={{ background: "rgba(0,184,212,0.08)", border: "1px solid rgba(0,184,212,0.2)" }}
            >
              <p className="text-cyan-400 font-black text-base">0.000025 ETH</p>
              <p className="text-gray-500 text-xs">Single Play · Ink Mainnet</p>
            </div>
          </div>

          <div className="mb-6">
            <Leaderboard currentAddress={account?.address} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-gray-600 text-xs">Powered by Ink Mainnet</p>
            <p className="text-gray-700 text-xs">Built with ThirdWeb</p>
          </div>
        </div>
      </div>
      {appState === "payment" && (
        <PaymentModal
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setAppState("menu")}
        />
      )}
    </div>
  );
}

export function HomePage() {
  return (
    <ThirdwebProvider>
      <HomeContent />
    </ThirdwebProvider>
  );
}
