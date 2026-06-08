export const RAMP = '@%#*+=-:. ';

// Converts RGBA pixel data into ASCII art. Each pixel maps to one character
// from `ramp`, where darker pixels use denser (earlier) characters.
export function rgbaToAscii(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  ramp = RAMP,
): string {
  const rows: string[] = [];
  const last = ramp.length - 1;
  for (let y = 0; y < height; y++) {
    let row = '';
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      const idx = Math.floor((l / 255) * last);
      row += ramp[idx];
    }
    rows.push(row);
  }
  return rows.join('\n');
}
