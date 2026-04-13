import { useState } from "react";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { prepareTransaction, toWei } from "thirdweb";
import { client, BASE_CHAIN, SINGLE_PLAY_ETH, RECIPIENT_ADDRESS } from "@/lib/thirdweb";
import { Confetti } from "./Confetti";
import { SoneiumLogo } from "./SoneiumLogo";

interface PaymentModalProps {
  onPaymentSuccess: () => void;
  onClose: () => void;
}

type PaymentState = "choose" | "paying" | "success" | "error";

export function PaymentModal({ onPaymentSuccess, onClose }: PaymentModalProps) {
  const [state, setState] = useState<PaymentState>("choose");
  const [errorMsg, setErrorMsg] = useState("");
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  async function handlePay() {
    if (!account) {
      setErrorMsg("No wallet connected.");
      setState("error");
      return;
    }
    setState("paying");
    try {
      const value = toWei(SINGLE_PLAY_ETH);
      const tx = prepareTransaction({
        chain: BASE_CHAIN,
        client,
        to: RECIPIENT_ADDRESS,
        value,
      });
      await sendTransaction(tx);
      setState("success");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMsg(e?.message || "Transaction failed. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <Confetti />
        <div
          className="relative max-w-md w-full mx-4 rounded-3xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(45,0,90,0.97), rgba(26,0,53,0.97))",
            border: "2px solid rgba(160,80,255,0.5)",
            boxShadow: "0 0 60px rgba(140,0,220,0.35), 0 0 120px rgba(80,0,160,0.2)",
            animation: "celebrate 0.5s ease-out forwards",
          }}
        >
          <div className="flex justify-center mb-4">
            <div style={{ animation: "float 2s ease-in-out infinite" }}>
              <SoneiumLogo size={80} />
            </div>
          </div>

          <div className="text-5xl mb-4">🎉</div>

          <h2 className="text-3xl font-black text-white mb-2" style={{ textShadow: "0 0 20px rgba(0,184,212,0.8)" }}>
            Payment Successful!
          </h2>

          <p className="text-cyan-400 text-lg mb-2 font-semibold">Single Play Unlocked!</p>

          <p className="text-gray-300 mb-8">One game session is ready for you!</p>

          <div className="flex gap-3 justify-center">
            <span className="text-4xl">🚀</span>
            <span className="text-4xl">⚡</span>
            <span className="text-4xl">🎮</span>
          </div>

          <p className="mt-4 text-xl font-bold text-white">Let's Play the Game!</p>

          <button
            onClick={() => onPaymentSuccess()}
            className="mt-6 w-full py-4 rounded-2xl text-xl text-white transition-all hover:scale-105 active:scale-95 font-extrabold"
            style={{
              background: "linear-gradient(135deg, #00B8D4, #0080FF, #6B00FF)",
              boxShadow: "0 0 30px rgba(0,184,212,0.6)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  if (state === "paying") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="rounded-3xl p-10 text-center max-w-sm mx-4" style={{ background: "linear-gradient(135deg, rgba(45,0,90,0.97), rgba(26,0,53,0.97))", border: "1px solid rgba(160,80,255,0.4)", boxShadow: "0 0 40px rgba(120,0,200,0.3)" }}>
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent"
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
          <p className="text-white text-xl font-bold">Processing Payment...</p>
          <p className="text-gray-400 mt-2">Confirm in your wallet</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="rounded-3xl p-8 text-center max-w-sm mx-4" style={{ background: "linear-gradient(135deg, rgba(45,0,90,0.97), rgba(26,0,53,0.97))", border: "1px solid rgba(160,80,255,0.4)", boxShadow: "0 0 40px rgba(120,0,200,0.3)" }}>
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-400 text-xl font-bold mb-2">Payment Failed</p>
          <p className="text-gray-400 text-sm mb-6">{errorMsg}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setState("choose")}
              className="flex-1 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/30 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-400 font-semibold hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="relative max-w-lg w-full mx-4 rounded-3xl p-8"
        style={{
          background: "linear-gradient(135deg, rgba(45,0,90,0.97), rgba(26,0,53,0.97))",
          border: "1px solid rgba(160,80,255,0.4)",
          boxShadow: "0 0 60px rgba(120,0,200,0.35), 0 0 120px rgba(80,0,160,0.15)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <SoneiumLogo size={60} />
        </div>

        <h2 className="text-2xl font-black text-center text-white mb-1">Play Now</h2>
        <p className="text-gray-400 text-center text-sm mb-6">Pay on Ink Mainnet to start playing</p>

        <button
          onClick={() => handlePay()}
          className="group relative w-full rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, rgba(0,184,212,0.15), rgba(0,128,255,0.15))",
            border: "2px solid rgba(0,184,212,0.5)",
            boxShadow: "0 0 25px rgba(0,184,212,0.15)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎮</div>
            <div className="flex-1">
              <div className="text-white font-bold text-xl">Single Play</div>
              <div className="text-gray-400 text-sm mt-1">One game session on Ink Mainnet</div>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 font-black text-2xl">0.000025 ETH</div>
              <div className="text-gray-500 text-xs mt-1">Ink Mainnet</div>
            </div>
          </div>
        </button>

        <div className="mt-5 flex items-center gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <p className="text-gray-500 text-xs">Secured on Ink Mainnet</p>
        </div>
      </div>
    </div>
  );
}
