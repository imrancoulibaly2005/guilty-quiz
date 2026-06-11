/* ═══════════════════════════════════════════════════════
   Blind Test Cartoons — app.js
   ═══════════════════════════════════════════════════════ */

const ROUND_DURATION = 30;
const PLAYER_COLORS  = ['#FF4FCB','#00D4FF','#FFD600','#00FF94','#FF6B35','#A855F7','#FF3860','#22D3EE'];
const ALL_CATEGORIES = [
  { name: '🇫🇷 Franco-Européen',   count: 13 },
  { name: '⚽ Sport & Urban',       count: 5  },
  { name: '🕹️ Classiques 80-90s', count: 5  },
  { name: '📺 CN, Nick & Disney',  count: 14 },
  { name: '🎌 Anime VF',           count: 9  },
  { name: '🎤 Rap FR',             count: 12 },
  { name: '🇺🇸 Rap US',            count: 7  },
];

// ── Session persistence ───────────────────────────────────
function saveSession() {
  localStorage.setItem('btSession', JSON.stringify({
    roomCode:  state.roomCode,
    playerId:  state.playerId,
    isHost:    state.isHost,
    pseudo:    state.pseudo,
    color:     state.color,
  }));
  // Host: also keep room code in URL so refresh auto-rejoins
  if (state.isHost && state.roomCode) {
    history.replaceState(null, '', `?host=${state.roomCode}`);
  }
}
function clearSession() {
  localStorage.removeItem('btSession');
  history.replaceState(null, '', '/');
}

// ── State ─────────────────────────────────────────────────
let socket, ytPlayer, ytReady = false, ytErrorTimer = null;
let state = {
  isHost:    false,
  playerId:  null,
  pseudo:    '',
  color:     '',
  roomCode:  '',
  songIndex: 0,
  total:     0,
  timerLeft: ROUND_DURATION,
  buzzerLocked: false,
  revealTimeout: null,
};

// ── Screens ───────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Utils ─────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function buzz440() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function flashBuzz(color) {
  const el = $('buzzFlash');
  el.style.background = color;
  el.classList.add('active');
  $('crtOverlay').classList.add('active');
  setTimeout(() => {
    el.classList.remove('active');
    $('crtOverlay').classList.remove('active');
  }, 300);
}

function setTimer(timeLeft) {
  const pct = Math.max(0, (timeLeft / ROUND_DURATION) * 100);
  $('hostTimerFill')   && ($('hostTimerFill').style.width   = pct + '%');
  $('playerTimerFill') && ($('playerTimerFill').style.width = pct + '%');
  $('hostTimerLabel')  && ($('hostTimerLabel').textContent   = timeLeft);
  $('playerTimerLabel') && ($('playerTimerLabel').textContent = timeLeft);
}

function rankLabel(i) {
  if (i === 0) return '🥇';
  if (i === 1) return '🥈';
  if (i === 2) return '🥉';
  return i + 1;
}

// ── Scoreboard render ─────────────────────────────────────
function renderScoreboard(containerId, scores, roundLabel) {
  const el = $(containerId);
  if (!el) return;

  const header = roundLabel
    ? `<div class="scoreboard-header"><span>🎵 ${roundLabel}</span><span style="color:var(--text-dim);font-size:.9rem">Score</span></div>`
    : '<div class="scoreboard-header"><span>Classement</span><span style="color:var(--text-dim);font-size:.9rem">Score</span></div>';

  const rows = scores.map((p, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const delta = p.delta && p.delta !== 0
      ? `<span class="delta-badge ${p.delta > 0 ? 'delta-pos' : 'delta-neg'}">${p.delta > 0 ? '+' : ''}${p.delta}</span>`
      : '';
    return `<div class="score-row">
      <div class="score-rank ${rankClass}">${rankLabel(i)}</div>
      <div class="score-pseudo" style="color:${p.color}">${escHtml(p.pseudo)}</div>
      <div class="score-pts">${p.score} pts</div>
      ${delta}
    </div>`;
  }).join('');

  el.innerHTML = header + rows;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Player list (waiting room) ─────────────────────────────
function renderPlayerList(players) {
  const el = $('playerListWaiting');
  if (!players || players.length === 0) {
    el.innerHTML = '<span class="text-dim text-sm">En attente de joueurs<span class="waiting-dots"></span></span>';
  } else {
    el.innerHTML = players.map(p =>
      `<div class="player-chip"><div class="player-dot" style="background:${p.color}"></div>${escHtml(p.pseudo)}</div>`
    ).join('');
  }
  $('playerCountLabel').textContent = `${players ? players.length : 0} / 15`;
}

// ── Category config (host lobby) ──────────────────────────
function renderCatConfig() {
  const list = $('catList');
  list.innerHTML = ALL_CATEGORIES.map((c, i) =>
    `<label class="cat-item">
      <input type="checkbox" checked data-cat="${escHtml(c.name)}">
      <span class="cat-name">${c.name}</span>
      <span class="cat-count">${c.count} titres</span>
    </label>`
  ).join('');
  list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateCatCount);
  });
  updateCatCount();
}

function updateCatCount() {
  const checks = document.querySelectorAll('#catList input[type="checkbox"]');
  let total = 0;
  checks.forEach(cb => {
    const cat = ALL_CATEGORIES.find(c => c.name === cb.dataset.cat);
    if (cb.checked && cat) total += cat.count;
    const label = cb.closest('label');
    if (label) label.classList.toggle('unchecked', !cb.checked);
  });
  $('totalSongsLabel').textContent = `${total} manche${total > 1 ? 's' : ''} sélectionnée${total > 1 ? 's' : ''}`;
  const btn = $('btnStartGame');
  if (btn) btn.disabled = total === 0;
}

function getSelectedCats() {
  return [...document.querySelectorAll('#catList input[type="checkbox"]:checked')]
    .map(cb => cb.dataset.cat);
}

// ── Buzz list (host) ──────────────────────────────────────
function renderBuzzList(buzzOrder, activeBuzzerId) {
  const el = $('hostBuzzList');
  if (!buzzOrder || buzzOrder.length === 0) {
    el.innerHTML = '<div class="text-dim text-sm">Personne n\'a buzzé</div>';
    $('hostValidation').style.display = 'none';
    return;
  }

  el.innerHTML = buzzOrder.map((p, i) => {
    const active = p.playerId === activeBuzzerId;
    return `<div class="buzz-item ${active ? 'active-buzz' : ''}">
      <div class="buzz-rank">${i + 1}.</div>
      <div class="player-dot" style="background:${p.color}"></div>
      <div style="font-weight:600;color:${p.color}">${escHtml(p.pseudo)}</div>
      <div class="buzz-pts">+${p.pointsIfCorrect} pts</div>
    </div>`;
  }).join('');

  if (activeBuzzerId) {
    const active = buzzOrder.find(p => p.playerId === activeBuzzerId);
    if (active) {
      $('buzzNameDisplay').style.color = active.color;
      $('buzzNameDisplay').innerHTML =
        `<div class="buzz-name-pseudo" style="color:${active.color}">${escHtml(active.pseudo)}</div>` +
        `<div class="buzz-name-pts">⚡ +${active.pointsIfCorrect} pts si correct</div>`;
      // re-trigger animation
      $('buzzNameDisplay').style.animation = 'none';
      void $('buzzNameDisplay').offsetWidth;
      $('buzzNameDisplay').style.animation = '';
    }
    $('hostValidation').style.display = 'flex';
    $('hostValidation').style.flexDirection = 'column';
  } else {
    $('hostValidation').style.display = 'none';
  }
}

// ── YouTube API ───────────────────────────────────────────
function loadYtApi() {
  if (window.YT) { onYouTubeIframeAPIReady(); return; }
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    width: '1', height: '1',
    playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => { ytReady = true; },
      onError: (e) => {
        console.warn('YT error', e.data);
        showYtError();
      },
      onStateChange: (e) => {
        // -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
      }
    }
  });
};

function ytLoad(videoId, startAt) {
  hideYtError();
  if (!ytReady || !ytPlayer) return;
  ytPlayer.cueVideoById({ videoId, startSeconds: startAt || 0 });
}

function ytPlay() {
  if (!ytReady || !ytPlayer) return;
  ytPlayer.playVideo();
}

function ytStop() {
  if (!ytReady || !ytPlayer) return;
  ytPlayer.stopVideo();
}

function showYtError() {
  $('ytErrorBanner').classList.add('visible');
  // No auto-skip — host clicks ⏭️ Passer manually
}

function hideYtError() {
  $('ytErrorBanner').classList.remove('visible');
  if (ytErrorTimer) { clearTimeout(ytErrorTimer); ytErrorTimer = null; }
}

// ── Confetti ──────────────────────────────────────────────
function spawnConfetti() {
  const container = $('confettiContainer');
  container.innerHTML = '';
  const colors = ['#FF4FCB','#FFD600','#00D4FF','#00FF94','#FF6B35','#A855F7'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration:${2 + Math.random() * 3}s;
      animation-delay:${Math.random() * 1.5}s;
    `;
    container.appendChild(piece);
  }
}

// ── Waiting room helper ───────────────────────────────────
function showWaitingRoom(data) {
  $('displayRoomCode').textContent = data.roomCode;
  showScreen('screenWaiting');
  if (data.isHost) {
    $('catConfigCard').style.display    = 'block';
    $('waitingActions').style.display   = 'flex';
    $('playerWaitingCard').style.display = 'none';
    renderCatConfig();
    loadYtApi();
  } else {
    $('catConfigCard').style.display    = 'none';
    $('waitingActions').style.display   = 'none';
    $('playerWaitingCard').style.display = 'block';
    $('playerColorBadge').innerHTML =
      `<div class="player-chip"><div class="player-dot" style="background:${data.color}"></div>${escHtml(state.pseudo)}</div>`;
  }
  renderPlayerList(data.players);
}

// ── Socket setup ──────────────────────────────────────────
function connectSocket() {
  socket = io({ transports: ['websocket', 'polling'] });

  socket.on('connect', () => console.log('socket connected'));

  socket.on('error', ({ message }) => {
    alert('Erreur : ' + message);
  });

  // ── Room joined ──
  socket.on('room_joined', (data) => {
    state.roomCode = data.roomCode;
    state.isHost   = data.isHost;
    if (!data.isHost) { state.playerId = data.playerId; state.color = data.color; }
    saveSession();

    $('displayRoomCode').textContent = data.roomCode;
    showScreen('screenWaiting');

    if (data.isHost) {
      $('catConfigCard').style.display   = 'block';
      $('waitingActions').style.display  = 'flex';
      $('playerWaitingCard').style.display = 'none';
      renderCatConfig();
      loadYtApi();
    } else {
      $('catConfigCard').style.display   = 'none';
      $('waitingActions').style.display  = 'none';
      $('playerWaitingCard').style.display = 'block';
      $('playerColorBadge').innerHTML =
        `<div class="player-chip"><div class="player-dot" style="background:${data.color}"></div>${escHtml(state.pseudo)}</div>`;
    }

    renderPlayerList(data.players);
  });

  // ── Room rejoined (after page refresh) ──
  socket.on('room_rejoined', (data) => {
    state.roomCode = data.roomCode;
    state.isHost   = data.isHost;
    if (!data.isHost) {
      state.playerId = data.playerId;
      state.color    = data.color;
      state.pseudo   = data.pseudo;
    }
    saveSession();

    if (data.phase === 'lobby') {
      showWaitingRoom(data);

    } else if (data.phase === 'playing') {
      state.songIndex = data.songIndex;
      state.total     = data.total;
      state.timerLeft = data.timeLeft || ROUND_DURATION;
      const roundLabel = `Manche ${data.songIndex} / ${data.total}`;

      if (data.isHost) {
        state.currentSong = data.song;
        loadYtApi();
        showScreen('screenHost');
        $('hostRoundBanner').textContent   = roundLabel;
        $('hostCategoryBadge').textContent = data.category;
        $('hostSongTitle').textContent     = data.titleForHost;
        setTimer(data.timerRunning ? data.timeLeft : ROUND_DURATION);
        renderBuzzList(data.buzzOrder || [], data.activeBuzzerId);
        if (!data.buzzOrder || data.buzzOrder.length === 0) $('hostValidation').style.display = 'none';
        renderScoreboard('hostScoreboard', data.scores, roundLabel);
      } else {
        showScreen('screenPlayer');
        $('playerRoundBanner').textContent   = roundLabel;
        $('playerCategoryBadge').textContent = data.category;
        $('playerDotTop').style.background   = data.color;
        $('playerPseudoTop').textContent     = data.pseudo;
        $('buzzerBtn').disabled  = !!data.alreadyBuzzed;
        $('buzzStatus').textContent = data.alreadyBuzzed ? '⏳ Tu as déjà buzzé ce tour…' : '🎵 En attente…';
        $('buzzStatus').className   = 'buzz-status';
        setTimer(data.timerRunning ? data.timeLeft : ROUND_DURATION);
        renderScoreboard('playerScoreboard', data.scores, roundLabel);
      }

    } else if (data.phase === 'gameover') {
      showScreen('screenPodium');
      spawnConfetti();
      renderPodium(data.podium);
      $('podiumHostActions').style.display = data.isHost ? 'flex' : 'none';
      $('podiumPlayerMsg').style.display   = data.isHost ? 'none' : 'block';
    }
  });

  socket.on('rejoin_failed', () => {
    clearSession();
    // stay on lobby screen
  });

  // ── Player joined ──
  socket.on('player_joined', ({ players }) => {
    renderPlayerList(players);
  });

  // ── Game started (new round) ──
  socket.on('game_started', (data) => {
    ytStop(); // cut audio from previous round
    state.songIndex = data.songIndex;
    state.total     = data.total;
    state.timerLeft = ROUND_DURATION;
    state.buzzerLocked = false;

    const roundLabel = `Manche ${data.songIndex} / ${data.total}`;

    if (state.isHost) {
      showScreen('screenHost');
      $('hostRoundBanner').textContent   = roundLabel;
      $('hostCategoryBadge').textContent = data.category;
      $('hostSongTitle').textContent     = data.titleForHost;
      setTimer(ROUND_DURATION);
      renderBuzzList([], null);
      $('hostValidation').style.display  = 'none';
      renderScoreboard('hostScoreboard', data.scores, roundLabel);

      // Store song data — video loaded only when host clicks Play
      state.currentSong = data.song;

    } else {
      showScreen('screenPlayer');
      $('playerRoundBanner').textContent   = roundLabel;
      $('playerCategoryBadge').textContent = data.category;
      $('playerDotTop').style.background   = state.color;
      $('playerPseudoTop').textContent     = state.pseudo;
      $('buzzerBtn').disabled              = false;
      $('buzzStatus').textContent          = '🎵 En attente…';
      $('buzzStatus').className            = 'buzz-status';
      setTimer(ROUND_DURATION);
      renderScoreboard('playerScoreboard', data.scores, roundLabel);
    }
  });

  // ── Timer tick ──
  socket.on('timer_tick', ({ timeLeft }) => {
    state.timerLeft = timeLeft;
    setTimer(timeLeft);
  });

  // ── Player buzzed ──
  socket.on('player_buzzed', ({ buzzOrder, activeBuzzerId }) => {
    // On the first buzz: cut audio, play buzz sound, flash all screens
    if (buzzOrder && buzzOrder.length === 1) {
      const isMyOwnBuzz = !state.isHost && buzzOrder[0].playerId === state.playerId;
      if (!isMyOwnBuzz) {
        buzz440();
        flashBuzz(buzzOrder[0].color || '#FF4FCB');
      }
      if (state.isHost) {
        ytStop();
        flashBuzz(buzzOrder[0].color || '#FF4FCB');
      }
    }

    if (state.isHost) {
      renderBuzzList(buzzOrder, activeBuzzerId);
      return;
    }

    if (!buzzOrder || buzzOrder.length === 0) {
      // Buzzers re-enabled
      if (!state.buzzerLocked) {
        $('buzzerBtn').disabled = false;
        $('buzzStatus').textContent  = '🎵 En attente…';
        $('buzzStatus').className    = 'buzz-status';
      }
      return;
    }

    const me = buzzOrder.find(p => p.playerId === state.playerId);
    const first = buzzOrder[0];

    if (me) {
      if (me.playerId === activeBuzzerId) {
        $('buzzStatus').textContent = '⚡ Tu as buzzé ! L\'hôte valide…';
        $('buzzStatus').className   = 'buzz-status you-buzzed';
      } else {
        $('buzzStatus').textContent = `Tu as buzzé (position ${buzzOrder.indexOf(me) + 1})`;
        $('buzzStatus').className   = 'buzz-status';
      }
      $('buzzerBtn').disabled = true;
    } else {
      $('buzzerBtn').disabled = true;
      $('buzzStatus').textContent = `⚡ ${escHtml(first.pseudo)} a buzzé !`;
      $('buzzStatus').className   = 'buzz-status other-buzzed';
    }
  });

  // ── Score update ──
  socket.on('score_update', ({ scores }) => {
    const roundLabel = `Manche ${state.songIndex} / ${state.total}`;
    if (state.isHost) renderScoreboard('hostScoreboard', scores, roundLabel);
    else              renderScoreboard('playerScoreboard', scores, roundLabel);
    if (document.getElementById('revealScoreboard').closest('.screen.active')) {
      renderScoreboard('revealScoreboard', scores, roundLabel);
    }
  });

  // ── Song revealed ──
  socket.on('song_revealed', ({ correctTitle, category, found, scores }) => {
    ytStop();
    const roundLabel = `Manche ${state.songIndex} / ${state.total}`;

    $('revealFoundLabel').textContent = found ? '🎯 Trouvé !' : '😅 Personne n\'a trouvé…';
    $('revealTitle').textContent      = correctTitle;
    $('revealCategory').textContent   = category;
    renderScoreboard('revealScoreboard', scores, roundLabel);

    if (state.isHost) {
      $('hostRoundBanner').textContent = `Réponse : Manche ${state.songIndex} / ${state.total}`;
    }

    showScreen('screenReveal');

    if (state.revealTimeout) clearTimeout(state.revealTimeout);
    if (state.isHost) {
      state.revealTimeout = setTimeout(() => {
        socket.emit('next_song', { roomCode: state.roomCode });
      }, 6000);
    }
  });

  // ── Game stopped by host ──
  socket.on('game_stopped', () => {
    ytStop();
    clearSession();
    location.reload();
  });

  // ── Game over ──
  socket.on('game_over', ({ podium }) => {
    showScreen('screenPodium');
    spawnConfetti();
    renderPodium(podium);

    if (state.isHost) {
      $('podiumHostActions').style.display = 'flex';
      $('podiumPlayerMsg').style.display   = 'none';
    } else {
      $('podiumHostActions').style.display = 'none';
      $('podiumPlayerMsg').style.display   = 'block';
    }
  });
}

// ── Podium render ─────────────────────────────────────────
function renderPodium(podium) {
  const wrap = $('podiumBlocks');
  const top3 = [podium[1], podium[0], podium[2]]; // 2nd left, 1st center, 3rd right
  const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };

  wrap.innerHTML = top3.filter(Boolean).map(p => `
    <div class="podium-block podium-${p.rank}">
      <div class="podium-name" style="color:${p.color}">${escHtml(p.pseudo)}</div>
      <div class="podium-score">${p.score} pts</div>
      <div class="podium-stand">${emojis[p.rank] || p.rank}</div>
      <div class="podium-stats">
        🎯 ${p.correctCount} bonnes<br>
        🔔 ${p.buzzCount} buzzers<br>
        ⚡ ${p.accuracy}% précision
      </div>
    </div>
  `).join('');

  // Full ranking
  const full = $('podiumFullRanking');
  full.innerHTML = '<div class="scoreboard-header"><span>Classement complet</span></div>'
    + podium.map((p, i) => `
      <div class="score-row">
        <div class="score-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${rankLabel(i)}</div>
        <div class="score-pseudo" style="color:${p.color}">${escHtml(p.pseudo)}</div>
        <div class="score-pts">${p.score} pts</div>
      </div>
    `).join('');
}

// ── Button wiring ─────────────────────────────────────────
function wireButtons() {
  // Lobby: join/create
  $('btnJoin').addEventListener('click', () => {
    const pseudo = $('inputPseudo').value.trim();
    const code   = $('inputCode').value.trim().toUpperCase();
    const errEl  = $('lobbyError');

    if (!pseudo) { showErr(errEl, 'Entre ton pseudo.'); return; }
    errEl.style.display = 'none';

    state.pseudo = pseudo;

    if (!socket) connectSocket();

    if (code) {
      socket.emit('join_room', { code, pseudo });
    } else {
      socket.emit('create_room', { pseudo });
    }

    socket.once('error', ({ message }) => {
      showErr(errEl, message);
    });
  });

  function showErr(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }

  // Lobby: uppercase code input
  $('inputCode').addEventListener('input', function () {
    this.value = this.value.toUpperCase();
  });

  // Waiting room: start
  $('btnStartGame').addEventListener('click', () => {
    const cats = getSelectedCats();
    if (cats.length === 0) return;
    socket.emit('start_game', { roomCode: state.roomCode, categories: cats });
  });

  // Host: play — load audio + start server timer simultaneously
  $('btnPlay').addEventListener('click', () => {
    if (state.currentSong) ytLoad(state.currentSong.youtubeId, state.currentSong.startAt);
    setTimeout(ytPlay, 300);
    socket.emit('start_timer', { roomCode: state.roomCode });
  });

  // Host: stop
  $('btnStop').addEventListener('click', () => { ytStop(); });

  // Host: skip
  $('btnSkip').addEventListener('click', () => {
    if (state.revealTimeout) { clearTimeout(state.revealTimeout); state.revealTimeout = null; }
    socket.emit('next_song', { roomCode: state.roomCode });
  });

  // Host: correct
  $('btnCorrect').addEventListener('click', () => {
    socket.emit('validate', { roomCode: state.roomCode, correct: true });
  });

  // Host: wrong
  $('btnWrong').addEventListener('click', () => {
    socket.emit('validate', { roomCode: state.roomCode, correct: false });
  });

  // Podium: replay
  $('btnReplay').addEventListener('click', () => {
    const cats = getSelectedCats();
    socket.emit('replay', { roomCode: state.roomCode, categories: cats.length ? cats : undefined });
    showScreen('screenWaiting');
    renderCatConfig();
  });

  // Podium: new game
  $('btnNewGame').addEventListener('click', () => {
    clearSession();
    location.reload();
  });

  // Host: stop game (waiting room)
  $('btnStopGameWaiting').addEventListener('click', () => {
    if (!confirm('Fermer la salle et renvoyer tout le monde au lobby ?')) return;
    socket.emit('stop_game', { roomCode: state.roomCode });
  });

  // Host: stop game (during game)
  $('btnStopGameHost').addEventListener('click', () => {
    if (!confirm('Arrêter la partie et renvoyer tout le monde au lobby ?')) return;
    socket.emit('stop_game', { roomCode: state.roomCode });
  });

  // Player: buzzer click
  $('buzzerBtn').addEventListener('click', () => {
    if ($('buzzerBtn').disabled) return;
    buzz440();
    flashBuzz(state.color || '#FF4FCB');
    $('buzzerBtn').disabled = true;
    socket.emit('buzz', { roomCode: state.roomCode });
  });

  // Spacebar buzz (PC)
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' && e.key !== ' ') return;
    const screen = $('screenPlayer');
    if (!screen || !screen.classList.contains('active')) return;
    const btn = $('buzzerBtn');
    if (btn && !btn.disabled) {
      e.preventDefault();
      btn.click();
    }
  });
}

// ── Init ──────────────────────────────────────────────────
wireButtons();

// Try to rejoin an existing session after page refresh
(function tryRejoin() {
  // Priority 1: URL param ?host=CODE  (host tab refresh)
  const hostCode = new URLSearchParams(location.search).get('host');
  if (hostCode) {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('btSession')); } catch { return null; } })();
    state.pseudo  = (saved && saved.pseudo) || 'Hôte';
    state.isHost  = true;
    connectSocket();
    socket.once('connect', () => socket.emit('rejoin_room', { roomCode: hostCode, isHost: true }));
    return;
  }

  // Priority 2: localStorage  (player refresh)
  let saved;
  try { saved = JSON.parse(localStorage.getItem('btSession')); } catch { return; }
  if (!saved || !saved.roomCode || saved.isHost) return; // host uses URL path above

  state.pseudo   = saved.pseudo  || '';
  state.isHost   = false;
  state.playerId = saved.playerId || null;
  state.color    = saved.color   || '';

  connectSocket();
  socket.once('connect', () => {
    socket.emit('rejoin_room', {
      roomCode: saved.roomCode,
      playerId: saved.playerId,
      isHost:   false,
    });
  });
})();
