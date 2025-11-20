# Daily AI Journal 📓🤖

A React Native application that allows users to write daily entries and receive AI-powered sentiment analysis using Hugging Face Inference API.  
The app also stores entries locally using AsyncStorage and provides a weekly mood summary.

---

## 📱 Features

### ✔ Daily Entry Screen
- Users can write a journal entry about their day.
- AI sentiment analysis using Hugging Face (DistilBERT SST-2).
- Offline detection (Analyze button disabled when offline).
- Auto-generated summary and suggestion based on mood.
- Saved entries stored locally.

### ✔ History Screen
- Displays all saved entries.
- Each entry includes:
  - Sentiment emoji (😊 / 😐 / 😞)
  - Timestamp
  - First lines of user text
  - Sentiment label
- Colored backgrounds based on sentiment.

### ✔ Weekly Summary Screen
- Analyzes entries from the last 7 days.
- Shows totals:
  - Positive
  - Neutral
  - Negative
- Generates an “AI-style” weekly mood summary.

---

## 🧠 AI Model Used

**Model**

    distilbert-base-uncased-finetuned-sst-2-english

A lightweight sentiment analysis model fine-tuned on the SST-2 dataset.

**Inference Router Endpoint**

    https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

    HUGGINGFACE_API_KEY=your_api_key_here

Import in your code:

    import { HUGGINGFACE_API_KEY } from '@env';

---

## 📂 Project Structure

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
        index.ts (colors, spacing, radius)

---

## 🛠 Technologies Used

- React Native CLI  
- TypeScript  
- Hugging Face Inference API  
- AsyncStorage  
- React Navigation  
- NetInfo (offline detection)  
- react-native-dotenv  

---

## 🚀 How to Run the Project

1. Install dependencies

       npm install

2. Configure environment variables

       HUGGINGFACE_API_KEY=your_key_here

3. Start the Metro bundler

       npx react-native start

4. Run on Android

       npx react-native run-android

---

## 📌 Notes About Development Process

- Built all screens according to the project specification.  
- Integrated real-time sentiment analysis through Hugging Face.  
- Implemented offline detection using @react-native-community/netinfo.  
- Added UI polishing and improved user experience.  
- Added AsyncStorage-based local persistence system.  
- Handled multiple API response formats gracefully.  
- Added TypeScript-based type safety across the project.  
- Documented code using clear and concise comments.

---

## 📄 License

This project is created for educational/study/staj purposes.  
Feel free to fork.

---

## 📬 Contact

Egemen Kulatu  
GitHub: https://github.com/EgemenKulatu
