/* Trivia Quest – NEW solo category-based game */

let tq = {};

function initTrivia() {
  Storage.markPlayed('trivia');
  checkHubMaster();
  tq = { screen: 'select', category: null };
  renderTrivia();
}

function tqSelectCategory(catKey) {
  const cat = TQ_QUESTIONS[catKey];
  const pool = [...cat.questions].sort(() => Math.random() - 0.5).slice(0, 10);
  tq = {
    screen: 'game',
    catKey, catLabel: cat.label, catIcon: cat.icon,
    pool, qi: 0,
    lives: 3, score: 0, streak: 0,
    results: [],
    timer: 20, answered: false,
    timerIv: null
  };
  renderTrivia();
  tqStartTimer();
}

function tqStartTimer() {
  clearAllIntervals();
  tq.timer = 20;
  const iv = setInterval(() => {
    tq.timer--;
    const b = document.getElementById('tqtbar'), n = document.getElementById('tqtnum');
    if (b) { b.style.width = (tq.timer / 20 * 100) + '%'; b.style.background = tq.timer > 8 ? 'var(--accent)' : tq.timer > 4 ? '#BA7517' : '#E24B4A'; }
    if (n) n.textContent = tq.timer + 's';
    if (tq.timer <= 0) { clearInterval(iv); if (!tq.answered) tqTimeout(); }
  }, 1000);
  regInterval(iv);
}

function tqTimeout() {
  tq.answered = true;
  tq.lives--;
  tq.streak = 0;
  const puz = tq.pool[tq.qi];
  tq.results.push({ correct: false, timedOut: true });
  tqMarkOpts(-1, puz.ans);
  tqAdvance();
}

function tqAnswer(idx) {
  if (tq.answered) return;
  tq.answered = true;
  clearAllIntervals();
  const puz = tq.pool[tq.qi];
  const correct = idx === puz.ans;
  tqMarkOpts(idx, puz.ans);
  if (correct) {
    const pts = 100 + tq.timer * 5 + tq.streak * 10;
    tq.score += pts;
    tq.streak++;
    tq.results.push({ correct: true });
    if (tq.streak >= 5) tryUnlock('trivia_streak');
  } else {
    tq.lives--;
    tq.streak = 0;
    tq.results.push({ correct: false });
  }
  tqUpdateHud();
  tqAdvance();
}

function tqMarkOpts(chosen, correct) {
  document.querySelectorAll('.tq-opt').forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    else if (i === chosen && chosen !== correct) b.classList.add('wrong');
  });
}

function tqUpdateHud() {
  const liv = document.getElementById('tqlives');
  if (liv) liv.innerHTML = Array(tq.lives).fill('❤️').concat(Array(3 - tq.lives).fill('🖤')).join('');
  const sc = document.getElementById('tqscore');
  if (sc) sc.innerHTML = `Score: <strong>${tq.score}</strong>`;
}

function tqAdvance() {
  if (tq.lives <= 0) {
    setTimeout(() => { tq.screen = 'end'; renderTrivia(); }, 1600);
    return;
  }
  if (tq.qi >= tq.pool.length - 1) {
    setTimeout(() => { tq.screen = 'end'; renderTrivia(); }, 1600);
    return;
  }
  setTimeout(() => {
    tq.qi++;
    tq.answered = false;
    renderTrivia();
    tqStartTimer();
  }, 1600);
}

function renderTrivia() {
  const c = document.getElementById('content');

  if (tq.screen === 'select') {
    const cats = Object.entries(TQ_QUESTIONS);
    c.innerHTML = `
    <div class="g-screen" style="text-align:left;padding:0">
      <h2 style="margin-bottom:6px">🧩 Trivia Quest</h2>
      <p style="margin-bottom:20px">Choose a category. Answer 10 questions, keep your 3 lives!</p>
      <div class="tq-cat-grid">
        ${cats.map(([key, cat]) => `
        <div class="tq-cat-card" onclick="tqSelectCategory('${key}')">
          <div class="tq-cat-icon">${cat.icon}</div>
          <div class="tq-cat-name">${cat.label}</div>
          <div class="tq-cat-count">${cat.questions.length} questions</div>
        </div>`).join('')}
      </div>
    </div>`;
    return;
  }

  if (tq.screen === 'end') {
    const totalQ = tq.pool.length;
    const correct = tq.results.filter(r => r.correct).length;
    const pct = Math.round(correct / totalQ * 100);
    Storage.setScore('trivia', tq.score);
    Storage.incStat('trivia', 'gamesPlayed');
    tryUnlock('trivia_done');
    if (correct === totalQ) tryUnlock('trivia_perfect');
    c.innerHTML = `<div class="g-screen">
      <div style="font-size:40px;margin-bottom:8px">${pct >= 80 ? '🌟' : pct >= 50 ? '📚' : '😓'}</div>
      <h2>${pct >= 80 ? 'Brilliant!' : pct >= 50 ? 'Well done!' : 'Keep studying!'}</h2>
      <p>${tq.catIcon} ${tq.catLabel}</p>
      <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:20px;display:inline-block;min-width:220px;text-align:left">
        <div class="stats-row">Correct: <span class="stats-val">${correct} / ${totalQ}</span></div>
        <div class="stats-row">Accuracy: <span class="stats-val">${pct}%</span></div>
        <div class="stats-row">Score: <span class="stats-val">${tq.score}</span></div>
        <div class="stats-row">Lives remaining: <span class="stats-val">${'❤️'.repeat(tq.lives)}</span></div>
      </div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="g-btn" onclick="tqSelectCategory('${tq.catKey}')">Play Again</button>
        <button class="g-btn sec" onclick="initTrivia()">Change Category</button>
        <button class="g-btn sec" onclick="loadGame('home')">Hub</button>
      </div>
    </div>`;
    return;
  }

  const puz = tq.pool[tq.qi];
  const dots = tq.results.map(r => `<div class="tq-prog-dot ${r.correct ? 'correct' : 'wrong'}"></div>`).join('') +
    `<div class="tq-prog-dot current"></div>` +
    Array(Math.max(0, tq.pool.length - tq.results.length - 1)).fill('<div class="tq-prog-dot"></div>').join('');

  c.innerHTML = `
  <div class="tq-header">
    <div class="tq-stat">${tq.catIcon} ${tq.catLabel}</div>
    <div class="tq-stat" id="tqscore">Score: <strong>${tq.score}</strong></div>
    <div class="tq-lives" id="tqlives">${Array(tq.lives).fill('❤️').concat(Array(3 - tq.lives).fill('🖤')).join('')}</div>
  </div>
  <div class="tq-progress">${dots}</div>
  <div class="tq-card">
    <div class="tq-trow">
      <div class="tq-tbg"><div id="tqtbar" class="tq-tbar"></div></div>
      <div id="tqtnum" class="tq-tnum">20s</div>
    </div>
    <div class="tq-category">Question ${tq.qi + 1} of ${tq.pool.length}</div>
    <div class="tq-q">${puz.q}</div>
    <div class="tq-opts">
      ${puz.opts.map((o, i) => `<button class="tq-opt" onclick="tqAnswer(${i})">${o}</button>`).join('')}
    </div>
  </div>`;
}
