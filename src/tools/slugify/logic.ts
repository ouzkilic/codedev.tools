import type { ToolLogic } from '@/hooks/useToolState';

const TR_MAP: Record<string, string> = {
  ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g',
  ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c',
};

export const slugifyLogic: ToolLogic = {
  transform(input: string): string {
    return input
      .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (c) => TR_MAP[c]) // Turkish letters → ASCII
      .normalize('NFKD') // split accented letters into base + diacritic
      .replace(/[̀-ͯ]/g, '') // strip diacritics
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → hyphen
      .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
  },
};
