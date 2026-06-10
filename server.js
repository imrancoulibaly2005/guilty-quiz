const express         = require('express');
const { createServer } = require('http');
const { Server }      = require('socket.io');
const path            = require('path');
const SONGS           = require('./songs');

const PORT       = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ─── Constants ───────────────────────────────────────────────────────────────
const PLAYER_COLORS = ['#FF4FCB','#00D4FF','#FFD600','#00FF94','#FF6B35','#A855F7','#FF3860','#22D3EE'];
const ALL_CATEGORIES = [
  '🇫🇷 Franco-Européen',
  '📺 CN / Nickelodeon',
  '🏰 Disney',
  '⚔️ Anime / Shonen',
  '⚽ Sport & Urban',
  '🕹️ Classiques 90s'
];
const ROOM_TIMEOUT_MS = 15 * 60 * 1000;
const MAX_PLAYERS = 10;
const ROUND_DURATION = 30;

// ─── Rooms ───────────────────────────────────────────────────────────────────
const rooms = new Map();

function mkCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRoom(hostSocketId) {
  let code;
  do { code = mkCode(); } while (rooms.has(code));

  const room = {
    code,
    hostSocketId,
    players: [],       // { socketId, playerId, pseudo, color, score, buzzCount, correctCount }
    phase: 'lobby',    // lobby | playing | gameover
    playlist: [],
    songIndex: -1,
    currentSong: null,
    buzzOrder: [],
    currentBuzzIndex: 0,
    timer: null,
    timeLeft: 0,
    inactivityTimer: null,
    categories: [...ALL_CATEGORIES],
    colorIndex: 0,
  };

  resetInactivity(room);
  return room;
}

function resetInactivity(room) {
  if (room.inactivityTimer) clearTimeout(room.inactivityTimer);
  room.inactivityTimer = setTimeout(() => {
    io.to(room.code).emit('error', { message: 'Room expirée après 15 min d\'inactivité.' });
    destroyRoom(room.code);
  }, ROOM_TIMEOUT_MS);
}

function destroyRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  if (room.timer) clearInterval(room.timer);
  if (room.inactivityTimer) clearTimeout(room.inactivityTimer);
  rooms.delete(code);
}

function getScores(room) {
  return [...room.players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      rank: i + 1,
      playerId: p.playerId,
      pseudo: p.pseudo,
      color: p.color,
      score: p.score,
      delta: p.delta || 0,
    }));
}

function getPodium(room) {
  return [...room.players]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({
      rank: i + 1,
      playerId: p.playerId,
      pseudo: p.pseudo,
      color: p.color,
      score: p.score,
      buzzCount: p.buzzCount,
      correctCount: p.correctCount,
      accuracy: p.buzzCount > 0 ? Math.round((p.correctCount / p.buzzCount) * 100) : 0,
    }));
}

function startNextSong(room) {
  room.songIndex++;
  if (room.songIndex >= room.playlist.length) {
    endGame(room);
    return;
  }

  room.currentSong = room.playlist[room.songIndex];
  room.buzzOrder = [];
  room.currentBuzzIndex = 0;
  room.phase = 'playing';
  room.timeLeft = ROUND_DURATION;
  room.players.forEach(p => p.delta = 0);

  resetInactivity(room);

  io.to(room.code).emit('game_started', {
    song: {
      youtubeId: room.currentSong.youtubeId,
      startAt: room.currentSong.startAt,
      category: room.currentSong.category,
    },
    titleForHost: room.currentSong.title,
    songIndex: room.songIndex + 1,
    total: room.playlist.length,
    category: room.currentSong.category,
    scores: getScores(room),
  });

  // Auto-skip after 30s if no one buzzed correctly
  room.timer = setInterval(() => {
    room.timeLeft--;
    io.to(room.code).emit('timer_tick', { timeLeft: room.timeLeft });
    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      room.timer = null;
      // If nobody found, reveal answer
      revealSong(room, false);
    }
  }, 1000);
}

function revealSong(room, found) {
  if (room.timer) { clearInterval(room.timer); room.timer = null; }
  io.to(room.code).emit('song_revealed', {
    correctTitle: room.currentSong.title,
    category: room.currentSong.category,
    found,
    scores: getScores(room),
  });
}

function endGame(room) {
  room.phase = 'gameover';
  if (room.timer) { clearInterval(room.timer); room.timer = null; }
  io.to(room.code).emit('game_over', { podium: getPodium(room) });
}

function broadcastBuzzOrder(room) {
  const active = room.buzzOrder[room.currentBuzzIndex];
  io.to(room.code).emit('player_buzzed', {
    buzzOrder: room.buzzOrder.map((p, i) => ({
      playerId: p.playerId,
      pseudo: p.pseudo,
      color: p.color,
      pointsIfCorrect: i === 0 ? 3 : i === 1 ? 2 : 1,
    })),
    activeBuzzerId: active ? active.playerId : null,
  });
}

// ─── Socket.IO ───────────────────────────────────────────────────────────────
io.on('connection', socket => {

  // Create room (becomes host)
  socket.on('create_room', ({ pseudo }) => {
    if (!pseudo || !pseudo.trim()) return socket.emit('error', { message: 'Pseudo requis.' });

    const room = makeRoom(socket.id);
    rooms.set(room.code, room);
    socket.join(room.code);

    socket.emit('room_joined', {
      roomCode: room.code,
      isHost: true,
      players: [],
      colors: {},
      categories: ALL_CATEGORIES,
    });
  });

  // Join existing room
  socket.on('join_room', ({ code, pseudo }) => {
    const room = rooms.get(code ? code.toUpperCase() : '');
    if (!room) return socket.emit('error', { message: 'Code de salle invalide.' });
    if (!pseudo || !pseudo.trim()) return socket.emit('error', { message: 'Pseudo requis.' });
    if (room.phase !== 'lobby') return socket.emit('error', { message: 'La partie a déjà commencé.' });
    if (room.players.length >= MAX_PLAYERS) return socket.emit('error', { message: 'Salle pleine (max 10 joueurs).' });

    const name = pseudo.trim();
    if (room.players.find(p => p.pseudo === name)) return socket.emit('error', { message: 'Ce pseudo est déjà pris.' });

    const color = PLAYER_COLORS[room.colorIndex % PLAYER_COLORS.length];
    room.colorIndex++;

    const player = {
      socketId: socket.id,
      playerId: socket.id,
      pseudo: name,
      color,
      score: 0,
      buzzCount: 0,
      correctCount: 0,
      delta: 0,
    };
    room.players.push(player);
    socket.join(room.code);
    resetInactivity(room);

    const colors = {};
    room.players.forEach(p => { colors[p.playerId] = p.color; });

    socket.emit('room_joined', {
      roomCode: room.code,
      isHost: false,
      playerId: player.playerId,
      color,
      players: room.players.map(p => ({ playerId: p.playerId, pseudo: p.pseudo, color: p.color })),
      colors,
    });

    io.to(room.code).emit('player_joined', {
      players: room.players.map(p => ({ playerId: p.playerId, pseudo: p.pseudo, color: p.color })),
      colors,
    });
  });

  // Start game
  socket.on('start_game', ({ roomCode, categories }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.players.length < 1) return socket.emit('error', { message: 'Au moins 1 joueur requis.' });

    const cats = Array.isArray(categories) && categories.length > 0 ? categories : ALL_CATEGORIES;
    const filtered = SONGS.filter(s => cats.includes(s.category));
    if (filtered.length === 0) return socket.emit('error', { message: 'Aucune chanson dans les catégories sélectionnées.' });

    room.playlist = shuffle(filtered);
    room.songIndex = -1;
    room.phase = 'playing';
    room.players.forEach(p => { p.score = 0; p.buzzCount = 0; p.correctCount = 0; p.delta = 0; });

    startNextSong(room);
  });

  // Player buzz
  socket.on('buzz', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.phase !== 'playing') return;
    if (socket.id === room.hostSocketId) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    // Already buzzed this round
    if (room.buzzOrder.find(p => p.playerId === player.playerId)) return;

    player.buzzCount++;
    room.buzzOrder.push(player);

    // Stop timer on first buzz
    if (room.buzzOrder.length === 1 && room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }

    broadcastBuzzOrder(room);
  });

  // Host validates answer
  socket.on('validate', ({ roomCode, correct }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.buzzOrder.length === 0) return;

    const active = room.buzzOrder[room.currentBuzzIndex];
    if (!active) return;

    const player = room.players.find(p => p.playerId === active.playerId);
    if (!player) return;

    if (correct) {
      const pts = room.currentBuzzIndex === 0 ? 3 : room.currentBuzzIndex === 1 ? 2 : 1;
      player.score += pts;
      player.delta = pts;
      player.correctCount++;

      io.to(room.code).emit('score_update', { scores: getScores(room) });
      revealSong(room, true);
    } else {
      player.score = Math.max(0, player.score - 1);
      player.delta = -1;

      io.to(room.code).emit('score_update', { scores: getScores(room) });

      room.currentBuzzIndex++;
      if (room.currentBuzzIndex < room.buzzOrder.length) {
        // Next buzzer gets a chance
        broadcastBuzzOrder(room);
      } else {
        // Everyone got it wrong, restart timer
        room.timeLeft = Math.max(room.timeLeft, 10);
        room.timer = setInterval(() => {
          room.timeLeft--;
          io.to(room.code).emit('timer_tick', { timeLeft: room.timeLeft });
          if (room.timeLeft <= 0) {
            clearInterval(room.timer);
            room.timer = null;
            revealSong(room, false);
          }
        }, 1000);

        // Re-enable buzzers
        io.to(room.code).emit('player_buzzed', { buzzOrder: [], activeBuzzerId: null });
      }
    }

    resetInactivity(room);
  });

  // Host bonus category
  socket.on('bonus_cat', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    const active = room.buzzOrder[room.currentBuzzIndex - 1] || room.buzzOrder[room.currentBuzzIndex];
    if (!active) return;
    const player = room.players.find(p => p.playerId === active.playerId);
    if (!player) return;
    player.score++;
    player.delta = (player.delta || 0) + 1;
    io.to(room.code).emit('score_update', { scores: getScores(room) });
  });

  // Host next song
  socket.on('next_song', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.timer) { clearInterval(room.timer); room.timer = null; }
    startNextSong(room);
  });

  // Host replay
  socket.on('replay', ({ roomCode, categories }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostSocketId !== socket.id) return;

    const cats = Array.isArray(categories) && categories.length > 0 ? categories : ALL_CATEGORIES;
    const filtered = SONGS.filter(s => cats.includes(s.category));
    room.playlist = shuffle(filtered);
    room.songIndex = -1;
    room.phase = 'playing';
    room.players.forEach(p => { p.score = 0; p.buzzCount = 0; p.correctCount = 0; p.delta = 0; });

    startNextSong(room);
  });

  // Disconnect
  socket.on('disconnect', () => {
    rooms.forEach((room, code) => {
      if (room.hostSocketId === socket.id) {
        io.to(code).emit('error', { message: "L'hôte a quitté la partie." });
        destroyRoom(code);
        return;
      }
      const idx = room.players.findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        if (room.phase === 'lobby') {
          room.players.splice(idx, 1);
          io.to(code).emit('player_joined', {
            players: room.players.map(p => ({ playerId: p.playerId, pseudo: p.pseudo, color: p.color })),
            colors: Object.fromEntries(room.players.map(p => [p.playerId, p.color])),
          });
        } else {
          room.players[idx].socketId = null;
        }
      }
    });
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🎵 Blind Test Cartoons démarré sur le port ${PORT}`);
  console.log(`   ${PUBLIC_URL}\n`);

  if (process.env.PUBLIC_URL) {
    setInterval(() => {
      fetch(`${PUBLIC_URL}/health`).catch(() => {});
    }, 14 * 60 * 1000);
  }
});
