// Quiz avant chaque boss. Autonome : ne connait pas game.js, recoit l'overlay, les sons et un callback.
// Donnees : data/questions.json  { version, questions: [{ id, theme?, q, choices[4], answer, explain? }] }
(function (root) {
  const FALLBACK = [
    { id: 'f1', q: 'Combien de lettres faut-il ramasser pour un GLOW UP ?', choices: ['5', '7', '9', '3'], answer: 1 },
    { id: 'f2', q: 'Que fait un bug qui te touche ?', choices: ['GLOW DOWN', 'GLOW UP', 'Rien', 'Il te donne une lettre'], answer: 0 },
    { id: 'f3', q: 'Quand peut-on frapper Carl ?', choices: ['Quand il court', 'Quand il souffle', 'Jamais', 'Quand il crache'], answer: 1 },
    { id: 'f4', q: 'A quel tempo bat le niveau ?', choices: ['60 BPM', '90 BPM', '120 BPM', '180 BPM'], answer: 2 },
    { id: 'f5', q: 'Quelle touche declenche le pouvoir du perso ?', choices: ['E', 'P', 'M', 'S'], answer: 0 },
  ];
  let pool = FALLBACK.slice(), asked = new Set(), active = null;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const valid = (q) => q && typeof q.q === 'string' && Array.isArray(q.choices) && q.choices.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4;

  async function load(url) {
    try {
      const r = await (root.fetch)(url || 'data/questions.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const qs = (data.questions || data).filter(valid);
      if (qs.length) pool = qs;
    } catch (e) { /* repli sur FALLBACK */ }
    return pool.length;
  }

  function pick(count, theme) {
    let cands = pool.filter((q) => !asked.has(q.id));
    if (theme) { const t = cands.filter((q) => q.theme === theme); if (t.length >= count) cands = t; }
    if (cands.length < count) { asked.clear(); cands = pool.slice(); }
    const chosen = shuffle(cands.slice()).slice(0, count);
    chosen.forEach((q) => asked.add(q.id));
    return chosen.map((q) => {
      const order = shuffle([0, 1, 2, 3]);
      return { ...q, order, correct: order.indexOf(q.answer) };
    });
  }

  // opts : { overlay, bossName, theme, count, seconds, sfx: { good, bad, tick }, onDone(correct) }
  function start(opts) {
    const overlay = opts.overlay, count = opts.count || 5, seconds = opts.seconds || 15, sfx = opts.sfx || {};
    const qs = pick(count, opts.theme);
    const st = { i: 0, correct: 0, locked: false, timer: 0, raf: 0, t0: 0 };
    active = st;
    overlay.hidden = false;

    function render() {
      const q = qs[st.i];
      overlay.innerHTML = `
        <div class="card wide quiz">
          <p class="eyebrow">[ quiz avant ${esc(opts.bossName || 'le boss')} ] question ${st.i + 1} / ${qs.length}</p>
          <div class="quiz-timer"><i id="quizBar"></i></div>
          <h2 class="quiz-q">${esc(q.q)}</h2>
          <div class="quiz-choices">
            ${q.order.map((ci, k) => `<button type="button" class="choice" data-k="${k}"><span>${k + 1}</span>${esc(q.choices[ci])}</button>`).join('')}
          </div>
          <p class="hint">clavier 1 à 4, ou clique. chaque bonne réponse retire 1 PV au boss.</p>
        </div>`;
      overlay.querySelectorAll('.choice').forEach((b) => b.addEventListener('click', () => answer(parseInt(b.dataset.k, 10))));
      st.locked = false; st.t0 = performance.now();
      cancelAnimationFrame(st.raf);
      const bar = overlay.querySelector('#quizBar');
      const tickBar = () => {
        if (st.locked || active !== st) return;
        const left = Math.max(0, 1 - (performance.now() - st.t0) / (seconds * 1000));
        if (bar) bar.style.width = (left * 100).toFixed(1) + '%';
        if (left <= 0) { answer(-1); return; }
        st.raf = requestAnimationFrame(tickBar);
      };
      st.raf = requestAnimationFrame(tickBar);
    }

    function answer(k) {
      if (st.locked) return;
      st.locked = true; cancelAnimationFrame(st.raf);
      const q = qs[st.i], good = k === q.correct;
      if (good) st.correct++;
      overlay.querySelectorAll('.choice').forEach((b, idx) => {
        b.disabled = true;
        if (idx === q.correct) b.classList.add('good');
        else if (idx === k) b.classList.add('bad');
      });
      if (good && sfx.good) sfx.good(); else if (!good && sfx.bad) sfx.bad();
      const hint = overlay.querySelector('.hint');
      if (hint) hint.textContent = good ? 'bonne réponse' : (k < 0 ? 'temps écoulé' : 'raté') + (q.explain ? ' : ' + q.explain : '');
      st.timer = setTimeout(() => { st.i++; if (st.i < qs.length) render(); else finish(); }, 900);
    }

    function finish() {
      const n = st.correct, hp = Math.max(1, (opts.maxHp || 5) - n);
      overlay.innerHTML = `
        <div class="card quiz">
          <p class="eyebrow">[ quiz terminé ]</p>
          <h2>${n} / ${qs.length} bonnes réponses.<br><span class="hl">${esc(opts.bossName || 'le boss')} aura ${hp} PV.</span></h2>
          <div class="actions">
            <button class="btn" id="quizGo" type="button">[ au combat ]</button>
            <span class="hint">ou Espace</span>
          </div>
        </div>`;
      const go = () => { if (active !== st) return; active = null; root.removeEventListener('keydown', onKey, true); opts.onDone && opts.onDone(n); };
      overlay.querySelector('#quizGo').addEventListener('click', go);
      overlay.querySelector('#quizGo').focus({ preventScroll: true });
      st.go = go;
    }

    // Capture clavier : le jeu derriere ne recoit rien pendant le quiz.
    function onKey(e) {
      if (active !== st) return;
      e.stopPropagation();
      if (st.go) { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); st.go(); } return; }
      const m = /^(Digit|Numpad)([1-4])$/.exec(e.code);
      if (m) { e.preventDefault(); answer(parseInt(m[2], 10) - 1); }
    }
    root.addEventListener('keydown', onKey, true);
    render();
    return st;
  }

  function abort() { if (active) { clearTimeout(active.timer); cancelAnimationFrame(active.raf); active = null; } }

  root.AntoukaQuiz = { load, start, abort, pick, get size() { return pool.length; }, _setPool(qs) { pool = qs.filter(valid); asked.clear(); } };
  if (typeof module !== 'undefined') module.exports = root.AntoukaQuiz;
})(typeof window !== 'undefined' ? window : globalThis);
