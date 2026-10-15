(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const $ = (id) => document.getElementById(id);

  const tok = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = {};
  // Les couleurs canvas suivent les tokens CSS : relues a chaque changement de skin (data-skin sur <html>).
  function readTokens() {
    Object.assign(C, {
      ink: tok('--ink'), panel: tok('--panel'), line: tok('--line'), grid: tok('--grid'),
      violet: tok('--violet'), violet2: tok('--violet-2'), violet3: tok('--violet-3'),
      faint: tok('--violet-faint'), ghost: tok('--violet-ghost'),
      term: tok('--term'), termSoft: tok('--term-soft'), paper: tok('--paper'), mute: tok('--mute'), dim: tok('--dim'),
      skin: tok('--skin'), cheek: tok('--cheek'), hair: tok('--hair'), beard: tok('--beard'),
      sweater: tok('--sweater'), collar: tok('--collar'), pants: tok('--pants'),
      blonde: tok('--blonde'), wine: tok('--wine'), glass: tok('--glass'),
      skinDark: tok('--skin-dark'), shirt: tok('--shirt'), phone: tok('--phone'), jersey: tok('--jersey'), jersey2: tok('--jersey-2'), cap: tok('--cap'),
    });
  }
  readTokens();
  // Couleurs propres au skin Halloween (pas de tokens : elles ne servent qu'au canvas).
  const HW = { moon: '#f3e9c6', blood: '#c81e3a', ecto: '#8ef58a', zombie: '#9bbf7a', frank: '#a9c4a0', bandage: '#e8dcc2', bone: '#efe6d6', coffin: '#5a3a22', pumpkin: '#ff7a1a', spider: '#120a16', pale: '#e9dcd2', cape: '#2a0b4a', hat: '#0d0710' };
  const F_DISPLAY = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif';
  const F_MONO = '"Space Mono", ui-monospace, Menlo, monospace';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Monde ----------
  const T = 32, ROWS = 15, COLS = 434, H = ROWS * T;
  const WORD = 'ANTOUKA';
  const FINISH = { x: 429 * T, y: 10 * T, w: 2 * T, h: 3 * T };
  const SECTIONS = [
    { x: 1, label: '[ 1 .0 INIT ]' },
    { x: 74, label: '[ 2 .0 BUILD ]' },
    { x: 142, label: '[ 3 .0 DEBUG ]' },
    { x: 191, label: '[ 4 .0 DEPLOY ]' },
    { x: 226, label: '[ 6 .0 REFACTO ]' },
    { x: 298, label: '[ 7 .0 PROD ]' },
    { x: 333, label: '[ 8 .0 TEST ]' },
    { x: 360, label: '[ 9 .0 HOTFIX ]' },
    { x: 403, label: '[ 10 .0 RELEASE ]' },
  ];
  const FRIDGE = { x: 404 * T + 6, y: 13 * T - 72, w: 36, h: 72 };
  let grid, letters, blockLetters, enemies, spikes, cps, bumps, bosses = [], words = [], waves = [], cans = [], puddles = [];

  function buildLevel() {
    grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
    const slots = [], defs = [];
    spikes = []; cps = []; bumps = {};
    const ground = (a, b) => { for (let x = a; x <= b; x++) for (let y = 13; y < ROWS; y++) grid[y][x] = 1; };
    const plat = (x, y, w) => { for (let i = 0; i < w; i++) grid[y][x + i] = 2; };
    const BP = (x, y, w) => { for (let i = 0; i < w; i++) grid[y][x + i] = 7; };
    const col = (x, top) => { for (let y = top; y < 13; y++) grid[y][x] = 5; };
    const L = (x, y) => slots.push({ x, y, block: false });
    const Q = (x, y) => { grid[y][x] = 3; slots.push({ x, y, block: true }); };
    const W = (x) => defs.push({ type: 'bug', x });
    const Fy = (x, y) => defs.push({ type: 'fly', x, y });
    const S = (a, b) => { for (let x = a; x <= b; x++) spikes.push(x); };
    const CP = (x) => cps.push({ x, on: false });

    // 1 .0 INIT : premier mot
    CP(3);
    ground(0, 34);
    L(8, 12); Q(12, 10); L(17, 11);
    plat(20, 10, 4); L(21, 8);
    col(25, 12); W(30);
    ground(38, 72);
    L(40, 11); CP(42);
    col(45, 12); col(46, 11); col(47, 10);
    L(48, 8);
    W(53); W(57);
    plat(60, 10, 4); L(62, 8);
    CP(66);

    // 2 .0 BUILD : le vide et les 404
    ground(76, 96);
    plat(79, 10, 3); L(80, 8);
    Fy(86, 9);
    Q(89, 9);
    W(92);
    plat(98, 10, 3); BP(103, 9, 3); plat(108, 10, 3);
    Fy(101, 6);
    L(104, 7); L(109, 8);
    ground(113, 140);
    L(116, 11);
    plat(118, 9, 3); plat(123, 9, 3);
    W(120); W(124);
    S(127, 128);
    Q(131, 9);
    CP(130);
    plat(134, 10, 4); L(136, 8);

    // 3 .0 DEBUG : en hauteur
    ground(144, 189);
    col(147, 12); col(148, 11); col(149, 10); col(150, 9); col(151, 11);
    plat(153, 8, 3); L(154, 6);
    plat(158, 7, 3); L(159, 5);
    Fy(163, 6);
    plat(165, 9, 3); L(166, 7);
    W(162); W(168);
    S(172, 174); L(173, 9); BP(171, 11, 4);
    CP(177);
    Fy(179, 8);
    Q(181, 9);
    W(185);
    col(188, 12); col(189, 11); L(189, 9);

    // 4 .0 DEPLOY : arène de Ruben
    ground(193, COLS - 1);
    L(196, 10);
    CP(197);
    col(200, 11); plat(202, 8, 2);
    col(222, 11); plat(219, 8, 2);
    // ===== NIVEAU 2 : plus dur. Trous de 4 cases, pics sous les lettres, rythme, 3 SAVE seulement. =====
    const cut = (a, b) => { for (let x = a; x <= b; x++) for (let y = 13; y < ROWS; y++) grid[y][x] = 0; };
    // 6 .0 REFACTO
    CP(226);
    L(230, 11);
    plat(235, 10, 3); L(236, 8);
    cut(241, 244);
    S(248, 249); L(248, 9);
    W(253); W(256); L(257, 11);
    Q(259, 9);
    cut(263, 274);
    BP(264, 10, 2); L(265, 8);
    Fy(266, 7);
    BP(269, 10, 2); L(270, 8);
    CP(277); L(279, 11);
    col(281, 12); col(282, 11); col(283, 10);
    W(285);
    plat(286, 8, 3); L(287, 6);
    Fy(289, 9);
    plat(291, 7, 2); L(292, 5);
    S(294, 295);
    // 7 .0 PROD
    W(300); W(303); W(306); L(302, 11);
    Q(309, 9);
    cut(313, 316);
    plat(314, 10, 2); L(315, 8); Fy(314, 7);
    S(320, 322); BP(319, 11, 4); L(321, 9);
    CP(325);
    Fy(327, 8);
    // 8 .0 TEST : arène de Carl
    col(332, 11); plat(337, 8, 2);
    col(356, 11); plat(351, 8, 2);
    // ===== NIVEAU 3 : 9 .0 HOTFIX, court et dur, une serie de lettres, deux SAVE =====
    CP(362); L(364, 11); Q(365, 9);
    cut(367, 371); BP(369, 10, 1); Fy(369, 7);
    plat(375, 8, 3); L(376, 6); W(374); W(377); S(379, 380);
    cut(381, 384); plat(382, 9, 2); L(383, 7);
    col(387, 12); col(388, 11); col(389, 10); L(389, 8);
    plat(392, 8, 2); L(393, 6);
    Fy(395, 8); CP(396); W(397); L(399, 11);
    // 10 .0 RELEASE : arène de YOW (frigo contre le mur gauche), puis la porte
    col(402, 11); plat(406, 8, 2);
    col(426, 11); plat(421, 8, 2);
    bosses = [makeBoss('ruben', 211), makeBoss('carl', 344), makeBoss('yow', 414)];
    words = []; waves = []; cans = []; puddles = [];

    slots.sort((a, b) => a.x - b.x);
    letters = slots.map((s, i) => ({ ...s, id: i, ch: WORD[i % 7], idx: i % 7, taken: false }));
    blockLetters = {};
    letters.forEach((l) => { if (l.block) blockLetters[l.x + ',' + l.y] = l; });

    enemies = defs.map((d, i) => d.type === 'bug'
      ? { type: 'bug', x: d.x * T + 2, y: 13 * T - 20, w: 28, h: 20, vx: 0, vy: 0, dir: -1, alive: true, active: false, squash: 0, ground: false, seed: i }
      : { type: 'fly', x0: d.x * T, y0: d.y * T, x: d.x * T, y: d.y * T, w: 36, h: 22, t: i * 40, range: 64, alive: true, squash: 0, seed: i });
  }

  const isSolid = (cx, cy) => {
    if (cx < 0 || cx >= COLS) return true;
    if (cy < 0) return true;
    if (cy >= ROWS) return false;
    const t = grid[cy][cx];
    if (t === 7) return beatOn;
    return t !== 0;
  };
  // Tempo : 120 BPM a 60 fps = 30 frames par temps. Les plateformes rythmees existent 2 temps sur 4.
  const BEAT = 30;
  let beatOn = true, beatP = 0, pads = [];

  function moveX(e, dx) {
    e.x += dx;
    const top = Math.floor(e.y / T), bot = Math.floor((e.y + e.h - 0.01) / T);
    if (dx > 0) {
      const c = Math.floor((e.x + e.w - 0.01) / T);
      for (let r = top; r <= bot; r++) if (isSolid(c, r)) { e.x = c * T - e.w; return true; }
    } else if (dx < 0) {
      const c = Math.floor(e.x / T);
      for (let r = top; r <= bot; r++) if (isSolid(c, r)) { e.x = (c + 1) * T; return true; }
    }
    return false;
  }

  function moveY(e, dy, onHead) {
    e.y += dy;
    e.ground = false;
    const l = Math.floor(e.x / T), r = Math.floor((e.x + e.w - 0.01) / T);
    if (dy > 0) {
      const row = Math.floor((e.y + e.h - 0.01) / T);
      for (let c = l; c <= r; c++) if (isSolid(c, row)) { e.y = row * T - e.h; e.vy = 0; e.ground = true; return; }
    } else if (dy < 0) {
      const row = Math.floor(e.y / T);
      const mid = Math.floor((e.x + e.w / 2) / T);
      const order = [mid, l, r];
      for (const c of order) if (isSolid(c, row)) { e.y = (row + 1) * T; e.vy = 0; if (onHead) onHead(c, row); return; }
    }
  }

  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // ---------- Etat ----------
  const SIZES = { 1: [24, 32], 2: [27, 38], 3: [30, 44] };
  const PERKS = { 1: 'forme de base', 2: 'saut renforcé, 1 plateforme', 3: 'double saut, 2 plateformes' };

  // ---------- Skin Halloween : bascule surprise apres 5 s de jeu, une fois par partie ----------
  let skinId = 'decode', haunted = false;
  const isHW = () => skinId === 'halloween';
  const noHW = () => { try { return localStorage.getItem('antouka-glow-nohw') === '1'; } catch (e) { return false; } };
  const HW_LABELS = { dash: 'Ruée du zombie', potion: 'Philtre', visio: 'Fantôme', weesh: 'Hurlement' };
  const powerLabel = (hd) => (isHW() ? HW_LABELS[hd.power.key] : hd.power.label);
  function setSkin(id) {
    skinId = id;
    if (isHW()) document.documentElement.setAttribute('data-skin', 'halloween');
    else document.documentElement.removeAttribute('data-skin');
    readTokens();
    const tag = document.querySelector('.brand .tag');
    if (tag) tag.textContent = isHW() ? '[ halloween edition ]' : '[ glow up edition ]';
    if (p) updateHUD();
    if ($('sheet')) { renderSheet(hero); overlay.querySelectorAll('.hero canvas').forEach((cv) => drawHeroPreview(cv, cv.parentNode.dataset.hero)); }
  }
  function haunt() {
    haunted = true;
    setSkin('halloween');
    flash = 1; cam.shake = 10;
    splash('TRICK OR TREAT', 'le jeu est hanté', 'boss');
    sfx.haunt();
  }
  const maxPads = (g) => (g === 3 ? 2 : g === 2 ? 1 : 0);
  // Fiche de perso : multiplicateurs reels + barres affichees sur 5 + pouvoir E.
  const HEROES = {
    lou: { name: 'LOU', speed: 1.08, jump: 1.0, inv: 1.25, kb: 0.8, stats: { vitesse: 4, saut: 3, 'résistance': 4 },
      power: { key: 'dash', label: 'Dash', desc: 'ruée invincible sur 3 cases, écrase tout, recharge 4 s' } },
    vibcobida: { name: 'VIBCOBIDA', speed: 0.95, jump: 1.08, inv: 0.8, kb: 1.2, stats: { vitesse: 3, saut: 4, 'résistance': 2 },
      power: { key: 'potion', label: 'Potion', desc: '3 écrasements remplissent le verre, E pour boire : +1 glow, 1,5 s invincible' } },
    kardo: { name: 'KARDO', speed: 1.0, jump: 0.95, inv: 1.4, kb: 0.6, stats: { vitesse: 3, saut: 2, 'résistance': 5 },
      power: { key: 'visio', label: 'En visio', desc: 'invisible 5 s, rien ne peut le toucher, recharge 10 s' } },
    moko: { name: 'MOKO', speed: 1.15, jump: 1.05, inv: 0.7, kb: 1.3, stats: { vitesse: 5, saut: 4, 'résistance': 1 },
      power: { key: 'weesh', label: 'Weeeeesssshh', desc: '3 weeeeesssshh tournent autour de lui 4 s et écrasent ce qu’ils touchent, recharge 8 s' } },
  };
  const HERO = () => HEROES[hero];
  // Pouvoirs a duree + recharge (frames). La potion a son propre compteur de gorgees.
  // STREEP : perso cache, jamais sur l'ecran perso. Il remplace le heros a 15 minutes de jeu effectif dans une partie.
  // Lent pour de vrai (vitesse 1 sur la fiche) : 0,62 contre 0,95 minimum pour les autres.
  HEROES.streep = { name: 'STREEP', hidden: true, speed: 0.62, jump: 0.85, inv: 0.6, kb: 1.4, stats: { vitesse: 1, saut: 1, 'résistance': 1 },
    power: { key: 'gamer', label: 'Pause jeux vidéo', desc: 'il s’assoit et joue 3 s : intouchable mais immobile, recharge 10 s' } };
  // Les persos caches ne sont listes qu'en mode dev (STREEP se choisit alors comme les autres).
  const VISIBLE_HEROES = () => Object.keys(HEROES).filter((k) => !HEROES[k].hidden || (window.AntoukaPlayer && window.AntoukaPlayer.get().dev));
  const POW = { dash: { t: 14, cd: 240 }, visio: { t: 300, cd: 600 }, weesh: { t: 240, cd: 480 }, gamer: { t: 180, cd: 600 } };
  let streeped = false, prevHero = null;
  function streepArrive() {
    streeped = true; prevHero = hero; hero = 'streep';
    p.powT = 0; p.powCd = 0; p.sips = 0; shields = [];
    flash = 1; cam.shake = 8;
    splash('STREEP', 'dsl j’étais bloqué à Nation', 'boss');
    popText(p.x + p.w / 2, p.y - 16, '?!', C.paper, true);
    sfx.alarm(); updateHUD();
  }
  function unstreep() { if (prevHero) { hero = prevHero; prevHero = null; } streeped = false; if (hero === 'streep' && !isDev()) hero = 'lou'; }
  const SIPS = 3, WEESH_N = 3, WEESH_R = 46;
  let shields = [];
  let p, state = 'title', score = 0, best = 0, deaths = 0, time = 0, tick = 0;
  let word = [false, false, false, false, false, false, false];
  let particles = [], cam = { x: 0, shake: 0 }, freezeT = 0, deadT = 0, flash = 0, winTimer = 0, lvl2 = false, lvl3 = false;
  let viewW = 900, scale = 1, dpr = 1;

  try { best = parseInt(localStorage.getItem('antouka-glow-best') || '0', 10) || 0; } catch (e) { best = 0; }
  let hero = 'lou';
  try { const saved = localStorage.getItem('antouka-glow-hero'); if (saved && HEROES[saved] && (!HEROES[saved].hidden || (window.AntoukaPlayer && window.AntoukaPlayer.get().dev))) hero = saved; } catch (e) {}

  // ---------- Identite joueur et classement : js/player.js + js/leaderboard.js (Supabase via PostgREST, RLS insert/select). ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const Player = () => window.AntoukaPlayer || null;
  const boardOn = () => !!(window.AntoukaSupa && window.AntoukaSupa.enabled());
  const playerName = () => { const pl = Player(); return pl ? (pl.get().pseudo || '') : ''; };
  const playerCode = () => { const pl = Player(); return pl ? (pl.get().code || '') : ''; };
  const playerLocked = () => { const pl = Player(); return !!(pl && pl.get().id); };
  let runSent = false;
  // 1 = niveau 1, 2 = Ruben battu, 3 = niveau 2 entame, 4 = Carl battu.
  // 1 niveau 1, 2 Ruben battu, 3 niveau 2, 4 Carl battu, 5 niveau 3, 6 YOW battu.
  // Supabase n'accepte que 1..4 tant que la migration 0002 n'est pas appliquee : ANTOUKA_MAX_LEVEL plafonne l'envoi.
  function levelReached() {
    const ruben = bosses.find((b) => b.type === 'ruben'), carl = bosses.find((b) => b.type === 'carl'), yow = bosses.find((b) => b.type === 'yow');
    if (yow && yow.dead) return 6;
    if (lvl3) return 5;
    if (carl && carl.dead) return 4;
    if (lvl2) return 3;
    if (ruben && ruben.dead) return 2;
    return 1;
  }
  // Envoie le run une seule fois par partie (victoire ou abandon). Ne rejette jamais.
  // Mode dev (code secret sur l'ecran profil) : invincible, raccourcis clavier, rien n'est envoye au classement.
  const isDev = () => !!(Player() && Player().get().dev);
  let devGod = true, devFly = false;
  function devTeleport(col, deadTypes) {
    for (const b of bosses) if (deadTypes.includes(b.type)) { b.dead = true; b.quizDone = true; b.active = true; } else if (!b.dead) { resetBoss(b); b.quizDone = false; }
    words = []; waves = []; cans = []; puddles = [];
    p.x = col * T; p.y = 13 * T - p.h; p.vx = 0; p.vy = 0; cam.x = Math.max(0, p.x - viewW * 0.4);
    if (col >= 358) lvl2 = lvl3 = true; else if (col >= 224) lvl2 = true;
    overlay.hidden = true; state = 'play';
    popText(p.x + p.w / 2, p.y - 16, 'DEV TP', C.term, false);
    updateBossBar();
  }
  function devKey(code) {
    const k = { Digit1: () => devTeleport(196, []), Digit2: () => devTeleport(328, ['ruben']), Digit3: () => devTeleport(398, ['ruben', 'carl']),
      Digit4: () => devTeleport(226, ['ruben']), Digit5: () => devTeleport(360, ['ruben', 'carl']),
      KeyG: () => { if (p.glow < 3) { setGlow(3, 'up'); state = 'play'; } },
      KeyH: () => { if (isHW()) setSkin('decode'); else { haunted = true; setSkin('halloween'); } },
      KeyK: () => { const b = bosses.find((x) => x.active && !x.dead); if (b) { b.hp = 1; hitBoss(b); } },
      KeyI: () => { devGod = !devGod; popText(p.x + p.w / 2, p.y - 16, devGod ? 'GOD ON' : 'GOD OFF', C.term, false); updateHUD(); },
      Digit6: () => { if (!streeped) streepArrive(); },
      KeyF: () => { devFly = !devFly; p.vy = 0; p.powT = 0; popText(p.x + p.w / 2, p.y - 16, devFly ? 'FLY ON' : 'FLY OFF', C.term, false); updateHUD(); },
    }[code];
    if (!k) return false;
    k(); return true;
  }
  function recordRun() {
    if (isDev()) return Promise.resolve({ skipped: true, dev: true });
    if (runSent || score <= 0 || !window.AntoukaBoard) return Promise.resolve({ skipped: true });
    runSent = true;
    const maxLevel = (window.ANTOUKA_CONFIG && window.ANTOUKA_CONFIG.maxLevel) || 4;
    return AntoukaBoard.submitRun({ hero: streeped && prevHero ? prevHero : hero, score, levelReached: Math.min(levelReached(), maxLevel), durationS: Math.floor(time / 60), deaths }).catch(() => ({ queued: true }));
  }

  function newPlayer() {
    const [w, h] = SIZES[1];
    return { x: 3 * T + 4, y: 13 * T - h, w, h, vx: 0, vy: 0, ground: false, face: 1, glow: 1, inv: 0, coyote: 0, jumpsLeft: 0, sy: 1, run: 0, jumping: false, lock: 0, pads: 0, onPad: false, powT: 0, powCd: 0, sips: 0, slowT: 0, slowK: 1 };
  }

  function reset() {
    buildLevel();
    p = newPlayer();
    cps[0].on = true;
    score = 0; deaths = 0; time = 0;
    word.fill(false);
    particles = []; pads = []; lvl2 = false; lvl3 = false; shields = []; runSent = false;
    cam.x = 0; cam.shake = 0;
    haunted = false;
    unstreep();
    if (isHW()) setSkin('decode');
    updateHUD();
    updateBossBar();
  }

  // ---------- Audio ----------
  let ac = null, muted = false;
  function initAudio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  }
  function tone(f, dur, type = 'square', vol = 0.05, slide = 0, delay = 0) {
    if (muted || !ac) return;
    const t0 = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  const sfx = {
    jump: () => tone(320, 0.12, 'square', 0.035, 260),
    dbl: () => tone(520, 0.1, 'square', 0.035, 380),
    letter: (i) => tone(523 * (isHW() ? [1, 1.189, 1.335, 1.498, 1.682, 1.782, 2][i % 7] : Math.pow(1.12246, i)), 0.14, 'triangle', 0.07),
    haunt: () => { tone(220, 0.7, 'sawtooth', 0.05, -170); tone(1760, 0.3, 'sine', 0.045, 0, 0.35); tone(1319, 0.6, 'sine', 0.045, 0, 0.6); },
    stomp: () => tone(180, 0.12, 'square', 0.05, -120),
    block: () => { tone(660, 0.08, 'square', 0.04); tone(880, 0.12, 'triangle', 0.05, 0, 0.06); },
    up: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'square', 0.045, 0, i * 0.07)),
    down: () => tone(440, 0.45, 'sawtooth', 0.05, -330),
    off: () => [392, 311, 233, 175].forEach((f, i) => tone(f, 0.18, 'square', 0.05, 0, i * 0.12)),
    save: () => { tone(784, 0.08, 'triangle', 0.05); tone(1175, 0.14, 'triangle', 0.05, 0, 0.08); },
    win: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.06, 0, i * 0.11)),
    kick: () => tone(isHW() ? 55 : 70, 0.1, 'sine', 0.06, -30),
    dash: () => tone(900, 0.16, 'sawtooth', 0.04, -600),
    visio: () => { tone(880, 0.12, 'sine', 0.05); tone(1175, 0.18, 'sine', 0.05, 0, 0.14); },
    gamer: () => [659, 880, 1319].forEach((f, i) => tone(f, 0.08, 'square', 0.04, 0, i * 0.09)),
    weesh: () => tone(1400, 0.5, 'sawtooth', 0.04, -1100),
    drink: () => [523, 659, 784].forEach((f, i) => tone(f, 0.12, 'triangle', 0.05, 0, i * 0.08)),
    hat: () => tone(2400, 0.025, 'square', 0.01),
    pad: () => { tone(392, 0.08, 'triangle', 0.05); tone(587, 0.12, 'triangle', 0.05, 0, 0.05); },
    alarm: () => [0, 1, 2].forEach((i) => { tone(220, 0.18, 'sawtooth', 0.05, 0, i * 0.26); tone(330, 0.16, 'sawtooth', 0.04, 0, i * 0.26 + 0.1); }),
    spit: () => tone(240, 0.18, 'sawtooth', 0.04, 320),
    bossHit: () => { tone(150, 0.22, 'square', 0.06, -80); tone(620, 0.1, 'triangle', 0.05, 0, 0.06); },
    wave: () => tone(60, 0.35, 'sine', 0.08, -25),
    can: () => tone(3200, 0.06, 'sawtooth', 0.025, -1800),
    fridge: () => { tone(660, 0.06, 'square', 0.04); tone(880, 0.06, 'square', 0.04, 0, 0.09); },
  };
  function toggleMute() {
    muted = !muted;
    $('mute').textContent = muted ? 'son off' : 'son on';
  }
  $('mute').addEventListener('click', () => { initAudio(); toggleMute(); });
  $('pauseBtn').addEventListener('click', () => { togglePause(); $('pauseBtn').blur(); });

  // ---------- Input ----------
  const input = { left: false, right: false, jump: false, jumpBuf: 0, pad: false, padBuf: 0, power: false, powerBuf: 0 };
  const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'pad', KeyS: 'pad', KeyX: 'pad', KeyE: 'power' };
  const press = (k) => {
    if (k === 'jump') { if (!input.jump) input.jumpBuf = 8; input.jump = true; }
    else if (k === 'pad') { if (!input.pad) input.padBuf = 8; input.pad = true; }
    else if (k === 'power') { if (!input.power) input.powerBuf = 8; input.power = true; }
    else input[k] = true;
  };
  addEventListener('keydown', (e) => {
    const ae = document.activeElement;
    if (isDev() && (state === 'play' || state === 'pause' || state === 'freeze') && !(ae && ae.tagName === 'INPUT') && !e.repeat && devKey(e.code)) { e.preventDefault(); return; }
    if (ae && ae.tagName === 'INPUT') {
      // Saisie du pseudo : les touches du jeu restent au clavier. Entree valide et lance.
      if (e.code === 'Enter') {
        e.preventDefault();
        if (ae.id === 'claimIn' && $('claimGo')) { $('claimGo').click(); return; }
        ae.blur(); titleAdvance();
      }
      return;
    }
    const k = KEYS[e.code];
    if (k || e.code === 'Enter') initAudio();
    if (k) {
      e.preventDefault();
      if (state === 'title' || state === 'win') {
        if (k === 'jump' && !e.repeat) titleAdvance();
        else if (state === 'title' && titleStep === 3 && (k === 'left' || k === 'right') && !e.repeat) {
          const ids = VISIBLE_HEROES(), i = ids.indexOf(hero);
          selectHero(ids[(i + (k === 'right' ? 1 : ids.length - 1)) % ids.length]); sfx.letter(ids.indexOf(hero) * 2);
        }
        return;
      }
      press(k);
    }
    const isBtn = document.activeElement && document.activeElement.tagName === 'BUTTON';
    if (e.code === 'Enter' && !isBtn && (state === 'title' || state === 'win')) titleAdvance();
    const key = (e.key || '').toLowerCase();
    if (key === 'p' || e.code === 'Escape') togglePause();
    if (key === 'm') toggleMute();
  });
  addEventListener('keyup', (e) => {
    const k = KEYS[e.code];
    if (k) input[k] = false;
  });
  addEventListener('blur', () => { input.left = input.right = input.jump = input.pad = input.power = false; });
  function bindTouch(id, key) {
    const el = $(id);
    const on = (e) => {
      e.preventDefault(); initAudio();
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      el.classList.add('held');
      if (state === 'title' || state === 'win') { titleAdvance(); return; }
      press(key);
    };
    const off = () => { el.classList.remove('held'); input[key] = false; };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('lostpointercapture', off);
  }
  bindTouch('tLeft', 'left'); bindTouch('tRight', 'right'); bindTouch('tJump', 'jump'); bindTouch('tPad', 'pad'); bindTouch('tPower', 'power');
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (state === 'play') togglePause();
  });

  // ---------- HUD et ecrans ----------
  const pad = (n) => String(n).padStart(6, '0');
  let wordFlashT = 0;
  function updateWordHUD(allOn) {
    $('word').innerHTML = '<span class="br">[</span>' +
      WORD.split('').map((c, i) => `<span class="slot${allOn || word[i] ? ' on' : ''}">${c}</span>`).join('') +
      '<span class="br">]</span>';
  }
  function updateHUD() {
    $('glowNum').textContent = p.glow + ' .0';
    $('perk').textContent = PERKS[p.glow];
    if ($('dev')) { $('dev').hidden = !isDev(); $('dev').textContent = 'dev' + (devGod ? ' god' : '') + (devFly ? ' fly' : ''); }
    if ($('slow')) $('slow').hidden = !(p.slowT > 0);
    const m = $('meter');
    m.classList.toggle('max', p.glow === 3);
    [...m.children].forEach((el, i) => el.classList.toggle('on', i < p.glow));
    $('pads').innerHTML = Array.from({ length: maxPads(p.glow) }, (_, i) => `<i class="${i < p.pads ? 'on' : ''}"></i>`).join('');
    const pk = HERO().power.key;
    if (POW[pk]) {
      const active = p.powT > 0 && pk !== 'dash', ready = p.powCd <= 0, pct = Math.round((1 - p.powCd / POW[pk].cd) * 100);
      $('power').innerHTML = `<b class="${ready ? 'ready' : ''}">E</b>` + (active
        ? `<span class="act">${pk === 'visio' ? (isHW() ? 'fantôme' : 'en visio') : pk === 'gamer' ? 'en jeu' : (isHW() ? 'hurlement' : 'weeeeesssshh')}</span>`
        : `<span class="cd${ready ? ' ready' : ''}"><i style="width:${pct}%"></i></span>`);
    } else {
      const full = p.sips >= SIPS;
      $('power').innerHTML = `<b class="${full ? 'ready' : ''}">E</b><span class="sips">${Array.from({ length: SIPS }, (_, i) => `<i class="${i < p.sips ? 'on' : ''}"></i>`).join('')}</span>`;
    }
    $('score').textContent = pad(score);
    $('best').textContent = pad(Math.max(best, score));
    updateWordHUD(wordFlashT > 0);
  }
  function splash(big, sub, kind) {
    const el = $('splash');
    el.className = 'splash';
    void el.offsetWidth;
    el.innerHTML = `<div class="big">${big}</div><div class="sub">${sub}</div>`;
    el.classList.add('show', kind);
  }

  const overlay = $('overlay');
  let titleStep = 1;
  function showTitle() {
    if (isHW()) setSkin('decode');
    unstreep();
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="card wide">
        <p class="eyebrow">[ 0 .0 antouka ]</p>
        <h2>Collecte le mot.<br><span class="hl">Glow up.</span></h2>
        <div class="tiles">
          <div class="tile">
            <div class="vis word-vis"><span class="br">[</span>${WORD.split('').map((c, i) => `<span class="slot${i < 4 ? ' on' : ''}">${c}</span>`).join('')}<span class="br">]</span></div>
            <b>Ramasse le mot</b>
            <p>7 lettres, aussi dans les blocs { }. Mot complet : GLOW UP, un pouvoir en plus.</p>
          </div>
          <div class="tile">
            <div class="vis foe-vis"><span class="bug">bug</span><span class="e404">404</span><span class="stomp">&darr; saute dessus</span></div>
            <b>Évite les bugs</b>
            <p>Touché : GLOW DOWN. Au glow 1 .0, retour au dernier SAVE.</p>
          </div>
          <div class="tile">
            <div class="vis beat-vis"><i></i><i class="on"></i><i></i><i class="on"></i></div>
            <b>Suis le tempo</b>
            <p>120 BPM. Les plateformes en pointillés n'existent que sur le temps.</p>
          </div>
          <div class="tile">
            <div class="vis boss-vis"><span>[ RUBEN ]</span><span>[ CARL ]</span><span>[ YOW ]</span></div>
            <b>Trois boss, un quiz</b>
            <p>5 questions avant chaque boss : chaque bonne réponse lui retire 1 PV. Carl ne se touche que quand il souffle, YOW saute et lance des canettes.</p>
          </div>
        </div>
        <div class="chips">
          <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> bouger</span>
          <span><kbd>Espace</kbd> sauter</span>
          <span><kbd>&darr;</kbd> plateforme</span>
          <span><kbd>E</kbd> pouvoir</span>
          <span><kbd>P</kbd> pause</span>
          <span><kbd>M</kbd> son</span>
        </div>
        <div class="actions">
          <button class="btn" id="next" type="button">[ suivant ]</button>
          <span class="hint">ou Espace</span>
          <button class="ghost" id="boardBtn" type="button">classement</button>
        </div>
      </div>`;
    titleStep = 1;
    $('next').addEventListener('click', () => { initAudio(); showIdentity(); });
    $('boardBtn').addEventListener('click', () => showBoard(showTitle));
    $('next').focus({ preventScroll: true });
  }
  const HERO_SHORT = { lou: 'LOU', vibcobida: 'VIB', kardo: 'KAR', moko: 'MOK' };
  const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  async function showBoard(back) {
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="card wide">
        <p class="eyebrow">[ classement ]</p>
        <h2>Top 20 au <span class="hl">chrono</span>.</h2>
        <p class="hint">classé par niveau atteint, puis temps le plus court</p>
        <div class="board" id="board"><p class="hint">chargement...</p></div>
        <div class="actions">
          <button class="btn" id="boardBack" type="button">[ retour ]</button>
          <span class="hint">${boardOn() ? 'meilleur run par joueur' : 'classement indisponible'}</span>
        </div>
      </div>`;
    $('boardBack').addEventListener('click', back);
    $('boardBack').focus({ preventScroll: true });
    let rows = [];
    try { rows = window.AntoukaBoard ? await AntoukaBoard.fetchBoard() : []; } catch (e) { if ($('board')) $('board').innerHTML = '<p class="hint">classement indisponible pour le moment</p>'; return; }
    if (!$('board')) return;
    if (!rows.length) { $('board').innerHTML = '<p class="hint">personne encore. finis une partie pour ouvrir le bal.</p>'; return; }
    const me = playerCode();
    const mine = rows.find((r) => r.code === me);
    const top = rows.slice(0, 20);
    const line = (r) => `<tr class="${r.code === me ? 'me' : ''}"><td>${r.rank}</td><td>${esc(r.pseudo)}</td><td>${HERO_SHORT[String(r.hero).toLowerCase()] || esc(r.hero)}</td><td>${r.level_reached} .0${r.level_reached < 4 ? ' <i>*</i>' : ''}</td><td class="time">${mmss(r.duration_s || 0)}</td><td>${pad(r.score)}</td></tr>`;
    $('board').innerHTML = `<table>
      <thead><tr><th>#</th><th>pseudo</th><th>perso</th><th>niveau</th><th>temps</th><th>score</th></tr></thead>
      <tbody>${top.map(line).join('')}${mine && mine.rank > 20 ? `<tr class="gap"><td colspan="6">...</td></tr>${line(mine)}` : ''}</tbody>
    </table><p class="hint">* run arrêté avant Carl</p>`;
  }
  function heroCard(id) {
    return `<button type="button" class="hero${hero === id ? ' on' : ''}" data-hero="${id}">
      <canvas width="72" height="84" aria-hidden="true"></canvas><b>${HEROES[id].name}</b>
    </button>`;
  }
  // Panneau de droite : stats du perso survole (ou selectionne), avec un apercu plus grand.
  function renderSheet(id) {
    const hd = HEROES[id];
    const bars = Object.entries(hd.stats).map(([k, v]) =>
      `<div class="stat"><span>${k}</span><span class="bar">${Array.from({ length: 5 }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('')}</span><span class="val">${v} / 5</span></div>`).join('');
    const el = $('sheet');
    el.innerHTML = `
      <div class="sheet-head">
        <canvas width="96" height="112" aria-hidden="true"></canvas>
        <div><b>${hd.name}</b>${hero === id ? '<em>sélectionné</em>' : '<em class="dim">survol</em>'}</div>
      </div>
      <div class="stats">${bars}</div>
      <div class="pw"><b>E : ${powerLabel(hd)}</b><br>${hd.power.desc}</div>`;
    drawHeroPreview(el.querySelector('canvas'), id);
  }
  function showSelect() {
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="card wide">
        <p class="eyebrow">[ 0 .2 choisis ton perso ]</p>
        <h2>Qui fait le <span class="hl">glow up</span> ?</h2>
        <div class="pick">
          <div class="heroes" role="listbox" aria-label="Personnages">${VISIBLE_HEROES().map(heroCard).join('')}</div>
          <div class="sheet" id="sheet" aria-live="polite"></div>
        </div>
        <div class="actions">
          <button class="btn" id="play" type="button">[ jouer ]</button>
          <span class="hint">ou Espace</span>
          <button class="ghost" id="back" type="button">profil</button>
        </div>
      </div>`;
    titleStep = 3;
    overlay.querySelectorAll('.hero').forEach((btn) => {
      drawHeroPreview(btn.querySelector('canvas'), btn.dataset.hero);
      const show = () => renderSheet(btn.dataset.hero);
      btn.addEventListener('mouseenter', show);
      btn.addEventListener('focus', show);
      btn.addEventListener('click', () => {
        selectHero(btn.dataset.hero);
        initAudio(); sfx.letter(Object.keys(HEROES).indexOf(hero) * 2);
      });
    });
    overlay.querySelector('.heroes').addEventListener('mouseleave', () => renderSheet(hero));
    renderSheet(hero);
    $('play').addEventListener('click', () => { initAudio(); start(); });
    $('back').addEventListener('click', showIdentity);
    $('play').focus({ preventScroll: true });
  }
  // Ecran profil : code joueur, pseudo, retrouver un code. Entre les regles et le choix du perso.
  function showIdentity() {
    overlay.hidden = false;
    const on = boardOn() && Player();
    overlay.innerHTML = `
      <div class="card">
        <p class="eyebrow">[ 0 .1 ton profil ]</p>
        <h2>Ton code,<br><span class="hl">ton pseudo.</span></h2>
        ${on ? identityHTML() : '<p class="hint">classement désactivé sur cette version : pas de code ni de pseudo, tu peux jouer directement.</p>'}
        ${on ? `<ul class="steps ident-help">
          <li><span>code</span>c'est ta clé : note-le pour retrouver ton pseudo et ton classement sur un autre appareil.</li>
          <li><span>pseudo</span>visible dans le classement, ${playerLocked() ? 'figé depuis ta première partie.' : 'modifiable jusqu’à ta première partie.'}</li>
        </ul>` : ''}
        <div class="actions">
          <button class="btn" id="next" type="button">[ continuer ]</button>
          <span class="hint">ou Espace</span>
          <button class="ghost" id="back" type="button">règles</button>
        </div>
      </div>`;
    titleStep = 2;
    bindIdentity();
    $('next').addEventListener('click', () => { initAudio(); showSelect(); });
    $('back').addEventListener('click', showTitle);
    (on && !playerLocked() && !$('pseudo').value ? $('pseudo') : $('next')).focus({ preventScroll: true });
  }
  // Bloc identite : code joueur, pseudo (fige apres la premiere partie), retrouver un code. Vide sans Supabase.
  function identityHTML() {
    if (!boardOn() || !Player()) return '';
    const locked = playerLocked();
    if (isDev()) {
      return `
      <div class="ident big dev-box">
        <div class="ident-row"><span class="ident-lbl">mode dev</span><code class="ident-code">${esc(playerCode())}</code><button class="ghost" id="leaveDev" type="button">quitter le mode dev</button></div>
        <p class="hint">invincible, parties non enregistrées. Raccourcis en jeu : 1 2 3 téléportent devant Ruben, Carl, YOW ; 4 niveau 2, 5 niveau 3 ; G glow max ; H halloween ; K tue le boss ; I invincibilité on/off ; F vol libre (Espace monte, bas descend) ; 6 fait arriver STREEP, et sa carte est disponible sur l'écran perso.</p>
      </div>`;
    }
    return `
      <div class="ident big">
        <div class="ident-row">
          <span class="ident-lbl">ton code</span>
          <code class="ident-code" id="myCode">${esc(playerCode() || 'généré à ta première partie')}</code>
          <button class="ghost" id="claimBtn" type="button">j'ai déjà un code</button>
        </div>
        <div class="ident-row">
          <label class="ident-lbl" for="pseudo">pseudo</label>
          <input class="ident-in" id="pseudo" type="text" maxlength="16" autocomplete="nickname" placeholder="2 à 16 caractères" value="${esc(playerName())}" ${locked ? 'disabled' : ''}>
          <span class="hint">${locked ? 'figé après ta première partie' : 'visible dans le classement'}</span>
        </div>
        <div class="ident-row" id="claimRow" hidden>
          <input class="ident-in" id="claimIn" type="text" maxlength="12" placeholder="ANT-XXXX" autocapitalize="characters" spellcheck="false">
          <button class="ghost" id="claimGo" type="button">retrouver</button>
          <span class="hint" id="claimMsg"></span>
        </div>
      </div>`;
  }
  function bindIdentity() {
    if ($('leaveDev')) { $('leaveDev').addEventListener('click', () => { Player().leaveDev(); devGod = true; devFly = false; showIdentity(); }); return; }
    if (!$('pseudo')) return;
    const pl = Player();
    if (!pl.get().pseudo) pl.setPseudo(pl.defaultPseudo());
    $('pseudo').value = pl.get().pseudo;
    $('pseudo').addEventListener('change', () => { $('pseudo').value = pl.setPseudo($('pseudo').value); });
    $('claimBtn').addEventListener('click', () => { $('claimRow').hidden = false; $('claimIn').focus(); });
    $('claimGo').addEventListener('click', async () => {
      $('claimMsg').textContent = 'recherche...';
      const r = await pl.claim($('claimIn').value);
      if (r) showIdentity(); else $('claimMsg').textContent = 'code inconnu';
    });
  }
  function selectHero(id) {
    hero = id;
    try { localStorage.setItem('antouka-glow-hero', hero); } catch (e) {}
    overlay.querySelectorAll('.hero').forEach((b) => b.classList.toggle('on', b.dataset.hero === hero));
    if ($('sheet')) renderSheet(hero);
  }
  // Ecran titre en trois temps : regles, profil, choix du perso. Espace avance, puis lance la partie.
  function titleAdvance() {
    if (state === 'title' && titleStep === 1) showIdentity();
    else if (state === 'title' && titleStep === 2) showSelect();
    else start();
  }
  function showPause() {
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="card">
        <p class="eyebrow">[ pause ]</p>
        <h2>Glow en veille.</h2>
        <div class="actions">
          <button class="btn" id="resume" type="button">[ reprendre ]</button>
          <span class="hint">ou P</span>
          <button class="ghost" id="quit" type="button">abandonner</button>
        </div>
      </div>`;
    $('resume').addEventListener('click', togglePause);
    $('quit').addEventListener('click', abandon);
    $('resume').focus({ preventScroll: true });
  }
  // Fin de run volontaire : le score est envoye tel quel, l'ecran reprend le chemin de la victoire (Espace = rejouer).
  function abandon() {
    if (state !== 'pause') return;
    state = 'win'; titleStep = 2;
    const secs = Math.floor(time / 60);
    const mmssV = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="card">
        <p class="eyebrow">[ run arrêté ]</p>
        <h2>Niveau <span class="hl">${levelReached()} .0</span> atteint.</h2>
        <dl class="stats">
          <div><dt>score</dt><dd>${pad(score)}</dd></div>
          <div><dt>temps</dt><dd>${mmssV}</dd></div>
          <div><dt>glow off</dt><dd>${deaths}</dd></div>
        </dl>
        <div class="actions">
          <button class="btn" id="again" type="button">[ rejouer ]</button>
          <span class="hint">ou Espace</span>
          <button class="ghost" id="winBoard" type="button">classement</button>
        </div>
        <p class="hint" id="saveHint">${boardOn() ? 'enregistrement de la partie...' : ''}</p>
      </div>`;
    $('again').addEventListener('click', start);
    $('winBoard').addEventListener('click', () => showBoard(abandonBack));
    $('again').focus({ preventScroll: true });
    recordRun().then((r) => { const h = $('saveHint'); if (h) h.textContent = r.dev ? 'mode dev : partie non enregistrée' : r.skipped ? '' : r.rejected ? 'partie refusée par le classement' : r.queued ? 'partie gardée, envoi au prochain lancement' : `partie enregistrée pour ${playerName()}`; refreshMiniBoard(); });
  }
  function abandonBack() { state = 'title'; showTitle(); }
  function showWin() {
    titleStep = 2;
    const secs = Math.floor(time / 60);
    const mmss = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    if (score >= best) { best = score; try { localStorage.setItem('antouka-glow-best', String(best)); } catch (e) {} }
    // Le record qui compte est le chrono d'une partie finie (classement au temps).
    let bestTime = 0; try { bestTime = parseInt(localStorage.getItem('antouka-glow-best-time') || '0', 10) || 0; } catch (e) {}
    const record = !bestTime || secs < bestTime;
    if (record) { try { localStorage.setItem('antouka-glow-best-time', String(secs)); } catch (e) {} }
    overlay.hidden = false;
    overlay.innerHTML = `
      <div class="card">
        <p class="eyebrow">[ 4 .0 deploy ok ]</p>
        <h2>Déployé en <span class="hl">glow ${p.glow} .0</span>.</h2>
        <dl class="stats">
          <div><dt>score</dt><dd>${pad(score)}</dd></div>
          <div><dt>temps</dt><dd>${mmss}</dd></div>
          <div><dt>glow off</dt><dd>${deaths}</dd></div>
          <div><dt>record</dt><dd>${pad(best)}</dd></div>
        </dl>
        <div class="actions">
          <button class="btn" id="again" type="button">[ rejouer ]</button>
          <span class="hint">${record ? 'nouveau record' : 'ou Espace'}</span>
          <button class="ghost" id="winBoard" type="button">classement</button>
        </div>
        <p class="hint" id="saveHint">${boardOn() ? 'enregistrement de la partie...' : ''}</p>
        <div hidden>
        </div>
      </div>`;
    $('again').addEventListener('click', start);
    $('winBoard').addEventListener('click', () => showBoard(showWin));
    $('again').focus({ preventScroll: true });
    recordRun().then((r) => { const h = $('saveHint'); if (h) h.textContent = r.dev ? 'mode dev : partie non enregistrée' : r.skipped ? '' : r.rejected ? 'partie refusée par le classement' : r.queued ? 'partie gardée, envoi au prochain lancement' : `partie enregistrée pour ${playerName()}`; refreshMiniBoard(); });
    updateHUD();
  }
  // Mini classement sticky a gauche de l'ecran de jeu : top 5 + ta ligne, discret, rafraichi au lancement et apres chaque run.
  let miniCache = null;
  async function refreshMiniBoard() {
    const el = $('miniBoard');
    if (!el || !window.AntoukaBoard) return;
    try { miniCache = await AntoukaBoard.fetchBoard(); } catch (e) { if (!miniCache) return; }
    renderMiniBoard();
  }
  function renderMiniBoard() {
    const el = $('miniBoard'), rows = miniCache || [];
    if (!el) return;
    if (!rows.length) { el.hidden = true; return; }
    const me = playerCode();
    const top = rows.slice(0, 5);
    const mine = rows.find((r) => r.code === me);
    const line = (r) => `<li class="${r.code === me ? 'me' : ''}"><span>${r.rank}</span><b>${esc(r.pseudo)}</b><em>${r.level_reached} .0 ${mmss(r.duration_s || 0)}</em></li>`;
    $('miniRows').innerHTML = top.map(line).join('') + (mine && mine.rank > 5 ? `<li class="gap">...</li>${line(mine)}` : '');
    el.hidden = false;
  }
  function start() {
    clearTimeout(winTimer);
    if (Player()) Player().ensure().catch(() => {});
    refreshMiniBoard();
    reset();
    input.jumpBuf = 0; input.jump = false; input.left = false; input.right = false;
    overlay.hidden = true;
    state = 'play';
    canvas.focus && canvas.focus();
  }
  function togglePause() {
    if (state === 'quiz') return;
    if (state === 'play') { state = 'pause'; showPause(); }
    else if (state === 'pause') { state = 'play'; overlay.hidden = true; }
  }

  // ---------- Regles ----------
  function setGlow(n, kind) {
    const [ow, oh] = [p.w, p.h];
    p.glow = n;
    const [w, h] = SIZES[n];
    p.x += (ow - w) / 2; p.y += oh - h; p.w = w; p.h = h;
    // Si la nouvelle tete rentre dans un plafond (glow up sous un bloc), on redescend sous lui.
    const hr = Math.floor(p.y / T), hl = Math.floor(p.x / T), hR = Math.floor((p.x + p.w - 0.01) / T);
    for (let c = hl; c <= hR; c++) if (isSolid(c, hr)) { p.y = (hr + 1) * T; if (p.vy < 0) p.vy = 0; break; }
    p.pads = maxPads(n);
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    if (kind === 'up') {
      score += 1000;
      state = 'freeze'; freezeT = 48; flash = 1; p.inv = 80;
      splash('GLOW UP', `glow ${n} .0 / ${PERKS[n]}`, 'up');
      ring(cx, cy, C.term, 40); ring(cx, cy, C.violet2, 24);
      sfx.up();
    } else if (kind === 'down') {
      p.inv = Math.round(110 * HERO().inv);
      cam.shake = 14;
      splash('GLOW DOWN', `retour en glow ${n} .0`, 'down');
      burst(cx, cy, C.violet2, 18, 4);
      sfx.down();
    }
    updateHUD();
  }

  function collect(l, fromBlock) {
    l.taken = true;
    score += 100;
    const cx = l.x * T + 16, cy = l.y * T + 16 - (fromBlock ? 34 : 0);
    burst(cx, cy, C.violet3, 14, 3);
    popText(cx, cy - 14, l.ch, C.term, true);
    sfx.letter(l.idx);
    word[l.idx] = true;
    if (word.every(Boolean)) {
      word.fill(false);
      wordFlashT = 50;
      if (p.glow < 3) setGlow(p.glow + 1, 'up');
      else {
        score += 5000;
        splash('GLOW MAX', '+5000 / déjà au sommet', 'up');
        ring(p.x + p.w / 2, p.y + p.h / 2, C.term, 40);
        sfx.up();
      }
    }
    updateHUD();
  }

  function hurt(sx) {
    if (p.inv > 0 || state !== 'play') return;
    if (p.glow > 1) {
      setGlow(p.glow - 1, 'down');
      const away = sx === undefined ? -p.face : (p.x + p.w / 2 < sx ? -1 : 1);
      p.vy = -6; p.vx = away * 3 * HERO().kb; p.jumping = false;
    } else die();
  }

  function die() {
    deaths++;
    state = 'dead'; deadT = 80;
    p.vy = -9; p.vx = 0;
    cam.shake = 16;
    splash('GLOW OFF', 'retour au dernier save', 'off');
    sfx.off();
  }

  function respawn() {
    const cp = [...cps].reverse().find((c) => c.on) || cps[0];
    p.x = cp.x * T + 4; p.y = 13 * T - p.h; p.vx = 0; p.vy = 0; p.inv = 100; p.lock = 24; p.powT = 0; shields = [];
    p.slowT = 0; p.slowK = 1; waves = []; cans = []; puddles = [];
    for (const b of bosses) if (b.active && !b.dead) resetBoss(b);
  }

  // ---------- Boss : Ruben (crache des antouka) et Carl (fonce, souffle, crache SQE / LELE) ----------
  const BOSS_DEFS = {
    ruben: { name: 'RUBEN', w: 80, h: 100, hp: 5, barrier: 199, min: 204 * T, max: 218 * T - 80, end: 224, intro: 'il crache des antouka / saute-lui sur la tête', words: ['antouka'] },
    yow: { name: 'YOW', w: 70, h: 104, hp: 4, barrier: 401, min: 404 * T, max: 424 * T - 70, end: 428, intro: 'il bondit, saute par-dessus l’onde / frappe-le au frigo', words: [] },
    carl: { name: 'CARL', w: 56, h: 104, hp: 5, barrier: 331, min: 334 * T, max: 354 * T - 56, end: 358, intro: 'trop rapide pour être touché / frappe-le quand il souffle', words: ['SQE', 'LELE'] },
  };
  function makeBoss(type, col) {
    const d = BOSS_DEFS[type];
    return { type, name: d.name, barrier: d.barrier, xmin: d.min, xmax: d.max, end: d.end, x0: col * T, x: col * T, y: 13 * T - d.h, w: d.w, h: d.h, hp: d.hp, max: d.hp,
      active: false, dead: false, deadT: 0, dir: -1, face: -1, t: 0, spitT: 100, mouth: 0, inv: 0, mode: 'rest', modeT: 70, spitN: 0, quizDone: false, quizScore: 0,
      vx: 0, vy: 0, ground: true, cansCd: 120, fridgeT: 0, target: 0, sy: 1, wave2: 0 };
  }
  // Les phases d'agressivite restent sur 3 crans quel que soit le nombre de PV laisse par le quiz.
  const bossPhase = (b) => Math.min(2, Math.max(0, b.max - b.hp));
  function setBarrier(b, on) { for (let y = 0; y < 13; y++) grid[y][b.barrier] = on ? 6 : 0; }
  function updateBossBar() {
    const b = bosses.find((x) => x.active && !x.dead);
    $('bossbar').hidden = !b;
    if (b) {
      $('bossName').textContent = '[ ' + b.name.toLowerCase() + ' ]';
      $('bossHp').innerHTML = Array.from({ length: b.max }, (_, i) => `<i class="${i < b.hp ? 'on' : ''}"></i>`).join('');
    }
  }
  // Quiz coupe jusqu'a ANTOUKA_CONFIG.quizOffUntil : compte a rebours en haut a gauche du HUD.
  const quizOffUntil = () => Date.parse((window.ANTOUKA_CONFIG && window.ANTOUKA_CONFIG.quizOffUntil) || '') || 0;
  const quizOff = () => Date.now() < quizOffUntil();
  function tickQuizOff() {
    const el = $('quizOff');
    if (!el) return;
    const left = quizOffUntil() - Date.now();
    if (left <= 0) { el.hidden = true; return; }
    const s = Math.floor(left / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    el.textContent = `quiz de retour dans ${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    el.hidden = false;
  }
  tickQuizOff(); setInterval(tickQuizOff, 1000);
  // 5 questions avant le boss : chaque bonne reponse lui retire 1 PV, minimum 1.
  function startQuiz(b) {
    b.quizDone = true;
    state = 'quiz';
    input.left = input.right = input.jump = input.pad = input.power = false;
    p.vx = 0;
    setBarrier(b, true);
    AntoukaQuiz.start({
      overlay, bossName: b.name, theme: BOSS_DEFS[b.type].theme, count: 5, maxHp: b.max,
      sfx: { good: () => sfx.letter(4), bad: () => sfx.down() },
      onDone: (n) => {
        b.quizScore = n; b.hp = Math.max(1, b.max - n);
        overlay.hidden = true;
        state = 'play';
        activateBoss(b);
      },
    });
  }
  function activateBoss(b) {
    b.active = true; b.spitT = 100; b.mode = 'rest'; b.modeT = 70;
    setBarrier(b, true);
    cam.shake = 8;
    splash(b.name, BOSS_DEFS[b.type].intro, 'boss');
    sfx.alarm();
    updateBossBar();
  }
  function resetBoss(b) {
    // Le quiz n'est pas rejoue apres une mort : on repart avec les PV qu'il avait laisses.
    Object.assign(b, { x: b.x0, y: 13 * T - b.h, hp: Math.max(1, b.max - b.quizScore), active: false, dead: false, deadT: 0, dir: -1, t: 0, spitT: 100, mouth: 0, inv: 0, mode: 'rest', modeT: 70, vx: 0, vy: 0, ground: true, cansCd: 120, fridgeT: 0, sy: 1, wave2: 0 });
    words = []; waves = []; cans = []; puddles = [];
    setBarrier(b, false);
    updateBossBar();
  }
  function pushWord(b, txt, x, y, vx, vy, g) {
    ctx.font = `700 18px ${F_DISPLAY}`;
    const ww = Math.ceil(ctx.measureText(txt).width) + 8;
    const wd = { b, txt, x: x - ww / 2, y, w: ww, h: 20, vx, vy, g, t: 0, dead: false, bounces: 0, wave: 0, y0: y };
    words.push(wd);
    return wd;
  }
  function spit(b) {
    const phase = bossPhase(b);
    const mx = b.x + b.w / 2 + b.face * 30, my = b.y + (b.type === 'carl' ? 46 : 58);
    if (b.type === 'carl') {
      // Carl alterne trois trajectoires : tir vise sur le joueur, LELE qui rebondit au sol, SQE en vague.
      const n = b.spitN++, txt = BOSS_DEFS.carl.words[n % 2], sp = 5.5 + phase * 0.8;
      const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
      const dir = b.mode === 'dash' ? b.face : (pcx < mx ? -1 : 1);
      const pat = n % 3;
      if (pat === 0) {
        const t = Math.max(12, Math.abs(pcx - mx) / sp);
        pushWord(b, txt, mx, my - 10, dir * sp, Math.max(-4, Math.min(6, (pcy - my) / t)), 0);
      } else if (pat === 1) {
        const wd = pushWord(b, txt, mx, my - 10, dir * (sp - 1), 2, 0.3);
        wd.bounces = 2 + phase;
      } else {
        const wd = pushWord(b, txt, mx, my - 10, dir * (sp - 0.5), 0, 0);
        wd.wave = 42; wd.y0 = wd.y;
      }
      b.mouth = 14;
      sfx.spit();
      return;
    }
    const pcx = p.x + p.w / 2, pcy = p.y + p.h / 2;
    const sp = 3.2 + phase * 0.5;
    const dir = pcx < mx ? -1 : 1;
    const t = Math.max(20, Math.abs(pcx - mx) / sp);
    const shots = [{ vx: dir * sp, vy: Math.max(-3, Math.min(3, (pcy - my) / t)), g: 0 }];
    if (phase >= 1) shots.push({ vx: dir * (sp - 0.8), vy: -6.5, g: 0.16 });
    if (phase >= 2) shots.push({ vx: dir * (sp + 0.6), vy: 0, g: 0, ground: true });
    for (const s of shots) pushWord(b, 'antouka', mx, s.ground ? 13 * T - 20 : my - 10, s.vx, s.vy, s.g);
    b.mouth = 26;
    sfx.spit();
  }
  const isDashing = () => HERO().power.key === 'dash' && p.powT > 0;
  // Les weeeeesssshh de MOKO ecrasent ennemis et mots qui touchent leur orbite.
  function updateShields() {
    if (!shields.length) return;
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    for (const s of shields) {
      s.a += 0.08;
      s.x = cx + Math.cos(s.a) * WEESH_R; s.y = cy + Math.sin(s.a) * WEESH_R * 0.7;
      const box = { x: s.x - 28, y: s.y - 6, w: 56, h: 12 };
      for (const e of enemies) {
        if (!e.alive || !overlap(box, e)) continue;
        e.alive = false; e.squash = 30; score += 200;
        popText(e.x + e.w / 2, e.y - 6, 'WEESH +200', C.jersey2, false);
        burst(e.x + e.w / 2, e.y + e.h / 2, C.jersey2, 10, 2.5);
        sfx.stomp();
      }
      for (const w of words) {
        if (w.dead || !overlap(box, w)) continue;
        w.dead = true; score += 50;
        popText(w.x + w.w / 2, w.y - 6, '+50', C.paper, false);
      }
      for (const c of cans) {
        if (c.dead || !overlap(box, c)) continue;
        c.dead = true; score += 50;
        popText(c.x + c.w / 2, c.y - 6, '+50', C.paper, false);
      }
    }
  }
  // Une gorgee par ecrasement pour VIBCOBIDA ; le verre plein se boit avec E.
  function sip() {
    if (HERO().power.key !== 'potion' || p.sips >= SIPS) return;
    p.sips++;
    if (p.sips >= SIPS) { popText(p.x + p.w / 2, p.y - 14, 'VERRE PLEIN, E', C.term, false); sfx.save(); }
    updateHUD();
  }
  function hitBoss(b) {
    b.hp--; b.inv = 60; cam.shake = 10; sip();
    score += 1000;
    popText(b.x + b.w / 2, b.y - 30, 'BUG FIX', C.term, true);
    burst(b.x + b.w / 2, b.y, C.violet2, 20, 4);
    sfx.bossHit();
    if (b.hp <= 0) {
      b.dead = true; b.deadT = 80;
      for (const w of words) burst(w.x + w.w / 2, w.y + w.h / 2, C.violet3, 8, 2);
      words = [];
      setBarrier(b, false);
      score += 5000;
      flash = 1;
      const last = bosses.every((x) => x.dead);
      splash(b.name + ' DEBUGGÉ', last ? '+5000 / la porte deploy est ouverte' : '+5000 / niveau 2 droit devant', 'up');
      WORD.split('').forEach((c, i) => {
        const a = (i / 7) * Math.PI * 2;
        particles.push({ x: b.x + b.w / 2, y: b.y + 40, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3 - 1, life: 70, max: 70, c: C.term, txt: c, big: true, g: 0 });
      });
      sfx.win();
    }
    updateBossBar(); updateHUD();
  }
  function updateBoss(b) {
    if (!b.active) {
      if (state === 'play' && !b.dead && p.x > (b.barrier + 1) * T) {
        if (!b.quizDone && window.AntoukaQuiz && !quizOff()) startQuiz(b);
        else { b.quizDone = true; activateBoss(b); }
      }
      return;
    }
    if (b.dead) {
      if (b.deadT > 0) {
        b.deadT--;
        if (b.deadT % 5 === 0) burst(b.x + Math.random() * b.w, b.y + Math.random() * b.h, Math.random() < 0.5 ? C.violet2 : C.term, 8, 3);
        if (b.deadT === 0 && p.glow < 3 && state === 'play') setGlow(p.glow + 1, 'up');
      }
      return;
    }
    b.t++;
    if (b.inv > 0) b.inv--;
    const phase = bossPhase(b);
    if (b.mouth > 0) b.mouth--;
    if (b.type === 'yow') { updateYow(b, phase); return; }
    if (b.type === 'carl') {
      if (b.mode === 'rest') {
        b.face = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;
        if (--b.modeT <= 0) { b.mode = 'dash'; b.modeT = [150, 180, 210][phase]; b.dir = b.face; b.spitT = 10; }
      } else {
        const sp = [5, 6.2, 7.4][phase];
        b.x += b.dir * sp;
        if (b.x < b.xmin) { b.x = b.xmin; b.dir = 1; }
        if (b.x > b.xmax) { b.x = b.xmax; b.dir = -1; }
        b.face = b.dir;
        if (b.t % 3 === 0) particles.push({ x: b.x + b.w / 2 - b.dir * 20, y: b.y + 30 + Math.random() * 60, vx: -b.dir * 2, vy: 0, life: 14, max: 14, c: C.violet3, s: 3, g: 0 });
        if (--b.spitT <= 0) { spit(b); b.spitT = [26, 20, 15][phase]; }
        if (--b.modeT <= 0) {
          b.mode = 'rest'; b.modeT = [110, 85, 65][phase]; popText(b.x + b.w / 2, b.y - 30, 'ouf...', C.violet3, false);
          // Salve basse en s'arretant : deux mots au ras du sol de chaque cote, pour qu'on ne campe pas a ses pieds.
          for (const d of [-1, 1]) pushWord(b, 'SQE', b.x + b.w / 2 + d * 40, 13 * T - 22, d * (3 + phase * 0.6), 0, 0);
          sfx.spit();
        }
      }
      if (state === 'play' && overlap(p, b)) {
        const stomp = p.vy > 0 && p.y + p.h - p.vy <= b.y + 16;
        if (stomp && b.mode === 'rest') {
          p.vy = -11; p.y = b.y - p.h; p.jumping = false;
          if (b.inv === 0) hitBoss(b);
        } else {
          if (stomp && b.inv === 0) popText(b.x + b.w / 2, b.y - 30, 'TROP RAPIDE', C.paper, false);
          hurt(b.x + b.w / 2);
        }
      }
      return;
    }
    b.face = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;
    if (b.mouth <= 0) {
      b.x += b.dir * [1.1, 1.6, 2.2][phase];
      if (b.x < b.xmin) { b.x = b.xmin; b.dir = 1; }
      if (b.x > b.xmax) { b.x = b.xmax; b.dir = -1; }
    }
    if (--b.spitT <= 0 && tick % BEAT === 0) { spit(b); b.spitT = [120, 90, 60][phase]; }
    if (state === 'play' && overlap(p, b)) {
      if (p.vy > 0 && p.y + p.h - p.vy <= b.y + 16) {
        p.vy = -11; p.y = b.y - p.h; p.jumping = false;
        if (b.inv === 0) hitBoss(b);
      } else hurt(b.x + b.w / 2);
    }
  }
  // ---------- YOW : bondit, onde de choc a l'atterrissage, se sert au frigo et lance des canettes ----------
  const GROUND_Y = 13 * T;
  function updateYow(b, phase) {
    if (b.mode === 'rest') { b.mode = 'idle'; b.modeT = 30; }
    const pcx = p.x + p.w / 2;
    b.sy += (1 - b.sy) * 0.2;
    if (b.cansCd > 0) b.cansCd--;
    if (b.mode === 'idle') {
      b.face = pcx < b.x + b.w / 2 ? -1 : 1;
      if (--b.modeT <= 0) {
        // Cible : le frigo si la recharge est prete, sinon le cote du joueur.
        const toFridge = b.cansCd <= 0;
        b.target = toFridge ? FRIDGE.x + FRIDGE.w + 6 : Math.max(b.xmin, Math.min(b.xmax, pcx - b.w / 2 + (pcx < b.x ? -40 : 40)));
        b.mode = toFridge ? 'jumpFridge' : 'jump';
        const dist = b.target - b.x, air = 2 * 14 / 0.55;
        b.vx = Math.max(-[5, 6, 7][phase], Math.min([5, 6, 7][phase], dist / air));
        b.vy = -14; b.ground = false; b.sy = 1.25;
        b.face = b.vx < 0 ? -1 : 1;
        sfx.jump();
      }
    } else if (b.mode === 'jump' || b.mode === 'jumpFridge') {
      b.vy = Math.min(b.vy + 0.55, 14);
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.xmin) { b.x = b.xmin; b.vx = Math.abs(b.vx); }
      if (b.x > b.xmax) { b.x = b.xmax; b.vx = -Math.abs(b.vx); }
      if (b.y >= GROUND_Y - b.h) {
        b.y = GROUND_Y - b.h; b.ground = true; b.sy = 0.72;
        cam.shake = 6;
        const cx = b.x + b.w / 2;
        for (const d of [-1, 1]) waves.push({ x: cx, dir: d, b, life: 170, t: 0 });
        b.wave2 = phase >= 1 ? 20 : 0;
        burst(cx, GROUND_Y, C.mute, 12, 3);
        sfx.wave();
        if (b.mode === 'jumpFridge') { b.mode = 'fridge'; b.fridgeT = 60; b.face = -1; sfx.fridge(); }
        else { b.mode = 'land'; b.modeT = 36; }
      }
    } else if (b.mode === 'land') {
      if (b.wave2 > 0 && --b.wave2 === 0) { const cx = b.x + b.w / 2; for (const d of [-1, 1]) waves.push({ x: cx, dir: d, b, life: 170, t: 0 }); sfx.wave(); }
      if (--b.modeT <= 0) { b.mode = 'idle'; b.modeT = [24, 16, 10][phase]; }
    } else if (b.mode === 'fridge') {
      if (b.wave2 > 0 && --b.wave2 === 0) { const cx = b.x + b.w / 2; for (const d of [-1, 1]) waves.push({ x: cx, dir: d, b, life: 170, t: 0 }); sfx.wave(); }
      if (--b.fridgeT <= 0) {
        const n = 2 + (phase >= 2 ? 1 : 0);
        for (let i = 0; i < n; i++) {
          const sx = b.x + b.w / 2, sy = b.y + 40;
          const flight = 46 + i * 8, dx = pcx - sx + (i - (n - 1) / 2) * 50;
          cans.push({ x: sx - 6, y: sy, w: 12, h: 18, vx: dx / flight, vy: -9 - i, g: 0.4, bounces: 1, t: 0, life: 300, dead: false });
        }
        b.cansCd = [240, 180, 140][phase];
        b.mode = 'idle'; b.modeT = [24, 16, 10][phase];
        sfx.can();
      }
    }
    if (state === 'play' && overlap(p, b)) {
      if (p.vy > 0 && p.y + p.h - p.vy <= b.y + 18) {
        p.vy = -11; p.y = b.y - p.h; p.jumping = false;
        if (b.inv === 0) hitBoss(b);
      } else hurt(b.x + b.w / 2);
    }
  }
  function applySlow(t, k) {
    const was = p.slowT > 0;
    p.slowT = Math.max(p.slowT, t); p.slowK = Math.min(p.slowK, k);
    if (!was) updateHUD();
  }
  function updateWaves() {
    for (const w of waves) {
      w.t++; w.x += w.dir * 4; w.life--;
      if (w.x < w.b.xmin - 10 || w.x > w.b.xmax + w.b.w + 10 || w.life <= 0) w.dead = true;
      if (w.t % 3 === 0) particles.push({ x: w.x, y: GROUND_Y - 2, vx: w.dir * 0.5, vy: -1 - Math.random(), life: 14, max: 14, c: C.mute, s: 2, g: 0.05 });
      if (!w.dead && state === 'play' && p.inv === 0 && overlap(p, { x: w.x - 7, y: GROUND_Y - 14, w: 14, h: 14 })) {
        w.dead = true;
        hurt(w.x);
        applySlow(120, 0.2);
        popText(p.x + p.w / 2, p.y - 14, 'RALENTI', C.violet3, false);
      }
    }
    waves = waves.filter((w) => !w.dead);
  }
  function updateCans() {
    for (const c of cans) {
      c.t++; c.x += c.vx; c.y += c.vy; c.vy += c.g; c.life--;
      if (c.y + c.h >= GROUND_Y) {
        if (c.bounces > 0) { c.bounces--; c.y = GROUND_Y - c.h; c.vy *= -0.5; c.vx *= 0.7; }
        else { c.dead = true; puddles.push({ x: c.x + c.w / 2 - 22, w: 44, life: 60 }); burst(c.x + c.w / 2, GROUND_Y, HW.moon, 8, 2); sfx.can(); }
      }
      if (c.life <= 0) c.dead = true;
      if (!c.dead && state === 'play' && overlap(p, c)) {
        if ((p.vy > 0 && p.y + p.h - p.vy <= c.y + 6) || isDashing()) {
          if (!isDashing()) { p.vy = -8; p.jumping = false; }
          score += 50; sip(); popText(c.x + 6, c.y - 6, '+50', C.paper, false); sfx.stomp();
        } else hurt(c.x + c.w / 2);
        c.dead = true;
      }
    }
    cans = cans.filter((c) => !c.dead);
  }
  function updatePuddles() {
    for (const pd of puddles) {
      pd.life--;
      if (state === 'play' && p.ground && p.x + p.w > pd.x && p.x < pd.x + pd.w) applySlow(2, 0.5);
    }
    puddles = puddles.filter((pd) => pd.life > 0);
  }

  function updateWords() {
    for (const w of words) {
      w.t++; w.x += w.vx; w.y += w.vy; w.vy += w.g;
      if (w.wave) w.y = w.y0 + Math.sin(w.t * 0.14) * w.wave;
      if (!w.g && w.y + w.h > 13 * T + 2) w.dead = true;
      if (w.g > 0 && w.y + w.h >= 13 * T) {
        // LELE rebondit au sol tant qu'il lui reste des rebonds.
        if (w.bounces > 0) { w.bounces--; w.y = 13 * T - w.h; w.vy = -7.5; burst(w.x + w.w / 2, w.y + w.h, C.violet3, 5, 2); }
        else w.dead = true;
      }
      if (w.x + w.w < w.b.barrier * T || w.x > w.b.end * T || w.t > 400) w.dead = true;
      if (!w.dead && state === 'play' && overlap(p, w)) {
        if ((p.vy > 0 && p.y + p.h - p.vy <= w.y + 8) || isDashing()) {
          if (!isDashing()) { p.vy = -8; p.jumping = false; }
          score += 50; sip();
          popText(w.x + w.w / 2, w.y - 6, '+50', C.paper, false);
          sfx.stomp();
        } else hurt(w.x + w.w / 2);
        w.dead = true;
      }
      if (w.dead) burst(w.x + w.w / 2, w.y + w.h / 2, C.violet3, 8, 2);
    }
    words = words.filter((w) => !w.dead);
  }

  // ---------- Particules ----------
  function burst(x, y, c, n, sp) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random());
      particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 40, max: 40, c, s: 2 + Math.random() * 3, g: 0.12 });
    }
  }
  function ring(x, y, c, n) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      particles.push({ x, y, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, life: 46, max: 46, c, s: 3, g: 0 });
    }
  }
  function popText(x, y, txt, c, big) {
    particles.push({ x, y, vx: 0, vy: -1.1, life: 50, max: 50, c, txt, big, g: 0 });
  }

  // ---------- Boucle ----------
  function updatePlayer() {
    const hd = HERO();
    if (isDev() && devFly) {
      // Vol libre : pas de gravite, fleches pour se deplacer, saut = monter, bas = descendre.
      const s = 6;
      p.vx = (input.right ? s : 0) - (input.left ? s : 0);
      p.vy = (input.pad ? s : 0) - (input.jump ? s : 0);
      if (p.vx) p.face = p.vx < 0 ? -1 : 1;
      p.jumping = false; input.jumpBuf = 0; input.padBuf = 0;
      moveX(p, p.vx); moveY(p, p.vy);
      if (p.y < 0) p.y = 0;
      p.ground = false; p.sy += (1 - p.sy) * 0.2;
      if (tick % 4 === 0) particles.push({ x: p.x + p.w / 2, y: p.y + p.h, vx: 0, vy: 1, life: 14, max: 14, c: C.term, s: 2, g: 0 });
      return;
    }
    const maxS = (p.glow === 3 ? 4.7 : 4.2) * hd.speed * p.slowK;
    const acc = p.ground ? 0.65 : 0.45;
    const left = input.left && p.lock <= 0, right = input.right && p.lock <= 0;

    // Pouvoir E. LOU : dash. VIBCOBIDA : boire le verre plein. KARDO : en visio (invisible). MOKO : weeeeesssshh en orbite.
    const pk = hd.power.key, pw = POW[pk];
    if (p.powCd > 0) { p.powCd--; if (p.powCd === 0 || p.powCd % 10 === 0) updateHUD(); }
    if (p.powT > 0 && pk !== 'dash') { p.powT--; if (p.powT === 0) { shields = []; updateHUD(); } }
    if (input.powerBuf > 0) {
      if (pw && p.powCd <= 0 && p.powT <= 0) {
        input.powerBuf = 0;
        p.powT = pw.t; p.powCd = pw.cd;
        if (pk === 'dash') {
          p.vy = 0; p.inv = Math.max(p.inv, pw.t + 2); p.jumping = false;
          ring(p.x + p.w / 2, p.y + p.h / 2, C.term, 12);
          sfx.dash();
        } else if (pk === 'visio') {
          p.inv = Math.max(p.inv, pw.t);
          popText(p.x + p.w / 2, p.y - 14, 'EN VISIO', C.violet3, true);
          sfx.visio();
        } else if (pk === 'gamer') {
          // Il s'assoit et joue : intouchable, immobile, pas de saut.
          p.inv = Math.max(p.inv, pw.t); p.lock = pw.t; p.vx = 0; p.jumping = false;
          sfx.gamer();
        } else if (pk === 'weesh') {
          p.inv = Math.max(p.inv, pw.t);
          shields = Array.from({ length: WEESH_N }, (_, i) => ({ a: (i / WEESH_N) * Math.PI * 2 }));
          ring(p.x + p.w / 2, p.y + p.h / 2, C.jersey2, 16);
          sfx.weesh();
        }
        updateHUD();
      } else if (pk === 'potion' && p.sips >= SIPS) {
        input.powerBuf = 0;
        p.sips = 0;
        if (p.glow < 3) { setGlow(p.glow + 1, 'up'); splash('SANTÉ', `glow ${p.glow} .0 / le verre est vide`, 'up'); }
        else { score += 500; popText(p.x + p.w / 2, p.y - 14, '+500 SANTÉ', C.term, true); ring(p.x + p.w / 2, p.y + p.h / 2, C.term, 20); }
        p.inv = Math.max(p.inv, 90);
        sfx.drink(); updateHUD();
      }
    }

    const dashing = pk === 'dash' && p.powT > 0;
    if (dashing) {
      p.powT--;
      p.vx = p.face * 7;
      if (tick % 2 === 0) particles.push({ x: p.x + p.w / 2 - p.face * 10, y: p.y + Math.random() * p.h, vx: -p.face * 2, vy: 0, life: 16, max: 16, c: C.term, s: 4, g: 0 });
    } else if (left && !right) { p.vx = Math.max(p.vx - acc, -maxS); p.face = -1; }
    else if (right && !left) { p.vx = Math.min(p.vx + acc, maxS); p.face = 1; }
    else { p.vx *= p.ground ? 0.72 : 0.94; if (Math.abs(p.vx) < 0.1) p.vx = 0; }

    if (p.ground) {
      p.coyote = 7; p.jumpsLeft = p.glow === 3 ? 1 : 0; p.jumping = false;
      // Les charges de plateforme ne reviennent que sur du vrai sol, pas sur une plateforme posee.
      if (!p.onPad && p.pads !== maxPads(p.glow)) { p.pads = maxPads(p.glow); updateHUD(); }
    } else p.coyote--;
    if (pk === 'gamer' && p.powT > 0) { input.jumpBuf = 0; input.padBuf = 0; }
    if (input.jumpBuf > 0) {
      if (p.coyote > 0) {
        p.vy = (p.glow >= 2 ? -13 : -11.5) * hd.jump * (p.slowK < 1 ? 0.85 : 1); p.coyote = 0; input.jumpBuf = 0; p.sy = 1.22; p.jumping = true; sfx.jump();
      } else if (p.jumpsLeft > 0) {
        p.jumpsLeft--; p.vy = -10 * hd.jump; input.jumpBuf = 0; p.sy = 1.2; p.jumping = true; sfx.dbl();
        ring(p.x + p.w / 2, p.y + p.h, C.term, 12);
      }
    }
    // Saut variable : le cut ne s'applique qu'aux sauts du joueur, pas aux rebonds ni aux reculs.
    if (!input.jump && p.jumping && p.vy < -4) p.vy = -4;
    p.vy = dashing ? 0 : Math.min(p.vy + 0.55, 12);

    // Plateforme { } posee sous les pieds, en l'air seulement (inspire d'Octahedron).
    if (input.padBuf > 0 && !p.ground && p.pads > 0) {
      input.padBuf = 0; p.pads--;
      const pd = { x: Math.round(p.x + p.w / 2 - 32), y: Math.round(p.y + p.h) + 1, w: 64, h: 6, life: 75, max: 75 };
      pads.push(pd);
      p.y = pd.y - p.h; p.vy = 0; p.sy = 0.85; p.ground = true; p.onPad = true; p.jumping = false; p.coyote = 7;
      ring(pd.x + 32, pd.y, C.term, 10);
      sfx.pad(); updateHUD();
    }

    const wasGround = p.ground;
    const prevBot = p.y + p.h;
    if (moveX(p, p.vx)) p.vx = 0;
    p.onPad = false;
    moveY(p, p.vy, (c, r) => {
      if (r >= 0 && grid[r][c] === 3) {
        grid[r][c] = 4;
        bumps[c + ',' + r] = 10;
        sfx.block();
        const l = blockLetters[c + ',' + r];
        if (l && !l.taken) collect(l, true);
      }
    });
    if (p.vy >= 0) {
      for (const pd of pads) {
        if (p.x + p.w > pd.x && p.x < pd.x + pd.w && prevBot <= pd.y + 1 && p.y + p.h >= pd.y) { p.y = pd.y - p.h; p.vy = 0; p.ground = true; p.onPad = true; }
      }
    }
    // Plateforme rythmee qui reapparait dans le corps : on remonte dessus.
    if (beatOn) {
      const l = Math.floor(p.x / T), r = Math.floor((p.x + p.w - 0.01) / T), top = Math.floor(p.y / T), bot = Math.floor((p.y + p.h - 0.01) / T);
      outer: for (let row = bot; row >= top; row--) for (let c = l; c <= r; c++) if (row >= 0 && row < ROWS && grid[row][c] === 7) { p.y = row * T - p.h; p.vy = 0; p.ground = true; break outer; }
    }
    if (p.y < 0) { p.y = 0; if (p.vy < 0) p.vy = 0; }
    if (!wasGround && p.ground) p.sy = 0.78;
    p.run += Math.abs(p.vx) * 0.09;
    p.sy += (1 - p.sy) * 0.2;
  }

  function updateEnemies() {
    // Capture avant la boucle : un premier ecrasement inverse p.vy et ne doit pas faire blesser par le second ennemi.
    const falling = p.vy > 0, feetPrev = p.y + p.h - p.vy;
    for (const e of enemies) {
      if (!e.alive) { if (e.squash > 0) e.squash--; continue; }
      if (e.type === 'bug') {
        if (!e.active) { if (e.x < cam.x + viewW + 80) e.active = true; else continue; }
        e.vy = Math.min(e.vy + 0.55, 12);
        if (moveX(e, e.dir * 1.1)) e.dir *= -1;
        moveY(e, e.vy);
        if (e.ground) {
          const fx = e.dir > 0 ? e.x + e.w + 1 : e.x - 1;
          if (!isSolid(Math.floor(fx / T), Math.floor((e.y + e.h + 2) / T))) e.dir *= -1;
        }
        if (e.y > H + 60) e.alive = false;
      } else {
        e.t++;
        const nx = e.x0 + Math.sin(e.t * 0.018) * e.range;
        e.dir = nx >= e.x ? 1 : -1;
        e.x = nx;
        e.y = e.y0 + Math.sin(e.t * 0.05) * 18;
      }
      if (state === 'play' && overlap(p, { x: e.x + 4, y: e.y + 4, w: e.w - 8, h: e.h - 4 })) {
        if ((falling && feetPrev <= e.y + 10) || isDashing()) {
          const dashed = isDashing();
          e.alive = false; e.squash = 30;
          if (!dashed) { p.vy = input.jump ? -11 : -7.5; p.jumping = input.jump; }
          score += 200; sip();
          popText(e.x + e.w / 2, e.y - 6, '+200', C.paper, false);
          burst(e.x + e.w / 2, e.y + e.h / 2, C.mute, 10, 2.5);
          sfx.stomp();
          updateHUD();
        } else hurt(e.x + e.w / 2);
      }
    }
  }

  function updatePlay() {
    time++;
    // Skin Halloween desactive en jeu (Antho : "pas fou"). Reste accessible en mode dev avec H.
    if (!streeped && hero !== 'streep' && time >= 15 * 60 * 60) streepArrive();
    updatePlayer();
    if (p.inv > 0) p.inv--;
    if (p.lock > 0) p.lock--;

    if (!lvl2 && p.x > 224 * T) {
      lvl2 = true;
      splash('NIVEAU 2', 'plus dur, plus vite, moins de save', 'boss');
      sfx.alarm();
    }
    if (!lvl3 && p.x > 358 * T) {
      lvl3 = true;
      splash('NIVEAU 3', 'dernier sprint, hotfix en prod', 'boss');
      sfx.alarm();
    }
    if (p.slowT > 0 && --p.slowT === 0) { p.slowK = 1; updateHUD(); }
    for (const c of cps) {
      if (!c.on && p.x > c.x * T) {
        c.on = true; sfx.save();
        popText(c.x * T + 30, 9 * T, 'SAVED', C.term, false);
      }
    }
    for (const l of letters) {
      if (l.taken || l.block) continue;
      const bob = Math.sin(tick * 0.06 + l.id) * 4;
      if (overlap(p, { x: l.x * T + 2, y: l.y * T - 6 + bob, w: 28, h: 40 })) collect(l, false);
    }
    for (const sx of spikes) {
      if (p.inv === 0 && overlap(p, { x: sx * T + 8, y: 12 * T + 20, w: T - 16, h: 12 })) { hurt(); if (state === 'play') { p.vy = -8; p.jumping = false; } }
    }
    updateEnemies();
    for (const b of bosses) updateBoss(b);
    updateWords();
    updateWaves(); updateCans(); updatePuddles();
    updateShields();

    if (state === 'play' && bosses.every((b) => b.dead) && overlap(p, { x: FINISH.x + 12, y: FINISH.y + 8, w: FINISH.w - 24, h: FINISH.h - 8 })) {
      state = 'deploy';
      score += p.glow * 1000;
      ring(FINISH.x + FINISH.w / 2, FINISH.y + FINISH.h / 2, C.term, 48);
      splash('DEPLOY', `bonus glow ${p.glow} .0 / +${p.glow * 1000}`, 'up');
      sfx.win();
      winTimer = setTimeout(() => { state = 'win'; showWin(); }, 1200);
    }

    if (state === 'play' && p.y > H + 60) {
      if (isDev() && devGod) respawn();
      else if (p.glow > 1) { setGlow(p.glow - 1, 'down'); respawn(); }
      else { die(); p.y = H + 40; }
    }
    if (isDev() && devGod) { p.inv = Math.max(p.inv, 2); if (p.slowT > 0) { p.slowT = 0; p.slowK = 1; updateHUD(); } }

    if (p.glow === 3 && tick % 2 === 0 && (Math.abs(p.vx) > 0.5 || !p.ground)) {
      particles.push({ x: p.x + p.w / 2, y: p.y + p.h * 0.6, vx: -p.vx * 0.2, vy: 0, life: 22, max: 22, c: C.term, s: 3, g: 0 });
    }
  }

  function step() {
    tick++;
    beatOn = Math.floor(tick / (BEAT * 2)) % 2 === 0;
    beatP = Math.pow(1 - (tick % BEAT) / BEAT, 2);
    if (state === 'play') {
      if (tick % BEAT === 0) sfx.kick();
      else if (tick % BEAT === BEAT / 2) sfx.hat();
    }
    for (const pd of pads) pd.life--;
    pads = pads.filter((pd) => pd.life > 0);
    if (state === 'play') updatePlay();
    else if (state === 'freeze') { if (--freezeT <= 0) state = 'play'; }
    else if (state === 'dead') {
      p.vy += 0.5; p.y += p.vy;
      if (--deadT <= 0) {
        const [w, h] = SIZES[1];
        p.glow = 1; p.w = w; p.h = h;
        respawn();
        state = 'play';
        updateHUD();
      }
    }
    if (input.jumpBuf > 0) input.jumpBuf--;
    if (input.padBuf > 0) input.padBuf--;
    if (input.powerBuf > 0) input.powerBuf--;
    if (wordFlashT > 0 && --wordFlashT === 0) updateWordHUD(false);
    for (const k in bumps) if (--bumps[k] <= 0) delete bumps[k];

    for (const pt of particles) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += pt.g || 0; pt.vx *= 0.97; pt.life--; }
    particles = particles.filter((pt) => pt.life > 0);

    const target = Math.max(0, Math.min(COLS * T - viewW, p.x + p.w / 2 - viewW * 0.4));
    cam.x += (target - cam.x) * 0.12;
    if (cam.shake > 0) cam.shake *= 0.86;
    if (cam.shake < 0.3) cam.shake = 0;
    if (flash > 0) flash = Math.max(0, flash - 0.04);
  }

  // ---------- Rendu ----------
  const blobs = Array.from({ length: 26 }, (_, i) => ({ x: i * 360 + ((i * 137) % 200), y: 80 + ((i * 89) % 300), r: 160 + ((i * 53) % 140) }));
  const SNIPPETS = ["const word = 'antouka';", 'if (letters === 7) glow++;', '// GLOW UP', 'catch (bug) { glow-- }', 'npm run deploy', 'player.level += 1;', 'while (!max) collect();', 'fix: bug #404', 'git commit -m "glow"', 'return ".antouka";'];
  const SNIPPETS_HW = ['// BOO', 'ghost.spawn()', 'git stash --haunted', 'catch (fear) { glow-- }', 'npm run haunt', 'while (alive) scream()', 'rm -rf fear', "return 'trick or treat'"];
  const snippets = Array.from({ length: 48 }, (_, i) => ({ x: i * 250 + ((i * 97) % 120), y: 70 + ((i * 53) % 7) * 44, t: SNIPPETS[i % SNIPPETS.length], th: SNIPPETS_HW[i % SNIPPETS_HW.length] }));
  const bats = Array.from({ length: 14 }, (_, i) => ({ x: i * 520 + ((i * 131) % 300), y: 50 + ((i * 71) % 180), s: 0.7 + ((i * 37) % 5) / 10, ph: i * 1.3 }));

  // Decor Halloween : lune, brume, chauves-souris, toile d'araignee, snippets hantes.
  function drawBgHW() {
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, viewW, H);
    const mx = viewW - 230 - (cam.x * 0.1) % 200, my = 175;
    const halo = ctx.createRadialGradient(mx, my, 40, mx, my, 220);
    halo.addColorStop(0, 'rgba(255,122,26,0.16)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.fillRect(mx - 220, my - 220, 440, 440);
    ctx.fillStyle = HW.moon; ctx.beginPath(); ctx.arc(mx, my, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.arc(mx - 22, my - 10, 14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 18, my + 24, 9, 0, Math.PI * 2); ctx.fill();
    for (const b of blobs) {
      const sx = b.x - cam.x * 0.3;
      if (sx < -b.r || sx > viewW + b.r) continue;
      const r = b.r * (1 + 0.1 * beatP);
      const g = ctx.createRadialGradient(sx, b.y, 0, sx, b.y, r);
      g.addColorStop(0, 'rgba(94,32,240,0.14)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(sx - r, b.y - r, r * 2, r * 2);
    }
    const fog = ctx.createLinearGradient(0, 330, 0, H);
    fog.addColorStop(0, 'rgba(255,122,26,0)'); fog.addColorStop(1, 'rgba(255,122,26,0.08)');
    ctx.fillStyle = fog; ctx.fillRect(0, 330, viewW, H - 330);
    // Toile dans le coin haut gauche, fixe a l'ecran.
    ctx.strokeStyle = 'rgba(253,253,253,0.10)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const a = (i / 4) * Math.PI / 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 150, Math.sin(a) * 150); }
    for (const rad of [50, 95, 140]) { ctx.moveTo(rad, 0); for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; ctx.quadraticCurveTo(Math.cos(a - 0.1) * rad * 0.92, Math.sin(a - 0.1) * rad * 0.92, Math.cos(a) * rad, Math.sin(a) * rad); } }
    ctx.stroke();
    ctx.font = `700 210px ${F_DISPLAY}`; ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = 'rgba(255,122,26,0.10)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const x = i * 1500 + 120 - cam.x * 0.2; if (x > viewW || x < -1100) continue; ctx.strokeText('ANTOUKA', x, 330); }
    ctx.font = `400 12px ${F_MONO}`; ctx.fillStyle = C.line;
    for (const s of snippets) { const x = s.x - cam.x * 0.55; if (x < -260 || x > viewW) continue; ctx.fillText(s.th, x, s.y); }
    // Chauves-souris en parallaxe, qui traversent vers la gauche.
    ctx.fillStyle = HW.spider; ctx.strokeStyle = HW.spider; ctx.lineWidth = 2;
    const span = COLS * T * 0.5 + 600;
    for (const b of bats) {
      const bx = (((b.x - tick * 0.6 * b.s - cam.x * 0.5) % span) + span) % span - 300;
      if (bx < -40 || bx > viewW + 40) continue;
      const by = b.y + Math.sin(tick * 0.03 + b.ph) * 14, flap = Math.sin(tick * 0.4 + b.ph) * 6;
      ctx.beginPath();
      ctx.moveTo(bx - 14 * b.s, by + flap); ctx.quadraticCurveTo(bx - 7 * b.s, by - 4 * b.s, bx, by);
      ctx.quadraticCurveTo(bx + 7 * b.s, by - 4 * b.s, bx + 14 * b.s, by + flap);
      ctx.quadraticCurveTo(bx + 8 * b.s, by + 2 * b.s, bx + 4 * b.s, by + 5 * b.s);
      ctx.lineTo(bx, by + 3 * b.s); ctx.lineTo(bx - 4 * b.s, by + 5 * b.s);
      ctx.quadraticCurveTo(bx - 8 * b.s, by + 2 * b.s, bx - 14 * b.s, by + flap);
      ctx.fill();
    }
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  function drawBg() {
    if (isHW()) return drawBgHW();
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, 0, viewW, H);
    for (const b of blobs) {
      const sx = b.x - cam.x * 0.3;
      if (sx < -b.r || sx > viewW + b.r) continue;
      const r = b.r * (1 + 0.1 * beatP);
      const g = ctx.createRadialGradient(sx, b.y, 0, sx, b.y, r);
      g.addColorStop(0, C.ghost); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(sx - r, b.y - r, r * 2, r * 2);
    }
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1 + beatP;
    ctx.beginPath();
    const off = -((cam.x * 0.5) % 64);
    for (let x = off; x < viewW; x += 64) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
    for (let y = 0; y < H; y += 64) { ctx.moveTo(0, y + 0.5); ctx.lineTo(viewW, y + 0.5); }
    ctx.stroke();
    ctx.font = `700 210px ${F_DISPLAY}`;
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = C.ghost; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const x = i * 1500 + 120 - cam.x * 0.2;
      if (x > viewW || x < -1100) continue;
      ctx.strokeText('ANTOUKA', x, 330);
    }
    ctx.font = `400 12px ${F_MONO}`;
    ctx.fillStyle = C.line;
    for (const s of snippets) {
      const x = s.x - cam.x * 0.55;
      if (x < -260 || x > viewW) continue;
      ctx.fillText(s.t, x, s.y);
    }
  }

  function drawTiles() {
    const c0 = Math.max(0, Math.floor(cam.x / T) - 1), c1 = Math.min(COLS - 1, Math.ceil((cam.x + viewW) / T) + 1);
    for (let x = c0; x <= c1; x++) {
      for (let y = 0; y < ROWS; y++) {
        const t = grid[y][x];
        if (!t) continue;
        const px = x * T, py = y * T;
        if (t === 1 || t === 5) {
          ctx.fillStyle = C.panel; ctx.fillRect(px, py, T, T);
          ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1);
          if (!isSolid(x, y - 1)) {
            ctx.fillStyle = isHW() ? C.term : C.violet; ctx.fillRect(px, py, T, 2);
            ctx.fillStyle = C.violet3; ctx.fillRect(px + 14, py + 6, 4, 1);
            if (isHW() && x % 4 === 1) {
              // Herbe seche.
              ctx.strokeStyle = HW.bandage; ctx.lineWidth = 1; ctx.beginPath();
              for (let i = 0; i < 3; i++) { ctx.moveTo(px + 8 + i * 8, py); ctx.lineTo(px + 6 + i * 8 + (i === 1 ? 4 : 0), py - 6 - i); }
              ctx.stroke();
            }
          }
        } else if (t === 3 && isHW()) {
          // Pierre tombale "RIP" : tete arrondie, on la frappe par en dessous comme un bloc.
          const b = bumps[x + ',' + y] || 0, oy = -Math.sin((b / 10) * Math.PI) * 6;
          ctx.save(); ctx.shadowColor = C.term; ctx.shadowBlur = 10 + Math.sin(tick * 0.1) * 4;
          ctx.fillStyle = C.mute; rr(px + 3, py + 1 + oy, T - 6, T - 1, [12, 12, 2, 2]); ctx.fill(); ctx.restore();
          ctx.fillStyle = C.ink; ctx.font = `700 11px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('RIP', px + 16, py + 19 + oy);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        } else if (t === 4 && isHW()) {
          const b = bumps[x + ',' + y] || 0, oy = -Math.sin((b / 10) * Math.PI) * 6;
          ctx.fillStyle = C.panel; rr(px + 3, py + 1 + oy, T - 6, T - 1, [12, 12, 2, 2]); ctx.fill();
          ctx.strokeStyle = C.dim; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px + 10, py + 6 + oy); ctx.lineTo(px + 17, py + 16 + oy); ctx.lineTo(px + 13, py + 26 + oy); ctx.stroke();
        } else if (t === 7 && isHW()) {
          // Bougie : allumee quand solide, meche fumante sinon.
          const lit = beatOn;
          ctx.fillStyle = HW.bone; rr(px + 10, py + 8, 12, T - 8, 2); ctx.fill();
          ctx.fillStyle = C.line; ctx.fillRect(px + 10, py + 8, 12, 2);
          if (lit) {
            ctx.save(); ctx.shadowColor = C.term; ctx.shadowBlur = 14;
            const fh = 10 + beatP * 6;
            ctx.fillStyle = C.term; ctx.beginPath(); ctx.moveTo(px + 16, py + 6 - fh); ctx.quadraticCurveTo(px + 22, py + 4, px + 16, py + 9); ctx.quadraticCurveTo(px + 10, py + 4, px + 16, py + 6 - fh); ctx.fill();
            ctx.fillStyle = HW.moon; ctx.beginPath(); ctx.ellipse(px + 16, py + 5, 2, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            ctx.fillStyle = C.termSoft; ctx.fillRect(px, py, T, 2);
          } else {
            ctx.strokeStyle = C.dim; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
            ctx.beginPath(); ctx.moveTo(px + 16, py + 6); ctx.quadraticCurveTo(px + 20, py - 2, px + 15, py - 8); ctx.stroke(); ctx.setLineDash([]);
          }
        } else if (t === 6 && isHW()) {
          // Barriere : brume violette qui monte.
          for (let i = 0; i < 3; i++) {
            const yy = py + ((tick * 1.5 + i * 11 + y * 7) % T);
            ctx.fillStyle = 'rgba(130,79,255,0.22)'; ctx.beginPath(); ctx.ellipse(px + 16, yy, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
          }
        } else if (t === 2) {
          ctx.fillStyle = C.faint; ctx.fillRect(px, py, T, T);
          ctx.strokeStyle = C.line; ctx.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1);
          ctx.fillStyle = C.violet2; ctx.fillRect(px, py, T, 2);
        } else if (t === 7) {
          const phase = tick % (BEAT * 2), warn = phase > BEAT * 2 - 10 && phase % 4 < 2;
          if (beatOn && !warn) {
            ctx.fillStyle = C.termSoft; ctx.fillRect(px, py, T, T);
            ctx.fillStyle = C.term; ctx.fillRect(px, py, T, 2);
            ctx.strokeStyle = C.term; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1);
          } else {
            ctx.strokeStyle = warn && !beatOn ? C.term : C.line; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]); ctx.strokeRect(px + 0.5, py + 0.5, T - 1, T - 1); ctx.setLineDash([]);
          }
        } else if (t === 6) {
          ctx.fillStyle = C.faint; ctx.fillRect(px + 8, py, 16, T);
          ctx.fillStyle = C.violet2;
          ctx.fillRect(px + 15, py, 2, T);
          ctx.fillRect(px + 8, py + ((tick * 2 + y * 9) % T), 16, 2);
        } else {
          const b = bumps[x + ',' + y] || 0;
          const oy = -Math.sin((b / 10) * Math.PI) * 6;
          if (t === 3) {
            ctx.save();
            ctx.shadowColor = C.violet; ctx.shadowBlur = 14 + Math.sin(tick * 0.1) * 4;
            ctx.fillStyle = C.violet; rr(px + 1, py + 1 + oy, T - 2, T - 2, 2); ctx.fill();
            ctx.restore();
            ctx.fillStyle = C.paper; ctx.font = `700 14px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('{ }', px + 16, py + 17 + oy);
          } else {
            ctx.fillStyle = C.panel; rr(px + 1, py + 1 + oy, T - 2, T - 2, 2); ctx.fill();
            ctx.strokeStyle = C.line; ctx.stroke();
            ctx.fillStyle = C.dim; ctx.font = `700 13px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('{}', px + 16, py + 17 + oy);
          }
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        }
      }
    }
  }

  function drawPads() {
    for (const pd of pads) {
      if (pd.life < 20 && pd.life % 4 < 2) continue;
      if (isHW()) {
        // Planche de cercueil avec deux clous.
        ctx.save(); ctx.globalAlpha = Math.min(1, pd.life / 30);
        ctx.fillStyle = HW.coffin; rr(pd.x, pd.y, pd.w, 8, 1); ctx.fill();
        ctx.strokeStyle = C.term; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = C.mute; ctx.fillRect(pd.x + 6, pd.y + 3, 2, 2); ctx.fillRect(pd.x + pd.w - 8, pd.y + 3, 2, 2);
        ctx.fillStyle = C.termSoft; ctx.fillRect(pd.x + 8, pd.y + 10, (pd.w - 16) * (pd.life / pd.max), 2);
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.min(1, pd.life / 30);
      ctx.shadowColor = C.term; ctx.shadowBlur = 12;
      ctx.fillStyle = C.term; ctx.fillRect(pd.x, pd.y, pd.w, 3);
      ctx.restore();
      ctx.strokeStyle = C.term; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pd.x + 5, pd.y + 3); ctx.lineTo(pd.x, pd.y + 3); ctx.lineTo(pd.x, pd.y + 10); ctx.lineTo(pd.x + 5, pd.y + 10);
      ctx.moveTo(pd.x + pd.w - 5, pd.y + 3); ctx.lineTo(pd.x + pd.w, pd.y + 3); ctx.lineTo(pd.x + pd.w, pd.y + 10); ctx.lineTo(pd.x + pd.w - 5, pd.y + 10);
      ctx.stroke();
      ctx.fillStyle = C.termSoft; ctx.fillRect(pd.x + 8, pd.y + 6, (pd.w - 16) * (pd.life / pd.max), 2);
    }
  }

  function drawSpikes() {
    for (const sx of spikes) {
      const px = sx * T, base = 13 * T;
      if (isHW()) {
        // Os plantes dans le sol.
        ctx.strokeStyle = HW.bone; ctx.fillStyle = HW.bone; ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) {
          const x = px + 6 + i * 10, tilt = (i - 1) * 3;
          ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + tilt, base - 14); ctx.stroke();
          ctx.beginPath(); ctx.arc(x + tilt - 2.5, base - 15, 2.2, 0, Math.PI * 2); ctx.arc(x + tilt + 2.5, base - 15, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        continue;
      }
      for (let i = 0; i < 3; i++) {
        const x = px + 2 + i * 9.5;
        ctx.fillStyle = C.mute;
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + 4.75, base - 16); ctx.lineTo(x + 9.5, base); ctx.fill();
        ctx.fillStyle = C.violet2; ctx.fillRect(x + 3.75, base - 16, 2, 3);
      }
    }
  }

  function drawLetters() {
    for (const l of letters) {
      if (l.taken || l.block) continue;
      const cx = l.x * T + 16, cy = l.y * T + 16 + Math.sin(tick * 0.06 + l.id) * 4;
      if (cx < cam.x - 40 || cx > cam.x + viewW + 40) continue;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      g.addColorStop(0, isHW() ? 'rgba(255,122,26,0.22)' : C.ghost); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - 30, cy - 30, 60, 60);
      if (isHW()) {
        // Flamme de bougie au-dessus de la lettre.
        const fh = 8 + Math.sin(tick * 0.3 + l.id) * 3;
        ctx.save(); ctx.shadowColor = C.term; ctx.shadowBlur = 10;
        ctx.fillStyle = C.term; ctx.beginPath(); ctx.moveTo(cx, cy - 20 - fh); ctx.quadraticCurveTo(cx + 5, cy - 20, cx, cy - 17); ctx.quadraticCurveTo(cx - 5, cy - 20, cx, cy - 20 - fh); ctx.fill();
        ctx.restore();
      }
      ctx.strokeStyle = C.violet3; ctx.lineWidth = 1.5;
      const w = 15, h = 17, k = 5;
      ctx.beginPath();
      ctx.moveTo(cx - w + k, cy - h); ctx.lineTo(cx - w, cy - h); ctx.lineTo(cx - w, cy + h); ctx.lineTo(cx - w + k, cy + h);
      ctx.moveTo(cx + w - k, cy - h); ctx.lineTo(cx + w, cy - h); ctx.lineTo(cx + w, cy + h); ctx.lineTo(cx + w - k, cy + h);
      ctx.stroke();
      ctx.save();
      ctx.shadowColor = C.violet2; ctx.shadowBlur = 12;
      ctx.fillStyle = C.paper; ctx.font = `700 ${Math.round(24 + 4 * beatP)}px ${F_DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(l.ch, cx, cy + 1);
      ctx.restore();
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  function drawEnemies() {
    for (const e of enemies) {
      if (!e.alive && e.squash <= 0) continue;
      if (e.x < cam.x - 60 || e.x > cam.x + viewW + 60) continue;
      ctx.save();
      if (!e.alive) ctx.globalAlpha = e.squash / 30;
      if (e.type === 'bug' && isHW()) {
        // Araignee : corps noir, huit pattes animees, deux yeux rouges.
        const sq = e.alive ? 1 : 0.3;
        const cx = e.x + e.w / 2, by = e.y + e.h, bh = e.h * sq;
        const step = e.alive ? Math.sin(tick * 0.5 + e.seed) * 3 : 0;
        ctx.strokeStyle = C.mute; ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const ly = by - bh * (0.75 - i * 0.12), s = i % 2 ? step : -step;
          ctx.moveTo(cx - 4, ly); ctx.lineTo(cx - 13 - i * 2, ly - 4 + s); ctx.lineTo(cx - 17 - i * 2, by);
          ctx.moveTo(cx + 4, ly); ctx.lineTo(cx + 13 + i * 2, ly - 4 - s); ctx.lineTo(cx + 17 + i * 2, by);
        }
        ctx.stroke();
        ctx.fillStyle = HW.spider; ctx.strokeStyle = C.violet3; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(cx, by - bh * 0.5, e.w / 2 - 2, bh * 0.45, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + e.dir * 10, by - bh * 0.55, 5 * sq, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (e.alive) {
          ctx.fillStyle = HW.blood;
          ctx.fillRect(cx + e.dir * 9 - 1, by - bh * 0.62, 2, 2); ctx.fillRect(cx + e.dir * 13 - 1, by - bh * 0.62, 2, 2);
        }
      } else if (e.type === 'fly' && isHW()) {
        // Fantome : drap arrondi, bas ondule, "BOO".
        const sq = e.alive ? 1 : 0.4;
        const bob = e.alive ? Math.sin(tick * 0.08 + e.seed) * 3 : 0;
        const x = e.x, y = e.y + e.h * (1 - sq) + bob, h = e.h * sq + 10;
        ctx.globalAlpha *= 0.88;
        ctx.fillStyle = HW.bone;
        ctx.beginPath();
        ctx.moveTo(x, y + h); ctx.lineTo(x, y + 11); ctx.arc(x + e.w / 2, y + 11, e.w / 2, Math.PI, 0); ctx.lineTo(x + e.w, y + h);
        for (let i = 3; i >= 0; i--) { const wx = x + (i / 4) * e.w; ctx.quadraticCurveTo(wx + e.w / 8, y + h - 5 - (tick % 10 < 5 ? 0 : 2), wx, y + h); }
        ctx.closePath(); ctx.fill();
        if (e.alive) {
          ctx.fillStyle = C.ink;
          ctx.beginPath(); ctx.ellipse(x + e.w / 2 - 6, y + 10, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.ellipse(x + e.w / 2 + 6, y + 10, 2.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.font = `700 10px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('BOO', x + e.w / 2, y + 21);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        }
      } else if (e.type === 'bug') {
        const sq = e.alive ? 1 : 0.35;
        const cx = e.x + e.w / 2, by = e.y + e.h, bh = e.h * sq;
        const step = e.alive ? Math.sin(tick * 0.4 + e.seed) * 3 : 0;
        ctx.strokeStyle = C.mute; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = -1; i <= 1; i++) {
          const lx = cx + i * 7;
          ctx.moveTo(lx, by - bh * 0.4); ctx.lineTo(lx + (i === 0 ? -step : step) - 3, by);
        }
        ctx.moveTo(cx + e.dir * 8, by - bh * 0.8); ctx.lineTo(cx + e.dir * 15, by - bh - 5);
        ctx.moveTo(cx + e.dir * 4, by - bh * 0.9); ctx.lineTo(cx + e.dir * 8, by - bh - 7);
        ctx.stroke();
        ctx.fillStyle = C.panel; ctx.strokeStyle = C.mute;
        ctx.beginPath(); ctx.ellipse(cx, by - bh * 0.55, e.w / 2, bh * 0.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(cx, by - bh); ctx.lineTo(cx, by - bh * 0.15); ctx.stroke();
        if (e.alive) {
          ctx.fillStyle = C.paper;
          ctx.fillRect(cx + e.dir * 6 - 2, by - bh * 0.7, 3, 4);
          ctx.fillRect(cx + e.dir * 11 - 2, by - bh * 0.7, 3, 4);
        }
      } else {
        const sq = e.alive ? 1 : 0.4;
        const flap = e.alive ? Math.sin(tick * 0.5 + e.seed) * 6 : 0;
        const x = e.x, y = e.y + e.h * (1 - sq), h = e.h * sq;
        ctx.strokeStyle = C.mute; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 4); ctx.lineTo(x - 6, y - 4 + flap);
        ctx.moveTo(x + e.w - 6, y + 4); ctx.lineTo(x + e.w + 6, y - 4 + flap);
        ctx.stroke();
        const glitch = e.alive && (tick + e.seed * 13) % 90 < 6 ? 3 : 0;
        if (glitch) { ctx.fillStyle = C.violet; rr(x + glitch, y, e.w, h, 2); ctx.fill(); }
        ctx.fillStyle = C.panel; rr(x, y, e.w, h, 2); ctx.fill();
        ctx.strokeStyle = C.mute; ctx.stroke();
        if (e.alive) {
          ctx.fillStyle = C.paper; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('404', x + e.w / 2, y + h / 2 + 1);
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        }
      }
      ctx.restore();
    }
  }

  function drawCarl(b) {
    const w = b.w, lH = 22, bH = 40, hH = 42, hW = 44;
    const bodyTop = -(lH + bH), headTop = bodyTop - hH + 6;
    const dash = b.mode === 'dash' && !b.dead;
    const run = dash ? Math.sin(b.t * 0.6) : 0;
    const breath = !dash && !b.dead ? Math.sin(b.t * 0.25) * 2 : 0;
    const anger = bossPhase(b);
    const head = () => rr(-hW / 2, headTop + breath, hW, hH, 16);
    const torso = () => rr(-w * 0.42, bodyTop + breath, w * 0.84, bH + 2, 6);
    ctx.save();
    ctx.translate(b.x + w / 2, b.y + b.h);
    if (b.dead) { ctx.globalAlpha = b.deadT / 80; ctx.rotate((80 - b.deadT) * 0.004 * b.face); }
    const a0 = ctx.globalAlpha;
    ctx.scale(b.face, 1);
    if (dash) ctx.rotate(0.22);
    else if (!b.dead) ctx.rotate(0.12);

    ctx.save();
    ctx.shadowColor = dash ? C.term : C.violet2; ctx.shadowBlur = dash ? 22 : 10 + anger * 6;
    ctx.strokeStyle = dash ? C.term : C.violet2; ctx.lineWidth = 2;
    torso(); ctx.stroke(); head(); ctx.stroke();
    ctx.restore();

    const skel = isHW();
    const rattle = skel && dash ? Math.sin(b.t * 1.3) * 1.5 : 0;
    if (skel) {
      // Squelette : os des jambes, cage thoracique, bras en os.
      ctx.strokeStyle = HW.bone; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-10 + run * 9, -lH); ctx.lineTo(-10 + run * 9 + rattle, 0); ctx.moveTo(9 - run * 9, -lH); ctx.lineTo(9 - run * 9 - rattle, 0); ctx.stroke();
      ctx.fillStyle = C.ink; torso(); ctx.fill();
      ctx.strokeStyle = HW.bone; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, bodyTop + breath + 2); ctx.lineTo(0, bodyTop + breath + bH); ctx.stroke();
      for (let i = 0; i < 4; i++) { const ry = bodyTop + breath + 8 + i * 8; ctx.beginPath(); ctx.moveTo(-w * 0.38, ry + 3); ctx.quadraticCurveTo(0, ry - 4, w * 0.38, ry + 3); ctx.stroke(); }
      ctx.save(); ctx.translate(w * 0.34, bodyTop + breath + 6); ctx.rotate(dash ? -1.3 + run * 0.6 : 0.3);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rattle, bH * 0.72); ctx.stroke(); ctx.restore();
      ctx.lineCap = 'butt';
      ctx.fillStyle = HW.bone; head(); ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.ellipse(hW * 0.06, headTop + breath + hH * 0.42, 5, 6, 0, 0, Math.PI * 2); ctx.ellipse(hW * 0.33, headTop + breath + hH * 0.42, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hW * 0.2, headTop + breath + hH * 0.56); ctx.lineTo(hW * 0.16, headTop + breath + hH * 0.66); ctx.lineTo(hW * 0.24, headTop + breath + hH * 0.66); ctx.fill();
      ctx.fillRect(-hW * 0.1, headTop + breath + hH * 0.8, hW * 0.6, 1.5);
      for (let i = 0; i < 5; i++) ctx.fillRect(-hW * 0.08 + i * hW * 0.12, headTop + breath + hH * 0.74, 1.5, 6);
    } else {
    ctx.fillStyle = C.pants;
    ctx.fillRect(-16 + run * 9, -lH, 13, lH);
    ctx.fillRect(3 - run * 9, -lH, 13, lH);
    ctx.fillStyle = C.collar; torso(); ctx.fill();
    ctx.fillStyle = C.term; ctx.fillRect(-w * 0.42, bodyTop + breath + 14, w * 0.84, 3);
    ctx.fillStyle = C.sweater;
    ctx.save(); ctx.translate(w * 0.34, bodyTop + breath + 6); ctx.rotate(dash ? -1.3 + run * 0.6 : 0.3);
    rr(-5, 0, 10, bH * 0.75, 5); ctx.fill(); ctx.restore();

    ctx.fillStyle = C.skin; head(); ctx.fill();
    ctx.save(); head(); ctx.clip();
    ctx.fillStyle = C.hair;
    ctx.beginPath();
    ctx.moveTo(-hW / 2, headTop + breath + hH * 0.3);
    for (let i = 0; i <= 5; i++) ctx.lineTo(-hW / 2 + (i / 5) * hW, headTop + breath + (i % 2 ? -6 : 4));
    ctx.lineTo(hW / 2, headTop + breath + hH * 0.22);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    }
    // Lunettes.
    const gy = headTop + breath + hH * 0.42;
    ctx.strokeStyle = C.paper; ctx.lineWidth = 2;
    rr(-hW * 0.02, gy - 6, 15, 12, 3); ctx.stroke();
    rr(hW * 0.4 - 15, gy - 6, 15, 12, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hW * 0.02 + 13, gy); ctx.lineTo(hW * 0.4 - 15, gy); ctx.moveTo(-hW * 0.02, gy); ctx.lineTo(-hW * 0.4, gy - 2); ctx.stroke();
    ctx.fillStyle = C.glass; ctx.fillRect(-hW * 0.02 + 2, gy - 4, 11, 8); ctx.fillRect(hW * 0.4 - 13, gy - 4, 11, 8);
    ctx.fillStyle = C.beard;
    if (!skel) ctx.fillRect(hW * 0.05, gy - 2, 3, 4); if (!skel) ctx.fillRect(hW * 0.3, gy - 2, 3, 4);
    const open = b.mouth > 0 ? Math.sin((b.mouth / 14) * Math.PI) : (!dash && !b.dead ? 0.35 + Math.sin(b.t * 0.25) * 0.2 : 0);
    if (!skel) { ctx.beginPath(); ctx.ellipse(hW * 0.22, headTop + breath + hH * 0.78, 6, 1.5 + open * 6, 0, 0, Math.PI * 2); ctx.fill(); }
    if (!dash && !b.dead && b.t % 40 < 20) {
      ctx.fillStyle = C.violet3;
      ctx.beginPath(); ctx.ellipse(-hW * 0.4, headTop + breath + hH * 0.3 + (b.t % 40) * 0.4, 2, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (b.inv > 0 && b.inv % 8 < 4) {
      ctx.globalAlpha = a0 * 0.55; ctx.fillStyle = C.paper;
      head(); ctx.fill(); torso(); ctx.fill();
      ctx.globalAlpha = a0;
    }
    ctx.restore();

    if (!b.dead) {
      ctx.fillStyle = dash ? C.term : C.violet3; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center';
      ctx.fillText(dash ? '[ CARL ]' : '[ CARL souffle ]', b.x + w / 2, b.y - 12);
      ctx.textAlign = 'left';
    }
  }

  function drawBoss(b) {
    if (!b || (b.dead && b.deadT <= 0)) return;
    if (b.x > cam.x + viewW + 100 || b.x + b.w < cam.x - 100) return;
    if (b.type === 'carl') { drawCarl(b); return; }
    if (b.type === 'yow') { drawYow(b); return; }
    const w = b.w, lH = 16, bH = 40, hH = 50, hW = 78;
    const bodyTop = -(lH + bH), headTop = bodyTop - hH + 6;
    const walk = b.mouth > 0 || b.dead || !b.active ? 0 : Math.sin(b.t * 0.15);
    const anger = bossPhase(b);
    const head = () => rr(-hW / 2, headTop, hW, hH, 22);
    const torso = () => rr(-w * 0.48, bodyTop, w * 0.96, bH + 2, 8);
    ctx.save();
    ctx.translate(b.x + w / 2, b.y + b.h);
    if (b.dead) { ctx.globalAlpha = b.deadT / 80; ctx.rotate((80 - b.deadT) * 0.004 * b.face); }
    const a0 = ctx.globalAlpha;
    ctx.scale(b.face, 1);

    ctx.save();
    ctx.shadowColor = anger === 2 ? C.term : C.violet2; ctx.shadowBlur = 16 + anger * 8;
    ctx.strokeStyle = C.violet2; ctx.lineWidth = 2;
    torso(); ctx.stroke(); head(); ctx.stroke();
    ctx.restore();

    const vamp = isHW();
    if (vamp) {
      // Cape derriere le corps, qui flotte quand il marche.
      ctx.fillStyle = HW.cape;
      ctx.beginPath(); ctx.moveTo(-w * 0.3, bodyTop + 2); ctx.lineTo(w * 0.3, bodyTop + 2);
      ctx.lineTo(w * 0.62 + walk * 6, 2); ctx.lineTo(-w * 0.62 - walk * 6, 2); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = vamp ? C.ink : C.pants;
    ctx.fillRect(-26 + walk * 4, -lH, 20, lH);
    ctx.fillRect(6 - walk * 4, -lH, 20, lH);
    ctx.fillStyle = vamp ? C.ink : C.violet; torso(); ctx.fill();
    if (vamp) {
      // Col releve et chemise.
      ctx.fillStyle = HW.bone; ctx.beginPath(); ctx.moveTo(-6, bodyTop); ctx.lineTo(0, bodyTop + 14); ctx.lineTo(6, bodyTop); ctx.closePath(); ctx.fill();
      ctx.fillStyle = HW.cape; ctx.beginPath(); ctx.moveTo(-w * 0.3, bodyTop + 2); ctx.lineTo(-w * 0.2, bodyTop - 14); ctx.lineTo(-w * 0.1, bodyTop + 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w * 0.3, bodyTop + 2); ctx.lineTo(w * 0.2, bodyTop - 14); ctx.lineTo(w * 0.1, bodyTop + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = HW.blood; ctx.fillRect(-2, bodyTop + 6, 4, 6);
    }
    ctx.strokeStyle = C.violet3; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(4, bodyTop + 4); ctx.lineTo(4, bodyTop + 18); ctx.moveTo(16, bodyTop + 4); ctx.lineTo(16, bodyTop + 18); ctx.stroke();
    ctx.fillStyle = C.violet2;
    ctx.save(); ctx.translate(w * 0.36, bodyTop + 6); ctx.rotate(b.mouth > 0 ? -0.9 : walk * 0.4);
    rr(-6, 0, 12, bH * 0.8, 6); ctx.fill(); ctx.restore();

    ctx.fillStyle = vamp ? HW.pale : C.skin; head(); ctx.fill();
    ctx.save(); head(); ctx.clip();
    ctx.fillStyle = vamp ? C.ink : C.hair;
    if (vamp) {
      // Cheveux plaques avec la pointe au front.
      ctx.beginPath(); ctx.moveTo(-hW / 2, headTop); ctx.lineTo(hW / 2, headTop); ctx.lineTo(hW / 2, headTop + hH * 0.16);
      ctx.lineTo(hW * 0.22, headTop + hH * 0.16); ctx.lineTo(hW * 0.12, headTop + hH * 0.3); ctx.lineTo(hW * 0.02, headTop + hH * 0.16);
      ctx.lineTo(-hW / 2, headTop + hH * 0.2); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(-hW / 2, headTop, hW, hH * 0.24);
      ctx.fillRect(-hW / 2, headTop, hW * 0.24, hH * 0.5);
    }
    ctx.restore();
    if (vamp) {
      // Canines.
      ctx.fillStyle = HW.bone;
      ctx.beginPath(); ctx.moveTo(hW * 0.17, headTop + hH * 0.8); ctx.lineTo(hW * 0.2, headTop + hH * 0.94); ctx.lineTo(hW * 0.23, headTop + hH * 0.8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hW * 0.29, headTop + hH * 0.8); ctx.lineTo(hW * 0.32, headTop + hH * 0.94); ctx.lineTo(hW * 0.35, headTop + hH * 0.8); ctx.fill();
      ctx.fillStyle = HW.blood; ctx.fillRect(hW * 0.19, headTop + hH * 0.92, 2, 4);
    }
    ctx.fillStyle = C.skin;
    ctx.beginPath(); ctx.ellipse(-hW * 0.16, headTop + hH * 0.48, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.beard; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hW * 0.02, headTop + hH * 0.32 - anger * 2); ctx.lineTo(hW * 0.2, headTop + hH * 0.4);
    ctx.moveTo(hW * 0.27, headTop + hH * 0.4); ctx.lineTo(hW * 0.45, headTop + hH * 0.32 - anger * 2);
    ctx.stroke();
    ctx.fillStyle = C.beard;
    ctx.fillRect(hW * 0.08, headTop + hH * 0.46, 4, 5);
    ctx.fillRect(hW * 0.33, headTop + hH * 0.46, 4, 5);
    const open = b.mouth > 0 ? Math.sin((b.mouth / 26) * Math.PI) : 0;
    ctx.beginPath(); ctx.ellipse(hW * 0.25, headTop + hH * 0.76, 9, 2 + open * 8, 0, 0, Math.PI * 2); ctx.fill();
    if (open > 0.3) {
      ctx.fillStyle = C.cheek;
      ctx.beginPath(); ctx.ellipse(hW * 0.25, headTop + hH * 0.76 + open * 4, 5, open * 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (b.inv > 0 && b.inv % 8 < 4) {
      ctx.globalAlpha = a0 * 0.55; ctx.fillStyle = C.paper;
      head(); ctx.fill(); torso(); ctx.fill();
      ctx.globalAlpha = a0;
    }
    ctx.restore();

    if (!b.dead) {
      ctx.fillStyle = C.violet3; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center';
      ctx.fillText('[ RUBEN ]', b.x + w / 2, b.y - 12);
      ctx.textAlign = 'left';
    }
  }

  // YOW : grand, barbu, debardeur, short, grosses baskets. Halloween : loup-garou.
  function drawYow(b) {
    const w = b.w, lH = 26, bH = 42, hH = 36, hW = 48;
    const wolf = isHW();
    const air = !b.ground && !b.dead;
    const fridge = b.mode === 'fridge';
    const bodyTop = -(lH + bH), headTop = bodyTop - hH + 6;
    const anger = bossPhase(b);
    const skin = wolf ? '#5a4634' : '#8d5a3b';
    const head = () => rr(-hW / 2, headTop, hW, hH, 14);
    const torso = () => rr(-w * 0.44, bodyTop, w * 0.88, bH + 2, 7);
    ctx.save();
    ctx.translate(b.x + w / 2, b.y + b.h);
    if (b.dead) { ctx.globalAlpha = b.deadT / 80; ctx.rotate((80 - b.deadT) * 0.004 * b.face); }
    const a0 = ctx.globalAlpha;
    ctx.scale(b.face * (2 - b.sy), b.sy);

    ctx.save();
    ctx.shadowColor = anger === 2 ? C.term : C.violet2; ctx.shadowBlur = 14 + anger * 8;
    ctx.strokeStyle = C.violet2; ctx.lineWidth = 2;
    torso(); ctx.stroke(); head(); ctx.stroke();
    ctx.restore();

    // Jambes et baskets : repliees en l'air, ecartees au sol.
    const sneaker = (x, y, dir) => {
      ctx.fillStyle = C.paper; rr(x, y, 24, 9, [3, 7, 3, 3]); ctx.fill();
      ctx.fillStyle = wolf ? HW.ecto : C.term; ctx.beginPath(); ctx.moveTo(x + 5, y + 5); ctx.quadraticCurveTo(x + 12, y + 7, x + 20, y + 1); ctx.lineTo(x + 19, y + 3); ctx.quadraticCurveTo(x + 12, y + 8, x + 6, y + 6); ctx.fill();
      ctx.fillStyle = C.mute; ctx.fillRect(x, y + 8, 24, 2.5);
    };
    ctx.fillStyle = skin;
    if (air) {
      ctx.fillRect(-20, -lH + 6, 14, lH - 14); ctx.fillRect(4, -lH + 2, 14, lH - 14);
      sneaker(-22, -16, 1); sneaker(6, -20, 1);
    } else {
      ctx.fillRect(-22, -lH, 14, lH - 6); ctx.fillRect(8, -lH, 14, lH - 6);
      sneaker(-26, -9, 1); sneaker(6, -9, 1);
    }
    ctx.fillStyle = C.pants; rr(-w * 0.4, bodyTop + bH - 6, w * 0.8, 16, 3); ctx.fill();
    ctx.fillStyle = wolf ? HW.bandage : HW.bone; torso(); ctx.fill();
    if (wolf) { ctx.fillStyle = skin; ctx.beginPath(); ctx.moveTo(-w * 0.2, bodyTop + bH + 2); ctx.lineTo(-w * 0.1, bodyTop + bH - 8); ctx.lineTo(0, bodyTop + bH + 2); ctx.fill(); }
    ctx.fillStyle = skin;
    ctx.fillRect(-w * 0.44 - 8, bodyTop + 2, 9, 14); ctx.fillRect(w * 0.44 - 1, bodyTop + 2, 9, 14);
    // Bras : tendu vers le frigo, leves en l'air, le long du corps sinon.
    ctx.save(); ctx.translate(w * 0.4, bodyTop + 6);
    ctx.rotate(fridge ? -1.9 : air ? -2.6 : 0.4 + Math.sin(b.t * 0.2) * 0.1);
    ctx.fillStyle = skin; rr(-5, 0, 10, 34, 5); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(-w * 0.4, bodyTop + 6);
    ctx.rotate(air ? 2.6 : -0.4);
    ctx.fillStyle = skin; rr(-5, 0, 10, 34, 5); ctx.fill(); ctx.restore();

    ctx.fillStyle = skin; head(); ctx.fill();
    ctx.save(); head(); ctx.clip();
    ctx.fillStyle = C.ink;
    ctx.fillRect(-hW / 2, headTop, hW, hH * 0.22);
    if (wolf) { ctx.fillStyle = skin; ctx.fillRect(-hW / 2, headTop, hW, hH * 0.22); ctx.fillStyle = '#3b2b1d'; ctx.fillRect(-hW / 2, headTop, hW, hH * 0.14); }
    // Barbe fournie.
    ctx.fillStyle = wolf ? '#3b2b1d' : C.ink;
    ctx.beginPath(); ctx.moveTo(-hW / 2, headTop + hH * 0.55); ctx.quadraticCurveTo(0, headTop + hH * 0.5, hW / 2, headTop + hH * 0.58);
    ctx.lineTo(hW / 2, headTop + hH); ctx.lineTo(-hW / 2, headTop + hH); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (wolf) {
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.moveTo(-hW * 0.45, headTop + 4); ctx.lineTo(-hW * 0.3, headTop - 14); ctx.lineTo(-hW * 0.15, headTop + 4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hW * 0.15, headTop + 4); ctx.lineTo(hW * 0.3, headTop - 14); ctx.lineTo(hW * 0.45, headTop + 4); ctx.fill();
      ctx.fillStyle = HW.bone;
      ctx.beginPath(); ctx.moveTo(hW * 0.1, headTop + hH * 0.66); ctx.lineTo(hW * 0.14, headTop + hH * 0.8); ctx.lineTo(hW * 0.18, headTop + hH * 0.66); ctx.fill();
      ctx.beginPath(); ctx.moveTo(hW * 0.3, headTop + hH * 0.66); ctx.lineTo(hW * 0.34, headTop + hH * 0.8); ctx.lineTo(hW * 0.38, headTop + hH * 0.66); ctx.fill();
    }
    ctx.fillStyle = wolf ? HW.ecto : HW.bone;
    ctx.fillRect(hW * 0.08, headTop + hH * 0.4, 4, 4); ctx.fillRect(hW * 0.3, headTop + hH * 0.4, 4, 4);
    ctx.fillStyle = C.ink;
    ctx.fillRect(hW * 0.1, headTop + hH * 0.41, 2, 2.5); ctx.fillRect(hW * 0.32, headTop + hH * 0.41, 2, 2.5);
    ctx.fillRect(hW * 0.04, headTop + hH * 0.3 - anger, 9, 2); ctx.fillRect(hW * 0.26, headTop + hH * 0.3 - anger, 9, 2);
    if (b.inv > 0 && b.inv % 8 < 4) { ctx.globalAlpha = a0 * 0.55; ctx.fillStyle = C.paper; head(); ctx.fill(); torso(); ctx.fill(); ctx.globalAlpha = a0; }
    ctx.restore();

    if (!b.dead) {
      ctx.fillStyle = fridge ? C.term : C.violet3; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center';
      ctx.fillText(fridge ? (isHW() ? '[ YOW ouvre le cercueil ]' : '[ YOW ouvre le frigo ]') : '[ YOW ]', b.x + w / 2, b.y - 12);
      ctx.textAlign = 'left';
    }
  }

  function drawFridge() {
    const f = FRIDGE, yow = bosses.find((b) => b.type === 'yow');
    if (!yow || f.x > cam.x + viewW + 60 || f.x + f.w < cam.x - 60) return;
    const open = yow.mode === 'fridge' && !yow.dead ? Math.min(1, (60 - yow.fridgeT) / 10) : 0;
    if (isHW()) {
      // Cercueil debout.
      ctx.fillStyle = HW.coffin; ctx.beginPath(); ctx.moveTo(f.x + 8, f.y); ctx.lineTo(f.x + f.w - 8, f.y); ctx.lineTo(f.x + f.w, f.y + 20); ctx.lineTo(f.x + f.w - 4, f.y + f.h); ctx.lineTo(f.x + 4, f.y + f.h); ctx.lineTo(f.x, f.y + 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.term; ctx.lineWidth = 1.5; ctx.stroke();
      if (open) { ctx.fillStyle = HW.ecto; ctx.globalAlpha = 0.5 * open; ctx.fillRect(f.x + 6, f.y + 10, f.w - 12, f.h - 16); ctx.globalAlpha = 1; }
      ctx.fillStyle = C.term; ctx.fillRect(f.x + f.w / 2 - 1, f.y + 24, 2, 20); ctx.fillRect(f.x + f.w / 2 - 6, f.y + 30, 12, 2);
      return;
    }
    ctx.fillStyle = HW.moon; rr(f.x, f.y, f.w, f.h, 3); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    if (open) {
      ctx.fillStyle = '#fff6d0'; ctx.fillRect(f.x + 3, f.y + 3, f.w - 6, f.h - 6);
      ctx.fillStyle = C.line; for (let i = 1; i < 4; i++) ctx.fillRect(f.x + 4, f.y + i * 17, f.w - 8, 1.5);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#e0202a'; rr(f.x + 7 + i * 9, f.y + 22, 7, 11, 1); ctx.fill(); }
      // Porte ouverte vers la droite.
      ctx.save(); ctx.translate(f.x + f.w, f.y); ctx.transform(Math.cos(open * 1.1), 0, 0, 1, 0, 0);
      ctx.fillStyle = HW.moon; rr(0, 0, f.w, f.h, 3); ctx.fill(); ctx.strokeStyle = C.line; ctx.stroke();
      ctx.restore();
    } else {
      ctx.fillStyle = C.line; ctx.fillRect(f.x + 2, f.y + 26, f.w - 4, 1.5);
      ctx.fillStyle = C.mute; ctx.fillRect(f.x + f.w - 8, f.y + 8, 3, 14); ctx.fillRect(f.x + f.w - 8, f.y + 32, 3, 20);
    }
  }

  function drawWaves() {
    for (const w of waves) {
      const col = isHW() ? C.violet2 : C.term;
      const h = 10 + Math.min(10, w.t * 0.3);
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.9 - i * 0.3;
        ctx.beginPath(); ctx.ellipse(w.x - w.dir * i * 7, GROUND_Y, 6 + i * 2, h - i * 2, 0, Math.PI, 0); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  function drawCans() {
    for (const c of cans) {
      ctx.save(); ctx.translate(c.x + c.w / 2, c.y + c.h / 2); ctx.rotate(c.t * 0.15 * Math.sign(c.vx || 1));
      if (isHW()) {
        ctx.fillStyle = HW.ecto; rr(-5, -8, 10, 14, 3); ctx.fill();
        ctx.fillStyle = HW.coffin; ctx.fillRect(-2, -11, 4, 4);
        ctx.strokeStyle = C.paper; ctx.lineWidth = 1; rr(-5, -8, 10, 14, 3); ctx.stroke();
      } else {
        ctx.fillStyle = '#e0202a'; rr(-6, -9, 12, 18, 2); ctx.fill();
        ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(-6, -1); ctx.quadraticCurveTo(0, -5, 6, 0); ctx.lineTo(6, 2); ctx.quadraticCurveTo(0, -3, -6, 1); ctx.fill();
        ctx.fillStyle = C.mute; ctx.fillRect(-6, -9, 12, 1.5); ctx.fillRect(-6, 7.5, 12, 1.5);
        ctx.fillStyle = C.paper; ctx.font = `700 5px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COLA', 0, 5);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();
    }
  }
  function drawPuddles() {
    for (const pd of puddles) {
      ctx.globalAlpha = Math.min(1, pd.life / 20) * 0.9;
      ctx.fillStyle = isHW() ? HW.ecto : '#4a2a12';
      ctx.beginPath(); ctx.ellipse(pd.x + pd.w / 2, GROUND_Y - 1, pd.w / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = HW.moon;
      for (let i = 0; i < 3; i++) { const bx = pd.x + 8 + i * 14 + ((tick + i * 7) % 10 < 5 ? 2 : 0); ctx.beginPath(); ctx.arc(bx, GROUND_Y - 4 - ((tick + i * 5) % 12) * 0.3, 1.2, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
  }

  function drawWords() {
    if (!words.length) return;
    ctx.font = `700 18px ${F_DISPLAY}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    for (const w of words) {
      const cy = w.y + w.h / 2;
      const jx = w.t % 14 < 2 ? 3 : 0;
      if (isHW()) {
        // Ruben : rouge sang qui goutte. Carl : vert fantome.
        const carl = w.b && w.b.type === 'carl';
        const col = carl ? HW.ecto : HW.blood;
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = carl ? 14 : 8;
        ctx.fillStyle = col; ctx.fillText(w.txt, w.x + 4, cy);
        ctx.restore();
        if (!carl) { ctx.fillStyle = HW.blood; ctx.fillRect(w.x + 12, cy + 7, 2, 5 + (w.t % 20) / 4); ctx.fillRect(w.x + w.w - 18, cy + 7, 2, 3 + (w.t % 14) / 3); }
        continue;
      }
      ctx.fillStyle = C.violet; ctx.fillText(w.txt, w.x + 6 + jx, cy + 2);
      ctx.save(); ctx.shadowColor = C.violet2; ctx.shadowBlur = 12;
      ctx.fillStyle = C.violet3; ctx.fillText(w.txt, w.x + 4, cy);
      ctx.restore();
      ctx.fillStyle = C.ghost;
      ctx.fillRect(w.x - Math.sign(w.vx) * 10, cy - 1, w.w, 2);
    }
    ctx.textBaseline = 'alphabetic';
  }

  function drawProps() {
    for (const c of cps) {
      const x = c.x * T + 16, base = 13 * T;
      if (x < cam.x - 80 || x > cam.x + viewW + 80) continue;
      if (isHW()) {
        // Lanterne citrouille sur un piquet.
        ctx.fillStyle = HW.coffin; ctx.fillRect(x, base - 60, 3, 60);
        const py = base - 72;
        if (c.on) { ctx.save(); ctx.shadowColor = C.term; ctx.shadowBlur = 16; }
        ctx.fillStyle = c.on ? C.term : C.dim;
        ctx.beginPath(); ctx.ellipse(x + 1, py, 16, 13, 0, 0, Math.PI * 2); ctx.fill();
        if (c.on) ctx.restore();
        ctx.fillStyle = c.on ? HW.moon : C.ink;
        ctx.beginPath(); ctx.moveTo(x - 9, py - 2); ctx.lineTo(x - 3, py - 2); ctx.lineTo(x - 6, py - 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + 5, py - 2); ctx.lineTo(x + 11, py - 2); ctx.lineTo(x + 8, py - 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 8, py + 3); ctx.lineTo(x + 10, py + 3); ctx.lineTo(x + 7, py + 8); ctx.lineTo(x + 3, py + 5); ctx.lineTo(x - 1, py + 8); ctx.lineTo(x - 5, py + 5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = HW.ecto; ctx.fillRect(x - 1, py - 16, 4, 5);
        ctx.fillStyle = c.on ? C.term : C.mute; ctx.font = `700 10px ${F_MONO}`; ctx.textAlign = 'center';
        ctx.fillText(c.on ? 'SAVED' : 'SAVE', x + 1, base - 88);
        ctx.textAlign = 'left';
        continue;
      }
      ctx.fillStyle = c.on ? C.term : C.mute;
      ctx.fillRect(x, base - 84, 2, 84);
      const fw = 54, fh = 20;
      if (c.on) { ctx.save(); ctx.shadowColor = C.term; ctx.shadowBlur = 12; }
      ctx.fillStyle = c.on ? C.term : C.panel;
      rr(x + 2, base - 84, fw, fh, 2); ctx.fill();
      if (c.on) ctx.restore();
      if (!c.on) { ctx.strokeStyle = C.mute; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.fillStyle = c.on ? C.ink : C.mute; ctx.font = `700 11px ${F_MONO}`; ctx.textBaseline = 'middle';
      ctx.fillText(c.on ? 'SAVED' : 'SAVE', x + 9, base - 73);
      ctx.textBaseline = 'alphabetic';
    }
    const f = FINISH;
    const locked = bosses.some((b) => !b.dead);
    if (f.x < cam.x + viewW + 120 && isHW()) {
      // Grille de cimetiere : barreaux et pointes ; chaine et cadenas tant qu'un boss est debout.
      ctx.save(); if (!locked) { ctx.shadowColor = C.term; ctx.shadowBlur = 20; }
      ctx.strokeStyle = locked ? C.mute : C.term; ctx.lineWidth = 2;
      ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.beginPath();
      for (let i = 1; i < 5; i++) { const xx = f.x + i * (f.w / 5); ctx.moveTo(xx, f.y - 6); ctx.lineTo(xx, f.y + f.h); }
      ctx.moveTo(f.x, f.y + 24); ctx.lineTo(f.x + f.w, f.y + 24);
      ctx.stroke();
      ctx.fillStyle = locked ? C.mute : C.term;
      for (let i = 1; i < 5; i++) { const xx = f.x + i * (f.w / 5); ctx.beginPath(); ctx.moveTo(xx - 3, f.y - 5); ctx.lineTo(xx, f.y - 12); ctx.lineTo(xx + 3, f.y - 5); ctx.fill(); }
      ctx.restore();
      if (locked) {
        ctx.strokeStyle = HW.bone; ctx.lineWidth = 3; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(f.x - 4, f.y + 40); ctx.lineTo(f.x + f.w + 4, f.y + 56); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = C.term; rr(f.x + f.w / 2 - 7, f.y + 42, 14, 12, 2); ctx.fill();
        ctx.strokeStyle = C.term; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x + f.w / 2, f.y + 42, 5, Math.PI, 0); ctx.stroke();
      }
      ctx.fillStyle = locked ? C.mute : C.term; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center';
      ctx.fillText(locked ? '[ LOCKED ]' : '[ DEPLOY ]', f.x + f.w / 2, f.y - 18);
      ctx.textAlign = 'left';
    } else if (f.x < cam.x + viewW + 120 && locked) {
      ctx.fillStyle = C.panel; ctx.fillRect(f.x, f.y, f.w, f.h);
      ctx.strokeStyle = C.mute; ctx.lineWidth = 2; ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.beginPath();
      for (let i = 1; i < 4; i++) { ctx.moveTo(f.x, f.y + i * 24); ctx.lineTo(f.x + f.w, f.y + i * 24); }
      ctx.stroke();
      ctx.fillStyle = C.mute; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center';
      ctx.fillText('[ LOCKED ]', f.x + f.w / 2, f.y - 12);
      ctx.textAlign = 'left';
    } else if (f.x < cam.x + viewW + 120) {
      ctx.save();
      ctx.shadowColor = C.violet2; ctx.shadowBlur = 24;
      const g = ctx.createLinearGradient(0, f.y, 0, f.y + f.h);
      g.addColorStop(0, C.violet); g.addColorStop(1, C.faint);
      ctx.fillStyle = g; ctx.fillRect(f.x, f.y, f.w, f.h);
      ctx.restore();
      ctx.fillStyle = C.ghost;
      for (let y = 0; y < f.h; y += 6) {
        const yy = f.y + ((y + tick * 0.6) % f.h);
        ctx.fillRect(f.x + 4, yy, f.w - 8, 2);
      }
      ctx.strokeStyle = C.violet3; ctx.lineWidth = 2; ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.fillStyle = C.term; ctx.font = `700 12px ${F_MONO}`; ctx.textAlign = 'center';
      ctx.fillText('[ DEPLOY ]', f.x + f.w / 2, f.y - 12);
      ctx.textAlign = 'left';
    }
    ctx.font = `400 11px ${F_MONO}`;
    for (const s of SECTIONS) {
      const x = s.x * T;
      if (x < cam.x - 200 || x > cam.x + viewW) continue;
      ctx.fillStyle = C.violet3; ctx.fillText(s.label, x, 70);
    }
  }

  // Avatars. LOU : chignon brun, barbe fournie, pull noir. VIBCOBIDA : blonde, lunettes, verre de vin blanc.
  // Dessine face a droite autour de (o.x, o.y) = milieu des pieds, puis retourne selon o.face.
  // STREEP : grand et fin, l'air effraye, sac de sport noir en bandouliere, manette a la main, crocs bleues. Assis quand il joue.
  const CROCS = '#2d6cff', CROCS_DARK = '#1a3f9e';
  function drawStreep(c, o) {
    const w = o.w, h = o.h, g = o.glow, dead = o.dead, ph = o.ph, airborne = o.airborne, sit = !!o.sitting;
    const aura = dead ? C.dim : g === 1 ? C.violet : g === 2 ? C.violet2 : C.term;
    const lH = h * 0.2, bH = h * 0.34, hH = h * 0.56, hW = w * 0.9, tw = w * 0.74;
    const bodyTop = sit ? -(bH + 4) : -(lH + bH), headTop = bodyTop - hH + 3;
    const r = (x, y, ww, hh, rad) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, ww, hh, rad); else c.rect(x, y, ww, hh); };
    const head = () => r(-hW / 2, headTop, hW, hH, hW * 0.4);
    const torso = () => r(-tw / 2, bodyTop, tw, bH + 2, 4);
    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * (2 - o.sy), o.sy);
    if (dead) c.globalAlpha = 0.6;
    c.save();
    if (o.shadow) { c.shadowColor = aura; c.shadowBlur = (g === 3 ? 24 : 14) * (o.pulse || 1); }
    c.strokeStyle = aura; c.lineWidth = 2; torso(); c.stroke(); head(); c.stroke();
    c.restore();
    // Jambes : tendues devant quand il est assis, tremblantes sinon.
    c.fillStyle = C.pants;
    const legW = w * 0.22;
    // Position des pieds (x gauche, y du dessous) pour poser les crocs ensuite.
    let feet;
    if (sit) { c.fillRect(-w * 0.1, -8, w * 0.7, 8); c.fillRect(-w * 0.1, -9, legW, 9); feet = [[w * 0.6 - 2, 0, true]]; }
    else if (airborne) { c.fillRect(-w * 0.3, -lH, legW, lH * 0.8); c.fillRect(w * 0.08, -lH - 2, legW, lH * 0.8); feet = [[-w * 0.3, -lH * 0.2], [w * 0.08, -lH * 0.2 - 2]]; }
    else { const sh = Math.sin((o.tick || 0) * 0.9) * 0.6; const lx = -w * 0.28 + ph * 2.5 + sh, rx = w * 0.06 - ph * 2.5 - sh; c.fillRect(lx, -lH, legW, lH); c.fillRect(rx, -lH, legW, lH); feet = [[lx, 0], [rx, 0]]; }
    // Crocs bleues : sabot arrondi, trous sur le dessus, bride au talon.
    for (const [fx, fy, flat] of feet) {
      const cw = legW + 7, ch = 6;
      c.fillStyle = CROCS; r(fx - 2, fy - ch, cw, ch, 3); c.fill();
      c.fillStyle = CROCS_DARK;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(fx + 1.5 + i * 3, fy - ch + 1.6, 0.7, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = CROCS_DARK; c.lineWidth = 1; c.beginPath();
      if (flat) { c.moveTo(fx - 2, fy - ch + 1); c.lineTo(fx - 2, fy - 1); } else { c.moveTo(fx - 1, fy - ch + 1); c.lineTo(fx - 1, fy - 1); }
      c.stroke();
    }
    // Sac de sport noir derriere la hanche, sangle en diagonale sur le tee-shirt.
    c.fillStyle = C.sweater; torso(); c.fill();
    c.fillStyle = C.ink;
    if (sit) r(-w * 0.75, -10, 16, 10, 3); else r(-tw / 2 - 12, bodyTop + bH - 8, 16, 11, 3);
    c.fill();
    c.strokeStyle = C.dim; c.lineWidth = 1; c.beginPath(); c.moveTo(sit ? -w * 0.72 : -tw / 2 - 10, sit ? -6 : bodyTop + bH - 4); c.lineTo(sit ? -w * 0.6 : -tw / 2 + 1, sit ? -6 : bodyTop + bH - 4); c.stroke();
    c.strokeStyle = C.ink; c.lineWidth = 2.5; c.beginPath(); c.moveTo(tw * 0.35, bodyTop + 1); c.lineTo(-tw / 2 - 4, bodyTop + bH - 6); c.stroke();
    // Bras et manette.
    const skin = C.skinDark;
    c.save(); c.translate(tw * 0.42, bodyTop + 4);
    c.rotate(sit ? -1.2 : airborne ? -2.2 : -0.9 + Math.sin((o.tick || 0) * 0.7) * 0.08);
    c.fillStyle = skin; r(-2.5, 0, 5, bH * 0.7, 2.5); c.fill();
    c.translate(0, bH * 0.7); c.rotate(sit ? 1.2 : 0.9);
    c.fillStyle = C.mute; r(-5, -3, 10, 6, 2); c.fill();
    c.fillStyle = C.term; c.fillRect(-3, -1, 1.5, 1.5); c.fillRect(1.5, -1, 1.5, 1.5);
    c.restore();
    if (sit) {
      // L'ecran pose devant lui, reflet qui bat la mesure.
      c.fillStyle = C.ink; r(w * 0.35, -22, 16, 12, 1.5); c.fill();
      c.strokeStyle = C.term; c.lineWidth = 1; r(w * 0.35, -22, 16, 12, 1.5); c.stroke();
      c.fillStyle = C.term; c.globalAlpha *= 0.3 + 0.5 * (o.beat || 0); c.fillRect(w * 0.35 + 2, -20, 12, 8); c.globalAlpha /= (0.3 + 0.5 * (o.beat || 0)) || 1;
      c.fillStyle = C.mute; c.fillRect(w * 0.35 + 6, -10, 4, 3);
    }
    // Tete : peau foncee, cheveux courts, yeux ecarquilles, sourcils releves, bouche en o, goutte de sueur.
    c.fillStyle = skin; head(); c.fill();
    c.save(); head(); c.clip(); c.fillStyle = C.ink; c.fillRect(-hW / 2, headTop, hW, hH * 0.2); c.restore();
    const eyeY = headTop + hH * 0.42;
    c.fillStyle = C.paper;
    c.beginPath(); c.ellipse(hW * 0.1, eyeY, 3.2, dead ? 1 : 4.2, 0, 0, Math.PI * 2); c.ellipse(hW * 0.34, eyeY, 3.2, dead ? 1 : 4.2, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = C.ink;
    c.beginPath(); c.arc(hW * 0.12, eyeY - 1, 1.5, 0, Math.PI * 2); c.arc(hW * 0.36, eyeY - 1, 1.5, 0, Math.PI * 2); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(hW * 0.02, eyeY - 7); c.lineTo(hW * 0.16, eyeY - 9.5); c.moveTo(hW * 0.28, eyeY - 9.5); c.lineTo(hW * 0.42, eyeY - 7); c.stroke();
    c.beginPath(); c.ellipse(hW * 0.24, headTop + hH * 0.76, 2.2, 2.8, 0, 0, Math.PI * 2); c.fillStyle = C.ink; c.fill();
    const sw = ((o.tick || 0) % 50) * 0.25;
    c.fillStyle = C.violet3; c.beginPath(); c.ellipse(-hW * 0.4, headTop + hH * 0.3 + sw, 1.6, 2.6, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  function drawAvatar(c, o) {
    if (o.hero === 'streep') return drawStreep(c, o);
    const w = o.w, h = o.h, g = o.glow, dead = o.dead, ph = o.ph, airborne = o.airborne;
    const vib = o.hero === 'vibcobida', kardo = o.hero === 'kardo', moko = o.hero === 'moko';
    const aura = dead ? C.dim : g === 1 ? C.violet : g === 2 ? C.violet2 : C.term;
    const lH = h * 0.16, bH = h * 0.33, hH = h * (moko ? 0.58 : 0.53), hW = w * (kardo ? 1.3 : moko ? 0.9 : 1.04);
    const bodyTop = -(lH + bH), headTop = bodyTop - hH + 3, headBot = headTop + hH;
    const bunX = -hW * 0.47, bunY = headTop + hH * 0.3, bunR = hW * 0.2;
    const hw = isHW();
    // Halloween : LOU zombie, VIBCOBIDA sorciere, KARDO creature de Frankenstein, MOKO momie.
    const skin = hw ? (kardo ? HW.frank : moko ? C.skinDark : vib ? C.skin : HW.zombie) : (moko ? C.skinDark : C.skin);
    const top = kardo ? C.shirt : moko ? C.jersey : C.sweater;
    const tw = moko ? w * 0.76 : w * 0.92;
    const r = (x, y, ww, hh, rad) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, ww, hh, rad); else c.rect(x, y, ww, hh); };
    const head = () => r(-hW / 2, headTop, hW, hH, kardo ? 4 : hW * 0.42);
    const torso = () => r(-tw / 2, bodyTop, tw, bH + 2, 4);
    const mane = () => r(-hW * 0.62, headTop + 2, hW * 1.1, hH + bH * 0.55, hW * 0.3);

    c.save();
    c.translate(o.x, o.y);
    c.scale(o.face * (2 - o.sy), o.sy);
    if (dead) c.globalAlpha = 0.6;

    c.save();
    if (o.shadow) { c.shadowColor = aura; c.shadowBlur = (g === 3 ? 24 : 14) * (o.pulse || 1); }
    c.strokeStyle = aura; c.lineWidth = 2;
    torso(); c.stroke();
    if (vib) { mane(); c.stroke(); }
    else { head(); c.stroke(); if (!kardo && !moko) { c.beginPath(); c.arc(bunX, bunY, bunR, 0, Math.PI * 2); c.stroke(); } }
    c.restore();

    if (vib) { c.fillStyle = C.blonde; mane(); c.fill(); }

    c.fillStyle = C.pants;
    const legW = w * 0.24;
    if (airborne) {
      c.fillRect(-w * 0.3, -lH, legW, lH * 0.8);
      c.fillRect(w * 0.06, -lH - 2, legW, lH * 0.8);
    } else {
      c.fillRect(-w * 0.28 + ph * 2.5, -lH, legW, lH);
      c.fillRect(w * 0.04 - ph * 2.5, -lH, legW, lH);
    }

    c.fillStyle = top; torso(); c.fill();
    if (hw && !vib && !kardo && !moko) {
      // Pull dechire : deux encoches en bas.
      c.fillStyle = skin;
      c.beginPath(); c.moveTo(-tw * 0.3, bodyTop + bH + 2); c.lineTo(-tw * 0.22, bodyTop + bH - 4); c.lineTo(-tw * 0.14, bodyTop + bH + 2); c.fill();
      c.beginPath(); c.moveTo(tw * 0.1, bodyTop + bH + 2); c.lineTo(tw * 0.2, bodyTop + bH - 5); c.lineTo(tw * 0.3, bodyTop + bH + 2); c.fill();
    }
    if (hw && moko) {
      // Bandages en diagonale sur le torse et les jambes.
      c.fillStyle = HW.bandage;
      for (let i = 0; i < 3; i++) { c.save(); c.translate(0, bodyTop + 6 + i * 9); c.rotate(-0.25); c.fillRect(-tw * 0.6, -1.5, tw * 1.2, 3); c.restore(); }
      c.fillRect(-w * 0.3, -lH + 3, w * 0.6, 2.5); c.fillRect(-w * 0.3, -lH + 9, w * 0.6, 2.5);
    }
    if (kardo) {
      // Chemise : col en V et boutons.
      c.fillStyle = C.collar; c.beginPath(); c.moveTo(-5, bodyTop); c.lineTo(0, bodyTop + 7); c.lineTo(5, bodyTop); c.closePath(); c.fill();
      c.fillStyle = C.dim; c.fillRect(-1, bodyTop + 10, 2, 2); c.fillRect(-1, bodyTop + 16, 2, 2);
    } else if (moko) {
      // Maillot : deux bandes orange.
      c.fillStyle = C.jersey2; c.fillRect(-tw / 2, bodyTop + 6, tw, 3); c.fillRect(-tw / 2, bodyTop + 14, tw, 3);
    }
    c.save();
    c.translate(w * 0.2, bodyTop + 3);
    c.rotate(vib ? (airborne ? -1.6 : -2.2 + ph * 0.15) : kardo ? -2.6 : (airborne ? -1.1 : hw && !moko ? -1.5 : ph * 0.5));
    c.fillStyle = kardo ? C.shirt : moko ? C.jersey : C.collar; r(-2.5, 0, 5, bH * (kardo ? 0.6 : 0.78), 2.5); c.fill();
    c.fillStyle = skin; c.beginPath(); c.arc(0, bH * (kardo ? 0.6 : 0.78), 2.4, 0, Math.PI * 2); c.fill();
    if (kardo) {
      // Telephone contre l'oreille.
      c.translate(0, bH * 0.6); c.rotate(2.6);
      c.fillStyle = C.phone; r(-2.5, -11, 5, 10, 1); c.fill();
      c.fillStyle = C.term; c.fillRect(-1, -9, 2, 2);
    }
    if (vib) {
      // Verre de vin blanc dans la main, toujours tenu droit.
      c.translate(0, bH * 0.78);
      c.rotate(-(airborne ? -1.6 : -2.2 + ph * 0.15));
      c.strokeStyle = C.paper; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -6); c.moveTo(-3, 0.5); c.lineTo(3, 0.5); c.stroke();
      const lvl = Math.max(0, Math.min(1, (o.sips === undefined ? 3 : o.sips) / 3));
      if (hw) {
        // Fiole de potion verte qui bouillonne.
        c.fillStyle = C.ink; r(-5, -14, 10, 11, 3); c.fill();
        if (lvl > 0) { c.fillStyle = HW.ecto; r(-4, -13 + (1 - lvl) * 8, 8, 9 - (1 - lvl) * 8, 2); c.fill(); }
        c.fillStyle = HW.coffin; c.fillRect(-2, -18, 4, 5);
        c.strokeStyle = C.paper; c.lineWidth = 1; r(-5, -14, 10, 11, 3); c.stroke();
        if (lvl > 0 && o.tick !== undefined) { c.fillStyle = HW.ecto; for (let i = 0; i < 3; i++) { const by = -14 - ((o.tick * 0.4 + i * 7) % 12); c.beginPath(); c.arc(-2 + i * 2, by, 1.2, 0, Math.PI * 2); c.fill(); } }
      } else {
      if (lvl > 0) { c.fillStyle = C.wine; c.beginPath(); c.moveTo(-4, -8); c.lineTo(4, -8); c.lineTo(3.4 + lvl * 0.6, -8 - lvl * 5); c.lineTo(-3.4 - lvl * 0.6, -8 - lvl * 5); c.closePath(); c.fill(); }
      if (lvl >= 1) { c.save(); c.shadowColor = C.term; c.shadowBlur = 8; c.strokeStyle = C.term; c.beginPath(); c.moveTo(-4.5, -14); c.quadraticCurveTo(-4.5, -4, 0, -6); c.quadraticCurveTo(4.5, -4, 4.5, -14); c.stroke(); c.restore(); }
      c.strokeStyle = C.paper; c.beginPath(); c.moveTo(-4.5, -14); c.quadraticCurveTo(-4.5, -4, 0, -6); c.quadraticCurveTo(4.5, -4, 4.5, -14); c.stroke();
      }
    }
    c.restore();
    if (!kardo) {
      c.strokeStyle = moko ? C.jersey2 : C.collar; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(w * 0.06, bodyTop + 1.5, w * 0.22, 2.2, 0, 0, Math.PI); c.stroke();
    }

    if (!vib && !kardo && !moko) { c.fillStyle = C.hair; c.beginPath(); c.arc(bunX, bunY, bunR, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = skin; head(); c.fill();

    c.save();
    head(); c.clip();
    if (kardo && hw) {
      // Cheveux noirs plats et cicatrice au front.
      c.fillStyle = C.ink; c.fillRect(-hW / 2, headTop, hW, hH * 0.18);
      c.strokeStyle = C.beard; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-hW * 0.3, headTop + hH * 0.26); c.lineTo(-hW * 0.02, headTop + hH * 0.3);
      for (let i = 0; i < 3; i++) { const sx = -hW * 0.26 + i * hW * 0.1; c.moveTo(sx, headTop + hH * 0.22); c.lineTo(sx + 1, headTop + hH * 0.34); }
      c.stroke();
    } else if (kardo) {
      // Brosse blonde.
      c.fillStyle = C.blonde;
      c.fillRect(-hW / 2, headTop, hW, hH * 0.2);
      for (let i = 0; i < 4; i++) { const x = -hW / 2 + 3 + i * (hW - 6) / 3; c.beginPath(); c.moveTo(x - 3, headTop + 1); c.lineTo(x, headTop - 5); c.lineTo(x + 3, headTop + 1); c.fill(); }
    } else if (moko) {
      // Casquette a l'envers : calotte, la visiere est dessinee apres hors du clip.
      c.fillStyle = C.cap; c.fillRect(-hW / 2, headTop, hW, hH * 0.26);
      c.fillStyle = C.jersey; c.fillRect(-hW / 2, headTop + hH * 0.2, hW, 2);
    } else if (vib) {
      // Frange blonde sur le cote.
      c.fillStyle = C.blonde;
      c.beginPath();
      c.moveTo(-hW / 2, headTop); c.lineTo(hW / 2, headTop); c.lineTo(hW / 2, headTop + hH * 0.18);
      c.quadraticCurveTo(hW * 0.15, headTop + hH * 0.08, -hW * 0.1, headTop + hH * 0.34);
      c.lineTo(-hW / 2, headTop + hH * 0.42);
      c.closePath(); c.fill();
    } else {
      c.fillStyle = C.hair;
      c.beginPath();
      c.moveTo(-hW / 2, headTop);
      c.lineTo(hW / 2, headTop);
      c.lineTo(hW / 2, headTop + hH * 0.22);
      c.quadraticCurveTo(hW * 0.1, headTop + hH * 0.14, -hW * 0.16, headTop + hH * 0.3);
      c.lineTo(-hW * 0.2, headTop + hH * 0.56);
      c.lineTo(-hW / 2, headTop + hH * 0.62);
      c.closePath(); c.fill();
      c.fillStyle = C.beard;
      c.beginPath();
      c.moveTo(-hW * 0.26, headTop + hH * 0.46);
      c.lineTo(-hW * 0.08, headTop + hH * 0.64);
      c.quadraticCurveTo(hW * 0.22, headTop + hH * 0.56, hW / 2, headTop + hH * 0.62);
      c.lineTo(hW / 2, headBot);
      c.lineTo(-hW / 2, headBot);
      c.lineTo(-hW / 2, headTop + hH * 0.5);
      c.closePath(); c.fill();
    }
    c.restore();
    if (moko) {
      // Visiere vers l'arriere.
      c.fillStyle = C.cap; r(-hW / 2 - 9, headTop + hH * 0.14, 11, 5, 2); c.fill();
    }
    if (hw && kardo) {
      // Boulons dans le cou.
      c.fillStyle = C.mute;
      c.fillRect(-hW / 2 - 4, headBot - 7, 5, 4); c.fillRect(hW / 2 - 1, headBot - 7, 5, 4);
      c.fillStyle = C.dim; c.fillRect(-hW / 2 - 4, headBot - 6, 2, 2); c.fillRect(hW / 2 + 2, headBot - 6, 2, 2);
    }
    if (hw && vib) {
      // Chapeau de sorciere : bord large, cone penche, bande orange.
      c.fillStyle = HW.hat;
      r(-hW * 0.75, headTop - 2, hW * 1.5, 5, 2); c.fill();
      c.beginPath(); c.moveTo(-hW * 0.42, headTop); c.lineTo(hW * 0.42, headTop); c.lineTo(hW * 0.18, headTop - hH * 0.75); c.lineTo(-hW * 0.05, headTop - hH * 1.05); c.closePath(); c.fill();
      c.fillStyle = C.term; c.fillRect(-hW * 0.4, headTop - 7, hW * 0.8, 4);
    }
    if (hw && moko) {
      // Bandeau sur l'oeil et bandages sur le crane.
      c.fillStyle = HW.bandage;
      c.save(); c.translate(0, headTop + hH * 0.48); c.rotate(-0.2); c.fillRect(-hW * 0.55, -2, hW * 0.62, 4.5); c.restore();
      c.save(); c.translate(0, headTop + hH * 0.6); c.rotate(0.15); c.fillRect(-hW * 0.55, -1.5, hW * 1.1, 3); c.restore();
    }
    if (hw && !vib && !kardo && !moko) {
      // Zombie : cerne violet sous un oeil, cicatrice cousue sur la joue.
      c.fillStyle = C.violet2; c.globalAlpha *= 0.5; c.fillRect(hW * 0.26, headTop + hH * 0.46, 7, 3); c.globalAlpha /= 0.5;
      c.strokeStyle = C.beard; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-hW * 0.36, headTop + hH * 0.5); c.lineTo(-hW * 0.1, headTop + hH * 0.58);
      for (let i = 0; i < 3; i++) { const sx = -hW * 0.33 + i * hW * 0.1; c.moveTo(sx, headTop + hH * 0.46); c.lineTo(sx + 1.5, headTop + hH * 0.62); }
      c.stroke();
    }
    if (!vib && !kardo && !moko) {
      c.fillStyle = C.beard;
      c.beginPath(); c.ellipse(hW * 0.1, headBot - 1, hW * 0.34, hH * 0.16, 0, 0, Math.PI); c.fill();
      c.fillStyle = C.skin;
      c.beginPath(); c.ellipse(-hW * 0.2, headTop + hH * 0.44, 2.2, 3.2, 0, 0, Math.PI * 2); c.fill();
    }
    if (kardo) {
      // Bouche entrouverte : il parle.
      c.fillStyle = C.beard; c.beginPath(); c.ellipse(hW * 0.22, headTop + hH * 0.74, 4, 2 + (o.talk ? Math.abs(Math.sin(o.talk)) * 2 : 1), 0, 0, Math.PI * 2); c.fill();
    } else if (moko) {
      // Grand sourire.
      c.strokeStyle = C.paper; c.lineWidth = 1.6; c.beginPath(); c.arc(hW * 0.2, headTop + hH * 0.66, 6, 0.15, Math.PI - 0.15); c.stroke();
    } else {
      c.fillStyle = vib ? C.cheek : C.paper;
      r(hW * 0.1, headTop + hH * (vib ? 0.76 : 0.7), hW * 0.3, 2.4, 1.2); c.fill();
    }
    const a0 = c.globalAlpha;
    c.globalAlpha = a0 * 0.65;
    c.fillStyle = C.cheek;
    c.beginPath(); c.arc(hW * 0.02, headTop + hH * 0.56, 2.2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(hW * 0.42, headTop + hH * 0.56, 2, 0, Math.PI * 2); c.fill();
    c.globalAlpha = a0;
    const eyeY = headTop + hH * 0.4;
    const eh = dead ? 1 : o.blink ? 0.8 : 2.6;
    c.fillStyle = moko ? C.ink : C.beard;
    c.fillRect(hW * 0.06, eyeY, 2.2, eh);
    c.fillRect(hW * 0.3, eyeY, 2.2, eh);
    c.fillStyle = kardo ? C.blonde : moko ? C.ink : C.beard;
    c.fillRect(hW * 0.02, eyeY - 3.4, 5, 1.7);
    c.fillRect(hW * 0.26, eyeY - 3.4, 5, 1.7);
    if (vib) {
      // Lunettes.
      c.strokeStyle = C.paper; c.lineWidth = 1.2;
      r(hW * 0.01, eyeY - 2.5, 7, 6.5, 2); c.stroke();
      r(hW * 0.25, eyeY - 2.5, 7, 6.5, 2); c.stroke();
      c.beginPath(); c.moveTo(hW * 0.01 + 7, eyeY + 0.5); c.lineTo(hW * 0.25, eyeY + 0.5); c.moveTo(hW * 0.01, eyeY); c.lineTo(-hW * 0.3, eyeY - 1); c.stroke();
    }
    c.restore();
  }

  function drawHeroPreview(cv, id) {
    const c = cv.getContext('2d');
    if (!c) return;
    c.clearRect(0, 0, cv.width, cv.height);
    drawAvatar(c, { hero: id, w: 30, h: 44, x: cv.width / 2, y: cv.height - 10, face: 1, sy: 1, glow: 2, dead: false, pulse: 1, ph: 0, airborne: false, blink: false, shadow: true });
  }

  function drawPlayer() {
    const pk = HERO().power.key;
    const visio = pk === 'visio' && p.powT > 0;
    if (!visio && !(isDev() && devGod) && p.inv > 0 && state === 'play' && Math.floor(p.inv / 4) % 2 === 0) return;
    if (visio) {
      // Invisible : silhouette a 30 %, qui reapparait par paliers sur la fin.
      ctx.save();
      ctx.globalAlpha = p.powT < 30 && Math.floor(p.powT / 5) % 2 === 0 ? 0.8 : 0.3;
      drawPlayerBody();
      ctx.restore();
      ctx.save();
      ctx.font = `700 11px ${F_MONO}`; ctx.textAlign = 'center'; ctx.fillStyle = C.term;
      ctx.globalAlpha = 0.6 + 0.4 * beatP;
      ctx.fillText('[ EN VISIO ]', p.x + p.w / 2, p.y - 16);
      ctx.restore();
      ctx.textAlign = 'left';
      return;
    }
    drawPlayerBody();
    if (shields.length) {
      ctx.save();
      ctx.font = `700 10px ${F_MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const s of shields) {
        if (s.x === undefined) continue;
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(Math.sin(s.a) * 0.3);
        ctx.shadowColor = C.jersey2; ctx.shadowBlur = 10;
        ctx.fillStyle = C.jersey2; ctx.fillText('weeeeesssshh', 0, 0);
        ctx.restore();
      }
      ctx.restore();
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
  }

  function drawPlayerBody() {
    const g = p.glow, dead = state === 'dead';
    const aura = dead ? C.dim : g === 1 ? C.violet : g === 2 ? C.violet2 : C.term;
    const sh = p.h * p.sy, sw = p.w * (2 - p.sy);
    const x = p.x + p.w / 2 - sw / 2, y = p.y + p.h - sh;
    const pulse = state === 'freeze' ? 1 + Math.sin(tick * 0.6) * 0.5 : 1;

    const moving = p.ground && Math.abs(p.vx) > 0.4 && !dead;
    drawAvatar(ctx, {
      hero, w: p.w, h: p.h, x: p.x + p.w / 2, y: p.y + p.h, face: p.face, sy: p.sy, glow: g, dead, pulse,
      ph: moving ? Math.sin(p.run) : 0, airborne: !p.ground && !dead, blink: (tick % 200) < 6, shadow: g >= 2 && !dead, sips: p.sips, talk: tick * 0.3, tick, sitting: HERO().power.key === 'gamer' && p.powT > 0, beat: beatP,
    });

    if (g >= 2 && !dead) {
      ctx.strokeStyle = g === 3 ? C.term : C.violet3; ctx.lineWidth = 1.5;
      const k = 5, m = 8;
      ctx.beginPath();
      ctx.moveTo(x - m + k, y - 3); ctx.lineTo(x - m, y - 3); ctx.lineTo(x - m, y + sh + 1); ctx.lineTo(x - m + k, y + sh + 1);
      ctx.moveTo(x + sw + m - k, y - 3); ctx.lineTo(x + sw + m, y - 3); ctx.lineTo(x + sw + m, y + sh + 1); ctx.lineTo(x + sw + m - k, y + sh + 1);
      ctx.stroke();
    }
    if (g === 3 && !dead && tick % 60 < 30) { ctx.fillStyle = C.term; ctx.fillRect(x + sw / 2 - 5, y - 10, 10, 2); }
  }

  function drawParticles() {
    for (const pt of particles) {
      const a = pt.life / pt.max;
      ctx.globalAlpha = a;
      if (pt.txt) {
        ctx.fillStyle = pt.c;
        ctx.font = pt.big ? `700 26px ${F_DISPLAY}` : `700 12px ${F_MONO}`;
        ctx.textAlign = 'center';
        ctx.fillText(pt.txt, pt.x, pt.y);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = pt.c;
        ctx.fillRect(pt.x - pt.s / 2, pt.y - pt.s / 2, pt.s, pt.s);
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    drawBg();
    const sx = reduceMotion ? 0 : (Math.random() - 0.5) * cam.shake;
    const sy = reduceMotion ? 0 : (Math.random() - 0.5) * cam.shake;
    ctx.save();
    ctx.translate(-Math.round(cam.x) + sx, sy);
    drawProps();
    drawTiles();
    drawPads();
    drawSpikes();
    drawLetters();
    drawEnemies();
    drawFridge();
    drawPuddles();
    for (const b of bosses) drawBoss(b);
    drawWords();
    drawWaves();
    drawCans();
    drawPlayer();
    drawParticles();
    ctx.restore();
    if (flash > 0 && !reduceMotion) {
      ctx.globalAlpha = flash * 0.35; ctx.fillStyle = C.term; ctx.fillRect(0, 0, viewW, H); ctx.globalAlpha = 1;
    }
    if (state === 'dead') {
      ctx.globalAlpha = 0.25; ctx.fillStyle = C.ink; ctx.fillRect(0, 0, viewW, H); ctx.globalAlpha = 1;
    }
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    const sw = Math.max(200, r.width), sh = Math.max(160, r.height);
    // Mobile en paysage : on reserve les cotes aux boutons tactiles pour qu'ils ne couvrent pas le sol.
    const coarse = matchMedia('(pointer: coarse)').matches;
    const gutter = coarse && sw > sh ? 150 : 0;
    scale = Math.min(sh / H, (sw - 2 * gutter) / 560);
    viewW = Math.min((sw - 2 * gutter) / scale, 1280);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = Math.floor(viewW * scale) + 'px';
    canvas.style.height = Math.floor(H * scale) + 'px';
    canvas.width = Math.floor(viewW * scale * dpr);
    canvas.height = Math.floor(H * scale * dpr);
    if (p) cam.x = Math.max(0, Math.min(COLS * T - viewW, cam.x));
  }
  new ResizeObserver(resize).observe(stage);

  let last = performance.now(), acc = 0;
  const STEP = 1000 / 60;
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    let n = 0;
    while (acc >= STEP && n < 6) { step(); acc -= STEP; n++; }
    draw();
    requestAnimationFrame(frame);
  }

  reset();
  resize();
  showTitle();
  if (window.AntoukaQuiz) AntoukaQuiz.load().catch(() => {});
  // Crochet de debug, seulement avec ?debug dans l'URL : teleportation et raccourcis pour les captures.
  if (window.location && /[?&]debug/.test(window.location.search)) {
    window.ANTOUKA_DEBUG = {
      tp(col) { p.x = col * T; p.y = 13 * T - p.h; p.vy = 0; cam.x = Math.max(0, p.x - viewW * 0.4); },
      kill(type) { for (const b of bosses) if (!type || b.type === type) { b.dead = true; b.quizDone = true; } },
      inv(v) { p.inv = v ? 999999 : 0; },
      glow(n) { setGlow(n, 'up'); state = 'play'; },
      haunt() { haunt(); },
      get state() { return state; }, get boss() { return bosses.map((b) => ({ type: b.type, mode: b.mode, active: b.active, hp: b.hp })); },
    };
  }
  if (window.AntoukaBoard) AntoukaBoard.flush().catch(() => {});
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load(`700 24px ${F_DISPLAY}`), document.fonts.load(`700 12px ${F_MONO}`)]).catch(() => {});
  }
  requestAnimationFrame(frame);
})();
