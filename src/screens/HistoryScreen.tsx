import React, { useEffect, useState } from 'react';
import { colors, radius, spacing } from '../theme';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getEntries, JournalEntry } from '../storage/journalStorage';
import type { Sentiment } from '../services/huggingFaceService';

// Her entry için doğru emoji’yi göstermek amacıyla küçük bir yardımcı fonksiyon yazdım.
function sentimentEmoji(s: Sentiment) {
  switch (s) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😞';
    default:
      return '😐';
  }
}

// Kart arka plan rengini sentiment değerine göre belirliyorum.
// UI’da hızlı bir duygu durumu algısı vermek için bunu kullandım.
function sentimentColor(s: Sentiment) {
  switch (s) {
    case 'positive':
      return colors.positiveBg;
    case 'negative':
      return colors.negativeBg;
    default:
      return colors.neutralBg;
  }
}

export default function HistoryScreen() {
  // AsyncStorage'tan gelen tüm geçmiş kayıtları burada tutuyorum.
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Veri çekilirken loading göstermek için ayrı bir state kullanıyorum.
  const [loading, setLoading] = useState(false);

  // Ekrana geri döndüğümde (navigate → back) veriyi yeniden yüklemek için
  // useIsFocused hook'unu kullanıyorum.
  const isFocused = useIsFocused();

  // Ekran her fokuslandığında geçmiş kayıtları yeniden yüklüyorum.
  useEffect(() => {
    if (!isFocused) return;

    const load = async () => {
      setLoading(true);

      // Tüm kayıtları AsyncStorage'tan çekiyorum.
      const all = await getEntries();
      setEntries(all);

      setLoading(false);
    };

    load();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>

      {/* Veri yüklenirken kullanıcıya durum göstergesi veriyorum */}
      {loading && <Text>Loading...</Text>}

      {/* Hiç kayıt yoksa bilgilendirici bir mesaj gösteriyorum */}
      {!loading && entries.length === 0 && (
        <Text style={styles.emptyText}>
          No entries yet. Go back and analyze your first day!
        </Text>
      )}

      {/* Kayıt varsa FlatList üzerinden render ediyorum */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Kayıt tarihini daha okunabilir bir formata çeviriyorum.
          const date = new Date(item.createdAt);
          const displayDate = date.toLocaleString();

          return (
            <View
              style={[
                styles.card,
                { backgroundColor: sentimentColor(item.sentiment) },
              ]}
            >
              {/* Kart başlığı: emoji + tarih */}
              <View style={styles.cardHeader}>
                <Text style={styles.emoji}>
                  {sentimentEmoji(item.sentiment)}
                </Text>
                <Text style={styles.date}>{displayDate}</Text>
              </View>

              {/* Entry metni (maks 2 satır gösteriyorum) */}
              <Text numberOfLines={2} style={styles.text}>
                {item.text}
              </Text>

              {/* Sentiment etiketini kart altında gösteriyorum */}
              <Text style={styles.sentimentLabel}>
                Sentiment: {item.sentiment}
              </Text>
            </View>
          );
        }}
        // Kayıt yoksa içeriği dikey ortalamak için içerik stilini değiştiriyorum.
        contentContainerStyle={entries.length === 0 ? { flexGrow: 1 } : undefined}
      />
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
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Her bir günlük girişini kart şeklinde gösteriyorum.
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  sentimentLabel: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
});
