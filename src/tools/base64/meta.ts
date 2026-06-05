import { Binary } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64',
  title: 'Base64 Encode / Decode',
  description: 'Encodes text to Base64 or decodes Base64 back to text (UTF-8).',
  category: 'encode',
  keywords: ['base64', 'encode', 'decode', 'btoa', 'atob'],
  icon: Binary,
  load: () => import('./index'),
};
