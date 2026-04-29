/* Fantasy Word Scramble */

let ws = {};

function shuffle(w) { return w.split('').sort(() => Math.random() - 0.5).join(''); }

function initScramble() {
  Storage.markPlayed('scramble');
  checkHubMaster();
  ws = { pool: [...WS_WORDS].sort(() => Math.random() - 0.5), qi: 0, score: 0, streak: 0, timer: 30, iv: null, input: '', result: '', answered: false };
  wsLoad();
}

function wsLoad() {
  clearAllIntervals();
  const entry = ws.pool[ws.qi % ws.pool.length];
  let scrambled = shuffle(entry.word);
  let attempts = 0;
  while (scrambled === entry.word && attempts < 10) { scrambled = shuffle(entry.word); attempts++; }
  ws.current = { ...entry, scrambled };
  ws.timer = 30;
  ws.answered = false;
  ws.input = '';
  ws.result = '';
  renderScramble();
  const iv = setInterval(() => {
    ws.timer--;
    const b = document.getElementById('wstbar'), n = document.getElementById('wstime');
    if (b) b.style.width = (ws.timer / 30 * 100) + '%';
    if (n) n.textContent = ws.timer + 's';
    if (ws.timer <= 0) { clearInterval(iv); if (!ws.answered) wsTimeout(); }
  }, 1000);
  regInterval(iv);
}

function wsTimeout() {
  ws.answered = true;
  ws.streak = 0;
  ws.result = `<span style="color:var(--red)">Time's up! The word was <strong>${ws.current.word}</strong>.</span>`;
  renderScramble();
  setTimeout(wsNext, 2000);
}

function wsCheck() {
  if (ws.answered) return;
  const val = (document.getElementById('wsinput')?.value || '').toUpperCase().trim();
  if (!val) return;
  if (val === ws.current.word) {
    ws.answered = true;
    const pts = 10 + Math.floor(ws.timer / 3) + ws.streak * 5;
    ws.score += pts;
    ws.streak++;
    ws.result = `<span style="color:var(--green)">Correct! +${pts} pts 🔥 Streak: ${ws.streak}</span>`;
    if (ws.streak >= 10) tryUnlock('scramble_fire');
    if (ws.score >= 100) tryUnlock('scramble_100');
    Storage.setScore('scramble', ws.score);
    renderScramble();
    setTimeout(wsNext, 1500);
  } else {
    ws.result = `<span style="color:var(--red)">Not quite... try again!</span>`;
    const inp = document.getElementById('wsinput');
    if (inp) { inp.value = ''; inp.focus(); }
    const res = document.getElementById('wsresult');
    if (res) res.innerHTML = ws.result;
  }
}

function wsNext() { ws.qi++; wsLoad(); }

function wsSkip() {
  ws.answered = true;
  ws.streak = 0;
  ws.result = `<span style="color:var(--text2)">Skipped. The word was <strong>${ws.current.word}</strong>.</span>`;
  renderScramble();
  setTimeout(wsNext, 1500);
}

function renderScramble() {
  const c = document.getElementById('content');
  const bestScore = Storage.getScores().scramble || 0;
  c.innerHTML = `
  <div class="ws-score">
    <div>Score: <span class="ws-sval">${ws.score}</span></div>
    <div>Streak: <span class="ws-sval">${ws.streak} 🔥</span></div>
    <div>Best: <span class="ws-sval">${bestScore}</span></div>
    <div>Word: <span class="ws-sval">${ws.qi + 1}</span></div>
  </div>
  <div class="ws-tbar-bg"><div id="wstbar" class="ws-tbar" style="width:${ws.timer / 30 * 100}%"></div></div>
  <div class="ws-timer">Time left: <span id="wstime">${ws.timer}s</span></div>
  <div class="ws-word">${ws.current.scrambled}</div>
  <div class="ws-hint">${ws.current.hint}</div>
  <div class="ws-input-row">
    <input id="wsinput" class="ws-input" placeholder="Your answer" value="${ws.input}"
      oninput="ws.input=this.value" onkeydown="if(event.key==='Enter')wsCheck()"
      ${ws.answered ? 'disabled' : ''} autocomplete="off" autocorrect="off" spellcheck="false">
  </div>
  <div id="wsresult" class="ws-result">${ws.result}</div>
  <div style="display:flex;gap:8px;justify-content:center">
    <button class="g-btn" onclick="wsCheck()" ${ws.answered ? 'disabled' : ''}>Submit</button>
    <button class="g-btn sec" onclick="wsSkip()" ${ws.answered ? 'disabled' : ''}>Skip</button>
    <button class="g-btn sec" onclick="initScramble()">Restart</button>
  </div>`;
  if (!ws.answered) document.getElementById('wsinput')?.focus();
}
