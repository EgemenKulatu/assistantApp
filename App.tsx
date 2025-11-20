/**
 * App.tsx
 * -------
 * Uygulamanın giriş noktası.
 *
 * Burada React Navigation ile üç ana ekranı yönetiyorum:
 *  - DailyEntryScreen       Günlük yazma ve AI analiz ekranı
 *  - HistoryScreen          Geçmiş analiz sonuçlarının listesi
 *  - WeeklySummaryScreen    Son 7 günün özetlenmiş ruh hali raporu
 *
 * NavigationContainer → Navigasyonun kök bileşeni
 * createNativeStackNavigator → iOS/Android native stack geçişlerini kullanıyorum
 */

import * as React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Uygulamanın üç ayrı ekranı
import DailyEntryScreen from './src/screens/DailyEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import WeeklySummaryScreen from './src/screens/WeeklySummaryScreen';

// Stack navigatörü oluşturuyorum
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    /**
     * NavigationContainer:
     * Uygulamanın tüm navigasyon yapısını saran ana bileşen.
     * Stack.Navigator içinde ekranlarımı tanımlıyorum.
     */
    <NavigationContainer>
      {/* Status bar görünümü (iOS/Android uyumlu) */}
      <StatusBar barStyle="dark-content" />

      {/* Stack içinde 3 ekran belirledim */}
      <Stack.Navigator>

        {/*
          Günlük giriş ekranı — uygulama açıldığında gelen ilk ekran.
          Başlık olarak “Daily AI Journal” gösteriyorum.
        */}
        <Stack.Screen
          name="DailyEntry"
          component={DailyEntryScreen}
          options={{ title: 'Daily AI Journal' }}
        />

        {/*
          Geçmiş ekranı — kullanıcı daha önce yaptığı günlük analizlerini listeliyor.
        */}
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'History' }}
        />

        {/*
          Haftalık özet ekranı — son 7 günlük girişlerden otomatik bir ruh hali özeti üretir.
        */}
        <Stack.Screen
          name="WeeklySummary"
          component={WeeklySummaryScreen}
          options={{ title: 'Weekly Summary' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
