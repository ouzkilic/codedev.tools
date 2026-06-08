import { Database } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'sql-ddl-to-prisma',
  title: 'SQL DDL → Prisma',
  description: 'Converts a CREATE TABLE statement into a Prisma model.',
  category: 'schema',
  keywords: ['sql', 'ddl', 'prisma', 'orm', 'model', 'schema'],
  icon: Database,
  load: () => import('./index'),
};
