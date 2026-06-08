// Heavy lib (SheetJS): dynamically imported so it only loads when this tool runs.
export async function excelToJson(buffer: ArrayBuffer | Uint8Array): Promise<string> {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buffer, { type: 'array' });
  const name = wb.SheetNames[0];
  if (!name) throw new Error('No sheets found in the workbook.');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name]);
  return JSON.stringify(rows, null, 2);
}
