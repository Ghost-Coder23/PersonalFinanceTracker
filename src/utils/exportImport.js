import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
};

export async function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    throw new Error('No data available to export.');
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => escapeCsvValue(row[header])).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return fileUri;

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: filename,
    UTI: 'public.comma-separated-values-text',
  });
  return fileUri;
}

export async function importFromCSV(fileUri) {
  const content = await FileSystem.readAsStringAsync(fileUri);
  const rows = content.split('\n').map((line) => line.split(','));
  return rows;
}
