import type { AsyncToolLogic } from '@/hooks/useAsyncToolState';

export const asciiArtLogic: AsyncToolLogic = {
  async transform(input) {
    const figlet = (await import('figlet')).default;
    const fontMod = await import('figlet/importable-fonts/Standard.js');
    const fontData = (fontMod.default ?? fontMod) as string;
    figlet.parseFont('Standard', fontData);
    return figlet.textSync(input || 'text', { font: 'Standard' });
  },
};
