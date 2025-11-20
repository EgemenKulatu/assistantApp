// src/storage/journalStorage.ts

/**
 * Uygulama içinde günlük (journal) kayıtlarını kalıcı olarak saklamak için
 * AsyncStorage kullanıyorum. Kullanıcı her yeni analiz yaptığında,
 * sonuçları yerel depolamaya ekliyorum ve History / WeeklySummary ekranlarında 
 * bu verileri görüntülüyorum.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Sentiment } from '../services/huggingFaceService';

/**
 * Tüm kayıtları tek bir key altında saklıyorum.
 * Versiyonlama adına key’i sonuna `v1` ekleyerek tanımladım.
 */
const STORAGE_KEY = 'journal_entries_v1';

/**
 * Bir günlük kaydının yapısını tanımladığım TypeScript tipi.
 * Her kayıt:
 * - id            benzersiz bir string
 * - text          kullanıcının yazdığı günlük metni
 * - sentiment     HuggingFace analiz sonucu (positive / neutral / negative)
 * - createdAt     ISO formatında tarih
 */
export type JournalEntry = {
  id: string;
  text: string;
  sentiment: Sentiment;
  createdAt: string; // ISO format
};

/**
 * getEntries()
 * -------------
 * Depolanan tüm kayıtları AsyncStorage'dan okuyup array olarak döndürüyorum.
 * Beklenmeyen durumlarda (bozuk JSON, null değer vb.) güvenli şekilde boş array dönüyor.
 */
export async function getEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    // Veri beklediğimiz formatta değilse uygulamanın hata almaması için boş array dönüyorum.
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (e) {
    console.warn('Failed to load entries', e);
    return [];
  }
}

/**
 * addEntry(entry)
 * ----------------
 * Yeni bir kayıt oluşturup mevcut kayıtların başına ekliyorum.
 *
 * Parametre olarak id ve createdAt içermeyen bir nesne alıyorum.
 * Çünkü bu iki bilgiyi burada kendim üretiyorum:
 *
 * - id:         Date.now() ile benzersiz sayı
 * - createdAt:  ISO string tarih
 */
export async function addEntry(
  entry: Omit<JournalEntry, 'id' | 'createdAt'>
): Promise<JournalEntry[]> {
  // Önce mevcut kayıtları alıyorum.
  const existing = await getEntries();

  // Yeni girişi oluşturuyorum.
  const newEntry: JournalEntry = {
    id: Date.now().toString(), // Benzersiz bir ID üretimi
    createdAt: new Date().toISOString(), // ISO timestamp
    ...entry,
  };

  // Yeni giriş en üstte olacak şekilde listeyi güncelliyorum.
  const updated = [newEntry, ...existing];

  // AsyncStorage’a yazıyorum.
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save entry', e);
  }

  return updated;
}
