const express    = require('express');
const { createServer } = require('http');
const { Server }  = require('socket.io');
const QRCode      = require('qrcode');
const path        = require('path');
const QUESTIONS   = require('./questions');
const AVATARS     = require('./avatars');

const PORT       = process.env.PORT       || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const app    = express();
const server = createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/avatars', (_req, res) =>
  res.json({ avatars: AVATARS, takenIds: [...takenAvatars] })
);

app.get('/api/qrcode', async (_req, res) => {
  try {
    const url = `${PUBLIC_URL}/join?room=${game.roomCode}`;
    const qr  = await QRCode.toDataURL(url, {
      width: 280, margin: 2,
      color: { dark: '#ffffff', light: '#0a0a0a' }
    });
    res.json({ qr, url, roomCode: game.roomCode });
  } catch { res.status(500).json({ error: 'QR failed' }); }
});

app.get('/api/room', (_req, res) =>
  res.json({ roomCode: game.roomCode, phase: game.phase, playerCount: players.length })
);

app.get('/',     (_req, res) => res.sendFile(path.join(__dirname, 'public', 'join.html')));
app.get('/join', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'join.html')));
app.get('/host', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'host.html')));
app.get('/play', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'play.html')));

// ─── State ────────────────────────────────────────────────────────────────────
function mkCode() { return String(Math.floor(1000 + Math.random() * 9000)); }

const game = {
  roomCode: mkCode(),
  phase:    'waiting',   // waiting | question | reveal | gameover
  qIdx:     0,
  timeLeft: 0,
  timer:    null
};

let players       = []; // { socketId, nickname, avatarId, score, answered, lastPoints }
let hostSocketId  = null;
const takenAvatars = new Set();
let answerDist     = [0, 0, 0, 0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function leaderboard(limit = Infinity) {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((p, i) => ({ rank: i + 1, nickname: p.nickname, avatarId: p.avatarId, score: p.score }));
}

function pushAvatarUpdate() {
  io.emit('avatar_update', { takenIds: [...takenAvatars] });
}

function pushPlayerList() {
  if (!hostSocketId) return;
  io.to(hostSocketId).emit('player_joined', {
    players: players.map(p => ({ id: p.socketId, nickname: p.nickname, avatarId: p.avatarId }))
  });
}

function startQuestion() {
  const q       = QUESTIONS[game.qIdx];
  game.phase    = 'question';
  game.timeLeft = 20;
  answerDist    = [0, 0, 0, 0];
  players.forEach(p => { p.answered = false; p.lastPoints = 0; });

  io.emit('question_start', {
    id:        q.id,
    index:     game.qIdx,
    total:     QUESTIONS.length,
    celebrity: q.celebrity,
    question:  q.question,
    options:   q.options,
    photoUrl:  `/celebrities/${q.photoFile}`
  });

  game.timer = setInterval(() => {
    game.timeLeft--;
    io.emit('timer_tick', { timeLeft: game.timeLeft });

    const allAnswered = players.filter(p => p.socketId).every(p => p.answered);
    if (game.timeLeft <= 0 || allAnswered) {
      clearInterval(game.timer);
      revealQuestion();
    }
  }, 1000);
}

function revealQuestion() {
  game.phase = 'reveal';
  const q    = QUESTIONS[game.qIdx];
  io.emit('question_end', {
    correctIndex: q.correct,
    fact:         q.fact,
    scores:       leaderboard(10)
  });
  setTimeout(() => {
    game.qIdx++;
    if (game.qIdx >= QUESTIONS.length) endGame();
    else startQuestion();
  }, 8000);
}

function endGame() {
  game.phase = 'gameover';
  io.emit('game_over', { leaderboard: leaderboard() });
}

// ─── Socket ───────────────────────────────────────────────────────────────────
io.on('connection', socket => {

  // ── Host ──
  socket.on('register_host', () => {
    hostSocketId = socket.id;
    socket.emit('host_registered', {
      roomCode:    game.roomCode,
      phase:       game.phase,
      players:     players.map(p => ({ id: p.socketId, nickname: p.nickname, avatarId: p.avatarId }))
    });
  });

  // ── Joueur : rejoindre ──
  socket.on('join_room', ({ roomCode, nickname, avatarId }) => {

    if (roomCode !== game.roomCode) {
      return socket.emit('join_error', { message: 'Code de salle invalide.' });
    }
    if (!nickname || !nickname.trim()) {
      return socket.emit('join_error', { message: 'Pseudo requis.' });
    }
    if (!AVATARS.find(a => a.id === avatarId)) {
      return socket.emit('join_error', { message: 'Avatar invalide.' });
    }

    const name = nickname.trim();

    // Reconnexion : même pseudo → on met à jour le socket
    const existing = players.find(p => p.nickname === name);
    if (existing) {
      takenAvatars.delete(existing.avatarId);
      existing.socketId = socket.id;
      existing.avatarId = avatarId;
      takenAvatars.add(avatarId);
      socket.emit('join_success', { nickname: name, avatarId, score: existing.score });
      pushAvatarUpdate();
      pushPlayerList();
      return;
    }

    if (game.phase !== 'waiting') {
      return socket.emit('join_error', { message: 'La partie a déjà commencé.' });
    }

    // Avatar exclusif : un seul joueur par avatar
    if (takenAvatars.has(avatarId)) {
      return socket.emit('join_error', { message: 'Cet avatar est déjà pris par un autre joueur !' });
    }

    const player = { socketId: socket.id, nickname: name, avatarId, score: 0, answered: false, lastPoints: 0 };
    players.push(player);
    takenAvatars.add(avatarId);

    socket.emit('join_success', { nickname: name, avatarId, score: 0 });
    pushAvatarUpdate();
    pushPlayerList();
  });

  // ── Joueur : reconnexion depuis play.html ──
  socket.on('rejoin', ({ nickname, avatarId }) => {
    const player = players.find(p => p.nickname === nickname && p.avatarId === avatarId);
    if (!player) {
      return socket.emit('join_error', { message: 'Session expirée. Rejoins la partie.' });
    }
    player.socketId = socket.id;
    socket.emit('rejoin_success', { nickname, avatarId, score: player.score, phase: game.phase });

    // Si question en cours → envoyer l'état actuel
    if (game.phase === 'question') {
      const q = QUESTIONS[game.qIdx];
      socket.emit('question_start', {
        id: q.id, index: game.qIdx, total: QUESTIONS.length,
        celebrity: q.celebrity, question: q.question, options: q.options,
        photoUrl: `/celebrities/${q.photoFile}`
      });
      socket.emit('timer_tick', { timeLeft: game.timeLeft });
      if (player.answered) socket.emit('already_answered', {});
    } else if (game.phase === 'gameover') {
      socket.emit('game_over', { leaderboard: leaderboard() });
    }
  });

  // ── Host : démarrer ──
  socket.on('start_game', () => {
    if (socket.id !== hostSocketId) return;
    if (players.length < 1) return;
    players.forEach(p => { p.score = 0; });
    game.qIdx = 0;
    io.emit('game_start', {});
    setTimeout(startQuestion, 2000);
  });

  // ── Joueur : répondre ──
  socket.on('submit_answer', ({ questionId, answerIndex, timeLeft }) => {
    if (game.phase !== 'question') return;
    const player = players.find(p => p.socketId === socket.id);
    if (!player || player.answered) return;
    const q = QUESTIONS[game.qIdx];
    if (q.id !== questionId) return;

    player.answered   = true;
    const correct     = answerIndex === q.correct;
    const points      = correct ? Math.max(100, Math.round(1000 * (Math.max(0, timeLeft) / 20))) : 0;
    player.score     += points;
    player.lastPoints = points;
    answerDist[answerIndex] = (answerDist[answerIndex] || 0) + 1;

    socket.emit('answer_received', { correct, points, answerIndex });
    if (hostSocketId) io.to(hostSocketId).emit('answer_update', { distribution: answerDist });

    if (players.filter(p => p.socketId).every(p => p.answered)) {
      clearInterval(game.timer);
      revealQuestion();
    }
  });

  // ── Host : skip question ──
  socket.on('skip_question', () => {
    if (socket.id !== hostSocketId) return;
    if (game.phase !== 'question') return;
    clearInterval(game.timer);
    revealQuestion();
  });

  // ── Host : fin forcée du quiz ──
  socket.on('force_end_quiz', () => {
    if (socket.id !== hostSocketId) return;
    clearInterval(game.timer);
    endGame();
  });

  // ── Host : reset ──
  socket.on('reset_game', () => {
    if (socket.id !== hostSocketId) return;
    clearInterval(game.timer);
    players = [];
    takenAvatars.clear();
    game.phase    = 'waiting';
    game.qIdx     = 0;
    game.timeLeft = 0;
    game.roomCode = mkCode();
    answerDist    = [0, 0, 0, 0];
    io.emit('game_reset', { roomCode: game.roomCode });
    pushAvatarUpdate();
  });

  // ── Déconnexion ──
  socket.on('disconnect', () => {
    if (socket.id === hostSocketId) hostSocketId = null;

    const idx = players.findIndex(p => p.socketId === socket.id);
    if (idx === -1) return;

    const player = players[idx];

    if (game.phase === 'waiting') {
      // En salle d'attente : retirer le joueur et libérer son avatar
      takenAvatars.delete(player.avatarId);
      players.splice(idx, 1);
      pushAvatarUpdate();
      pushPlayerList();
    } else {
      // En cours de partie : garder le score, marquer déconnecté
      player.socketId = null;
    }
  });
});

// ─── Démarrage ───────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🎯 GUILTY? démarré sur le port ${PORT}`);
  console.log(`   Host : ${PUBLIC_URL}/host`);
  console.log(`   Join : ${PUBLIC_URL}/join\n`);

  // Keep-alive : se ping toutes les 14 min pour éviter le spin-down Render
  if (process.env.PUBLIC_URL) {
    setInterval(() => {
      fetch(`${PUBLIC_URL}/health`)
        .then(() => console.log('[keep-alive] ping OK'))
        .catch(() => {});
    }, 14 * 60 * 1000);
    console.log('   Keep-alive actif (ping /health toutes les 14 min)\n');
  }
});
