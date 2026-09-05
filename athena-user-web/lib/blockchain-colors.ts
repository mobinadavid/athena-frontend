const PALETTE = [
  { hex: "#f7931a", className: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" },
  { hex: "#627eea", className: "bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200" },
  { hex: "#ef4444", className: "bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-200" },
  { hex: "#26a17b", className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200" },
  { hex: "#8247e5", className: "bg-violet-100 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200" },
  { hex: "#14f195", className: "bg-teal-100 text-teal-900 dark:bg-teal-500/20 dark:text-teal-200" },
  { hex: "#f0b90b", className: "bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200" },
  { hex: "#345d9d", className: "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200" },
];

const NAMED: Record<string, (typeof PALETTE)[number]> = {
  btc: PALETTE[0],
  bitcoin: PALETTE[0],
  eth: PALETTE[1],
  ethereum: PALETTE[1],
  trx: PALETTE[2],
  tron: PALETTE[2],
  usdt: PALETTE[3],
  tether: PALETTE[3],
  matic: PALETTE[4],
  polygon: PALETTE[4],
  sol: PALETTE[5],
  solana: PALETTE[5],
  bnb: PALETTE[6],
  bsc: PALETTE[6],
  ltc: PALETTE[7],
  litecoin: PALETTE[7],
};

function keyOf(value: string) {
  return value.trim().toLowerCase();
}

export function getBlockchainAccent(name: string) {
  const key = keyOf(name);
  if (NAMED[key]) return NAMED[key];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export const BLOCKCHAIN_COLORS = NAMED;
