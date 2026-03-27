import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Config, type MealType } from '../../constants/config';
import { NutritionBar } from '../../components/NutritionBar';
import { useMealStore } from '../../store/useMealStore';
import type { Meal } from '../../db/meals';
import { formatDateFull, formatTime } from '../../utils/date';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMeal, updateMeal, deleteMeal } = useMealStore();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (id) {
      getMeal(id).then((m) => {
        if (m) {
          setMeal(m);
          setDescription(m.description);
          setMealType((m.meal_type as MealType) ?? 'lunch');
          setCalories(m.calories != null ? String(Math.round(m.calories)) : '');
          setProtein(m.protein_g != null ? String(Math.round(m.protein_g)) : '');
          setCarbs(m.carbs_g != null ? String(Math.round(m.carbs_g)) : '');
          setFat(m.fat_g != null ? String(Math.round(m.fat_g)) : '');
        }
      });
    }
  }, [id]);

  if (!meal) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const handleSave = async () => {
    await updateMeal(meal.id, {
      description,
      meal_type: mealType,
      calories: parseFloat(calories) || null,
      protein_g: parseFloat(protein) || null,
      carbs_g: parseFloat(carbs) || null,
      fat_g: parseFloat(fat) || null,
    });
    setEditing(false);
    const updated = await getMeal(meal.id);
    if (updated) setMeal(updated);
  };

  const handleDelete = () => {
    Alert.alert('Delete Meal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMeal(meal.id);
          router.back();
        },
      },
    ]);
  };

  const parsedItems = meal.parsed_items
    ? JSON.parse(meal.parsed_items)
    : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
    >
      {/* Date & Time */}
      <Text style={styles.dateTime}>
        {formatDateFull(meal.logged_at)} at {formatTime(meal.logged_at)}
      </Text>

      {editing ? (
        <>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.typeRow}>
            {Config.mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeBtn,
                  mealType === type && styles.typeBtnActive,
                ]}
                onPress={() => setMealType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    mealType === type && styles.typeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nutrition (manual override)</Text>
          <View style={styles.nutritionGrid}>
            <NutritionInput label="Calories" value={calories} onChange={setCalories} unit="kcal" />
            <NutritionInput label="Protein" value={protein} onChange={setProtein} unit="g" />
            <NutritionInput label="Carbs" value={carbs} onChange={setCarbs} unit="g" />
            <NutritionInput label="Fat" value={fat} onChange={setFat} unit="g" />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Description */}
          <Text style={styles.mealDescription}>{meal.description}</Text>
          {meal.meal_type && (
            <Text style={styles.mealTypeLabel}>{meal.meal_type}</Text>
          )}

          {/* Nutrition Summary */}
          {meal.calories != null && (
            <View style={styles.nutritionCard}>
              <Text style={styles.caloriesBig}>
                {Math.round(meal.calories)} <Text style={styles.kcal}>kcal</Text>
              </Text>
              <NutritionBar
                calories={meal.calories ?? 0}
                protein={meal.protein_g ?? 0}
                carbs={meal.carbs_g ?? 0}
                fat={meal.fat_g ?? 0}
                fiber={meal.fiber_g ?? 0}
              />
            </View>
          )}

          {/* Parsed Items */}
          {parsedItems.length > 0 && (
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Items</Text>
              {parsedItems.map((item: any, i: number) => (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.quantity}</Text>
                  </View>
                  <Text style={styles.itemCal}>
                    {Math.round(item.calories)} kcal
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function NutritionInput({
  label,
  value,
  onChange,
  unit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
}) {
  return (
    <View style={styles.nutritionInputContainer}>
      <Text style={styles.nutritionInputLabel}>{label}</Text>
      <View style={styles.nutritionInputRow}>
        <TextInput
          style={styles.nutritionInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={Colors.textMuted}
        />
        <Text style={styles.nutritionInputUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  dateTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  mealDescription: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  mealTypeLabel: {
    fontSize: 14,
    color: Colors.primary,
    textTransform: 'capitalize',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
    overflow: 'hidden',
  },
  nutritionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  caloriesBig: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.calories,
    marginBottom: 16,
  },
  kcal: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  itemsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  itemLeft: {},
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  itemQty: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemCal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.calories,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editBtnText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: Colors.error + '15',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: Colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  // Edit mode
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  typeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  typeTextActive: {
    color: Colors.primary,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nutritionInputContainer: {
    width: '47%',
  },
  nutritionInputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  nutritionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
  },
  nutritionInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 10,
  },
  nutritionInputUnit: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
