import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getEntries, JournalEntry } from '../storage/journalStorage';
import type { Sentiment } from '../services/huggingFaceService';
import { colors, radius, spacing } from '../theme';

type SummaryStats = {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
};

// Son 7 güne ait kayıtlar üzerinden basit istatistik hesaplıyorum.
// Kaç tane pozitif / nötr / negatif gün olduğunu burada çıkartıyorum.
function computeStats(entries: JournalEntry[]): SummaryStats {
  const last7Days = entries.filter((e) => {
    const d = new Date(e.createdAt).getTime();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return d >= sevenDaysAgo && d <= now;
  });

  const stats: SummaryStats = {
    total: last7Days.length,
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  for (const e of last7Days) {
    if (e.sentiment === 'positive') stats.positive++;
    else if (e.sentiment === 'negative') stats.negative++;
    else stats.neutral++;
  }

  return stats;
}

// Hesapladığım istatistiklere göre haftanın genel modunu (overall mood)
// tek bir Sentiment değerine indiriyorum.
function overallMood(stats: SummaryStats): Sentiment {
  if (stats.total === 0) return 'neutral';

  if (stats.positive >= stats.negative && stats.positive >= stats.neutral) {
    return 'positive';
  }
  if (stats.negative > stats.positive && stats.negative >= stats.neutral) {
    return 'negative';
  }
  return 'neutral';
}

// Genel mod değerini, kullanıcıya daha açıklayıcı bir metin olarak gösteriyorum.
function moodText(mood: Sentiment): string {
  switch (mood) {
    case 'positive':
      return 'Overall, your week looks mostly positive. Keep doing what works for you.';
    case 'negative':
      return 'This week seems emotionally heavy. Try to plan small breaks and get support.';
    default:
      return 'Your week is quite balanced. Maybe add one small activity you enjoy.';
  }
}

export default function WeeklySummaryScreen() {
  // Tüm kayıtları burada tutuyorum, sadece son 7 günü filtrelerken kullanıyorum.
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Haftalık özet için gereken sayıları tek bir state altında takip ediyorum.
  const [stats, setStats] = useState<SummaryStats>({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  // AsyncStorage’tan veri çekerken loading göstermek için ayrı bir state kullanıyorum.
  const [loading, setLoading] = useState(false);

  // Ekran her odaklandığında (navigate ile geri gelindiğinde) veriyi tazeleyebilmek için
  // React Navigation’ın useIsFocused hook’unu kullanıyorum.
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    // Ekran her fokuslandığında, yerel depolamadan (AsyncStorage) kayıtları okuyorum.
    const load = async () => {
      setLoading(true);
      const all = await getEntries();
      setEntries(all);
      setStats(computeStats(all));
      setLoading(false);
    };

    load();
  }, [isFocused]);

  // Hesaplanan istatistiklerden haftanın genel modunu çıkarıyorum.
  const mood = overallMood(stats);

  // Genel mod için kullanıcıya göstereceğim açıklama metnini üretiyorum.
  const text = moodText(mood);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Summary</Text>

      {loading && <Text>Loading...</Text>}

      {/* Son 7 günde hiç entry yoksa kullanıcıya bilgilendirici bir mesaj gösteriyorum. */}
      {!loading && stats.total === 0 && (
        <Text style={styles.emptyText}>
          No entries in the last 7 days yet. Add a few daily notes first.
        </Text>
      )}

      {/* Son 7 günde en az bir entry varsa, hem sayısal dağılımı hem de kısa bir özet gösteriyorum. */}
      {!loading && stats.total > 0 && (
        <>
          <View style={styles.statsBox}>
            <Text style={styles.sectionTitle}>Last 7 Days</Text>
            <Text style={styles.line}>Total entries: {stats.total}</Text>
            <Text style={styles.line}>😊 Positive: {stats.positive}</Text>
            <Text style={styles.line}>😐 Neutral: {stats.neutral}</Text>
            <Text style={styles.line}>😞 Negative: {stats.negative}</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>AI-style Summary</Text>
            <Text style={styles.line}>{text}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Haftanın istatistiklerini daha blok halinde göstermek için ayrı bir kutu tasarladım.
  statsBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#DBEAFE',
    marginBottom: spacing.md,
  },
  // Genel AI tarzı özeti farklı bir kart içerisinde gösteriyorum.
  summaryBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  line: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: colors.textSecondary,
  },
});
