import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useProfileStore } from '../../store/useProfileStore';
import { calculateGoals } from '../../services/goalCalculator';

type Step = 'welcome' | 'body' | 'activity' | 'goal';

const activityLevels = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { key: 'light', label: 'Light', desc: 'Exercise 1-3 days/week' },
  { key: 'moderate', label: 'Moderate', desc: 'Exercise 3-5 days/week' },
  { key: 'active', label: 'Active', desc: 'Exercise 6-7 days/week' },
  { key: 'very_active', label: 'Very Active', desc: 'Hard exercise daily' },
] as const;

const genders = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
] as const;

export default function OnboardingScreen() {
  const { updateProfile } = useProfileStore();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<string>('male');
  const [activity, setActivity] = useState<string>('moderate');
  const [goals, setGoals] = useState({ calories: 2000, protein_g: 50, carbs_g: 250, fat_g: 65 });

  const skip = async () => {
    await updateProfile({ onboarding_done: 1 });
    router.replace('/(tabs)');
  };

  const nextStep = () => {
    if (step === 'welcome') setStep('body');
    else if (step === 'body') {
      setStep('activity');
    } else if (step === 'activity') {
      // Calculate goals
      const w = parseFloat(weight) || 70;
      const h = parseFloat(height) || 170;
      const a = parseInt(age) || 25;
      const g = calculateGoals(w, h, a, gender as any, activity as any);
      setGoals(g);
      setStep('goal');
    }
  };

  const finish = async () => {
    await updateProfile({
      name: name || null,
      weight_kg: parseFloat(weight) || null,
      height_cm: parseFloat(height) || null,
      age: parseInt(age) || null,
      gender: gender || null,
      activity_level: activity || null,
      calorie_goal: goals.calories,
      protein_goal_g: goals.protein_g,
      carbs_goal_g: goals.carbs_g,
      fat_goal_g: goals.fat_g,
      onboarding_done: 1,
    });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.skipBtn} onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {step === 'welcome' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>
              Let's set up your calorie goals. What's your name?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'body' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Body Stats</Text>
            <Text style={styles.subtitle}>
              We'll use these to calculate your daily calorie needs.
            </Text>

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 70"
              placeholderTextColor={Colors.textMuted}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 170"
              placeholderTextColor={Colors.textMuted}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              placeholderTextColor={Colors.textMuted}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.optionRow}>
              {genders.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.optionBtn,
                    gender === g.key && styles.optionBtnActive,
                  ]}
                  onPress={() => setGender(g.key)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      gender === g.key && styles.optionTextActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
              <Text style={styles.nextBtnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'activity' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Activity Level</Text>
            <Text style={styles.subtitle}>
              How active are you on a typical week?
            </Text>

            {activityLevels.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.activityCard,
                  activity === level.key && styles.activityCardActive,
                ]}
                onPress={() => setActivity(level.key)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    activity === level.key && styles.activityLabelActive,
                  ]}
                >
                  {level.label}
                </Text>
                <Text style={styles.activityDesc}>{level.desc}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
              <Text style={styles.nextBtnText}>Calculate My Goals</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'goal' && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Your Daily Goals</Text>
            <Text style={styles.subtitle}>
              Based on your profile. You can adjust these anytime in Settings.
            </Text>

            <View style={styles.goalCard}>
              <GoalRow
                label="Calories"
                value={goals.calories}
                unit="kcal"
                color={Colors.calories}
                onChangeText={(v) =>
                  setGoals((g) => ({ ...g, calories: parseInt(v) || 0 }))
                }
              />
              <GoalRow
                label="Protein"
                value={goals.protein_g}
                unit="g"
                color={Colors.protein}
                onChangeText={(v) =>
                  setGoals((g) => ({ ...g, protein_g: parseInt(v) || 0 }))
                }
              />
              <GoalRow
                label="Carbs"
                value={goals.carbs_g}
                unit="g"
                color={Colors.carbs}
                onChangeText={(v) =>
                  setGoals((g) => ({ ...g, carbs_g: parseInt(v) || 0 }))
                }
              />
              <GoalRow
                label="Fat"
                value={goals.fat_g}
                unit="g"
                color={Colors.fat}
                onChangeText={(v) =>
                  setGoals((g) => ({ ...g, fat_g: parseInt(v) || 0 }))
                }
              />
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={finish}>
              <Text style={styles.nextBtnText}>Let's Go!</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GoalRow({
  label,
  value,
  unit,
  color,
  onChangeText,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={goalStyles.row}>
      <View style={[goalStyles.dot, { backgroundColor: color }]} />
      <Text style={goalStyles.label}>{label}</Text>
      <TextInput
        style={goalStyles.input}
        value={String(value)}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
      <Text style={goalStyles.unit}>{unit}</Text>
    </View>
  );
}

const goalStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    textAlign: 'right',
  },
  unit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    width: 30,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 16,
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
  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: Colors.primary,
  },
  activityCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  activityCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  activityLabelActive: {
    color: Colors.primary,
  },
  activityDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  goalCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  nextBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
