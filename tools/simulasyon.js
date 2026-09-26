/* Makarya denge simülasyonu: node tools/simulasyon.js [hayat sayısı]
   Rastgele seçim yapan oyuncularla tam hayatlar oynatır; bölüm başına başarı oranlarını, stat seviyelerini,
   ölüm yaşı dağılımını, hayat başına olay ve mini oyun sayısını raporlar. */
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");
const ctx = { console, Object, Math, JSON }; vm.createContext(ctx);
for (const f of ["data.js", "content.js", "rules.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
ctx.RUNS = +(process.argv[2] || 4000);
vm.runInContext(`
var sc = {}, per = {}, statAt = {}, deathAges = [], events = [], minis = [], risky = 0, reachedEnd = 0, causes = {}, arch = {};
for (var run = 0; run < RUNS; run++) {
  var S = newState(); applyFamily(S, Object.keys(FAMILIES)[run % 6]);
  var n = 0, m = 0;
  for (var ch = 1; hasChapter(ch) && !S.dead; ch++) {
    S.ch = ch; S.plan = buildPlan(S, ch); S.pi = 0;
    var sAvg = STATS.reduce(function (s, k) { return s + S.stats[k]; }, 0) / 8;
    (statAt[ch] = statAt[ch] || []).push(sAvg);
    for (; S.pi < S.plan.length && !S.dead; S.pi++) {
      var e = curEvent(S); n++;
      var cs = e.choices.filter(function (c) { return hasReq(S, c, e); });
      var c = cs[Math.floor(Math.random() * cs.length)];
      if (c.risk && c.risk.p < 1) risky++;
      if (!c.diff) { applyOutcome(S, e, c, "direct"); }
      else {
        if (c.mini) m++;
        var b = needBreakdown(S, e, c), o = rollOutcome(1 + Math.floor(Math.random() * 20), b.need);
        applyOutcome(S, e, c, o);
        var k = ch + ":" + c.diff, a = per[k] || (per[k] = { n: 0, s: 0 }); a.n++; if (o == "win" || o == "crit") a.s++;
      }
      if (!S.dead) replanRest(S); else S._deathId = e.id;
    }
  }
  events.push(n); minis.push(m);
  if (S.dead) { var y = parseInt(S.dead.age); deathAges.push(y); if (S._deathId === "son-soz") reachedEnd++; }
  var t = archetype(S).title; arch[t] = (arch[t] || 0) + 1;
  STATS.forEach(function (k) { sc[k] = (sc[k] || 0) + S.stats[k] + 2 * (S.stats[k] - S.famStats[k]); });
}
function avg(a) { return (a.reduce(function (x, y) { return x + y; }, 0) / a.length).toFixed(1); }
console.log("Hayat başına olay:", avg(events), " mini oyun:", avg(minis), " riskli seçim alınan hayat oranı:", (risky / RUNS).toFixed(2));
console.log("Son Söz'e ulaşan: %" + (100 * reachedEnd / RUNS).toFixed(1));
var bands = [[18, 30], [30, 40], [40, 55], [55, 70], [70, 80], [80, 90], [90, 120]];
console.log("Ölüm yaşı dağılımı:", bands.map(function (b) { return b[0] + "-" + b[1] + ": %" + (100 * deathAges.filter(function (y) { return y >= b[0] && y < b[1]; }).length / RUNS).toFixed(1); }).join("  "));
console.log("Ortalama ölüm yaşı:", avg(deathAges));
for (var ch = 1; ch <= 10; ch++) {
  var row = ["veryEasy", "easy", "medium", "hard", "veryHard"].map(function (d) { var a = per[ch + ":" + d]; return a ? d + " %" + Math.round(100 * a.s / a.n) : ""; }).filter(Boolean).join("  ");
  console.log("Bölüm " + ch + " (ort. stat " + (statAt[ch] ? avg(statAt[ch]) : "-") + ", beklenen " + CHAPTERS[ch].expected + "): " + row);
}
console.log("Farklı karakter unvanı:", Object.keys(arch).length);
var mm = 0; STATS.forEach(function (k) { sc[k] /= RUNS; mm += sc[k] / 8; });
var o = {}; STATS.forEach(function (k) { o[k] = Math.round(sc[k] - mm); }); console.log("ARCH_NORM önerisi:", JSON.stringify(o));
`, ctx);
