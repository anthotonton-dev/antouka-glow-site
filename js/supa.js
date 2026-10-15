// Client minimal PostgREST. Pas de dependance. Utilisable dans le navigateur (global) et en node (module.exports).
(function (root) {
  let cfg = { url: '', key: '', fetch: null };
  const pick = () => (root.ANTOUKA_CONFIG ? { ...cfg, ...root.ANTOUKA_CONFIG } : cfg);
  const headers = (c) => ({ apikey: c.key, Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' });
  async function call(method, path, body) {
    const c = pick();
    const f = c.fetch || root.fetch;
    const r = await f(`${c.url}/rest/v1/${path}`, { method, headers: headers(c), body: body ? JSON.stringify(body) : undefined });
    const txt = await r.text();
    if (!r.ok) { const err = new Error(`${method} ${path} -> ${r.status}`); err.status = r.status; err.body = txt; throw err; }
    return txt ? JSON.parse(txt) : null;
  }
  const api = {
    configure(c) { cfg = { ...cfg, ...c }; },
    enabled() { const c = pick(); return !!(c.url && c.key); },
    async insert(table, row) { const rows = await call('POST', table, row); return rows && rows[0]; },
    select(table, query) { return call('GET', `${table}?${query}`); },
  };
  root.AntoukaSupa = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
