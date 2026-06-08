import { QrCode } from 'lucide-react';
import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  id: 'qr-decode',
  title: 'QR Code Reader',
  description: 'Reads a QR code from an image.',
  category: 'image',
  keywords: ['qr', 'qrcode', 'decode', 'read', 'scan', 'image'],
  icon: QrCode,
  load: () => import('./index'),
};
