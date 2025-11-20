// src/services/huggingFaceService.ts

/**
 * Uygulamada duygu analizi (sentiment analysis) yapmak için kullandığım tip.
 * API’den dönebilecek üç olası duygu sonucunu temsil ediyor.
 */
export type Sentiment = 'positive' | 'neutral' | 'negative';

/**
 * Hugging Face'in Inference Router endpoint’ini kullanıyorum.
 * Bu endpoint seçtiğim duygu analizi modeline (distilbert-base-uncased-finetuned-sst-2-english)
 * HTTP üzerinden erişmemi sağlıyor.
 *
 * Model İngilizce cümleleri pozitif ya da negatif olarak sınıflandırıyor.
 */
const HUGGING_FACE_API_URL =
  'https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english';

/**
 * API anahtarımı .env içinde saklıyorum.
 * React Native’da environment değişkenlerini güvenli şekilde okumak için
 * @env modülünü kullanıyorum.
 */
import { HUGGINGFACE_API_KEY } from '@env';


/**
 * analyzeSentiment()
 * -------------------
 * Kullanıcının yazdığı gündelik metni Hugging Face API’ye gönderip
 * pozitif / negatif / nötr şeklinde sadeleştirilmiş bir duygu etiketi döndürüyorum.
 *
 * Uygulamada izlediğim akış:
 *
 * 1) Metin boşsa erken çıkış (neutral)
 * 2) Fetch ile Hugging Face API’ye POST isteği
 * 3) Router API'sinin dönebileceği iki farklı JSON formatını destekleme
 * 4) Skor bazlı basit bir eşik yöntemi ile sonucu normalize etme
 *
 * Bu sayede hem düşük skorlu tahminleri filtreliyorum,
 * hem de beklenmedik JSON formatlarında uygulamanın çökmesini engelliyorum.
 */
export async function analyzeSentiment(text: string): Promise<Sentiment> {
  // Kullanıcı boş metin gönderirse model çağırmaya gerek yok.
  if (!text.trim()) {
    return 'neutral';
  }

  // Hugging Face API'ye HTTP POST isteği.
  const response = await fetch(HUGGING_FACE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });

  // Ham cevabı logluyorum; özellikle hata tespit ederken çok yardımcı oluyor.
  const rawText = await response.text();
  console.log('HF response status:', response.status);
  console.log('HF response raw body:', rawText);

  // API’den 200 dışı bir status geldiyse hata fırlatıyorum.
  if (!response.ok) {
    throw new Error(`Hugging Face error: ${response.status} ${rawText}`);
  }

  /**
   * Hugging Face router iki formatta JSON döndürebildiği için
   * parse işleminde iki yapıyı da destekleyecek şekilde kontrol ediyorum:
   *
   * Format A: [[ { label, score } ]]
   * Format B: [ { label, score } ]
   */
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    console.log('JSON parse error:', e);
    return 'neutral';
  }

  let label: string | undefined;
  let score: number | undefined;

  // Veri yapısının formatını çözmeye çalışıyorum
  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      // Format A
      const first = data[0][0];
      label = first?.label;
      score = first?.score;
    } else {
      // Format B
      const first = data[0];
      label = first?.label;
      score = first?.score;
    }
  }

  // Beklenmedik formatta güvenli şekilde nötr dönüyorum.
  if (!label || typeof score !== 'number') {
    console.log('HF unexpected format:', data);
    return 'neutral';
  }

  // Karşılaştırma için label’ı normalize ediyorum.
  label = label.toUpperCase();

  /**
   * Modelden dönen skor yüksek olsa bile tamamen güvenilir değil.
   * Bu yüzden minik bir eşik ekledim:
   *
   * Score > 0.6 → güçlü sinyal → pozitif / negatif sınıflandır
   * Aksi durumlarda nötr olarak işaretliyorum.
   *
   * Böylece yanlış pozitif/negatif sınıfların önüne geçmiş oluyorum.
   */
  if (label === 'POSITIVE' && score > 0.6) {
    return 'positive';
  }

  if (label === 'NEGATIVE' && score > 0.6) {
    return 'negative';
  }

  // Belirsiz durumlarda nötr dönüyorum.
  return 'neutral';
}
