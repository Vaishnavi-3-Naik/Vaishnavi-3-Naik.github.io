/* Hangman: Fantasy Edition */

const HM_STAGES = [
`  -----
  |   |
      |
      |
      |
      |
=========`,
`  -----
  |   |
  O   |
      |
      |
      |
=========`,
`  -----
  |   |
  O   |
  |   |
      |
      |
=========`,
`  -----
  |   |
  O   |
 /|   |
      |
      |
=========`,
`  -----
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
`  -----
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
`  -----
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`
];

let hm = {};

function initHangman() {
  Storage.markPlayed('hangman');
  checkHubMaster();
  const entry = HM_WORDS[Math.floor(Math.random() * HM_WORDS.length)];
  hm = { word: entry.word, hint: entry.hint, guessed: new Set(), lives: 6, won: false, lost: false };
  renderHangman();
}

function hmGuess(l) {
  if (hm.won || hm.lost || hm.guessed.has(l)) return;
  hm.guessed.add(l);
  if (!hm.word.includes(l)) hm.lives--;
  const revealed = hm.word.split('').every(c => hm.guessed.has(c));
  if (revealed) hm.won = true;
  if (hm.lives === 0) hm.lost = true;
  renderHangman();
}

function renderHangman() {
  const c = document.getElementById('content');
  if (hm.won || hm.lost) {
    if (hm.won) {
      Storage.incStat('hangman', 'solved');
      const total = Storage.getStat('hangman', 'solved');
      if (total >= 5) tryUnlock('hangman_five');
      if (hm.lives === 6) tryUnlock('hangman_life');
    }
    c.innerHTML = `<div class="g-screen">
      <div style="font-size:40px;margin-bottom:8px">${hm.won ? '🎉' : '💀'}</div>
      <h2>${hm.won ? 'Spell broken!' : 'You perished!'}</h2>
      <p>${hm.won ? `You guessed <strong style="color:var(--accent-light)">${hm.word}</strong> correctly!` : `The word was <strong style="color:var(--red)">${hm.word}</strong>.`}</p>
      <button class="g-btn" onclick="initHangman()">Next Word</button>
      <button class="g-btn sec" style="margin-left:8px" onclick="loadGame('home')">Hub</button>
    </div>`;
    return;
  }
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  c.innerHTML = `
  <div class="hm-gallows">${HM_STAGES[6 - hm.lives]}</div>
  <div class="hm-lives">${Array(hm.lives).fill('❤️').concat(Array(6 - hm.lives).fill('🖤')).join('')}</div>
  <div class="hm-word">${hm.word.split('').map(l => `<div class="hm-letter">${hm.guessed.has(l) ? l : ''}</div>`).join('')}</div>
  <div class="hm-hint">Hint: ${hm.hint}</div>
  <div class="hm-keys">${letters.map(l => {
    const guessed = hm.guessed.has(l);
    const hit = guessed && hm.word.includes(l);
    const miss = guessed && !hm.word.includes(l);
    return `<button class="hm-key${hit ? ' hit' : ''}${miss ? ' miss' : ''}" onclick="hmGuess('${l}')" ${guessed ? 'disabled' : ''}>${l}</button>`;
  }).join('')}</div>
  <button class="g-btn sec" onclick="initHangman()" style="margin-right:8px">New Word</button>
  <button class="g-btn sec" onclick="loadGame('home')">Hub</button>`;
}
