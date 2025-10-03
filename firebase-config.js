// Конфіг Firebase і ініціалізація

const firebaseConfig = {
  apiKey: "AIzaSyCYA1jhBcKUmh2fWOy5CqAbKG1QXkFsAjI",
  authDomain: "my-click-counter-1fe4f.firebaseapp.com",
  databaseURL: "https://my-click-counter-1fe4f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "my-click-counter-1fe4f",
  storageBucket: "my-click-counter-1fe4f.appspot.com",
  messagingSenderId: "544124700834",
  appId: "1:544124700834:web:463e2069483b2bf031effb"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
