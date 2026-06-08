// Pure palette extraction — operates on plain RGBA pixel data only (no canvas/DOM).

function toHex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

// Quantize each channel to its high 4 bits, tally counts, and return the
// most common colors as '#rrggbb' hex strings. Fully transparent pixels (alpha 0)
// are skipped.
export function extractPalette(data: Uint8ClampedArray, count = 6): string[] {
  const counts = new Map<string, number>();

  for (let i = 0; i + 3 < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = (data[i] >> 4) << 4;
    const g = (data[i + 1] >> 4) << 4;
    const b = (data[i + 2] >> 4) << 4;
    const key = `${r},${g},${b}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => {
      const [r, g, b] = key.split(',').map(Number);
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    });
}
