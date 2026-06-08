import { Database } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'sql-ddl-to-ts',
  title: 'SQL DDL → TypeScript',
  description: 'Converts a CREATE TABLE statement into a TypeScript interface.',
  category: 'schema',
  keywords: ['sql', 'ddl', 'create table', 'typescript', 'interface', 'types'],
  icon: Database,
  load: () => import('./index'),
};
