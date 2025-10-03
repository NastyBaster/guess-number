// Імпорт Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

// Конфігурація Firebase - заміни на свої власні конфіг дані, взяті з Firebase Console
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_ДОМЕН.firebaseapp.com",
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_ДОМЕН.appspot.com",
  messagingSenderId: "ВАШ_ІД_ВІДПРАВНИКА",
  appId: "ВАШ_APP_ID"
};

const app = initializeApp(firebaseConfig);
export { app };
