import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportToCSV(data, filename = 'export.csv') {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(fileUri);
}

export async function importFromCSV(fileUri) {
  const content = await FileSystem.readAsStringAsync(fileUri);
  const rows = content.split('\n').map(line => line.split(','));
  return rows;
}
