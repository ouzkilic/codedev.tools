// Maps a format name to its MIME type. Defaults to image/png for unknown formats.
export function mimeFor(format: string): string {
  switch (format) {
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'png':
      return 'image/png';
    default:
      return 'image/png';
  }
}

// Maps a format name to a file extension. Defaults to the format itself, falling back to png.
export function extFor(format: string): string {
  switch (format) {
    case 'jpg':
    case 'jpeg':
      return 'jpeg';
    case 'webp':
      return 'webp';
    case 'png':
      return 'png';
    default:
      return format || 'png';
  }
}
