/**
 * Compact number formatting: 1_000 → "1k", 1_100 → "1.1k", 1_000_000 → "1M"
 */
export function formatCompact(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(n);
}