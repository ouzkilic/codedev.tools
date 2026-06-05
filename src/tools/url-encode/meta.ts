import { Link } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'url-encode',
  title: 'URL Encode / Decode',
  description: 'Percent-encodes text for URLs or decodes it back.',
  category: 'encode',
  keywords: ['url', 'uri', 'encode', 'decode', 'percent', 'escape'],
  icon: Link,
  load: () => import('./index'),
};
