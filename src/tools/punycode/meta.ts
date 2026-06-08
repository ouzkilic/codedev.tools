import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'punycode',
  title: 'Punycode',
  description: 'Encodes/decodes internationalized domain names (Punycode, RFC 3492).',
  category: 'encode',
  keywords: ['punycode', 'idn', 'domain', 'rfc3492', 'encode', 'decode'],
  icon: Type,
  load: () => import('./index'),
};
