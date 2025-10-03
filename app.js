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

// Авторизація Email/Пароль (спочатку вхід, якщо не вдалося - реєстрація)
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

// Вихід користувача
btnLogout.addEventListener('click', () => {
  auth.signOut();
});

// Підписка на зміну стану авторизації
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

// Лоббі: прослуховування кімнат і оновлення списку
function startLobby(user) {
  const roomsRef = db.ref('rooms');

  // Підписка на всі кімнати у реальному часі
  roomsRef.on('value', snapshot => {
    const rooms = snapshot.val();
    if (!rooms) {
      roomList.textContent = 'Активних кімнат поки немає';
      return;
    }
    updateRoomList(rooms);
  });

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

  // Оновлення кімнати у реальному часі
  function observeRoom(roomId, user) {
    const roomRef = db.ref(`rooms/${roomId}`);

    roomRef.on('value', snapshot => {
      const room = snapshot.val();
      if (!room) return;

      statusBar.textContent = `Кімната ${roomId} - гравців: ${Object.keys(room.players).length}`;

      if (room.gameStatus === 'readyToStart') {
        startGame(room, roomId, user);
      }
    });
  }

  // Функція старту гри (потрібно доповнити)
  function startGame(room, roomId, user) {
    statusBar.textContent = `Гра почалася! У кімнаті ${roomId}.`;
    // ТУТ реалізуйте подальшу логіку гри: введення чисел, підказки, вгадування, чат тощо
  }
}

// Оновлення списку кімнат
function updateRoomList(rooms) {
  roomList.innerHTML = '';
  Object.entries(rooms).forEach(([roomId, room]) => {
    const div = document.createElement('div');
    div.className = 'room-item';
    const playersCount = room.players ? Object.keys(room.players).length : 0;
    div.textContent = `Кімната #${roomId} - ${playersCount}/2 гравців`;
    div.tabIndex = 0;
    div.addEventListener('click', () => {
      if (playersCount < 2) {
        joinRoom(roomId, firebase.auth().currentUser);
      } else {
        alert('Ця кімната повна');
      }
    });
    roomList.appendChild(div);
  });
}

// Функція joinRoom доступна з глобальної області щоб викликати з updateRoomList
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

// Функція observeRoom теж повинна бути доступна глобально (якщо треба, винесіть вгору)
function observeRoom(roomId, user) {
  const roomRef = db.ref(`rooms/${roomId}`);

  roomRef.on('value', snapshot => {
    const room = snapshot.val();
    if (!room) return;

    statusBar.textContent = `Кімната ${roomId} - гравців: ${Object.keys(room.players).length}`;

    if (room.gameStatus === 'readyToStart') {
      startGame(room, roomId, user);
    }
  });
}

// Зробіть startGame функцію глобальною, або реалізуйте далі
function startGame(room, roomId, user) {
  statusBar.textContent = `Гра почалася! У кімнаті ${roomId}.`;
  // Подальша логіка
}
