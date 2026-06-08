import { Binary } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64url',
  title: 'Base64URL Encode / Decode',
  description: 'URL-safe Base64 (- _ , no padding).',
  category: 'encode',
  keywords: ['base64url', 'base64', 'url-safe', 'encode', 'decode'],
  icon: Binary,
  load: () => import('./index'),
};
