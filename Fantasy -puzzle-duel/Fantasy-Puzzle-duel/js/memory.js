/* Memory Card Match */

let mm = {};

function initMemory() {
  Storage.markPlayed('memory');
  checkHubMaster();
  const icons = MM_EMOJIS.slice(0, 8);
  const cards = [...icons, ...icons].sort(() => Math.random() - 0.5).map((ic, i) => ({ id: i, icon: ic, flipped: false, matched: false }));
  mm = { cards, flipped: [], matched: 0, moves: 0, locked: false, started: false, time: 0, timerIv: null, best: mm.best || null };
  renderMemory();
}

function mmFlip(i) {
  if (mm.locked || mm.cards[i].flipped || mm.cards[i].matched) return;
  if (!mm.started) { mm.started = true; mmStartTimer(); }
  mm.cards[i].flipped = true;
  mm.flipped.push(i);
  renderMemory();
  if (mm.flipped.length === 2) {
    mm.moves++;
    mm.locked = true;
    const [a, b] = mm.flipped;
    if (mm.cards[a].icon === mm.cards[b].icon) {
      mm.cards[a].matched = mm.cards[b].matched = true;
      mm.matched += 2;
      mm.flipped = [];
      mm.locked = false;
      if (mm.matched === mm.cards.length) {
        clearInterval(mm.timerIv);
        if (!mm.best || mm.moves < mm.best) mm.best = mm.moves;
        Storage.incStat('memory', 'gamesWon');
        if (mm.moves <= 20) tryUnlock('memory_moves');
        if (mm.time <= 60) tryUnlock('memory_speed');
        setTimeout(() => renderMemory(true), 400);
      } else renderMemory();
    } else {
      setTimeout(() => {
        mm.cards[a].flipped = mm.cards[b].flipped = false;
        mm.flipped = [];
        mm.locked = false;
        renderMemory();
      }, 900);
    }
  }
}

function mmStartTimer() {
  mm.timerIv = setInterval(() => {
    mm.time++;
    const el = document.getElementById('mmtime');
    if (el) el.textContent = mmFmt(mm.time);
  }, 1000);
  regInterval(mm.timerIv);
}

function mmFmt(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

function renderMemory(won = false) {
  const c = document.getElementById('content');
  const cols = 4, size = Math.min(80, Math.floor((Math.min(window.innerWidth - 260, 680) - cols * 8) / cols));
  if (won) {
    const scores = Storage.getScores();
    const prevBest = scores.memory;
    const newBest = Storage.setScore('memory', mm.moves) ? mm.moves : prevBest;
    c.innerHTML = `<div class="g-screen">
      <div style="font-size:40px;margin-bottom:8px">🎉</div>
      <h2>All pairs matched!</h2>
      <p>Completed in <strong>${mm.moves} moves</strong> and <strong>${mmFmt(mm.time)}</strong>.</p>
      ${newBest ? `<p style="color:var(--orange)">🏅 Best: ${newBest} moves</p>` : ''}
      <button class="g-btn" onclick="initMemory()">Play Again</button>
      <button class="g-btn sec" style="margin-left:8px" onclick="loadGame('home')">Hub</button>
    </div>`;
    return;
  }
  c.innerHTML = `
  <div class="mm-info">
    <div class="mm-stat">Moves: <strong style="color:var(--accent-light)">${mm.moves}</strong></div>
    <div class="mm-stat">Pairs: <strong style="color:var(--green)">${mm.matched / 2}/8</strong></div>
    <div class="mm-stat">Time: <span id="mmtime">${mmFmt(mm.time)}</span></div>
    ${mm.best ? `<div class="mm-stat">Best: <strong style="color:var(--orange)">${mm.best} moves</strong></div>` : ''}
  </div>
  <div class="mm-grid" style="grid-template-columns:repeat(4,${size}px);justify-content:start">
    ${mm.cards.map((card, i) => `
    <div class="mm-card${card.flipped ? ' flipped' : ''}${card.matched ? ' matched' : ''}" onclick="mmFlip(${i})" style="width:${size}px;height:${size}px;font-size:${size * 0.4}px">
      <span class="front">${card.icon}</span>
      <span class="back" style="font-size:${size * 0.3}px;color:var(--border2)">?</span>
    </div>`).join('')}
  </div>
  <button class="g-btn sec" onclick="initMemory()" style="margin-right:8px">Restart</button>
  <button class="g-btn sec" onclick="loadGame('home')">Hub</button>`;
}
