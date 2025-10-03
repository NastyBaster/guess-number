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

// Авторизація Email/Пароль (реєстрація/вхід)
btnEmailSignIn.addEventListener('click', () => {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(() => {
      // Якщо вхід не вдався, реєструємось
      auth.createUserWithEmailAndPassword(email, password)
        .catch(error => {
          statusBar.textContent = error.message;
        });
    });
});

// Вихід
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

// Запуск лоббі
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
        observeGame(roomId, user);
      } else {
        statusBar.textContent = 'Не вдалося приєднатися, кімната повна';
      }
    });
  }

  // Перегляд оновлень у грі
  function observeGame(roomId, user) {
    const roomRef = db.ref(`rooms/${roomId}`);

    roomRef.on('value', snapshot => {
      const room = snapshot.val();
      if (!room) return;

      // TODO: виводити тут інтерфейс гри, стежити за подіями, показувати чат, хід гри...

      // Наприклад, якщо обидва гравці готові - починаємо гру
      if (room.gameStatus === 'readyToStart') {
        startGame(room, roomId, user);
      }
    });
  }

  // Початок гри (потрібно доповнити)
  function startGame(room, roomId, user) {
    if (!room.secretNumbers) {
      // Задаємо секретні числа (перший етап гри)
      // TODO: показати UI для введення числа
    }

    // TODO: інша логіка гри
  }
}
