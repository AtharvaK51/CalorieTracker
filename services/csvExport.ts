import {
  documentDirectory,
  cacheDirectory,
  writeAsStringAsync,
  EncodingType,
  StorageAccessFramework,
} from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform, Alert } from 'react-native';
import { getAllMeals, type Meal } from '../db/meals';

function buildCSV(meals: Meal[]): string {
  const header =
    'Date,Time,Description,Meal Type,Calories,Protein (g),Carbs (g),Fat (g),Fiber (g)\n';

  const rows = meals
    .map((meal: Meal) => {
      const date = meal.logged_at.split('T')[0];
      const time = meal.logged_at.split('T')[1]?.substring(0, 5) ?? '';
      const desc = `"${(meal.description ?? '').replace(/"/g, '""')}"`;
      return [
        date,
        time,
        desc,
        meal.meal_type ?? '',
        meal.calories ?? '',
        meal.protein_g ?? '',
        meal.carbs_g ?? '',
        meal.fat_g ?? '',
        meal.fiber_g ?? '',
      ].join(',');
    })
    .join('\n');

  return header + rows;
}

/**
 * Share CSV via system share sheet (works on both platforms, no permissions needed)
 */
export async function shareMealsCSV(): Promise<void> {
  const meals = await getAllMeals();
  const csv = buildCSV(meals);
  const fileUri = cacheDirectory + 'meals_export.csv';

  await writeAsStringAsync(fileUri, csv, {
    encoding: EncodingType.UTF8,
  });

  await shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Meals',
  });
}

/**
 * Save CSV to Downloads folder
 * - Android: Uses Storage Access Framework (SAF) to let user pick location
 * - iOS: Falls back to share sheet (iOS doesn't have a public Downloads folder)
 */
export async function saveToDownloads(): Promise<void> {
  const meals = await getAllMeals();
  if (meals.length === 0) {
    Alert.alert('No Data', 'No meals to export');
    return;
  }

  const csv = buildCSV(meals);
  const fileName = `meals_export_${new Date().toISOString().split('T')[0]}.csv`;

  if (Platform.OS === 'android') {
    await saveToDownloadsAndroid(csv, fileName);
  } else {
    // iOS: no Downloads folder, use share sheet
    await shareMealsCSV();
  }
}

async function saveToDownloadsAndroid(
  csv: string,
  fileName: string
): Promise<void> {
  // Request permission to pick a directory
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    Alert.alert('Permission Denied', 'Storage access is required to save the file.');
    return;
  }

  const directoryUri = permissions.directoryUri;

  // Create the file in the selected directory
  const fileUri = await StorageAccessFramework.createFileAsync(
    directoryUri,
    fileName,
    'text/csv'
  );

  await writeAsStringAsync(fileUri, csv, {
    encoding: EncodingType.UTF8,
  });

  Alert.alert('Saved!', `${fileName} saved successfully.`);
}
