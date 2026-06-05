import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

export type ToolCategory =
  | 'json' | 'schema' | 'compare' | 'xml' | 'csv-excel' | 'yaml'
  | 'encode' | 'crypto' | 'text' | 'datetime' | 'number' | 'color'
  | 'web' | 'markdown' | 'format' | 'generate' | 'misc';

export interface ToolMeta {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  icon: LucideIcon;
  load: () => Promise<{ default: ComponentType }>;
}
