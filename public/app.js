/* ═══════════════════════════════════════════════════════
   Blind Test Cartoons — app.js
   ═══════════════════════════════════════════════════════ */

const ROUND_DURATION = 30;
const PLAYER_COLORS  = ['#FF4FCB','#00D4FF','#FFD600','#00FF94','#FF6B35','#A855F7','#FF3860','#22D3EE'];
const ALL_CATEGORIES = [
  { name: '🇫🇷 Franco-Européen', count: 11 },
  { name: '📺 CN / Nickelodeon',  count: 12 },
  { name: '🏰 Disney',            count: 5  },
  { name: '⚔️ Anime / Shonen',    count: 9  },
  { name: '⚽ Sport & Urban',      count: 5  },
  { name: '🕹️ Classiques 90s',    count: 4  },
];

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
  $('playerCountLabel').textContent = `${players ? players.length : 0} / 10`;
}

// ── Category config (host lobby) ──────────────────────────
function renderCatConfig() {
  const list = $('catList');
  list.innerHTML = ALL_CATEGORIES.map(c =>
    `<label class="cat-item" id="cat_${btoa(c.name)}">
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
  ytErrorTimer = setTimeout(() => {
    hideYtError();
    if (state.isHost && socket) socket.emit('next_song', { roomCode: state.roomCode });
  }, 2000);
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

    $('displayRoomCode').textContent = data.roomCode;
    showScreen('screenWaiting');

    if (data.isHost) {
      $('catConfigCard').style.display   = 'block';
      $('waitingActions').style.display  = 'flex';
      $('playerWaitingCard').style.display = 'none';
      renderCatConfig();
      loadYtApi();
    } else {
      state.playerId = data.playerId;
      state.color    = data.color;
      $('catConfigCard').style.display   = 'none';
      $('waitingActions').style.display  = 'none';
      $('playerWaitingCard').style.display = 'block';
      $('playerColorBadge').innerHTML =
        `<div class="player-chip"><div class="player-dot" style="background:${data.color}"></div>${escHtml(state.pseudo)}</div>`;
    }

    renderPlayerList(data.players);
  });

  // ── Player joined ──
  socket.on('player_joined', ({ players }) => {
    renderPlayerList(players);
  });

  // ── Game started (new round) ──
  socket.on('game_started', (data) => {
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

      // Load video
      ytLoad(data.song.youtubeId, data.song.startAt);

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

  // Host: play
  $('btnPlay').addEventListener('click', () => { ytPlay(); });

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

  // Host: bonus cat
  $('btnBonusCat').addEventListener('click', () => {
    socket.emit('bonus_cat', { roomCode: state.roomCode });
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
    location.reload();
  });

  // Player: buzzer
  $('buzzerBtn').addEventListener('click', () => {
    if ($('buzzerBtn').disabled) return;
    buzz440();
    flashBuzz(state.color || '#FF4FCB');
    $('buzzerBtn').disabled = true;
    socket.emit('buzz', { roomCode: state.roomCode });
  });
}

// ── Init ──────────────────────────────────────────────────
wireButtons();
