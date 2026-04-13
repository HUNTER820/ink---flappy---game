export interface LeaderboardEntry {
  address: string;
  score: number;
  name: string;
  timestamp: number;
}

const STORAGE_KEY = "base_flappy_leaderboard";

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultLeaderboard();
    const parsed = JSON.parse(data) as LeaderboardEntry[];
    return parsed.sort((a, b) => b.score - a.score).slice(0, 100);
  } catch {
    return getDefaultLeaderboard();
  }
}

export function submitScore(address: string, score: number): void {
  const board = getLeaderboard();
  const shortAddr = address.slice(0, 6) + "..." + address.slice(-4);
  const existing = board.findIndex(e => e.address.toLowerCase() === address.toLowerCase());
  if (existing !== -1) {
    if (score > board[existing].score) {
      board[existing].score = score;
      board[existing].timestamp = Date.now();
    }
  } else {
    board.push({
      address,
      score,
      name: shortAddr,
      timestamp: Date.now(),
    });
  }
  const sorted = board.sort((a, b) => b.score - a.score).slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
}

function getDefaultLeaderboard(): LeaderboardEntry[] {
  return [
    { address: "0xDEF1...A1B2", score: 247, name: "0xDEF1...A1B2", timestamp: Date.now() - 86400000 },
    { address: "0xBASE...C3D4", score: 198, name: "0xBASE...C3D4", timestamp: Date.now() - 172800000 },
    { address: "0x1337...E5F6", score: 175, name: "0x1337...E5F6", timestamp: Date.now() - 259200000 },
    { address: "0xSOL1...G7H8", score: 142, name: "0xSOL1...G7H8", timestamp: Date.now() - 345600000 },
    { address: "0xETH2...I9J0", score: 131, name: "0xETH2...I9J0", timestamp: Date.now() - 432000000 },
    { address: "0xCRYP...K1L2", score: 118, name: "0xCRYP...K1L2", timestamp: Date.now() - 518400000 },
    { address: "0xBLOC...M3N4", score: 99, name: "0xBLOC...M3N4", timestamp: Date.now() - 604800000 },
    { address: "0xNODE...O5P6", score: 87, name: "0xNODE...O5P6", timestamp: Date.now() - 691200000 },
    { address: "0xWEB3...Q7R8", score: 76, name: "0xWEB3...Q7R8", timestamp: Date.now() - 777600000 },
    { address: "0xDEFI...S9T0", score: 65, name: "0xDEFI...S9T0", timestamp: Date.now() - 864000000 },
  ];
}
