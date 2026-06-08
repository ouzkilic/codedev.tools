import { Barcode } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'barcode',
  title: 'Barcode Generator',
  description: 'Generates a barcode (CODE128, EAN, UPC and more).',
  category: 'generate',
  keywords: ['barcode', 'code128', 'ean', 'upc', 'generate', 'jsbarcode'],
  icon: Barcode,
  load: () => import('./index'),
};
