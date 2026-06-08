import { Image } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'base64-to-file',
  title: 'Base64 → File',
  description: 'Decodes a Base64 / data URI back into a downloadable file.',
  category: 'image',
  keywords: ['base64', 'data uri', 'datauri', 'decode', 'file', 'download', 'image'],
  icon: Image,
  load: () => import('./index'),
};
