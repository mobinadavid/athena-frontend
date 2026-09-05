export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatAmount(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 8,
  }).format(value);
}

export function truncateAddress(address: string, chars = 6) {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function localized(title?: Record<string, string | undefined> | string) {
  if (!title) return "—";
  if (typeof title === "string") return title;
  return title.en || title.fa || Object.values(title).find(Boolean) || "—";
}

export function blockchainLabel(blockchain: {
  title?: Record<string, string>;
  name: string;
  native_asset: string;
}) {
  const title = localized(blockchain.title);
  return title !== "—" ? title : blockchain.name || blockchain.native_asset;
}
