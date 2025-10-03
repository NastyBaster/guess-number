// Тепер db вже доступна з firebase-config.js
// Можеш працювати з базою тут

const statusBar = document.getElementById('statusBar');
const roomList = document.getElementById('roomList');
const createBtn = document.getElementById('createRoomBtn');
const joinBtn = document.getElementById('joinRoomBtn');

createBtn.addEventListener('click', () => {
  statusBar.textContent = 'Створення кімнати...';
  const newRoomRef = db.ref('rooms').push();
  newRoomRef.set({
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    players: 1,
    // Add other initial room data here
  }).then(() => {
    statusBar.textContent = `Кімнату #${newRoomRef.key} створено!`;
    // TODO: Add logic to join the room
  }).catch(error => {
    statusBar.textContent = `Помилка створення кімнати: ${error.message}`;
  });
});

joinBtn.addEventListener('click', () => {
  statusBar.textContent = 'Пошук кімнати... (логіка підключення через Firebase)';
  // TODO: логіка приєднання до кімнати
});

function updateRoomList(rooms) {
  roomList.innerHTML = '';
  if (!rooms || Object.keys(rooms).length === 0) {
    roomList.textContent = 'Активних кімнат поки немає';
    return;
  }
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    const div = document.createElement('div');
    div.className = 'room-item';
    div.textContent = `Кімната #${roomId} - ${room.players}/2 гравців`;
    div.tabIndex = 0;
    div.addEventListener('click', () => {
      statusBar.textContent = `Приєднуємось до кімнати #${roomId}...`;
      // TODO: додати логіку підключення до кімнати
    });
    roomList.appendChild(div);
  });
}

const roomsRef = db.ref('rooms');
roomsRef.on('value', (snapshot) => {
    const rooms = snapshot.val();
    updateRoomList(rooms);
});
