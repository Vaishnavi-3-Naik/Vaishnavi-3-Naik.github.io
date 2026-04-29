/* Achievement definitions, unlock logic, and toast notifications */

const ACHIEVEMENTS = [
  { id: 'duel_first',    icon: '⚔️',  title: 'First Strike',       desc: 'Win your first Puzzle Duel' },
  { id: 'duel_dominant', icon: '🛡️',  title: 'Unstoppable',        desc: 'Win a Puzzle Duel without taking any damage' },
  { id: 'memory_moves',  icon: '🧠',  title: 'Sharp Mind',         desc: 'Complete Memory Match in 20 moves or fewer' },
  { id: 'memory_speed',  icon: '⚡',  title: 'Speed Match',        desc: 'Complete Memory Match in 60 seconds or less' },
  { id: 'hangman_five',  icon: '🪄',  title: 'Wordsmith',          desc: 'Solve 5 Hangman words total' },
  { id: 'hangman_life',  icon: '❤️',  title: 'Untouchable',        desc: 'Solve a Hangman word with all 6 lives intact' },
  { id: 'scramble_fire', icon: '🔥',  title: 'On Fire',            desc: 'Get a 10-word streak in Word Scramble' },
  { id: 'scramble_100',  icon: '💯',  title: 'Century',            desc: 'Score 100+ points in a Word Scramble session' },
  { id: 'trivia_done',   icon: '📚',  title: 'Initiate Scholar',   desc: 'Complete a Trivia Quest round' },
  { id: 'trivia_perfect',icon: '🌟',  title: 'Flawless Mind',      desc: 'Answer all 10 questions correctly in Trivia Quest' },
  { id: 'hub_master',    icon: '🏆',  title: 'Hub Master',         desc: 'Play all 5 different games at least once' },
  { id: 'trivia_streak', icon: '🎯',  title: 'Sharpshooter',       desc: 'Answer 5 trivia questions in a row correctly' },
];

let _toastTimer = null;

function showAchToast(ach) {
  const el = document.getElementById('ach-toast');
  if (!el) return;
  el.classList.remove('hidden', 'hiding');
  el.innerHTML = `
    <div class="ach-toast-icon">${ach.icon}</div>
    <div class="ach-toast-body">
      <div class="ach-toast-title">Achievement Unlocked!</div>
      <div class="ach-toast-name">${ach.title}</div>
    </div>`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.classList.add('hiding');
    setTimeout(() => el.classList.add('hidden'), 350);
  }, 3000);
  updateAchBadge();
}

function tryUnlock(id) {
  if (Storage.unlockAch(id)) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) showAchToast(ach);
  }
}

function updateAchBadge() {
  const el = document.getElementById('ach-count');
  if (el) {
    const count = Storage.getAchievements().length;
    el.textContent = `${count}/${ACHIEVEMENTS.length}`;
  }
}

function checkHubMaster() {
  const played = Storage.getGamesPlayed();
  if (['duel','memory','hangman','scramble','trivia'].every(g => played.includes(g))) {
    tryUnlock('hub_master');
  }
}
