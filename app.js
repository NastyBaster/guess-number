const authSection = document.getElementById('auth-section');
const lobbySection = document.getElementById('lobby-section');
const statusBar = document.getElementById('statusBar');
const roomList = document.getElementById('roomList');

const btnGoogleAuth = document.getElementById('btn-google-auth');
const btnEmailSignIn = document.getElementById('btn-email-signin');
const btnLogout = document.getElementById('btn-logout');

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');

// Авторизація Google
btnGoogleAuth.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(error => {
    statusBar.textContent = error.message;
  });
});

// Авторизація Email/Пароль (вхід або реєстрація)
btnEmailSignIn.addEventListener('click', () => {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(() => {
      auth.createUserWithEmailAndPassword(email, password)
        .catch(error => {
          statusBar.textContent = error.message;
        });
    });
});

// Вихід з аккаунта
btnLogout.addEventListener('click', () => {
  auth.signOut();
});

// Слухач змін авторизації
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = 'none';
    lobbySection.style.display = 'block';
    statusBar.textContent = `Вітаємо, ${user.email || user.displayName}!`;
    startLobby(user);
  } else {
    authSection.style.display = 'block';
    lobbySection.style.display = 'none';
    statusBar.textContent = 'Будь ласка, увійдіть';
  }
});

// Логіка лоббі: створення та приєднання до кімнат
function startLobby(user) {
  const roomsRef = db.ref('rooms');

  createRoomBtn.onclick = () => {
    statusBar.textContent = 'Створення кімнати...';
    const newRoomRef = roomsRef.push();
    newRoomRef.set({
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      players: { [user.uid]: { ready: false } },
      createdBy: user.uid,
      gameStatus: 'waiting',
      chat: {}
    }).then(() => {
      statusBar.textContent = `Кімната створена, ID: ${newRoomRef.key}`;
      observeRoom(newRoomRef.key, user);
    });
  };

  joinRoomBtn.onclick = () => {
    statusBar.textContent = 'Пошук кімнати для приєднання...';
    roomsRef.orderByChild('gameStatus').equalTo('waiting').limitToFirst(1).once('value', snapshot => {
      const rooms = snapshot.val();
      if (rooms) {
        const roomId = Object.keys(rooms)[0];
        joinRoom(roomId, user);
      } else {
        statusBar.textContent = 'Вільних кімнат немає, створіть нову';
      }
    });
  };

  // Функція приєднання до кімнати
  function joinRoom(roomId, user) {
    const roomRef = db.ref(`rooms/${roomId}`);

    roomRef.transaction(room => {
      if (room && Object.keys(room.players).length < 2) {
        room.players[user.uid] = { ready: false };
        if (Object.keys(room.players).length === 2) {
          room.gameStatus = 'readyToStart';
        }
        return room;
      }
      return;
    }).then(result => {
      if (result.committed) {
        statusBar.textContent = `Приєдналися до кімнати ${roomId}`;
        observeRoom(roomId, user);
      } else {
        statusBar.textContent = 'Не вдалося приєднатися, кімната повна';
      }
    });
  }

  // Спостереження за кімнатою – оновлення гри в реальному часі
  function observeRoom(roomId, user) {
    const roomRef = db.ref(`rooms/${roomId}`);

    roomRef.on('value', snapshot => {
      const room = snapshot.val();
      if (!room) return;

      // Вивід або логіка гри тут. Поки просто інформація для прикладу:
      statusBar.textContent = `Кімната ${roomId} - гравців: ${Object.keys(room.players).length}`;

      // Коли кількість гравців 2, починаємо гру
      if (room.gameStatus === 'readyToStart') {
        startGame(room, roomId, user);
      }
    });
  }

  // Початок гри (примітивна логіка)
  function startGame(room, roomId, user) {
    // TODO: реалізація введення чисел, вгадування, чат тощо
    statusBar.textContent = `Гра почалася! У кімнаті ${roomId}.`;
  }
}
