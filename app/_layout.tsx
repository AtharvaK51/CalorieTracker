import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { useProfileStore } from '../store/useProfileStore';

export default function RootLayout() {
  const { profile, loaded, loadProfile } = useProfileStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadProfile().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        {profile && !profile.onboarding_done ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen
          name="meal/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerTitle: 'Meal Details',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
