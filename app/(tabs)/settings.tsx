import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Config } from '../../constants/config';
import { useProfileStore } from '../../store/useProfileStore';
import { getAiSettings, saveAiSettings } from '../../services/ai';
import { shareMealsCSV, saveToDownloads } from '../../services/csvExport';

export default function SettingsScreen() {
  const { profile, updateProfile } = useProfileStore();
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [carbsGoal, setCarbsGoal] = useState('');
  const [fatGoal, setFatGoal] = useState('');
  const [waterGoal, setWaterGoal] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai'>('gemini');

  useEffect(() => {
    if (profile) {
      setCalorieGoal(String(Math.round(profile.calorie_goal)));
      setProteinGoal(String(Math.round(profile.protein_goal_g)));
      setCarbsGoal(String(Math.round(profile.carbs_goal_g)));
      setFatGoal(String(Math.round(profile.fat_goal_g)));
      setWaterGoal(String(Math.round(profile.water_goal_ml)));
    }
    getAiSettings().then((settings) => {
      setApiKey(settings.apiKey ?? '');
      setAiProvider(settings.provider);
    });
  }, [profile]);

  const saveGoals = async () => {
    await updateProfile({
      calorie_goal: parseFloat(calorieGoal) || 2000,
      protein_goal_g: parseFloat(proteinGoal) || 50,
      carbs_goal_g: parseFloat(carbsGoal) || 250,
      fat_goal_g: parseFloat(fatGoal) || 65,
      water_goal_ml: parseFloat(waterGoal) || 2500,
    });
    Alert.alert('Saved', 'Goals updated');
  };

  const saveApiKey = async () => {
    await saveAiSettings({
      apiKey: apiKey.trim() || null,
      provider: aiProvider,
    });
    Alert.alert('Saved', 'AI settings updated');
  };

  const handleShare = async () => {
    try {
      await shareMealsCSV();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to export');
    }
  };

  const handleSaveToDownloads = async () => {
    try {
      await saveToDownloads();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {/* Daily Goals */}
        <Text style={styles.sectionTitle}>Daily Goals</Text>
        <View style={styles.card}>
          <SettingRow
            label="Calories"
            value={calorieGoal}
            onChange={setCalorieGoal}
            unit="kcal"
          />
          <SettingRow
            label="Protein"
            value={proteinGoal}
            onChange={setProteinGoal}
            unit="g"
          />
          <SettingRow
            label="Carbs"
            value={carbsGoal}
            onChange={setCarbsGoal}
            unit="g"
          />
          <SettingRow
            label="Fat"
            value={fatGoal}
            onChange={setFatGoal}
            unit="g"
          />
          <SettingRow
            label="Water"
            value={waterGoal}
            onChange={setWaterGoal}
            unit="ml"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveGoals}>
            <Text style={styles.saveBtnText}>Save Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.recalcBtn}
            onPress={() => router.push('/setup-goals')}
          >
            <Text style={styles.recalcBtnText}>Recalculate with Body Stats</Text>
          </TouchableOpacity>
        </View>

        {/* AI Configuration */}
        <Text style={styles.sectionTitle}>AI Configuration</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Provider</Text>
          <View style={styles.providerRow}>
            {(['gemini', 'openai'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.providerBtn,
                  aiProvider === p && styles.providerBtnActive,
                ]}
                onPress={() => setAiProvider(p)}
              >
                <Text
                  style={[
                    styles.providerText,
                    aiProvider === p && styles.providerTextActive,
                  ]}
                >
                  {p === 'gemini' ? 'Gemini' : 'OpenAI'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter API key (optional)"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Leave empty to use the manual copy-paste fallback.
          </Text>

          <TouchableOpacity style={styles.saveBtn} onPress={saveApiKey}>
            <Text style={styles.saveBtnText}>Save AI Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSaveToDownloads}>
            <Text style={styles.actionBtnText}>Save to Downloads</Text>
          </TouchableOpacity>
          <View style={{ height: 10 }} />
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleShare}>
            <Text style={styles.actionBtnSecondaryText}>Share CSV</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            {Config.appName} v{Config.appVersion}
          </Text>
          <Text style={styles.aboutSubtext}>
            Local-first calorie tracking with AI-powered nutritional analysis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
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
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingInputRow}>
        <TextInput
          style={styles.settingInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
        />
        <Text style={styles.settingUnit}>{unit}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  settingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInput: {
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
  settingUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 6,
    width: 30,
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    color: Colors.text,
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: 14,
  },
  providerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  providerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  providerBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  providerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  providerTextActive: {
    color: Colors.primary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  saveBtnText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '600',
  },
  recalcBtn: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recalcBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: Colors.accent + '20',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  actionBtnText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  actionBtnSecondary: {
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnSecondaryText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  aboutSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
