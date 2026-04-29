/* Puzzle Duel – 2-player riddle battle */

let pd = {};

function initDuel() {
  Storage.markPlayed('duel');
  checkHubMaster();
  pd = {
    screen: 'start',
    p: [{ name: 'Wizard 1', hp: 100 }, { name: 'Wizard 2', hp: 100 }],
    turn: 0, round: 0,
    pool: [...PD_PUZZLES].sort(() => Math.random() - 0.5),
    qi: 0,
    log: 'The duel begins!',
    timer: 15, answered: false, winner: null,
    p1dmgTaken: 0
  };
  renderDuel();
}

function pdPuzzle() { return pd.pool[pd.qi % pd.pool.length]; }

function pdStartTimer() {
  clearAllIntervals();
  pd.timer = 15;
  const iv = setInterval(() => {
    pd.timer--;
    if (pd.timer <= 0) { clearInterval(iv); if (!pd.answered) pdTimeout(); }
    const b = document.getElementById('pdtbar'), n = document.getElementById('pdtnum');
    if (b) { b.style.width = (pd.timer / 15 * 100) + '%'; b.style.background = pd.timer > 6 ? '#7F77DD' : pd.timer > 3 ? '#BA7517' : '#E24B4A'; }
    if (n) n.textContent = pd.timer + 's';
  }, 1000);
  regInterval(iv);
}

function pdTimeout() {
  pd.answered = true;
  const cur = pd.turn, dmg = 10 + Math.floor(Math.random() * 6);
  pd.p[cur].hp = Math.max(0, pd.p[cur].hp - dmg);
  if (cur === 0) pd.p1dmgTaken += dmg;
  pd.log = `${pd.p[cur].name} ran out of time! Backfire: ${dmg} dmg!`;
  pdMarkOpts(-1);
  pdCheckWin();
}

function pdAnswer(idx) {
  if (pd.answered) return;
  pd.answered = true;
  clearAllIntervals();
  const puz = pdPuzzle(), cur = pd.turn, opp = 1 - cur;
  if (idx === puz.ans) {
    const dmg = 20 + Math.floor(Math.random() * 16);
    pd.p[opp].hp = Math.max(0, pd.p[opp].hp - dmg);
    pd.log = `${pd.p[cur].name} casts ${puz.spell}! ${dmg} damage!`;
  } else {
    const dmg = 10 + Math.floor(Math.random() * 6);
    pd.p[cur].hp = Math.max(0, pd.p[cur].hp - dmg);
    if (cur === 0) pd.p1dmgTaken += dmg;
    pd.log = `${pd.p[cur].name} answered wrong! Backfire: ${dmg} dmg!`;
  }
  pdMarkOpts(idx);
  pdCheckWin();
}

function pdMarkOpts(chosen) {
  const puz = pdPuzzle();
  document.querySelectorAll('.pd-opt').forEach((b, i) => {
    b.disabled = true;
    if (i === puz.ans) b.classList.add('correct');
    else if (i === chosen && chosen !== puz.ans) b.classList.add('wrong');
  });
  pdUpdateHP();
  if (!pd.winner) setTimeout(pdNext, 1800);
}

function pdCheckWin() {
  if (pd.p[0].hp <= 0 || pd.p[1].hp <= 0) {
    pd.winner = pd.p[0].hp <= 0 ? 1 : 0;
    pd.screen = 'end';
    if (pd.winner === 0) {
      // Player 1 wins
      tryUnlock('duel_first');
      Storage.incStat('duel', 'wins');
      if (pd.p1dmgTaken === 0) tryUnlock('duel_dominant');
    }
    setTimeout(renderDuel, 1900);
  }
}

function pdNext() {
  pd.turn = 1 - pd.turn;
  pd.qi++;
  pd.round = Math.floor(pd.qi / 2);
  pd.answered = false;
  pd.log = `${pd.p[pd.turn].name}'s turn!`;
  renderDuel();
  pdStartTimer();
}

function pdUpdateHP() {
  pd.p.forEach((p, i) => {
    const b = document.getElementById('pdhp' + i), n = document.getElementById('pdhpn' + i);
    if (b) b.style.width = p.hp + '%';
    if (n) n.textContent = p.hp + ' HP';
    if (b) b.style.background = hpCol(p.hp);
    if (n) n.style.color = hpCol(p.hp);
  });
}

function hpCol(hp) { return hp > 50 ? '#1D9E75' : hp > 25 ? '#f0a030' : '#e07070'; }

function renderDuel() {
  const c = document.getElementById('content');
  if (pd.screen === 'start') {
    c.innerHTML = `<div class="g-screen">
      <div style="font-size:40px;margin-bottom:8px">🧙‍♂️⚔️🧙‍♀️</div>
      <h2>Puzzle Duel</h2>
      <p>Answer riddles to cast spells. Wrong answers backfire!<br>First wizard to 0 HP loses.</p>
      <div style="margin-bottom:16px">
        <div style="font-size:13px;color:var(--text2);margin-bottom:10px">Enter wizard names:</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <input class="g-input" id="pdn1" placeholder="Wizard 1" value="Wizard 1">
          <input class="g-input" id="pdn2" placeholder="Wizard 2" value="Wizard 2">
        </div>
      </div>
      <button class="g-btn" onclick="pdStart()">Begin the Duel ⚔️</button>
    </div>`;
    return;
  }
  if (pd.screen === 'end') {
    const w = pd.p[pd.winner], l = pd.p[1 - pd.winner];
    c.innerHTML = `<div class="g-screen">
      <div style="font-size:40px;margin-bottom:8px">🏆</div>
      <h2>${w.name} wins!</h2>
      <p>${l.name} has been defeated.</p>
      <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:20px;display:inline-block;min-width:200px">
        <div style="font-size:13px;margin-bottom:4px;color:var(--text2)">Rounds played: ${pd.round + 1}</div>
        <div style="font-size:13px;color:var(--green);font-weight:500">${w.name}: ${w.hp} HP remaining</div>
        <div style="font-size:13px;color:var(--red)">${l.name}: 0 HP</div>
      </div><br>
      <button class="g-btn" onclick="initDuel()">Play Again</button>
      <button class="g-btn sec" style="margin-left:8px" onclick="loadGame('home')">Hub</button>
    </div>`;
    return;
  }
  const puz = pdPuzzle(), cur = pd.turn;
  c.innerHTML = `
  <div class="pd-arena">
    <div class="pd-players">
      <div class="pd-wiz${cur === 0 ? ' active' : ''}">
        <div class="pd-wname">${pd.p[0].name}${cur === 0 ? ' ✦' : ''}</div>
        <div class="hp-bg"><div id="pdhp0" class="hp-fill" style="width:${pd.p[0].hp}%;background:${hpCol(pd.p[0].hp)}"></div></div>
        <div id="pdhpn0" class="hp-txt" style="color:${hpCol(pd.p[0].hp)}">${pd.p[0].hp} HP</div>
      </div>
      <div style="font-size:18px;color:var(--text3)">VS</div>
      <div class="pd-wiz${cur === 1 ? ' active' : ''}">
        <div class="pd-wname">${cur === 1 ? '✦ ' : ''}${pd.p[1].name}</div>
        <div class="hp-bg"><div id="pdhp1" class="hp-fill" style="width:${pd.p[1].hp}%;background:${hpCol(pd.p[1].hp)}"></div></div>
        <div id="pdhpn1" class="hp-txt" style="color:${hpCol(pd.p[1].hp)}">${pd.p[1].hp} HP</div>
      </div>
    </div>
    <div class="pd-log">${pd.log}</div>
  </div>
  <div class="pd-puzzle">
    <div style="font-size:11px;color:var(--text3);margin-bottom:6px">${pd.p[cur].name}'s turn — round ${pd.round + 1}</div>
    <div class="pd-trow">
      <div class="pd-tbg"><div id="pdtbar" class="pd-tbar"></div></div>
      <div id="pdtnum" class="pd-tnum">15s</div>
    </div>
    <span class="g-badge b-${puz.diff}">${puz.diff}</span>
    <div class="pd-q">${puz.q}</div>
    <div class="pd-opts">${puz.opts.map((o, i) => `<button class="pd-opt" onclick="pdAnswer(${i})">${o}</button>`).join('')}</div>
  </div>`;
  pdStartTimer();
}

function pdStart() {
  pd.p[0].name = document.getElementById('pdn1').value.trim() || 'Wizard 1';
  pd.p[1].name = document.getElementById('pdn2').value.trim() || 'Wizard 2';
  pd.screen = 'game';
  pd.log = `The duel begins! ${pd.p[0].name} goes first.`;
  renderDuel();
  pdStartTimer();
}
