export interface CanvasSize {
  width: number;
  height: number;
}

export interface SizeOpts {
  lineHeight: number;
  padding: number;
  charWidth: number;
}

// Pure size computation (canvas rendering itself happens in the component).
export function computeCanvasSize(lines: string[], opts: SizeOpts): CanvasSize {
  const maxLen = lines.reduce((m, l) => Math.max(m, l.length), 0);
  const width = Math.ceil(opts.padding * 2 + maxLen * opts.charWidth);
  const height = Math.ceil(opts.padding * 2 + Math.max(lines.length, 1) * opts.lineHeight);
  return { width: Math.max(width, 120), height: Math.max(height, 60) };
}
