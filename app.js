// dom елементи
const statusBar = document.getElementById('statusBar');
const roomList = document.getElementById('roomList');
const createBtn = document.getElementById('createRoomBtn');
const joinBtn = document.getElementById('joinRoomBtn');

// При натисканні кнопок - буде підключатися логіка з Firebase
createBtn.addEventListener('click', () => {
  statusBar.textContent = 'Створення кімнати... (логіка Firebase буде тут)';
  // TODO: додати створення кімнати через Firebase
});

joinBtn.addEventListener('click', () => {
  statusBar.textContent = 'Пошук кімнати... (логіка приєднання через Firebase)';
  // TODO: додати підключення до кімнати Firebase
});

// Демонстраційний оновлення списку кімнат (статично, пізніше з Firebase)
function updateRoomList(rooms) {
  roomList.innerHTML = '';
  if (rooms.length === 0) {
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
      // TODO: викликати підключення до кімнати
    });
    roomList.appendChild(div);
  });
}

// Приклад кімнат
updateRoomList([
  {id: 101, players: 1},
  {id: 102, players: 0},
  {id: 103, players: 2}
]);
