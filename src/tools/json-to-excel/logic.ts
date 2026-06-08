// Heavy lib (SheetJS): dynamically imported so it only loads when this tool runs.
export async function jsonToXlsx(jsonString: string): Promise<Uint8Array> {
  const data = JSON.parse(jsonString);
  if (!Array.isArray(data)) throw new Error('Input must be a JSON array of objects.');
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}
