# Daily AI Journal 📓🤖  
A React Native application that allows users to write daily entries and receive AI-powered sentiment analysis using Hugging Face Inference API.  
The app also stores entries locally using AsyncStorage and provides a weekly mood summary.

---

## 📱 Features

### ✔ Daily Entry Screen
- Users write a short journal entry about their day.
- AI sentiment analysis using **Hugging Face (DistilBERT SST-2)**.
- Offline detection (AI analysis disabled when offline).
- Automatic summary and suggestion based on sentiment.
- Saves every entry to local storage.

### ✔ History Screen
- Displays all saved journal entries.
- Each entry includes:
  - Emoji representing sentiment (😊 / 😐 / 😞)
  - Timestamp  
  - User text  
  - Sentiment label  
- Entries are color-coded by sentiment.

### ✔ Weekly Summary Screen
- Analyzes the last 7 days of entries.
- Shows statistics:
  - Total entries  
  - Positive / Neutral / Negative counts  
- Generates a simple AI-style weekly summary.

---

## 🧠 AI Model

AI sentiment prediction is provided via:

distilbert-base-uncased-finetuned-sst-2-english

java
Kodu kopyala

API Endpoint (HuggingFace Inference Router):

https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english

yaml
Kodu kopyala

---

## 🔐 Environment Variables

Create a `.env` file:

HUGGINGFACE_API_KEY=your_api_key_here

python
Kodu kopyala

And import it in code:

```ts
import { HUGGINGFACE_API_KEY } from '@env';
📂 Project Structure
bash
Kodu kopyala
/src
  /screens
    DailyEntryScreen.tsx
    HistoryScreen.tsx
    WeeklySummaryScreen.tsx

  /services
    huggingFaceService.ts

  /storage
    journalStorage.ts

  /theme
    (colors, spacing, radius)
🛠 Technologies Used
React Native CLI

TypeScript

Hugging Face Inference API

AsyncStorage

React Navigation

NetInfo (offline detection)

🚀 How to Run the Project
1. Install dependencies
nginx
Kodu kopyala
npm install
2. Configure .env
ini
Kodu kopyala
HUGGINGFACE_API_KEY=your_key_here
3. Start Metro
java
Kodu kopyala
npx react-native start
4. Run Android
arduino
Kodu kopyala
npx react-native run-android
📌 Notes About Development Process (What I Implemented)
Built 3 screens based on the project spec.

Implemented real online sentiment analysis through Hugging Face.

Added fallback behavior for unexpected API formats.

Implemented offline detection using @react-native-community/netinfo.

Designed UI components with a clean and minimal look.

Added AsyncStorage-based local history system.

Built weekly statistics + simple mood algorithm.

Added environment variable handling via react-native-dotenv.

Ensured code clarity by adding descriptive comments across all files.

📄 License
This project is created for educational/study/staj purposes.
Feel free to fork.

📬 Contact
If you want to reach me:
Egemen Kulatu — GitHub: https://github.com/EgemenKulatu