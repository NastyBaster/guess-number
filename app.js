// Now db is available from firebase-config.js
// You can work with the database here

const statusBar = document.getElementById('statusBar');
const roomList = document.getElementById('roomList');
const createBtn = document.getElementById('createRoomBtn');
const joinBtn = document.getElementById('joinRoomBtn');

createBtn.addEventListener('click', () => {
  statusBar.textContent = 'Creating a room...';
  const newRoomRef = db.ref('rooms').push();
  newRoomRef.set({
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    players: 1,
    // Add other initial room data here
  }).then(() => {
    statusBar.textContent = `Room #${newRoomRef.key} created! You have joined as player 1.`;
    // TODO: Add logic to join the room
  }).catch(error => {
    statusBar.textContent = `Error creating room: ${error.message}`;
  });
});

joinBtn.addEventListener('click', () => {
    statusBar.textContent = 'Searching for a room...';
    const roomsRef = db.ref('rooms');
    roomsRef.orderByChild('players').equalTo(1).limitToFirst(1).once('value', (snapshot) => {
        if (snapshot.exists()) {
            const roomId = Object.keys(snapshot.val())[0];
            joinRoom(roomId);
        } else {
            statusBar.textContent = 'No available rooms found. Try creating one!';
        }
    });
});

function joinRoom(roomId) {
    const roomRef = db.ref(`rooms/${roomId}`);
    roomRef.transaction((room) => {
        if (room) {
            if (room.players < 2) {
                room.players++;
            }
        }
        return room;
    }).then((result) => {
        if (result.committed) {
            statusBar.textContent = `Successfully joined room #${roomId}!`;
        } else {
            statusBar.textContent = `Could not join room #${roomId}. It might be full.`;
        }
    }).catch((error) => {
        statusBar.textContent = `Error joining room: ${error.message}`;
    });
}

function updateRoomList(rooms) {
  roomList.innerHTML = '';
  if (!rooms || Object.keys(rooms).length === 0) {
    roomList.textContent = 'No active rooms yet';
    return;
  }
  Object.keys(rooms).forEach(roomId => {
    const room = rooms[roomId];
    const div = document.createElement('div');
    div.className = 'room-item';
    if (room.players >= 2) {
        div.classList.add('full');
        div.textContent = `Room #${roomId} - ${room.players}/2 players (Full)`;
    } else {
        div.textContent = `Room #${roomId} - ${room.players}/2 players`;
        div.tabIndex = 0;
        div.addEventListener('click', () => {
          statusBar.textContent = `Joining room #${roomId}...`;
          joinRoom(roomId);
        });
    }
    roomList.appendChild(div);
  });
}

const roomsRef = db.ref('rooms');
roomsRef.on('value', (snapshot) => {
    const rooms = snapshot.val();
    updateRoomList(rooms);
});
