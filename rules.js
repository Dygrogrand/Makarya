/* Makarya — oyun kuralları (arayüzden bağımsız, simülasyonla test edilebilir) */

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function newState() {
  var stats = {};
  STATS.forEach(function (k) { stats[k] = BASE_STAT; });
  return { v: 5, screen: "start", gender: "erkek", family: null, ch: 1, plan: [], pi: 0, stats: stats, famStats: null,
    traits: [], flags: [], log: [], chStart: {}, chTraits: {}, last: null, lock: null, dead: null };
}

/* ── Hayat planı: her perdede sabit dönüm noktaları + havuzdan rastgele olaylar ── */
var EV_BY_ID = {};
EVENTS.forEach(function (e, i) { e._i = i; EV_BY_ID[e.id] = e; });
function ageMonths(a) {
  var y = /(\d+)\s*yaş/.exec(a), m = /(\d+)\s*ay/.exec(a);
  return (y ? +y[1] * 12 : 0) + (m ? +m[1] : 0);
}
EVENTS.forEach(function (e) { e._m = ageMonths(e.age); });
/* when: { fam: [..], gender: "kiz", trait: "..", flag: "..", notFlag: "..", minStat: {stat: n} } */
function eligible(S, e) {
  var w = e.when; if (!w) return true;
  if (w.fam && w.fam.indexOf(S.family) < 0) return false;
  if (w.gender && w.gender !== S.gender) return false;
  if (w.trait && S.traits.indexOf(w.trait) < 0) return false;
  if (w.flag && S.flags.indexOf(w.flag) < 0) return false;
  if (w.notFlag && S.flags.indexOf(w.notFlag) >= 0) return false;
  for (var k in (w.minStat || {})) if (S.stats[k] < w.minStat[k]) return false;
  return true;
}
function buildPlan(S, ch, rnd) {
  rnd = rnd || Math.random;
  var pool = EVENTS.filter(function (e) { return e.ch === ch && eligible(S, e); });
  var fixed = pool.filter(function (e) { return e.fixed; });
  var rest = pool.filter(function (e) { return !e.fixed; })
    .map(function (e) { return { e: e, k: Math.pow(rnd(), 1 / (e.weight || 1)) }; })
    .sort(function (a, b) { return b.k - a.k; }).map(function (x) { return x.e; });
  var n = Math.max(0, (CHAPTERS[ch].pick || pool.length) - fixed.length);
  return fixed.concat(rest.slice(0, n)).sort(function (a, b) { return a._m - b._m || a._i - b._i; }).map(function (e) { return e.id; });
}
function hasChapter(ch) { return !!CHAPTERS[ch] && EVENTS.some(function (e) { return e.ch === ch; }); }
function curEvent(S) { return EV_BY_ID[S.plan[S.pi]]; }

function applyFamily(S, name) {
  S.family = name;
  var m = FAMILIES[name].mods;
  STATS.forEach(function (k) { S.stats[k] = clamp(S.stats[k] + (m[k] || 0), 0, 100); });
  S.famStats = Object.assign({}, S.stats);
}

function hasReq(S, c, e) {
  if (c.req && S.traits.indexOf(c.req) < 0) return false;
  if (c.reqFlag && S.flags.indexOf(c.reqFlag) < 0) return false;
  if (c.reqVoice) {
    var ok = e && eventVoices(S, e).some(function (v) { return v.stat === c.reqVoice && v.pass; });
    if (!ok) return false;
  }
  return true;
}

/* İç sesler: zar atılmadan, stat yeterliyse araya giren pasif kontroller */
var PASSIVE = { easy: -3, medium: 1, hard: 5, veryHard: 9 };
var VOICE_NAMES = { "Akıl": "AKIL", "Çene": "ÇENE", "Kurnazlık": "KURNAZLIK", "Cesaret": "CESARET", "Pişkinlik": "PİŞKİNLİK", "Vicdan": "VİCDAN", "Dayanıklılık": "DAYANIKLILIK", "Sosyal Radar": "SOSYAL RADAR" };
function voicePower(S, stat) {
  var p = S.stats[stat];
  S.traits.forEach(function (t) { p += 2 * (((TRAITS[t] || {}).bonus || {})[stat] || 0); });
  if (S.family) FAMILIES[S.family].traits.forEach(function (t) { p += 2 * ((t.stats || {})[stat] || 0); });
  return p;
}
function eventVoices(S, e) {
  return (e.voices || []).map(function (v) {
    var need = CHAPTERS[e.ch].expected + PASSIVE[v.diff];
    return { stat: v.stat, diff: v.diff, text: v.text, fail: v.fail, opens: v.opens, pass: voicePower(S, v.stat) >= need };
  });
}

/* Ailenin bu olay türünde bu stat için verdiği avantaj (hedef puanından düşülür) */
function familyEventBonus(S, e, stat) {
  if (!e.fam || !S.family) return 0;
  var f = FAMILIES[S.family];
  var aff = ((f.eff[e.fam] || {})[stat]) || 0;
  if (aff >= 3) return 3;
  if (aff >= 2) return 2;
  if (aff >= 1 || (f.mods[stat] || 0) >= 6) return 1;
  return 0;
}

/* Hedef zarın bileşenleri: her satır oyuncuya açıkça gösterilir */
function needBreakdown(S, e, c) {
  var d = DIFF[c.diff], ch = CHAPTERS[e.ch], rows = [];
  var base = d.base + ch.step;
  rows.push({ icon: "🎯", label: d.label + " zorluk", val: base, kind: "base" });
  var st = S.stats[c.stat];
  var statAdj = -Math.round((st - ch.expected) / 4);
  if (statAdj) rows.push({ icon: STAT_ICONS[c.stat], label: c.stat + " " + st + (statAdj < 0 ? " (beklenenin üstünde)" : " (beklenenin altında)"), val: statAdj, kind: "stat" });
  var fb = familyEventBonus(S, e, c.stat);
  if (fb) rows.push({ icon: "🏠", label: S.family + " ailesi etkisi", val: -fb, kind: "family" });
  if (S.family) FAMILIES[S.family].traits.forEach(function (t) {
    var v = (t.stats || {})[c.stat] || 0;
    if (v) rows.push({ icon: t.good ? "🏠" : "⚠️", label: t.name, val: -v, kind: "famtrait" });
  });
  var tsum = 0, trows = [];
  S.traits.forEach(function (t) {
    var v = ((TRAITS[t] || {}).bonus || {})[c.stat] || 0;
    if (v) { trows.push({ icon: "⭐", label: t, val: -v, kind: "trait" }); tsum += v; }
  });
  if (tsum > 3) { trows.push({ icon: "⭐", label: "Özellik tavanı (en fazla −3)", val: tsum - 3, kind: "cap" }); }
  rows = rows.concat(trows);
  var total = rows.reduce(function (s, r) { return s + r.val; }, 0);
  return { rows: rows, need: clamp(total, 2, 20), famBonus: fb };
}

function successChance(need) { return need <= 2 ? 0.95 : (21 - need) / 20; }

function rollOutcome(r, need) {
  if (r === 20) return "crit";
  if (r === 1) return "bad";
  return r >= need ? "win" : "fail";
}

function miniOutcome(score) {
  score = clamp(score, 0, 1);
  if (score >= 0.9) return "crit";
  if (score >= 0.68) return "win";
  if (score >= 0.48) return "mid";
  if (score >= 0.25) return "fail";
  return "bad";
}

/* Mini oyunda karakterin gücü: pencereyi genişletir, süreyi uzatır (−0,1 … 0,35) */
function miniAssist(S, e, c) {
  var b = needBreakdown(S, e, c);
  var helpers = b.rows.filter(function (r) { return r.kind !== "base" && r.kind !== "stat"; })
    .reduce(function (s, r) { return s - r.val; }, 0);
  var st = (S.stats[c.stat] - CHAPTERS[e.ch].expected) / 50;
  return clamp(st + helpers * 0.03, -0.1, 0.35);
}

var DEFAULT_TEXT = {
  crit: "Mükemmel. O an tamamen senindi.", win: "İstediğini yaptın.",
  mid: "Tam istediğin gibi olmadı ama kötü de değildi.", fail: "Bu kez olmadı.", bad: "İşler beklediğinden çok daha kötü gitti."
};

function gainTrait(S, t, res) {
  if (t && S.traits.indexOf(t) < 0) { S.traits.push(t); res.traits.push(t); }
}
function addFlag(S, f) { if (f && S.flags.indexOf(f) < 0) S.flags.push(f); }
function addStat(S, k, v, res) {
  if (!v) return;
  S.stats[k] = clamp(S.stats[k] + v, 0, 100);
  res.deltas.push([k, v]);
}

/* Seçimin sonucunu uygula. outcome: direct | crit | win | mid | fail | bad */
function applyOutcome(S, e, c, outcome, extra) {
  var res = { outcome: outcome, deltas: [], traits: [], note: "", text: "" };
  extra = extra || {};
  addFlag(S, c.flag);
  if (outcome === "direct") {
    for (var k in (c.direct || {})) addStat(S, k, c.direct[k], res);
    gainTrait(S, c.trait, res);
    res.text = c.r;
  } else {
    var d = DIFF[c.diff];
    var success = outcome === "crit" || outcome === "win";
    if (outcome === "crit") addStat(S, c.stat, d.crit, res);
    else if (outcome === "win") addStat(S, c.stat, d.succ, res);
    else if (outcome === "bad") addStat(S, c.stat, -d.loss, res);
    if (success) {
      addFlag(S, c.flagWin);
      gainTrait(S, c.trait, res);
      if (!c.trait && (outcome === "crit" || c.diff === "hard" || c.diff === "veryHard")) gainTrait(S, AUTO_TRAITS[c.stat], res);
    }
    if (outcome === "bad") addFlag(S, c.flagBad);
    if (outcome === "fail" && (c.diff === "hard" || c.diff === "veryHard") && c.stat !== "Dayanıklılık") {
      addStat(S, "Dayanıklılık", 1, res);
      res.note = "Kaybetmek de antrenmandır.";
    }
    var r = c.r || {};
    res.text = r[outcome] || (outcome === "crit" ? r.win : null) || (outcome === "mid" ? r.fail : null) || DEFAULT_TEXT[outcome];
  }
  if (c.risk && (extra.deathRoll != null ? extra.deathRoll : Math.random()) < c.risk.p) {
    res.death = c.risk.cause;
    S.dead = { cause: c.risk.cause, age: e.age, title: e.title };
  }
  S.log.push({ id: e.id, ch: e.ch, age: e.age, title: e.title, choice: c.t, outcome: outcome, roll: extra.roll || null });
  return res;
}

/* Final kartı: en güçlü iki stat (mevcut değer + gelişimin iki katı) */
var ARCH_ADJ = { "Akıl": "Hesaplı", "Çene": "Dili Güçlü", "Kurnazlık": "Kurnaz", "Cesaret": "Gözü Kara", "Pişkinlik": "Pişkin", "Vicdan": "Vicdanlı", "Dayanıklılık": "Sabırlı", "Sosyal Radar": "Sezgili" };
var ARCH_NOUN = { "Akıl": "Mühendis", "Çene": "Diplomat", "Kurnazlık": "Tüccar", "Cesaret": "Kaptan", "Pişkinlik": "Şovmen", "Vicdan": "Arabulucu", "Dayanıklılık": "Maratoncu", "Sosyal Radar": "Dedektif" };
var PROPHECY = {
  "Akıl": "Makarya'da bir gün bir köprü, bir yazılım ya da en azından bir tablo dosyası senin adını taşıyacak.",
  "Çene": "Ya büyükelçi olacaksın ya da Kapalıçarşı'da en iyi pazarlığı yapan kişi.",
  "Kurnazlık": "Makarya Merkez Bankası seni artık izliyor.",
  "Cesaret": "Makarya'da 'Bunu kim yapar?' sorusunun cevabı genelde sen olacaksın.",
  "Pişkinlik": "Sahneler, kameralar ve aile düğünleri seni bekliyor.",
  "Vicdan": "Makarya'da kavga eden herkes bir gün kapını çalacak.",
  "Dayanıklılık": "Makarya trafiğine bile sabredebilecek nadir insanlardan biri olacaksın.",
  "Sosyal Radar": "Bir odaya girdiğinde, kimin kime kızgın olduğunu herkesten önce bileceksin."
};
/* Bazı statlar oyunda daha sık geçtiği için simülasyonla dengelenir (20.000 oyun ortalaması) */
var ARCH_NORM = { "Akıl": -17, "Çene": 23, "Kurnazlık": 3, "Cesaret": -15, "Pişkinlik": -5, "Vicdan": 6, "Dayanıklılık": 0, "Sosyal Radar": 5 };
function archetype(S) {
  var base = S.famStats || S.stats;
  var scored = STATS.map(function (k) { return { k: k, s: S.stats[k] + 2 * (S.stats[k] - base[k]) - (ARCH_NORM[k] || 0) }; })
    .sort(function (a, b) { return b.s - a.s; });
  var top = scored[0].k, second = scored[1].k;
  return { title: ARCH_ADJ[second] + " " + ARCH_NOUN[top], top: top, second: second, prophecy: PROPHECY[top] };
}

if (typeof module !== "undefined") module.exports = {};
