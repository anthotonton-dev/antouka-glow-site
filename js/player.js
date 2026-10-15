// Identite joueur : code court, pseudo, id Supabase. Persiste dans localStorage sous antouka.player.
(function (root) {
  const KEY = 'antouka.player', ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const supa = () => root.AntoukaSupa;
  let cur = null, pending = null;
  function load() {
    if (cur) return cur;
    try { cur = JSON.parse(root.localStorage.getItem(KEY) || 'null'); } catch (e) { cur = null; }
    if (!cur || typeof cur !== 'object') cur = { id: null, code: null, pseudo: null };
    return cur;
  }
  function save() { try { root.localStorage.setItem(KEY, JSON.stringify(cur)); } catch (e) {} }
  function generateCode(prefix = 'ANT') {
    let s = '';
    for (let i = 0; i < 4; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
    return `${prefix}-${s}`;
  }
  // Compte et coupe en points de code (Postgres compte char_length ainsi) : un emoji vaut 1, jamais coupe en deux.
  function sanitizePseudo(s) {
    const cp = [...String(s || '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim()].slice(0, 16);
    while (cp.length && cp[cp.length - 1] === ' ') cp.pop();
    return cp.length >= 2 ? cp.join('') : null;
  }
  function defaultPseudo() { return 'Joueur' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'); }
  const api = {
    generateCode, sanitizePseudo, defaultPseudo,
    get() { const c = load(); return { id: c.id, code: c.code, pseudo: c.pseudo, dev: !!c.dev }; },
    // Mode dev : code DEV-XXXXXXXX verifie par empreinte SHA-256 (ANTOUKA_CONFIG.devHash), jamais envoye a Supabase.
    async claimDev(code) {
      const cfg = root.ANTOUKA_CONFIG || {};
      const subtle = (root.crypto && root.crypto.subtle) || null;
      if (!cfg.devHash || !subtle) return null;
      const buf = await subtle.digest('SHA-256', new TextEncoder().encode(code));
      const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
      if (hex !== cfg.devHash) return null;
      load();
      if (!cur.dev) { try { root.localStorage.setItem(KEY + '.backup', JSON.stringify(cur)); } catch (e) {} }
      cur = { id: null, code, pseudo: 'DEV', dev: true }; save();
      return api.get();
    },
    leaveDev() {
      let prev = null;
      try { prev = JSON.parse(root.localStorage.getItem(KEY + '.backup') || 'null'); } catch (e) { prev = null; }
      cur = prev && typeof prev === 'object' ? prev : { id: null, code: null, pseudo: null }; save();
      return api.get();
    },
    setPseudo(s) { load(); cur.pseudo = sanitizePseudo(s) || cur.pseudo || defaultPseudo(); save(); return cur.pseudo; },
    reset() { cur = { id: null, code: null, pseudo: null }; save(); },
    // Cree le joueur cote Supabase si pas encore fait. Renvoie null si hors ligne ou desactive.
    // Les appels concurrents partagent la meme promesse : un seul insert.
    ensure() {
      load();
      if (cur.dev || cur.id) return Promise.resolve(api.get());
      if (!supa() || !supa().enabled()) return Promise.resolve(null);
      if (pending) return pending;
      pending = (async () => {
        if (!cur.pseudo) cur.pseudo = defaultPseudo();
        let pseudoFallback = false;
        for (let i = 0; i < 3; i++) {
          const code = cur.code || generateCode();
          try {
            const row = await supa().insert('players', { code, pseudo: cur.pseudo });
            cur.id = row.id; cur.code = row.code; cur.pseudo = row.pseudo; save();
            return api.get();
          } catch (e) {
            if (e.status === 409) { cur.code = null; continue; }
            // Pseudo refuse par la base (contrainte check) : on retombe une fois sur un pseudo par defaut.
            if (e.status === 400 && !pseudoFallback) { pseudoFallback = true; cur.pseudo = defaultPseudo(); save(); i--; continue; }
            return null;
          }
        }
        return null;
      })().finally(() => { pending = null; });
      return pending;
    },
    // Retrouve un joueur existant par son code et remplace l'identite locale.
    async claim(code) {
      const c = String(code || '').trim().toUpperCase();
      if (/^DEV-[A-Z2-9]{8}$/.test(c)) return api.claimDev(c);
      if (!supa() || !supa().enabled() || !/^(ANT|TEST)-[A-Z2-9]{4}$/.test(c)) return null;
      try {
        const rows = await supa().select('players', `code=eq.${encodeURIComponent(c)}&select=id,code,pseudo&limit=1`);
        if (!rows || !rows[0]) return null;
        cur = { id: rows[0].id, code: rows[0].code, pseudo: rows[0].pseudo }; save();
        return api.get();
      } catch (e) { return null; }
    },
  };
  root.AntoukaPlayer = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
