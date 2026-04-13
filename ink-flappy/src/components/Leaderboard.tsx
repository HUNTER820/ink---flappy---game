import { getLeaderboard } from "@/lib/leaderboard";

interface LeaderboardProps {
  currentAddress?: string;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({ currentAddress }: LeaderboardProps) {
  const entries = getLeaderboard();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(0,10,25,0.8)",
        border: "1px solid rgba(0,184,212,0.25)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, rgba(0,184,212,0.15), rgba(107,0,255,0.1))" }}
      >
        <span className="text-xl">🏆</span>
        <h3 className="text-white font-black text-sm tracking-wider uppercase">Global Leaderboard</h3>
        <span className="ml-auto text-gray-500 text-xs">Top 100</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">No scores yet. Be the first!</div>
        ) : (
          entries.map((entry, idx) => {
            const isCurrentUser =
              currentAddress &&
              entry.address.toLowerCase().includes(currentAddress.slice(2, 6).toLowerCase());
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{
                  background: isCurrentUser
                    ? "rgba(0,184,212,0.12)"
                    : idx % 2 === 0
                    ? "transparent"
                    : "rgba(255,255,255,0.02)",
                  borderLeft: isCurrentUser ? "3px solid rgba(0,184,212,0.7)" : "3px solid transparent",
                }}
              >
                <span className="w-7 text-center font-bold text-sm">
                  {idx < 3 ? MEDALS[idx] : (
                    <span className="text-gray-500">{idx + 1}</span>
                  )}
                </span>
                <span
                  className="font-mono flex-1 truncate text-center text-[13px]"
                  style={{ color: isCurrentUser ? "#00B8D4" : "#94a3b8" }}
                >
                  {entry.name}
                </span>
                <span
                  className="font-black text-sm"
                  style={{ color: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "#00B8D4" }}
                >
                  {entry.score}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
