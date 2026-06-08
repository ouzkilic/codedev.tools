export interface Size {
  width: number;
  height: number;
}

// Computes the output dimensions for a resize, optionally preserving aspect ratio.
export function computeSize(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  keepAspect: boolean,
): Size {
  if (keepAspect && targetW > 0 && targetH > 0) {
    const scale = Math.min(targetW / srcW, targetH / srcH);
    return { width: Math.round(srcW * scale), height: Math.round(srcH * scale) };
  }
  if (keepAspect && targetW > 0 && targetH <= 0) {
    const scale = targetW / srcW;
    return { width: Math.round(srcW * scale), height: Math.round(srcH * scale) };
  }
  if (keepAspect && targetH > 0 && targetW <= 0) {
    const scale = targetH / srcH;
    return { width: Math.round(srcW * scale), height: Math.round(srcH * scale) };
  }
  return { width: targetW || srcW, height: targetH || srcH };
}
