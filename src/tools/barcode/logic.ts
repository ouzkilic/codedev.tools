export const BARCODE_FORMATS = [
  'CODE128',
  'CODE39',
  'EAN13',
  'EAN8',
  'UPC',
  'ITF14',
  'MSI',
  'pharmacode',
  'codabar',
] as const;

export type BarcodeFormat = (typeof BARCODE_FORMATS)[number];
