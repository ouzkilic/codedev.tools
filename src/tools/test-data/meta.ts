import { Sparkles } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'test-data',
  title: 'Test Data Generator',
  description: 'Generates Luhn-valid test credit-card numbers and test IBANs.',
  category: 'generate',
  keywords: ['test', 'credit card', 'iban', 'luhn', 'fake', 'data'],
  icon: Sparkles,
  load: () => import('./index'),
};
