import { Type } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'quoted-printable',
  title: 'Quoted-Printable',
  description: 'Encodes or decodes Quoted-Printable (MIME) text.',
  category: 'encode',
  keywords: ['quoted-printable', 'qp', 'mime', 'email', 'encode', 'decode'],
  icon: Type,
  load: () => import('./index'),
};
