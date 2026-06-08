import type { ToolOption, ToolOptions } from '@/hooks/useToolState';

export const ENTITY_OPTIONS: ToolOption[] = [
  { key: 'filter', label: 'Search', type: 'text', default: '', placeholder: 'copy, arrow, euro…' },
];

const ENTITIES: [string, string, string][] = [
  ['&amp;', '&', 'ampersand'],
  ['&lt;', '<', 'less-than'],
  ['&gt;', '>', 'greater-than'],
  ['&quot;', '"', 'double quote'],
  ['&apos;', "'", 'apostrophe'],
  ['&copy;', '©', 'copyright'],
  ['&reg;', '®', 'registered'],
  ['&trade;', '™', 'trademark'],
  ['&euro;', '€', 'euro'],
  ['&cent;', '¢', 'cent'],
  ['&pound;', '£', 'pound sterling'],
  ['&yen;', '¥', 'yen'],
  ['&curren;', '¤', 'currency'],
  ['&nbsp;', ' ', 'non-breaking space'],
  ['&hellip;', '…', 'horizontal ellipsis'],
  ['&mdash;', '—', 'em dash'],
  ['&ndash;', '–', 'en dash'],
  ['&bull;', '•', 'bullet'],
  ['&middot;', '·', 'middle dot'],
  ['&deg;', '°', 'degree'],
  ['&plusmn;', '±', 'plus-minus'],
  ['&times;', '×', 'multiplication'],
  ['&divide;', '÷', 'division'],
  ['&frac12;', '½', 'one half'],
  ['&frac14;', '¼', 'one quarter'],
  ['&frac34;', '¾', 'three quarters'],
  ['&sup2;', '²', 'superscript two'],
  ['&sup3;', '³', 'superscript three'],
  ['&micro;', 'µ', 'micro sign'],
  ['&para;', '¶', 'pilcrow'],
  ['&sect;', '§', 'section sign'],
  ['&dagger;', '†', 'dagger'],
  ['&Dagger;', '‡', 'double dagger'],
  ['&permil;', '‰', 'per mille'],
  ['&larr;', '←', 'leftwards arrow'],
  ['&uarr;', '↑', 'upwards arrow'],
  ['&rarr;', '→', 'rightwards arrow'],
  ['&darr;', '↓', 'downwards arrow'],
  ['&harr;', '↔', 'left right arrow'],
  ['&spades;', '♠', 'spade suit'],
  ['&clubs;', '♣', 'club suit'],
  ['&hearts;', '♥', 'heart suit'],
  ['&diams;', '♦', 'diamond suit'],
  ['&laquo;', '«', 'left angle quote'],
  ['&raquo;', '»', 'right angle quote'],
  ['&ldquo;', '“', 'left double quote'],
  ['&rdquo;', '”', 'right double quote'],
  ['&lsquo;', '‘', 'left single quote'],
  ['&rsquo;', '’', 'right single quote'],
  ['&infin;', '∞', 'infinity'],
  ['&ne;', '≠', 'not equal'],
  ['&le;', '≤', 'less-than or equal'],
  ['&ge;', '≥', 'greater-than or equal'],
  ['&radic;', '√', 'square root'],
  ['&sum;', '∑', 'n-ary summation'],
  ['&check;', '✓', 'check mark'],
  ['&cross;', '✗', 'ballot x'],
  ['&star;', '★', 'black star'],
  ['&loz;', '◊', 'lozenge'],
];

export function buildEntities(options: ToolOptions): string {
  const q = String(options.filter ?? '')
    .trim()
    .toLowerCase();
  const rows = q
    ? ENTITIES.filter(([name, , desc]) => name.toLowerCase().includes(q) || desc.toLowerCase().includes(q))
    : ENTITIES;
  if (rows.length === 0) return 'No matches.';
  return rows.map(([name, char, desc]) => `${name}\t${char}\t${desc}`).join('\n');
}
