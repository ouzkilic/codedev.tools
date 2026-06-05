import {
  Braces, Shield, GitCompare, Code2, Table2, FileText, Lock,
  Type, Clock, Hash, Palette, Globe, Sparkles, Boxes,
} from 'lucide-react';
import type { ToolCategory } from './types';

export const CATEGORIES: Record<
  ToolCategory,
  { label: string; icon: typeof Braces; order: number }
> = {
  json:        { label: 'JSON',            icon: Braces,     order: 1 },
  schema:      { label: 'Schema & Types',  icon: Shield,     order: 2 },
  compare:     { label: 'Compare & Diff',  icon: GitCompare, order: 2.5 },
  xml:         { label: 'XML',             icon: Code2,      order: 3 },
  'csv-excel': { label: 'CSV & Excel',     icon: Table2,   order: 4 },
  yaml:        { label: 'YAML & TOML',     icon: FileText, order: 5 },
  encode:      { label: 'Encode/Decode',   icon: Type,     order: 6 },
  crypto:      { label: 'Hash & Crypto',   icon: Lock,     order: 7 },
  text:        { label: 'Text',            icon: Type,     order: 8 },
  datetime:    { label: 'Date & Time',     icon: Clock,    order: 9 },
  number:      { label: 'Numbers & Units', icon: Hash,     order: 9.5 },
  color:       { label: 'Color & Design',  icon: Palette,  order: 9.7 },
  web:         { label: 'Web & Frontend',  icon: Globe,    order: 9.8 },
  format:      { label: 'Format & Code',   icon: Code2,    order: 10 },
  generate:    { label: 'Generators',      icon: Sparkles, order: 11 },
  misc:        { label: 'Misc',            icon: Boxes,    order: 12 },
};

export const orderedCategories = Object.entries(CATEGORIES)
  .sort((a, b) => a[1].order - b[1].order)
  .map(([key, val]) => ({ key: key as ToolCategory, ...val }));
