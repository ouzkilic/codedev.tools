import { QrCode } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'qr',
  title: 'QR Code Generator',
  description: 'Generates a QR code from text or a URL.',
  category: 'generate',
  keywords: ['qr', 'qrcode', 'barcode', 'generate', 'url'],
  icon: QrCode,
  load: () => import('./index'),
};
