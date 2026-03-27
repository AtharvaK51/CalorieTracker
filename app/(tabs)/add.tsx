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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '../../constants/colors';
import { Config, type MealType } from '../../constants/config';
import { useMealStore } from '../../store/useMealStore';
import { NutritionBar } from '../../components/NutritionBar';

export default function AddMealScreen() {
  const { addMeal, aiStatus, fallbackPrompt, applyFallbackResponse, resetAiStatus } = useMealStore();
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [lastMealId, setLastMealId] = useState<string | null>(null);
  const [fallbackInput, setFallbackInput] = useState('');

  const handleAdd = async () => {
    if (!description.trim()) {
      Alert.alert('Oops', 'Please describe your meal');
      return;
    }
    const mealId = await addMeal(description.trim(), mealType);
    setLastMealId(mealId);

    if (useMealStore.getState().aiStatus === 'success') {
      setDescription('');
      resetAiStatus();
      Alert.alert('Done!', 'Meal logged with nutrition data');
    }
  };

  const handleCopyPrompt = async () => {
    if (fallbackPrompt) {
      await Clipboard.setStringAsync(fallbackPrompt);
      Alert.alert('Copied!', 'Paste this into any AI tool, then paste the result back here.');
    }
  };

  const handleApplyFallback = async () => {
    if (!lastMealId || !fallbackInput.trim()) return;
    const success = await applyFallbackResponse(lastMealId, fallbackInput.trim());
    if (success) {
      setDescription('');
      setFallbackInput('');
      setLastMealId(null);
      resetAiStatus();
      Alert.alert('Done!', 'Nutrition data applied');
    } else {
      Alert.alert('Error', 'Could not parse the response. Make sure it\'s valid JSON.');
    }
  };

  const isAnalyzing = aiStatus === 'analyzing';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Log Meal</Text>

          {/* Meal Type Selector */}
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

          {/* Meal Description */}
          <Text style={styles.label}>What did you eat?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2 idlis with sambar and chutney"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isAnalyzing && styles.submitBtnDisabled]}
            onPress={handleAdd}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.background} size="small" />
                <Text style={styles.submitBtnText}>  Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Log Meal</Text>
            )}
          </TouchableOpacity>

          {/* Fallback Prompt Section */}
          {aiStatus === 'fallback' && fallbackPrompt && (
            <View style={styles.fallbackSection}>
              <Text style={styles.fallbackTitle}>Manual Analysis</Text>
              <Text style={styles.fallbackDesc}>
                No API key configured or the request failed. Copy the prompt below, paste it into any AI tool, then paste the result back.
              </Text>

              <View style={styles.promptBox}>
                <Text style={styles.promptText} numberOfLines={6}>
                  {fallbackPrompt}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopyPrompt}
              >
                <Text style={styles.copyBtnText}>Copy Prompt</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Paste AI response here:</Text>
              <TextInput
                style={[styles.input, { minHeight: 100 }]}
                placeholder='Paste the JSON result here...'
                placeholderTextColor={Colors.textMuted}
                value={fallbackInput}
                onChangeText={setFallbackInput}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyFallback}
              >
                <Text style={styles.applyBtnText}>Apply Nutrition Data</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeTextActive: {
    color: Colors.primary,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fallbackSection: {
    marginTop: 24,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
  },
  fallbackTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 8,
  },
  fallbackDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  promptBox: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  promptText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  copyBtnText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
});
