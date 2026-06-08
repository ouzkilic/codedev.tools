export const FAVICON_SIZES = [16, 32, 48, 180];

// Recommended HTML <link> tags for the generated favicons.
export function linkTags(): string {
  return [
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">',
  ].join('\n');
}
