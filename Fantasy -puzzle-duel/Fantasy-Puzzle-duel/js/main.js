/* Router, Home, Stats, Achievements pages, and theme management */

const GAMES = {
  home:         { title: '🏰 Fantasy Game Hub',          desc: 'Choose a game to begin' },
  duel:         { title: '⚔️ Puzzle Duel',                desc: '2-player riddle battle' },
  memory:       { title: '🃏 Memory Card Match',          desc: 'Find all matching pairs' },
  hangman:      { title: '🪄 Hangman: Fantasy Edition',   desc: 'Guess the fantasy word' },
  scramble:     { title: '🔤 Fantasy Word Scramble',      desc: 'Unscramble before time runs out' },
  trivia:       { title: '🧩 Trivia Quest',               desc: 'Test your knowledge' },
  achievements: { title: '🏅 Achievements',               desc: 'Your unlocked badges' },
  stats:        { title: '📊 Stats',                      desc: 'Your game statistics' },
};

let currentGame = 'home';
const allIntervals = [];
function regInterval(id) { allIntervals.push(id); }
function clearAllIntervals() { allIntervals.forEach(clearInterval); allIntervals.length = 0; }

function loadGame(id) {
  currentGame = id;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('nav-' + id)?.classList.add('active');
  const g = GAMES[id];
  document.getElementById('topbar-title').textContent = g.title;
  document.getElementById('topbar-desc').textContent = g.desc;
  clearAllIntervals();
  document.getElementById('content').innerHTML = '';
  if (id === 'home') renderHome();
  else if (id === 'duel') initDuel();
  else if (id === 'memory') initMemory();
  else if (id === 'hangman') initHangman();
  else if (id === 'scramble') initScramble();
  else if (id === 'trivia') initTrivia();
  else if (id === 'achievements') renderAchievements();
  else if (id === 'stats') renderStats();
}

// ── HOME ──
function renderHome() {
  const scores = Storage.getScores();
  const played = Storage.getGamesPlayed();
  const bestOf = game => scores[game] ? `🏅 Best: ${scores[game]}` : '';
  const newTag = game => !played.includes(game) ? ' home-card new-game' : '';

  document.getElementById('content').innerHTML = `
  <div class="home-header">
    <h2>Welcome, ${Storage.getSettings().name || 'Adventurer'}!</h2>
    <p>Pick a game below or from the sidebar. Unlock achievements as you play.</p>
  </div>
  <div class="home-grid">
    <div class="home-card" onclick="loadGame('duel')">
      <div class="home-card-icon">⚔️</div>
      <div class="home-card-title">Puzzle Duel</div>
      <div class="home-card-desc">Two wizards battle by answering riddles. Wrong answers backfire!</div>
      <div class="home-card-meta">👥 2 Players · Riddles · 15s timer</div>
    </div>
    <div class="home-card" onclick="loadGame('memory')">
      <div class="home-card-icon">🃏</div>
      <div class="home-card-title">Memory Card Match</div>
      <div class="home-card-desc">Flip cards to find matching fantasy pairs. Beat your best!</div>
      <div class="home-card-meta">🧠 Solo · 16 cards · Memory</div>
      ${scores.memory ? `<div class="home-card-score">🏅 Best: ${scores.memory} moves</div>` : ''}
    </div>
    <div class="home-card" onclick="loadGame('hangman')">
      <div class="home-card-icon">🪄</div>
      <div class="home-card-title">Hangman: Fantasy</div>
      <div class="home-card-desc">Guess spells, creatures, and artifacts letter by letter. 6 lives!</div>
      <div class="home-card-meta">🧙 Solo · Fantasy words · Classic</div>
    </div>
    <div class="home-card" onclick="loadGame('scramble')">
      <div class="home-card-icon">🔤</div>
      <div class="home-card-title">Word Scramble</div>
      <div class="home-card-desc">Unscramble jumbled fantasy words before the countdown ends!</div>
      <div class="home-card-meta">⏱️ Solo · 30s per word · Points</div>
      ${scores.scramble ? `<div class="home-card-score">🏅 Best: ${scores.scramble} pts</div>` : ''}
    </div>
    <div class="home-card${newTag('trivia')}" onclick="loadGame('trivia')" style="border-color:var(--accent2)">
      <div class="home-card-icon">🧩</div>
      <div class="home-card-title">Trivia Quest <span style="font-size:10px;background:#3a2060;color:#c4a0ff;padding:1px 6px;border-radius:6px;margin-left:4px">NEW</span></div>
      <div class="home-card-desc">Test your knowledge across Fantasy, Science, Math, and History!</div>
      <div class="home-card-meta">📚 Solo · 4 categories · 10 questions</div>
      ${scores.trivia ? `<div class="home-card-score">🏅 Best: ${scores.trivia} pts</div>` : ''}
    </div>
    <div class="home-card" onclick="loadGame('achievements')">
      <div class="home-card-icon">🏅</div>
      <div class="home-card-title">Achievements</div>
      <div class="home-card-desc">Earn badges by playing games and hitting milestones!</div>
      <div class="home-card-meta">🔓 ${Storage.getAchievements().length}/${ACHIEVEMENTS.length} unlocked</div>
    </div>
  </div>`;
}

// ── ACHIEVEMENTS PAGE ──
function renderAchievements() {
  const unlocked = Storage.getAchievements();
  const html = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    return `<div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}">
      <div class="ach-icon">${isUnlocked ? a.icon : '🔒'}</div>
      <div class="ach-body">
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.desc}</div>
        ${isUnlocked ? '<div class="ach-unlocked-label">✓ Unlocked</div>' : ''}
      </div>
    </div>`;
  }).join('');
  document.getElementById('content').innerHTML = `
  <div style="margin-bottom:16px;font-size:13px;color:var(--text2)">
    ${unlocked.length} of ${ACHIEVEMENTS.length} achievements unlocked
    <div style="background:var(--border);border-radius:6px;height:6px;overflow:hidden;margin-top:6px">
      <div style="height:100%;width:${unlocked.length / ACHIEVEMENTS.length * 100}%;background:var(--accent);border-radius:6px;transition:width 0.5s"></div>
    </div>
  </div>
  <div class="ach-grid">${html}</div>`;
}

// ── STATS PAGE ──
function renderStats() {
  const scores = Storage.getScores();
  const stats = Storage.getStats();
  const played = Storage.getGamesPlayed();
  const achCount = Storage.getAchievements().length;

  const row = (label, val) => `<div class="stats-row"><span>${label}</span><span class="stats-val">${val}</span></div>`;

  document.getElementById('content').innerHTML = `
  <div class="stats-grid">
    <div class="stats-card">
      <div class="stats-card-title">⚔️ Puzzle Duel</div>
      ${row('Wins', stats.duel?.wins || 0)}
      ${row('Games played', played.includes('duel') ? '✓' : 'Not yet')}
    </div>
    <div class="stats-card">
      <div class="stats-card-title">🃏 Memory Match</div>
      ${row('Best score (moves)', scores.memory ? scores.memory + ' moves' : '—')}
      ${row('Games won', stats.memory?.gamesWon || 0)}
    </div>
    <div class="stats-card">
      <div class="stats-card-title">🪄 Hangman</div>
      ${row('Words solved', stats.hangman?.solved || 0)}
      ${row('Milestone (5)', stats.hangman?.solved >= 5 ? '✓ Done' : `${stats.hangman?.solved || 0}/5`)}
    </div>
    <div class="stats-card">
      <div class="stats-card-title">🔤 Word Scramble</div>
      ${row('Best score', scores.scramble ? scores.scramble + ' pts' : '—')}
      ${row('Games played', played.includes('scramble') ? '✓' : 'Not yet')}
    </div>
    <div class="stats-card">
      <div class="stats-card-title">🧩 Trivia Quest</div>
      ${row('Best score', scores.trivia ? scores.trivia + ' pts' : '—')}
      ${row('Rounds played', stats.trivia?.gamesPlayed || 0)}
    </div>
    <div class="stats-card">
      <div class="stats-card-title">🏅 Overall</div>
      ${row('Achievements', `${achCount} / ${ACHIEVEMENTS.length}`)}
      ${row('Games tried', `${played.length} / 5`)}
    </div>
  </div>
  <button class="g-btn sec" onclick="loadGame('home')">Back to Hub</button>`;
}

// ── THEME ──
function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add('theme-' + theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const settings = Storage.getSettings();
  const next = settings.theme === 'dark' ? 'light' : 'dark';
  settings.theme = next;
  Storage.saveSettings(settings);
  applyTheme(next);
}

// ── INIT ──
(function init() {
  const settings = Storage.getSettings();
  applyTheme(settings.theme);
  updateAchBadge();
  loadGame('home');
})();
