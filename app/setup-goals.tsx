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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useProfileStore } from '../store/useProfileStore';
import { calculateGoals } from '../services/goalCalculator';

type Step = 'body' | 'weight_goal' | 'activity' | 'results';

const activityLevels = [
  { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { key: 'light', label: 'Light', desc: 'Exercise 1–3 days/week' },
  { key: 'moderate', label: 'Moderate', desc: 'Exercise 3–5 days/week' },
  { key: 'active', label: 'Active', desc: 'Exercise 6–7 days/week' },
  { key: 'very_active', label: 'Very Active', desc: 'Hard exercise daily' },
] as const;

const genders = [
  { key: 'male', label: 'Male' },
  { key: 'female', label: 'Female' },
  { key: 'other', label: 'Other' },
] as const;

const weightGoals = [
  { key: 'lose', label: 'Lose Weight', desc: 'Calorie deficit (−500 kcal)', delta: -500 },
  { key: 'maintain', label: 'Maintain Weight', desc: 'Stay at TDEE', delta: 0 },
  { key: 'gain', label: 'Gain Muscle', desc: 'Calorie surplus (+300 kcal)', delta: 300 },
] as const;

type WeightGoalKey = 'lose' | 'maintain' | 'gain';

const STEP_TITLES: Record<Step, string> = {
  body: 'Body Stats',
  weight_goal: 'Your Goal',
  activity: 'Activity Level',
  results: 'Your Daily Goals',
};

const STEPS: Step[] = ['body', 'weight_goal', 'activity', 'results'];

export default function SetupGoalsScreen() {
  const { profile, updateProfile } = useProfileStore();

  const [weight, setWeight] = useState(
    profile?.weight_kg ? String(profile.weight_kg) : ''
  );
  const [height, setHeight] = useState(
    profile?.height_cm ? String(profile.height_cm) : ''
  );
  const [age, setAge] = useState(
    profile?.age ? String(profile.age) : ''
  );
  const [gender, setGender] = useState<string>(profile?.gender ?? 'male');
  const [weightGoal, setWeightGoal] = useState<WeightGoalKey>('maintain');
  const [activity, setActivity] = useState<string>(
    profile?.activity_level ?? 'moderate'
  );
  const [goals, setGoals] = useState({
    calories: Math.round(profile?.calorie_goal ?? 2000),
    protein_g: Math.round(profile?.protein_goal_g ?? 50),
    carbs_g: Math.round(profile?.carbs_goal_g ?? 250),
    fat_g: Math.round(profile?.fat_goal_g ?? 65),
  });
  const [step, setStep] = useState<Step>('body');

  const stepIndex = STEPS.indexOf(step);

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
    } else {
      setStep(STEPS[stepIndex - 1]);
    }
  };

  const next = () => {
    if (step === 'activity') {
      const w = parseFloat(weight) || 70;
      const h = parseFloat(height) || 170;
      const a = parseInt(age) || 25;
      const delta = weightGoals.find((wg) => wg.key === weightGoal)?.delta ?? 0;
      const calculated = calculateGoals(w, h, a, gender as any, activity as any);
      const adjusted = {
        ...calculated,
        calories: Math.max(1200, calculated.calories + delta),
      };
      setGoals(adjusted);
      setStep('results');
    } else {
      setStep(STEPS[stepIndex + 1]);
    }
  };

  const skip = () => {
    router.back();
  };

  const save = async () => {
    await updateProfile({
      weight_kg: parseFloat(weight) || null,
      height_cm: parseFloat(height) || null,
      age: parseInt(age) || null,
      gender,
      activity_level: activity,
      calorie_goal: goals.calories,
      protein_goal_g: goals.protein_g,
      carbs_goal_g: goals.carbs_g,
      fat_goal_g: goals.fat_g,
    });
    Alert.alert('Saved', 'Your goals have been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{STEP_TITLES[step]}</Text>
          <TouchableOpacity onPress={skip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                i <= stepIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'body' && (
            <BodyStep
              weight={weight}
              height={height}
              age={age}
              gender={gender}
              onWeight={setWeight}
              onHeight={setHeight}
              onAge={setAge}
              onGender={setGender}
              onNext={next}
            />
          )}

          {step === 'weight_goal' && (
            <WeightGoalStep
              selected={weightGoal}
              onSelect={setWeightGoal}
              onNext={next}
            />
          )}

          {step === 'activity' && (
            <ActivityStep
              selected={activity}
              onSelect={setActivity}
              onNext={next}
            />
          )}

          {step === 'results' && (
            <ResultsStep goals={goals} onChangeGoals={setGoals} onSave={save} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Step components ---

function BodyStep({
  weight, height, age, gender,
  onWeight, onHeight, onAge, onGender, onNext,
}: {
  weight: string; height: string; age: string; gender: string;
  onWeight: (v: string) => void; onHeight: (v: string) => void;
  onAge: (v: string) => void; onGender: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <View>
      <Text style={styles.subtitle}>
        We use these to calculate your TDEE with the Mifflin-St Jeor equation.
      </Text>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 70"
        placeholderTextColor={Colors.textMuted}
        value={weight}
        onChangeText={onWeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 170"
        placeholderTextColor={Colors.textMuted}
        value={height}
        onChangeText={onHeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 25"
        placeholderTextColor={Colors.textMuted}
        value={age}
        onChangeText={onAge}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.optionRow}>
        {genders.map((g) => (
          <TouchableOpacity
            key={g.key}
            style={[styles.optionBtn, gender === g.key && styles.optionBtnActive]}
            onPress={() => onGender(g.key)}
          >
            <Text style={[styles.optionText, gender === g.key && styles.optionTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

function WeightGoalStep({
  selected, onSelect, onNext,
}: {
  selected: WeightGoalKey;
  onSelect: (k: WeightGoalKey) => void;
  onNext: () => void;
}) {
  return (
    <View>
      <Text style={styles.subtitle}>
        What are you trying to achieve?
      </Text>
      {weightGoals.map((wg) => (
        <TouchableOpacity
          key={wg.key}
          style={[styles.card, selected === wg.key && styles.cardActive]}
          onPress={() => onSelect(wg.key)}
        >
          <Text style={[styles.cardTitle, selected === wg.key && styles.cardTitleActive]}>
            {wg.label}
          </Text>
          <Text style={styles.cardDesc}>{wg.desc}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

function ActivityStep({
  selected, onSelect, onNext,
}: {
  selected: string;
  onSelect: (k: string) => void;
  onNext: () => void;
}) {
  return (
    <View>
      <Text style={styles.subtitle}>
        How active are you on a typical week?
      </Text>
      {activityLevels.map((level) => (
        <TouchableOpacity
          key={level.key}
          style={[styles.card, selected === level.key && styles.cardActive]}
          onPress={() => onSelect(level.key)}
        >
          <Text style={[styles.cardTitle, selected === level.key && styles.cardTitleActive]}>
            {level.label}
          </Text>
          <Text style={styles.cardDesc}>{level.desc}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextBtnText}>Calculate My Goals</Text>
      </TouchableOpacity>
    </View>
  );
}

type Goals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

function ResultsStep({
  goals, onChangeGoals, onSave,
}: {
  goals: Goals;
  onChangeGoals: (g: Goals) => void;
  onSave: () => void;
}) {
  return (
    <View>
      <Text style={styles.subtitle}>
        Calculated from your profile. Fine-tune as needed.
      </Text>

      <View style={styles.resultsCard}>
        <GoalRow
          label="Calories"
          value={goals.calories}
          unit="kcal"
          color={Colors.calories}
          onChangeText={(v) => onChangeGoals({ ...goals, calories: parseInt(v) || 0 })}
        />
        <GoalRow
          label="Protein"
          value={goals.protein_g}
          unit="g"
          color={Colors.protein}
          onChangeText={(v) => onChangeGoals({ ...goals, protein_g: parseInt(v) || 0 })}
        />
        <GoalRow
          label="Carbs"
          value={goals.carbs_g}
          unit="g"
          color={Colors.carbs}
          onChangeText={(v) => onChangeGoals({ ...goals, carbs_g: parseInt(v) || 0 })}
        />
        <GoalRow
          label="Fat"
          value={goals.fat_g}
          unit="g"
          color={Colors.fat}
          onChangeText={(v) => onChangeGoals({ ...goals, fat_g: parseInt(v) || 0 })}
        />
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={onSave}>
        <Text style={styles.nextBtnText}>Save Goals</Text>
      </TouchableOpacity>
    </View>
  );
}

function GoalRow({
  label, value, unit, color, onChangeText,
}: {
  label: string; value: number; unit: string; color: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.goalRow}>
      <View style={[styles.goalDot, { backgroundColor: color }]} />
      <Text style={styles.goalLabel}>{label}</Text>
      <TextInput
        style={styles.goalInput}
        value={String(value)}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
      <Text style={styles.goalUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
    width: 36,
  },
  backText: {
    color: Colors.text,
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  skipBtn: {
    padding: 4,
    width: 50,
    alignItems: 'flex-end',
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
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
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  cardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  cardTitleActive: {
    color: Colors.primary,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  resultsCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  goalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  goalLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  goalInput: {
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
  goalUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    width: 30,
  },
});
