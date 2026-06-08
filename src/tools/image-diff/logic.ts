export interface DiffStats {
  changed: number;
  total: number;
  percent: number;
}

// Compares two RGBA pixel buffers. A pixel is "changed" if any colour channel
// differs by more than the threshold, or if the alpha channels differ. When the
// buffers have different lengths, the overlap is compared and the extra pixels
// in the longer buffer are all counted as changed.
export function diffStats(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  threshold = 0,
): DiffStats {
  const lenA = Math.floor(a.length / 4);
  const lenB = Math.floor(b.length / 4);
  const total = lenA;
  const overlap = Math.min(lenA, lenB);

  let changed = 0;
  for (let p = 0; p < overlap; p++) {
    const i = p * 4;
    const dr = Math.abs(a[i] - b[i]);
    const dg = Math.abs(a[i + 1] - b[i + 1]);
    const db = Math.abs(a[i + 2] - b[i + 2]);
    const alphaDiff = a[i + 3] !== b[i + 3];
    if (dr > threshold || dg > threshold || db > threshold || alphaDiff) {
      changed++;
    }
  }

  // Count any extra pixels present in only one of the buffers as changed.
  changed += Math.abs(lenA - lenB);

  const percent = total === 0 ? 0 : Math.round((changed / total) * 100 * 100) / 100;
  return { changed, total, percent };
}
