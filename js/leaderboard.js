// Envoi des parties et lecture du classement. File d'attente locale si Supabase est injoignable.
(function (root) {
  const KEY = 'antouka.pendingRuns';
  const supa = () => root.AntoukaSupa, player = () => root.AntoukaPlayer;
  const readQ = () => { try { return JSON.parse(root.localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const writeQ = (q) => { try { root.localStorage.setItem(KEY, JSON.stringify(q)); } catch (e) {} };
  const toRow = (run, playerId) => ({ player_id: playerId, hero: String(run.hero).toUpperCase(), score: Math.max(0, Math.round(run.score)), level_reached: Math.min(4, Math.max(1, run.levelReached | 0)), duration_s: Math.max(0, Math.round(run.durationS)), deaths: Math.max(0, run.deaths | 0) });
  // Seules les pannes (reseau, 5xx) meritent une file : un 4xx se reproduira a l'identique.
  const transient = (e) => !e || !e.status || e.status >= 500;
  async function post(run) {
    const me = await player().ensure();
    if (!me || !me.id) throw new Error('pas de joueur');
    await supa().insert('runs', toRow(run, me.id));
  }
  const api = {
    async submitRun(run) {
      if (!supa() || !supa().enabled()) return { queued: false, skipped: true };
      try { await post(run); return { queued: false }; }
      catch (e) {
        if (!transient(e)) return { queued: false, rejected: true };
        const q = readQ(); q.push(run); writeQ(q.slice(-20)); return { queued: true };
      }
    },
    async flush() {
      if (!supa() || !supa().enabled()) return;
      const q = readQ();
      if (!q.length) return;
      const rest = [];
      for (const run of q) { try { await post(run); } catch (e) { if (transient(e)) rest.push(run); } }
      writeQ(rest);
    },
    // Classement au chrono : meilleur run par joueur = niveau atteint max, puis temps min, puis score max.
    // Calcule cote client depuis runs (lecture anon), la vue Supabase restant au score tant que 0003 n'est pas appliquee.
    rankRuns(rows) {
      const best = {};
      for (const r of rows || []) {
        const pl = r.players || {}; if (!pl.code || /^TEST-/.test(pl.code)) continue;
        const cur = best[pl.code];
        const better = !cur || r.level_reached > cur.level_reached || (r.level_reached === cur.level_reached && (r.duration_s < cur.duration_s || (r.duration_s === cur.duration_s && r.score > cur.score)));
        if (better) best[pl.code] = { code: pl.code, pseudo: pl.pseudo, hero: r.hero, score: r.score, level_reached: r.level_reached, duration_s: r.duration_s };
      }
      return Object.values(best)
        .sort((a, b) => b.level_reached - a.level_reached || a.duration_s - b.duration_s || b.score - a.score)
        .map((r, i) => ({ rank: i + 1, ...r }));
    },
    async fetchBoard() {
      if (!supa() || !supa().enabled()) return [];
      try {
        const rows = await supa().select('runs', 'select=hero,score,level_reached,duration_s,players(code,pseudo)&order=created_at.desc&limit=2000');
        return api.rankRuns(rows);
      } catch (e) {
        return supa().select('leaderboard', 'select=rank,code,pseudo,hero,score,level_reached,duration_s&order=rank.asc');
      }
    },
  };
  root.AntoukaBoard = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
