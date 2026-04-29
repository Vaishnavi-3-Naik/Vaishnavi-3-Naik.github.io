/* Persistent storage layer using localStorage */
const Storage = (() => {
  const P = 'fpd_';
  const g = k => { try { return JSON.parse(localStorage.getItem(P + k)); } catch { return null; } };
  const s = (k, v) => { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch {} };

  return {
    getScores() { return g('scores') || {}; },
    setScore(game, score) {
      const sc = g('scores') || {};
      const isNew = !sc[game] || score > sc[game];
      if (isNew) { sc[game] = score; s('scores', sc); }
      return isNew;
    },
    getStats() { return g('stats') || {}; },
    incStat(game, key, n = 1) {
      const st = g('stats') || {};
      if (!st[game]) st[game] = {};
      st[game][key] = (st[game][key] || 0) + n;
      s('stats', st);
      return st;
    },
    getStat(game, key) {
      const st = g('stats') || {};
      return (st[game] && st[game][key]) || 0;
    },
    getAchievements() { return g('achievements') || []; },
    unlockAch(id) {
      const list = g('achievements') || [];
      if (!list.includes(id)) { list.push(id); s('achievements', list); return true; }
      return false;
    },
    hasAch(id) { return (g('achievements') || []).includes(id); },
    getSettings() { return g('settings') || { theme: 'dark', name: 'Adventurer' }; },
    saveSettings(v) { s('settings', v); },
    getGamesPlayed() { return g('gamesPlayed') || []; },
    markPlayed(game) {
      const gp = g('gamesPlayed') || [];
      if (!gp.includes(game)) { gp.push(game); s('gamesPlayed', gp); }
      return gp;
    }
  };
})();
