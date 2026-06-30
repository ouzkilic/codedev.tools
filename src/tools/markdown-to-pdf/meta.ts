import { FileDown } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'markdown-to-pdf',
  title: 'Markdown → PDF',
  description: 'Render Markdown and export it as a PDF — runs entirely in your browser.',
  category: 'markdown',
  keywords: ['markdown', 'md', 'pdf', 'export', 'print', 'convert', 'document', 'save', 'readme'],
  icon: FileDown,
  load: () => import('./index'),
};
