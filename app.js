// Тепер db вже доступна з firebase-config.js
// Можеш працювати з базою тут

const statusBar = document.getElementById('statusBar');
const roomList = document.getElementById('roomList');
const createBtn = document.getElementById('createRoomBtn');
const joinBtn = document.getElementById('joinRoomBtn');

createBtn.addEventListener('click', () => {
  statusBar.textContent = 'Створення кімнати... (логіка Firebase буде тут)';
  // TODO: логіка створення кімнати у базі
});

joinBtn.addEventListener('click', () => {
  statusBar.textContent = 'Пошук кімнати... (логіка підключення через Firebase)';
  // TODO: логіка приєднання до кімнати
});

function updateRoomList(rooms) {
  roomList.innerHTML = '';
  if (!rooms || rooms.length === 0) {
    roomList.textContent = 'Активних кімнат поки немає';
    return;
  }
  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room-item';
    div.textContent = `Кімната #${room.id} - ${room.players}/2 гравців`;
    div.tabIndex = 0;
    div.addEventListener('click', () => {
      statusBar.textContent = `Приєднуємось до кімнати #${room.id}...`;
      // TODO: додати логіку підключення до кімнати
    });
    roomList.appendChild(div);
  });
}

// Демонстрація тестових кімнат
updateRoomList([
  {id: 101, players: 1},
  {id: 102, players: 0},
  {id: 103, players: 2}
]);
