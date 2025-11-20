import { addEntry } from '../storage/journalStorage';
import NetInfo from '@react-native-community/netinfo';
import React, { useState, useEffect } from 'react';
import { analyzeSentiment, Sentiment } from '../services/huggingFaceService';
import { colors, radius, spacing } from '../theme';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type Props = {
  navigation: any;
};

type AnalysisResult = {
  sentiment: Sentiment;
  summary: string;
  suggestion: string;
};

export default function DailyEntryScreen({ navigation }: Props) {
  // Kullanıcının günle ilgili yazdığı serbest metni burada tutuyorum.
  const [text, setText] = useState('');

  // AI analiz sonucunu (duygu, özet, öneri) tek bir state altında yönetiyorum.
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // API isteği sırasında loading durumunu göstermek için ayrı bir state kullanıyorum.
  const [loading, setLoading] = useState(false);

  // NetInfo üzerinden online/offline durumunu izleyip butonu buna göre kilitliyorum.
  const [isOnline, setIsOnline] = useState(true);

  // Ekran açıkken cihazın internet durumunu NetInfo ile sürekli dinliyorum.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isInternetReachable ?? state.isConnected ?? false;
      setIsOnline(!!online);
    });

    return () => {
      // Ekran kapandığında listener’ı temizliyorum.
      unsubscribe();
    };
  }, []);

  // Hugging Face’ten gelen sentiment sonucunu, kullanıcıya daha anlaşılır
  // bir "özet" ve "öneri" metnine çeviriyorum.
  function buildSummaryAndSuggestion(
    sentiment: Sentiment
  ): Omit<AnalysisResult, 'sentiment'> {
    let summary = 'Your day seems relatively neutral.';
    let suggestion =
      'Set one small intention for tomorrow to slightly improve your mood.';

    if (sentiment === 'positive') {
      summary = 'You had a mostly positive day.';
      suggestion =
        'Keep doing what makes you feel good and note what worked well today.';
    } else if (sentiment === 'negative') {
      summary = 'You had a difficult or negative day.';
      suggestion =
        'Try to take a short break, talk to someone you trust, or do one relaxing activity.';
    }

    return { summary, suggestion };
  }

  // "Analyze" butonuna basıldığında çalışan ana fonksiyon.
  const handleAnalyze = async () => {
    // Boş metinle istek atmanın bir anlamı olmadığı için guard koydum.
    if (!text.trim()) return;

    // İnternet yoksa Hugging Face API’sine erişemeyeceğim için
    // kullanıcıya net bir mesaj gösterip erken çıkıyorum.
    if (!isOnline) {
      setResult({
        sentiment: 'neutral',
        summary: 'You are currently offline.',
        suggestion:
          'You can still view your History, but AI analysis requires an internet connection.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Metni Hugging Face sentiment modeline gönderiyorum.
      const sentiment = await analyzeSentiment(text);

      // Modelden gelen sonucu, kullanıcıya daha okunabilir
      // bir özet/öneri formatına çeviriyorum.
      const { summary, suggestion } = buildSummaryAndSuggestion(sentiment);

      const analysis: AnalysisResult = {
        sentiment,
        summary,
        suggestion,
      };

      setResult(analysis);

      // Başarılı bir analizden sonra bu entry’yi AsyncStorage’a kaydediyorum.
      // History ekranında bu verileri gösteriyorum.
      await addEntry({ text: text.trim(), sentiment });
    } catch (e) {
      // Ağ hatası / API hatası vb. durumlarda UI’ı bozmamak için
      // kullanıcıya genel bir hata mesajı gösteriyorum.
      console.warn('AI error', e);
      setResult({
        sentiment: 'neutral',
        summary: 'Could not analyze your text.',
        suggestion: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Ana içerik kartı */}
        <View style={styles.card}>
          <Text style={styles.appTitle}>Daily AI Journal</Text>

          <Text style={styles.label}>How was your day?</Text>
          <TextInput
            style={styles.input}
            placeholder="Write a few sentences about your day..."
            multiline
            value={text}
            onChangeText={setText}
          />

          {/* AI analizi tetikleyen buton, loading ve online durumuna göre yönetiliyor */}
          <View style={styles.analyzeButtonWrapper}>
            <Button
              title={
                !isOnline
                  ? 'Offline'
                  : loading
                  ? 'Analyzing...'
                  : 'Analyze'
              }
              onPress={handleAnalyze}
              disabled={loading || !text.trim() || !isOnline}
              color={colors.primary}
            />
          </View>

          {/* Kullanıcıya offline durumda olduğunu net bir şekilde iletiyorum */}
          {!isOnline && (
            <Text style={styles.offlineText}>
              You are offline. AI analysis is disabled, but you can still view
              your History.
            </Text>
          )}

          {/* AI isteği sırasında kullanıcıya progress göstermek için spinner ekledim */}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Analyzing your entry...</Text>
            </View>
          )}

          {/* AI’den gelen sonucu özet, duygu ve öneri olarak gösteriyorum */}
          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.sectionTitle}>Analysis</Text>
              <Text style={styles.resultLine}>
                Sentiment: {result.sentiment}
              </Text>
              <Text style={styles.resultLine}>Summary: {result.summary}</Text>
              <Text style={styles.resultLine}>
                Suggestion: {result.suggestion}
              </Text>
            </View>
          )}
        </View>

        {/* Alt navigasyon: History ve Weekly Summary ekranlarına geçiş */}
        <View style={styles.navRow}>
          <View style={styles.navButton}>
            <Button
              title="HISTORY"
              onPress={() => navigation.navigate('History')}
              color={colors.primary}
            />
          </View>
          <View style={styles.navButton}>
            <Button
              title="WEEKLY SUMMARY"
              onPress={() => navigation.navigate('WeeklySummary')}
              color={colors.primary}
            />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 110,
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
    marginBottom: spacing.md,
  },
  analyzeButtonWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  offlineText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    columnGap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  resultLine: {
    fontSize: 14,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
