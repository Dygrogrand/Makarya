/* Makarya — arayüz ve akış */
var S = newState();
var CUR = null;          // o anki seçim: {e, c, idx, b, res, roll, mini}
var MG = { timers: [], raf: null, done: false };
var SAVE_KEY = "makarya-kayit-v5", META_KEY = "makarya-meta-v1";
var VOICE_COLORS = { "Akıl": "#3b6ea5", "Çene": "#b0572b", "Kurnazlık": "#8a6d1c", "Cesaret": "#b3322a", "Pişkinlik": "#8e3f86", "Vicdan": "#5f7d6a", "Dayanıklılık": "#6b5a48", "Sosyal Radar": "#2f7f86" };
var GIRL_OPEN = false;  // kız karakter görselleri tamamlanınca true yap
var ROMAN = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X" };
var app = document.getElementById("app");

/* ── yardımcılar ── */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
function cloneStats() { return Object.assign({}, S.stats); }
function signed(v) { return v > 0 ? "+" + v : String(v); }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() { try { var s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 5 && s.family && s.plan && s.plan.length && s.screen !== "final") return s; } catch (e) {} return null; }
function loadMeta() { try { var m = JSON.parse(localStorage.getItem(META_KEY)); if (m && m.deaths) return m; } catch (e) {} return { lives: 0, deaths: [], titles: {} }; }
function saveMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {} }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

function withExt(base) { return [base + ".webp", base + ".png", base + ".jpg"]; }
function sceneSrcs(id) {
  var e = EV_BY_ID[id], out = withExt((S.gender === "kiz" ? "img/kiz/sahne/" : "img/sahne/") + id);
  return e && e.place ? out.concat(withExt("img/mekan/" + e.place)) : out;
}
function famSrcs(name) { return withExt((S.gender === "kiz" ? "img/kiz/aile/" : "img/aile/") + FAMILIES[name].slug); }
function imgTag(srcs, cls) {
  return '<img class="' + (cls || "artImg") + '" alt="" src="' + esc(srcs[0]) + '" data-alt="' + esc(srcs.slice(1).join("|")) + '" onerror="imgFail(this)">';
}
function imgFail(el) {
  var rest = (el.getAttribute("data-alt") || "").split("|").filter(Boolean);
  if (rest.length) { el.setAttribute("data-alt", rest.slice(1).join("|")); el.src = rest[0]; }
  else el.remove();
}
function art(srcs, icon, kicker, title, text, tall) {
  return '<div class="art' + (tall ? " tall" : "") + '"><div class="artIcon">' + icon + "</div>" + imgTag(srcs) +
    '<div class="artCaption"><div class="artMeta">' + esc(kicker) + "</div><h1>" + esc(title) + "</h1>" + (text ? "<p>" + esc(text) + "</p>" : "") + "</div></div>";
}
function topbar(title) {
  return '<div class="topbar"><button class="topBtn" onclick="showCharacter()" aria-label="Karakter">☻</button><div class="brandWord">' + esc(title) +
    '</div><button class="topBtn" onclick="showRules()" aria-label="Kurallar">?</button></div>' +
    '<div class="progress"><i style="width:' + (S.plan && S.plan.length ? Math.round(100 * S.pi / S.plan.length) : 0) + '%"></i></div>';
}
function shell(title, artHtml, panelHtml) {
  app.innerHTML = '<div class="screen">' + topbar(title) + artHtml + '<div class="panel">' + panelHtml + "</div></div>";
}
function chTitle(ch) { return "Bölüm " + ROMAN[ch] + " · " + CHAPTERS[ch].name; }

function render() {
  stopMini();
  var f = { start: renderStart, family: renderFamily, familyResult: renderFamilyResult, event: renderEvent, check: renderCheck,
    minigame: renderMini, result: renderResult, chapterEnd: renderChapterEnd, final: renderFinal }[S.screen] || renderStart;
  f();
  if (["familyResult", "event", "result", "chapterEnd", "final"].indexOf(S.screen) >= 0) save();
}

/* ── başlangıç ── */
function renderStart() {
  var sv = loadSave(), saveHtml = "";
  if (sv) {
    var e = EV_BY_ID[sv.plan[Math.min(sv.pi, sv.plan.length - 1)]];
    saveHtml = '<div class="saveCard"><div><b>Kaldığın yer</b><small>' + esc(sv.family) + " ailesi · " + esc(e.age) + " · " + esc(e.title) +
      '</small></div><button onclick="resume()">DEVAM ET</button></div>';
  }
  shell("Makarya", art(["img/baslangic.webp"], "🌇", "HAYAT ZARI", "Makarya", "Aynı şehir, birbirinden çok farklı hayatlar.", true),
    '<div class="sectionTitle">Bir hayat başlıyor.</div>' +
    '<div class="sectionSub">Hayatındaki pek çok şeyi seçemeyeceksin. Ama bu kez bazı cevapları sen vereceksin.</div>' + saveHtml +
    '<div class="genderRow"><button class="genderBtn kiz soon" disabled><span>👧</span> Kız<em>Yakında</em></button>' +
    '<button class="genderBtn erkek" onclick="startGame(\'erkek\')"><span>👦</span> Erkek</button></div>' +
    '<div class="row"><button class="secondary" onclick="showRules()">Nasıl oynanır?</button>' +
    (loadMeta().lives ? '<button class="secondary" onclick="showGraveyard()">🪦 Koleksiyon</button>' : "") + "</div>" +
    '<div class="muted">Kız karakterin hikâyesi hazırlanıyor.</div>');
}
function resume() {
  var sv = loadSave(); if (!sv) return; S = sv; CUR = null;
  var e = curEvent(S);
  if (S.screen === "result" && S.last) restoreCur();
  else if ((S.screen === "check" || S.screen === "minigame") && S.lock) {
    CUR = { e: e, c: e.choices[S.lock.idx], idx: S.lock.idx };
    if (S.screen === "check") CUR.b = needBreakdown(S, e, CUR.c);
  } else if (S.screen === "check" || S.screen === "minigame" || S.screen === "result") S.screen = "event";
  render();
}
function restoreCur() {
  var e = curEvent(S), L = S.last;
  CUR = { e: e, c: e.choices[L.idx], idx: L.idx, res: L.res, roll: L.roll, mini: L.mini, b: { need: L.need } };
}
/* Sonuç uygulandığı anda kaydedilir: sayfayı yenileyerek seçim geri alınamaz */
function commit() {
  S.last = { idx: CUR.idx, res: CUR.res, roll: CUR.roll == null ? null : CUR.roll, mini: CUR.mini == null ? null : CUR.mini, need: CUR.b ? CUR.b.need : null };
  S.lock = null; S.screen = "result"; save();
}
function startGame(g) { if (g === "kiz" && !GIRL_OPEN) return; clearSave(); S = newState(); S.gender = g; S.screen = "family"; render(); }

/* ── aile kurası ── */
function renderFamily() {
  var names = Object.keys(FAMILIES);
  shell("Aile Kurası", art(["img/aile-secimi.webp"], "🎲", "AİLE KURASI", "Aileni seç.", "Ailen, yol boyunca sana güç verecek. Şaka yaptık; rastgele geliyor."),
    '<div class="familyGrid">' + names.map(function (n, i) {
      return '<div class="familyMini" id="fm' + i + '"><b>' + esc(n) + "</b>" + esc(FAMILIES[n].subtitle) + "</div>";
    }).join("") + '</div><button class="primary" id="rollFam" onclick="rollFamily()">🎲 HAYATA ATIL</button>');
}
function rollFamily() {
  var btn = document.getElementById("rollFam"); if (!btn || btn.disabled) return; btn.disabled = true;
  var names = Object.keys(FAMILIES), pick = Math.floor(Math.random() * names.length);
  var steps = 14 + pick + names.length * 1, k = 0, delay = 60;
  (function tick() {
    names.forEach(function (_, i) { var el = document.getElementById("fm" + i); if (el) el.classList.toggle("hot", i === k % names.length); });
    if (k >= steps && k % names.length === pick) {
      setTimeout(function () { applyFamily(S, names[pick]); S.screen = "familyResult"; render(); }, 650);
      return;
    }
    k++; delay = Math.min(260, delay * 1.09); setTimeout(tick, delay);
  })();
}
function renderFamilyResult() {
  var f = FAMILIES[S.family];
  var stats = STATS.map(function (k) {
    var d = S.stats[k] - BASE_STAT;
    return '<div class="statCard"><span>' + STAT_ICONS[k] + " " + k + "</span><b>" + S.stats[k] + (d ? ' <span class="delta ' + (d > 0 ? "pos" : "neg") + '">' + signed(d) + "</span>" : "") + "</b></div>";
  }).join("");
  var traits = f.traits.map(function (t) {
    var eff = Object.keys(t.stats).map(function (k) { return k + " kontrollerinde hedef " + signed(-t.stats[k]); }).join(", ");
    return '<div class="famTrait ' + (t.good ? "good" : "bad") + '"><span>' + (t.good ? "✓ " : "! ") + esc(t.name) + "<small>" + esc(t.desc) + " " + esc(eff) + "</small></span></div>";
  }).join("");
  shell("Makarya", art(famSrcs(S.family), "🏠", "AİLE BELİRLENDİ", S.family + " Ailesi", f.subtitle),
    '<div class="sectionTitle">Başlangıç Profilin</div><div class="sectionSub">Ailen karakterini belirgin biçimde şekillendiriyor.</div>' +
    '<div class="statGrid">' + stats + '</div><div class="idCard"><div class="idTitle">AİLEDEN GELEN ÖZELLİKLER</div>' + traits + "</div>" +
    '<button class="primary" onclick="beginGame()">HİKÂYEYE BAŞLA</button>');
}
function beginGame() { S.ch = 1; S.plan = buildPlan(S, 1); S.pi = 0; S.chStart[1] = cloneStats(); S.chTraits[1] = S.traits.slice(); S.screen = "event"; render(); }

/* ── olay ── */
function directSummary(c) {
  return Object.keys(c.direct).map(function (k) { return STAT_ICONS[k] + " " + k + " " + signed(c.direct[k]); }).join(" · ");
}
function renderEvent() {
  var e = curEvent(S);
  var recall = (e.recall || []).filter(function (r) { return S.flags.indexOf(r.flag) >= 0; })
    .map(function (r) { return '<div class="recall"><b>GEÇMİŞTEN</b>' + esc(r.text) + "</div>"; }).join("");
  var voices = eventVoices(S, e).filter(function (v) { return v.pass || v.fail; }).map(function (v) {
    return '<div class="voice' + (v.pass ? "" : " off") + '" style="--vc:' + VOICE_COLORS[v.stat] + '"><b>' + VOICE_NAMES[v.stat] +
      ' <i>[' + DIFF[v.diff].label + " · " + (v.pass ? "Başarılı" : "Başarısız") + "]</i></b>" + esc(v.pass ? v.text : v.fail) + "</div>";
  }).join("");
  var famLine = e.fam && S.family ? '<div class="famLine"><span>🏠</span><span>' + esc(FAMILIES[S.family].lines[e.fam]) + "</span></div>" : "";
  var choices = e.choices.map(function (c, idx) {
    if (!hasReq(S, c, e)) {
      if (c.reqFlag || c.reqVoice) return "";
      return '<div class="choice locked"><div class="choiceIcon">🔒</div><div class="choiceMain"><b>' + esc(c.t) +
        "</b><small>Bu seçenek için özellik gerekir: " + esc(c.req) + "</small></div></div>";
    }
    var tags = [], sub, chance;
    if (c.req) tags.push('<span class="tag trait">⭐ ' + esc(c.req) + "</span>");
    if (c.reqFlag) tags.push('<span class="tag trait">📜 Geçmişten gelen seçenek</span>');
    if (c.reqVoice) tags.push('<span class="tag voiceTag">💭 ' + esc(VOICE_NAMES[c.reqVoice]) + ' açtı</span>');
    if (c.risk) tags.push('<span class="tag risk">☠️ Ölüm riski %' + Math.round(c.risk.p * 100) + "</span>");
    if (c.trait && S.traits.indexOf(c.trait) < 0) tags.push('<span class="tag trait">🏅 Kazandırır: ' + esc(c.trait) + "</span>");
    if (c.direct) {
      sub = "Kesin sonuç · " + directSummary(c);
      chance = '<div class="chance hi">✓<small>kesin</small></div>';
    } else {
      var b = needBreakdown(S, e, c);
      sub = DIFF[c.diff].label + " · " + STAT_ICONS[c.stat] + " " + c.stat + (c.mini ? "" : " · Hedef " + b.need + "+");
      if (b.famBonus) tags.push('<span class="tag fam">🏠 Aile avantajı −' + b.famBonus + "</span>");
      if (c.mini) { tags.push('<span class="tag mini">🎮 Mini oyun</span>'); chance = '<div class="chance">🎮<small>beceri</small></div>'; }
      else {
        var p = Math.round(successChance(b.need) * 100);
        chance = '<div class="chance ' + (p >= 65 ? "hi" : p < 40 ? "lo" : "") + '">%' + p + "<small>şans</small></div>";
      }
    }
    return '<button class="choice" onclick="choose(' + idx + ')"><div class="choiceIcon">' + (c.stat ? STAT_ICONS[c.stat] : "✦") +
      '</div><div class="choiceMain"><b>' + esc(c.t) + "</b><small>" + esc(sub) + "</small>" + (tags.length ? '<div class="tags">' + tags.join("") + "</div>" : "") +
      "</div>" + chance + "</button>";
  }).join("");
  shell(chTitle(e.ch), art(sceneSrcs(e.id), e.icon, "Bölüm " + ROMAN[e.ch] + " · " + eventAge(S, e), e.title, e.text), recall + voices + famLine + choices);
}
function choose(idx) {
  var e = curEvent(S), c = e.choices[idx];
  if (!hasReq(S, c, e)) return;
  CUR = { e: e, c: c, idx: idx };
  if (c.direct) { CUR.res = applyOutcome(S, e, c, "direct"); commit(); }
  else if (c.mini) S.screen = "minigame";
  else { CUR.b = needBreakdown(S, e, c); S.screen = "check"; }
  render();
}

/* ── zar ── */
function renderCheck() {
  var e = CUR.e, c = CUR.c, b = CUR.b;
  var rows = b.rows.map(function (r) {
    var cls = r.kind === "base" ? "" : r.val < 0 ? "minus" : "plus";
    return '<div class="bRow"><span>' + r.icon + " " + esc(r.label) + '</span><b class="' + cls + '">' + (r.kind === "base" ? r.val : signed(r.val)) + "</b></div>";
  }).join("");
  var p = Math.round(successChance(b.need) * 100);
  shell("Zar Kontrolü", art(sceneSrcs(e.id), e.icon, "Zar kontrolü · " + c.stat, c.t, DIFF[c.diff].label + " zorluk · başarı şansı %" + p),
    '<div class="checkFocus"><div class="dieFace" id="die">🎲</div><div class="targetPill">Hedef ' + b.need + "+</div></div>" +
    '<div class="breakdown">' + rows + '<div class="bRow total"><span>Atman gereken en düşük sayı</span><b>' + b.need + "</b></div></div>" +
    '<div class="muted">20 her zaman kritik başarı, 1 her zaman kritik hata.</div>' +
    '<div class="row">' + (S.lock ? "" : '<button class="secondary" id="backBtn" onclick="S.screen=\'event\';render()">Vazgeç</button>') + '<button class="primary" id="rollBtn" onclick="rollDie()">ZAR AT</button></div>');
}
function rollDie() {
  var btn = document.getElementById("rollBtn"); if (!btn || btn.disabled) return;
  btn.disabled = true; var bk = document.getElementById("backBtn"); if (bk) bk.disabled = true;
  if (!S.lock) { S.lock = { idx: CUR.idx, roll: 1 + Math.floor(Math.random() * 20) }; S.screen = "check"; save(); }
  var d = document.getElementById("die"); d.classList.add("spin");
  var n = 0;
  (function spin() {
    d.textContent = 1 + Math.floor(Math.random() * 20);
    if (++n < 14) { setTimeout(spin, 45 + n * 6); return; }
    var r = S.lock.roll;
    d.textContent = r; d.classList.remove("spin");
    var o = rollOutcome(r, CUR.b.need);
    CUR.roll = r; CUR.res = applyOutcome(S, CUR.e, CUR.c, o, { roll: r }); commit();
    setTimeout(function () { render(); }, 550);
  })();
}

/* ── sonuç ── */
var OUT_LABEL = { crit: "Kritik başarı", win: "Başarılı", mid: "Yarım başarı", fail: "Başarısız", bad: "Kritik hata", direct: "Seçimin" };
var OUT_TITLE = { crit: "Mükemmel!", win: "Başarılı!", mid: "Fena Değil", fail: "Olmadı", bad: "Berbat!" };
function renderResult() {
  if (!CUR && S.last) restoreCur();
  var e = CUR.e, c = CUR.c, res = CUR.res, o = res.outcome;
  var rollCard = "";
  if (CUR.roll != null) rollCard = '<div class="rollCard"><div class="l">Atılan zar</div><div class="v">' + CUR.roll + '</div><div class="t">Hedef ' + CUR.b.need + "+</div></div>";
  else if (CUR.mini != null) rollCard = '<div class="rollCard"><div class="l">Mini oyun skoru</div><div class="v">%' + Math.round(CUR.mini * 100) + '</div><div class="t">' + OUT_LABEL[o] + "</div></div>";
  var gains = res.deltas.length ? '<div class="gainGrid">' + res.deltas.map(function (d) {
    return '<div class="gainCard ' + (d[1] < 0 ? "bad" : "good") + '"><div class="k">' + STAT_ICONS[d[0]] + " " + esc(d[0]) + '</div><div class="v">' + signed(d[1]) + "</div></div>";
  }).join("") + "</div>" : '<div class="muted">Bu seçim statlarını değiştirmedi.</div>';
  var traits = res.traits.map(function (t) {
    var bn = TRAITS[t] ? Object.keys(TRAITS[t].bonus).map(function (k) { return k + " kontrollerinde hedef −" + TRAITS[t].bonus[k]; }).join(", ") : "";
    return '<div class="traitCard"><div class="l">YENİ ÖZELLİK KAZANILDI</div><div class="n">' + esc(t) + '</div><div class="d">' + esc((TRAITS[t] || {}).desc || "") + (bn ? " " + esc(bn) + "." : "") + "</div></div>";
  }).join("");
  app.innerHTML = '<div class="screen">' + topbar("Sonuç") + '<div class="panel">' +
    '<div class="resultImg"><div class="artIcon">' + e.icon + "</div>" + imgTag(sceneSrcs(e.id)) + "</div>" +
    '<div class="resultHeader"><div class="badge o-' + o + '">' + OUT_LABEL[o] + '</div><div class="resultTitle">' + esc(o === "direct" ? c.t : OUT_TITLE[o]) + "</div>" +
    '<div class="resultText">' + esc(res.text) + "</div>" + (res.note ? '<div class="note">' + esc(res.note) + "</div>" : "") + "</div>" +
    rollCard + gains + traits +
    (res.death ? '<div class="deathCard"><div class="l">☠️ HAYAT BURADA SONA ERDİ</div><div class="d">' + esc(res.death) + "</div></div>" +
      '<button class="primary dark" onclick="advance()">🪦 MEZAR TAŞINI GÖR</button>' : '<button class="primary" onclick="advance()">DEVAM ET</button>') + "</div></div>";
}
function advance() {
  CUR = null; S.last = null;
  if (S.dead) { S.screen = "final"; render(); return; }
  replanRest(S);
  S.pi++;
  if (S.pi >= S.plan.length) S.screen = hasChapter(S.ch + 1) ? "chapterEnd" : "final";
  else S.screen = "event";
  render();
}

/* ── bölüm sonu ── */
function compareHtml(a, b) {
  return STATS.map(function (k) {
    var d = b[k] - a[k];
    return '<div class="compare"><span>' + STAT_ICONS[k] + " " + k + "</span><b>" + a[k] + " → " + b[k] + ' <span class="' + (d > 0 ? "up" : d < 0 ? "down" : "") + '">(' + signed(d) + ")</span></b></div>";
  }).join("");
}
function highlights(ch, n) {
  return S.log.filter(function (l) { return (!ch || l.ch === ch) && (l.outcome === "crit" || l.outcome === "bad"); }).slice(-n)
    .map(function (l) { return '<div class="logItem"><small>' + esc(l.age) + " · " + esc(l.title) + " · " + OUT_LABEL[l.outcome] + "</small>" + esc(l.choice) + "</div>"; }).join("");
}
function renderChapterEnd() {
  var ch = S.ch, C = CHAPTERS[ch], ev = EVENTS.filter(function (x) { return x.id === C.endImg; })[0];
  var before = S.chTraits[ch] || [], gained = S.traits.filter(function (t) { return before.indexOf(t) < 0; });
  var hl = highlights(ch, 3);
  shell(chTitle(ch), art(sceneSrcs(C.endImg), ev ? ev.icon : "📖", "BÖLÜM " + ROMAN[ch] + " TAMAMLANDI", C.endAge, C.endText),
    '<div class="sectionTitle">Bölüm ' + ROMAN[ch] + " · Gelişim Özeti</div><div class=\"sectionSub\">" + esc(C.range) + "</div>" +
    compareHtml(S.chStart[ch] || cloneStats(), cloneStats()) +
    '<h3 class="sectionTitle" style="font-size:18px">Kazanılan özellikler</h3>' +
    (gained.length ? '<div class="chips">' + gained.map(function (t) { return '<span class="chip">🏅 ' + esc(t) + "</span>"; }).join("") + "</div>" : '<div class="muted">Bu bölümde yeni özellik açılmadı.</div>') +
    (hl ? '<h3 class="sectionTitle" style="font-size:18px">Unutulmayan anlar</h3><div class="logList">' + hl + "</div>" : "") +
    '<button class="primary" onclick="nextChapter()">' + esc(C.next) + "</button>");
}
function nextChapter() { var ch = S.ch + 1; S.ch = ch; S.plan = buildPlan(S, ch); S.pi = 0; S.chStart[ch] = cloneStats(); S.chTraits[ch] = S.traits.slice(); S.screen = "event"; render(); }

/* ── final ── */
function barsHtml() {
  var max = Math.max(60, Math.max.apply(null, STATS.map(function (k) { return S.stats[k]; })));
  return '<div class="bars">' + STATS.map(function (k) {
    return '<div class="bar"><span>' + STAT_ICONS[k] + " " + k + '</span><div class="track"><div class="fill" style="width:' + Math.round(100 * S.stats[k] / max) + '%"></div></div><b>' + S.stats[k] + "</b></div>";
  }).join("") + "</div>";
}
function lifeLog() {
  return S.flags.filter(function (f) { return FLAG_LABELS[f]; }).map(function (f) { return '<div class="logItem">📜 ' + esc(FLAG_LABELS[f]) + "</div>"; }).join("") + highlights(null, 4);
}
function lifeAge() { return S.dead ? S.dead.age : CHAPTERS[S.ch].endAge.toLowerCase(); }
function recordLife() {
  if (S.recorded) return; S.recorded = true;
  var m = loadMeta(), a = archetype(S);
  m.lives++; m.titles[a.title] = (m.titles[a.title] || 0) + 1;
  if (S.dead) m.deaths.push({ cause: S.dead.cause, age: S.dead.age, title: S.dead.title, family: S.family, arch: a.title });
  saveMeta(m); save();
}
function renderFinal() {
  recordLife();
  var a = archetype(S), gender = S.gender === "kiz" ? "Kız" : "Erkek", dead = S.dead;
  var C = CHAPTERS[S.ch], before = S.chTraits[S.ch] || [];
  var gained = S.traits.filter(function (t) { return before.indexOf(t) < 0; });
  var head = dead ? art(sceneSrcs(curEvent(S).id), "🪦", "HAYAT SONA ERDİ · " + dead.age, dead.title, dead.cause)
    : art(sceneSrcs(C.endImg), "📜", "BÖLÜM " + ROMAN[S.ch] + " TAMAMLANDI", C.endAge, C.endText);
  shell(dead ? "Mezar Taşı" : "Hayat Kartı", head,
    '<div class="finalCard' + (dead ? " grave" : "") + '"><div class="k">' + (dead ? "MAKARYA · MEZAR TAŞI" : "MAKARYA · HAYAT KARTI") + "</div><h2>" + esc(a.title) + "</h2><p><b>" + esc(S.family) + " ailesi · " + gender + " · " + esc(lifeAge()) + "</b></p><p>" + esc(dead ? dead.cause : a.prophecy) + "</p></div>" +
    '<button class="primary" onclick="shareCard()">📤 KARTI PAYLAŞ</button>' +
    '<h3 class="sectionTitle" style="font-size:18px">Karakterin</h3>' + barsHtml() +
    '<h3 class="sectionTitle" style="font-size:18px">Özellikler</h3>' +
    (S.traits.length ? '<div class="chips">' + S.traits.map(function (t) { return '<span class="chip">' + (gained.indexOf(t) >= 0 ? "🆕 " : "🏅 ") + esc(t) + "</span>"; }).join("") + "</div>" : '<div class="muted">Hiç özellik açılmadı. Bu da bir tarz.</div>') +
    '<h3 class="sectionTitle" style="font-size:18px">Hayat kaydı</h3><div class="logList">' + (lifeLog() || '<div class="muted">Sakin bir çocukluk.</div>') + "</div>" +
    '<h3 class="sectionTitle" style="font-size:18px">Bölüm ' + ROMAN[S.ch] + " gelişimi</h3>" + compareHtml(S.chStart[S.ch] || cloneStats(), cloneStats()) +
    '<button class="secondary" onclick="newLife()">🎲 YENİ HAYAT</button>');
}
function newLife() { clearSave(); S = newState(); CUR = null; S.screen = "start"; render(); }

function wrapText(ctx, text, x, y, maxW, lh) {
  var words = String(text).split(" "), line = "", lines = [];
  words.forEach(function (w) { var t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line);
  lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * lh); });
  return y + lines.length * lh;
}
function shareCard() {
  var a = archetype(S), W = 1080, H = 1350;
  var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  var ctx = cv.getContext("2d");
  function draw(img) {
    ctx.fillStyle = "#1d1915"; ctx.fillRect(0, 0, W, H);
    if (img) {
      var r = Math.max(W / img.width, 560 / img.height), iw = img.width * r, ih = img.height * r;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 580); ctx.clip();
      ctx.drawImage(img, (W - iw) / 2, (560 - ih) / 2, iw, ih); ctx.restore();
      var g = ctx.createLinearGradient(0, 300, 0, 580); g.addColorStop(0, "rgba(29,25,21,0)"); g.addColorStop(1, "rgba(29,25,21,1)");
      ctx.fillStyle = g; ctx.fillRect(0, 300, W, 280);
    }
    ctx.textAlign = "center";
    ctx.fillStyle = "#d8b16a"; ctx.font = "900 30px sans-serif"; ctx.fillText(S.dead ? "MAKARYA · MEZAR TAŞI" : "MAKARYA · HAYAT KARTI", W / 2, 620);
    ctx.fillStyle = "#fff"; ctx.font = "900 84px Georgia, serif";
    var y = wrapText(ctx, a.title, W / 2, 715, 960, 90);
    ctx.fillStyle = "#e7dbc4"; ctx.font = "700 34px sans-serif";
    ctx.fillText(S.family + " ailesi · " + (S.gender === "kiz" ? "Kız" : "Erkek") + " · " + lifeAge(), W / 2, y + 10);
    ctx.font = "italic 32px Georgia, serif";
    y = wrapText(ctx, S.dead ? S.dead.cause : a.prophecy, W / 2, y + 70, 900, 42);
    ctx.textAlign = "left"; ctx.font = "700 30px sans-serif";
    var max = Math.max(60, Math.max.apply(null, STATS.map(function (k) { return S.stats[k]; })));
    STATS.forEach(function (k, i) {
      var col = i % 2, row = Math.floor(i / 2), x = 80 + col * 480, yy = y + 40 + row * 62;
      ctx.fillStyle = "#e7dbc4"; ctx.fillText(k, x, yy);
      ctx.fillStyle = "#3a332c"; ctx.fillRect(x + 220, yy - 20, 170, 16);
      ctx.fillStyle = "#c69b49"; ctx.fillRect(x + 220, yy - 20, 170 * S.stats[k] / max, 16);
      ctx.fillStyle = "#fff"; ctx.fillText(String(S.stats[k]), x + 400, yy);
    });
    ctx.textAlign = "center"; ctx.fillStyle = "#d8b16a"; ctx.font = "700 28px sans-serif";
    wrapText(ctx, S.traits.slice(-3).join(" · "), W / 2, Math.min(y + 310, H - 110), 940, 36);
    ctx.fillStyle = "#8f836f"; ctx.font = "700 26px sans-serif"; ctx.fillText("dygrogrand.github.io/Makarya", W / 2, H - 40);
    cv.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], "makarya-hayat-karti.png", { type: "image/png" });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: "Makarya", text: "Makarya'da " + a.title + " oldum." }).catch(function () {});
          return;
        }
      } catch (e) {}
      var url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = "makarya-hayat-karti.png"; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, "image/png");
  }
  var srcs = famSrcs(S.family), img = new Image(), k = 0;
  img.onload = function () { draw(img); };
  img.onerror = function () { k++; if (k < srcs.length) img.src = srcs[k]; else draw(null); };
  img.src = srcs[0];
}

/* ── pencereler ── */
function modal(html) {
  var m = document.createElement("div"); m.className = "modal";
  m.onclick = function (ev) { if (ev.target === m) m.remove(); };
  m.innerHTML = '<div class="modalCard">' + html + '<button class="primary" onclick="this.closest(\'.modal\').remove()">KAPAT</button></div>';
  document.body.appendChild(m);
}
function showCharacter() {
  if (!S.family) { modal("<h2>Karakterin</h2><p>Önce hayata atılman gerekiyor.</p>"); return; }
  var f = FAMILIES[S.family];
  var fam = f.traits.map(function (t) { return '<div class="famTrait ' + (t.good ? "good" : "bad") + '"><span>' + esc(t.name) + "<small>" + esc(t.desc) + "</small></span></div>"; }).join("");
  var tr = S.traits.length ? S.traits.map(function (t) { return '<div class="tCard"><b>⭐ ' + esc(t) + "</b><div>" + esc((TRAITS[t] || {}).desc || "") + "</div></div>"; }).join("")
    : '<div class="muted">Henüz kazanılmış özellik yok. Zor seçimler ve kritik başarılar özellik açar.</div>';
  modal("<h2>Karakterin</h2><p>" + esc(S.family) + " ailesi · " + (S.gender === "kiz" ? "Kız" : "Erkek") + " · " + S.traits.length + " özellik</p>" +
    barsHtml() + "<h3>Aile özellikleri</h3>" + fam + "<h3>Kazanılan özellikler</h3>" + tr +
    (S.flags.length ? "<h3>Hafıza</h3>" + lifeLog() : ""));
}
function showGraveyard() {
  var m = loadMeta();
  var titles = Object.keys(m.titles).sort(function (a, b) { return m.titles[b] - m.titles[a]; });
  modal("<h2>Koleksiyon</h2><p>" + m.lives + " hayat yaşandı · " + m.deaths.length + " erken veda · " + titles.length + " farklı karakter</p>" +
    (m.deaths.length ? "<h3>🪦 Ölüm koleksiyonu</h3>" + m.deaths.slice().reverse().map(function (d) {
      return '<div class="tCard"><b>' + esc(d.age) + " · " + esc(d.title) + "</b><div>" + esc(d.cause) + " (" + esc(d.family) + " ailesi, " + esc(d.arch) + ")</div></div>";
    }).join("") : "") +
    (titles.length ? "<h3>🎭 Açılan karakterler</h3><div class=\"chips\">" + titles.map(function (t) { return '<span class="chip">' + esc(t) + (m.titles[t] > 1 ? " ×" + m.titles[t] : "") + "</span>"; }).join("") + "</div>" : ""));
}
function showRules() {
  modal("<h2>Nasıl oynanır?</h2>" +
    "<p><b>Seçimler.</b> Her olayda bir seçim yaparsın. Bazıları kesin sonuç verir, bazıları zar ya da mini oyun ister.</p>" +
    "<p><b>Zar.</b> 20 yüzlü zar atılır. Hedef sayıya ya da üstüne atarsan başarırsın. 20 her zaman kritik başarı, 1 her zaman kritik hatadır.</p>" +
    "<p><b>Hedef nasıl belirlenir?</b> Zorluk, ilgili statın, ailenin etkisi ve kazandığın özellikler hedefi yukarı ya da aşağı çeker. Zar ekranında her kalemi tek tek görürsün.</p>" +
    "<p><b>Risk ve ödül.</b> Zor seçimler daha fazla stat kazandırır, başarılırsa özellik de açar. Zor bir kontrolde kaybetmek bile Dayanıklılık +1 getirir.</p>" +
    "<p><b>Özellikler.</b> Kazandığın özellikler hedefleri düşürür ve ileride yeni seçeneklerin kilidini açar (🔒).</p>" +
    "<p><b>Hafıza.</b> Bazı seçimler unutulmaz; yıllar sonra karşına çıkar.</p>" +
    "<p><b>Her hayat farklı.</b> Her bölümde olaylar geniş bir havuzdan seçilir; iki hayat birbirinin aynısı olmaz.</p>" +
    "<p><b>Ölüm.</b> 18 yaşından sonra hayat biraz daha kırılgan: ☠️ işaretli seçenekler ölüm riski taşır ve yüzdesi her zaman görünür; yaş ilerledikçe arka planda küçük bir risk de vardır. Sağlıklı alışkanlıklar ve Dayanıklılık bu riski düşürür. Her hayat bir mezar taşıyla biter ve koleksiyona girer.</p>" +
    "<p><b>Hatlar.</b> Meslek, evlilik, çocuk ve geçmiş seçimlerin, önüne çıkacak olayları değiştirir.</p>" +
    "<p><b>Kayıt.</b> Oyun otomatik kaydedilir. Seçimler geri alınamaz: zar atıldığı ya da mini oyun başladığı an karar verilmiş olur.</p>");
}

/* ── mini oyunlar ── */
function stopMini() {
  MG.timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
  MG.timers = []; if (MG.raf) cancelAnimationFrame(MG.raf); MG.raf = null;
}
function later(fn, ms) { MG.timers.push(setTimeout(fn, ms)); }
function finishMini(score) {
  if (MG.done || S.screen !== "minigame") return;
  MG.done = true; stopMini();
  score = clamp(score, 0, 1);
  CUR.mini = score;
  CUR.res = applyOutcome(S, CUR.e, CUR.c, miniOutcome(score)); commit();
  later(function () { render(); }, 350);
}
function renderMini() {
  var e = CUR.e, c = CUR.c, m = c.mini;
  MG.assist = miniAssist(S, e, c); MG.done = false;
  var pct = Math.round(MG.assist * 100);
  var help = pct > 0 ? "Karakterin bu oyunu %" + pct + " kolaylaştırıyor." : pct < 0 ? "Bu iş karakterini zorluyor: %" + (-pct) + " daha zor." : "Karakterin bu oyunda ne avantajlı ne dezavantajlı.";
  shell("Mini Oyun", art(sceneSrcs(e.id), e.icon, "MİNİ OYUN · " + c.stat, m.title, e.title),
    '<div class="mgStage" id="mg"><div class="mgTitle">' + esc(m.title) + '</div><div class="mgHint">' + esc(m.hint) + "</div>" +
    '<div class="muted">' + STAT_ICONS[c.stat] + " " + esc(c.stat) + " " + S.stats[c.stat] + " · " + esc(help) + "</div>" +
    '<button class="mgBig" onclick="startMini()">BAŞLA</button></div>' +
    (S.lock ? "" : '<button class="secondary" onclick="S.screen=\'event\';render()">Vazgeç</button>'));
}
function startMini() {
  if (!S.lock) { S.lock = { idx: CUR.idx }; S.screen = "minigame"; save(); }
  var m = CUR.c.mini, st = document.getElementById("mg");
  var back = st.parentNode.querySelector(".secondary"); if (back) back.remove();
  ({ timing: mgTiming, hold: mgHold, collect: mgCollect, race: mgRace, memory: mgMemory, cups: mgCups, doors: mgDoors,
     rhythm: mgRhythm, lanes: mgLanes, simon: mgSimon, poker: mgPoker, trace: mgTrace,
     bargain: mgBargain, swipe: mgSwipe, breath: mgBreath, balance: mgBalance })[m.type](st, MG.assist, m);
}
function mgTiming(st, a, m) {
  var width = 18 + a * 44, left = 50 - width / 2;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgBar" id="bar"><div class="mgZone" style="left:' + left + "%;width:" + width +
    '%"></div><div class="mgNeedle" id="needle"></div></div><button class="mgBig" id="stopBtn">DURDUR</button>';
  var x = 0, dir = 1, last = performance.now(), v = 0.085 - a * 0.08;
  function tick(now) {
    var dt = Math.min(32, now - last); last = now;
    x += dir * dt * v; if (x >= 100) { x = 100; dir = -1; } if (x <= 0) { x = 0; dir = 1; }
    var n = document.getElementById("needle"); if (n) n.style.left = x + "%";
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
  function stop() {
    var d = Math.abs(x - 50), half = width / 2;
    finishMini(d <= half ? 0.7 + 0.3 * (1 - d / half) : 0.6 - (d - half) / 40);
  }
  document.getElementById("stopBtn").onclick = stop;
  document.getElementById("bar").onclick = stop;
}
function mgHold(st, a, m) {
  var width = 16 + a * 40, center = 62, left = center - width / 2;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgPower"><div class="mgFill" id="fill"></div><div class="mgZone" style="left:' + left + "%;width:" + width +
    '%"></div></div><div class="mgStatus" id="hs">Basılı tut…</div><button class="mgBig" id="holdBtn" style="touch-action:none">BASILI TUT</button>';
  var btn = document.getElementById("holdBtn"), val = 0, holding = false, started = false, last = performance.now();
  btn.oncontextmenu = function (ev) { ev.preventDefault(); };
  btn.onpointerdown = function (ev) { ev.preventDefault(); holding = true; started = true; btn.textContent = "BIRAK!"; try { btn.setPointerCapture(ev.pointerId); } catch (e) {} };
  function release() {
    if (!holding) return; holding = false;
    var d = Math.abs(val - center), half = width / 2;
    finishMini(d <= half ? 0.7 + 0.3 * (1 - d / half) : 0.6 - (d - half) / 35);
  }
  btn.onpointerup = release; btn.onpointercancel = release;
  function tick(now) {
    var dt = Math.min(32, now - last); last = now;
    if (holding) val = Math.min(100, val + dt * (0.055 - a * 0.02));
    var f = document.getElementById("fill"); if (f) f.style.width = val + "%";
    if (holding && val >= 100) { release(); return; }
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
}
function mgCollect(st, a, m) {
  var n = 5, limit = 4200 + a * 3500, got = 0, t0 = performance.now();
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgField" id="field"></div><div class="mgStatus" id="cs"></div>';
  var field = document.getElementById("field"), placed = [];
  for (var i = 0; i < n; i++) {
    var px, py, tries = 0;
    do { px = 4 + Math.random() * 78; py = 4 + Math.random() * 66; tries++; }
    while (tries < 30 && placed.some(function (p) { return Math.abs(p[0] - px) < 16 && Math.abs(p[1] - py) < 22; }));
    placed.push([px, py]);
    var b = document.createElement("button"); b.className = "mgPiece"; b.textContent = m.piece || "🧩";
    b.style.left = px + "%"; b.style.top = py + "%";
    b.onclick = function () {
      this.remove(); got++;
      if (got === n) { var t = (performance.now() - t0) / limit; finishMini(t < 0.4 ? 0.95 : t < 0.6 ? 0.8 : t < 0.85 ? 0.6 : 0.5); }
    };
    field.appendChild(b);
  }
  MG.timers.push(setInterval(function () {
    var left = Math.max(0, limit - (performance.now() - t0)), cs = document.getElementById("cs");
    if (cs) cs.textContent = (n - got) + " parça kaldı · " + (left / 1000).toFixed(1) + " sn";
    if (left <= 0) finishMini(got / n * 0.45);
  }, 100));
}
function mgRace(st, a, m) {
  var taps = 0, target = 18 - a * 10, dur = 5000, t0 = performance.now();
  var me = S.gender === "kiz" ? "🏃‍♀️" : "🏃‍♂️";
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgTrack"><div class="mgFinish"></div><div class="mgRunner you" id="you">' + me +
    '<small>SEN</small></div><div class="mgRunner opp" id="opp">🏃</div></div><div class="mgStatus" id="rt">5.0 sn</div><button class="mgBig" id="tapBtn" style="touch-action:manipulation">HIZLAN!</button>';
  document.getElementById("tapBtn").onpointerdown = function (ev) { ev.preventDefault(); taps++; };
  MG.timers.push(setInterval(function () {
    var el = performance.now() - t0, rem = Math.max(0, dur - el);
    var you = Math.min(1, taps / target), opp = Math.min(1, el / dur * 0.88);
    var y = document.getElementById("you"), o = document.getElementById("opp"), t = document.getElementById("rt");
    if (y) y.style.left = "calc(" + Math.round(you * 84) + "% + 4px)";
    if (o) o.style.left = "calc(" + Math.round(opp * 84) + "% + 4px)";
    if (t) t.textContent = (rem / 1000).toFixed(1) + " sn";
    if (rem <= 0) finishMini(taps / target);
  }, 60));
}
function mgMemory(st, a, m) {
  var src = (m.items && m.items.length >= 5) ? m.items : ["🧒🏻", "👧🏽", "🧒🏿", "👦🏼", "👧🏻", "🧒🏽"], ranks = [5, 4, 3, 2, 1, 2];
  var pool = src.slice(0, 6).map(function (f, i) { return { f: f, r: ranks[i] }; })
    .sort(function () { return Math.random() - 0.5; });
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgKids" id="kids">' + pool.map(function (k) {
    return '<div class="mgKid"><div class="face">' + k.f + '</div><div class="stars">' + "★".repeat(k.r) + "</div></div>";
  }).join("") + '</div><div class="mgStatus" id="ms">Gözlemle…</div>';
  later(function () {
    var t0 = performance.now();
    document.getElementById("kids").innerHTML = pool.map(function (k, i) {
      return '<button class="mgKid" data-i="' + i + '"><div class="face">' + k.f + '</div><div class="stars">?</div></button>';
    }).join("");
    document.getElementById("ms").textContent = "En iyi top kontrolü kimdeydi?";
    Array.prototype.forEach.call(document.querySelectorAll("#kids button"), function (b) {
      b.onclick = function () {
        var r = pool[+b.getAttribute("data-i")].r, ms = performance.now() - t0;
        finishMini(r === 5 ? (ms < 1800 ? 0.95 : 0.82) : r === 4 ? 0.55 : r === 3 ? 0.4 : r === 2 ? 0.3 : 0.15);
      };
    });
  }, 1600 + a * 1800);
}
function mgCups(st, a, m) {
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgCups" id="cups"></div><div class="mgStatus" id="us">Parayı izle…</div>';
  var box = document.getElementById("cups"), pos = [0, 1, 2], coin = Math.floor(Math.random() * 3);
  var L = function (p) { return (p * 35) + "%"; };
  var coinEl = document.createElement("div"); coinEl.className = "mgCoin"; coinEl.textContent = "🪙"; coinEl.style.left = L(coin); box.appendChild(coinEl);
  var cups = [0, 1, 2].map(function (i) {
    var b = document.createElement("button"); b.className = "mgCup lift"; b.textContent = "📦"; b.style.left = L(i); b.disabled = true; box.appendChild(b); return b;
  });
  var speed = 330 + a * 400, swaps = Math.round(7 - a * 8);
  cups.forEach(function (b) { b.style.transitionDuration = speed + "ms"; });
  later(function () {
    cups.forEach(function (b) { b.classList.remove("lift"); });
    later(function () {
      coinEl.style.opacity = 0;
      var k = 0;
      (function swap() {
        if (k++ >= swaps) {
          document.getElementById("us").textContent = "Para hangi kutunun altında?";
          var t0 = performance.now();
          cups.forEach(function (b, i) {
            b.disabled = false;
            b.onclick = function () {
              cups.forEach(function (x) { x.disabled = true; });
              coinEl.style.left = L(pos[coin]); coinEl.style.opacity = 1; b.classList.add("lift");
              var ms = performance.now() - t0;
              finishMini(i === coin ? (ms < 1500 ? 0.95 : 0.82) : 0.3);
            };
          });
          return;
        }
        var i = Math.floor(Math.random() * 3), j = (i + 1 + Math.floor(Math.random() * 2)) % 3;
        var t = pos[i]; pos[i] = pos[j]; pos[j] = t;
        cups[i].style.left = L(pos[i]); cups[j].style.left = L(pos[j]);
        later(swap, speed + 60);
      })();
    }, 400);
  }, 1200 + a * 1000);
}
function mgDoors(st, a, m) {
  var shapes = [{ s: "Güneş", e: "☀️" }, { s: "Yıldız", e: "⭐" }, { s: "Balık", e: "🐟" }, { s: "Uçurtma", e: "🪁" }];
  var colors = ["Sarı", "Mavi", "Kırmızı", "Yeşil"];
  function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  var target = { c: rnd(colors), sh: rnd(shapes) };
  var sameShape = { c: rnd(colors.filter(function (c) { return c !== target.c; })), sh: target.sh };
  var sameColor = { c: target.c, sh: rnd(shapes.filter(function (s) { return s !== target.sh; })) };
  var other = { c: rnd(colors.filter(function (c) { return c !== target.c && c !== sameShape.c; })), sh: rnd(shapes.filter(function (s) { return s !== target.sh && s !== sameColor.sh; })) };
  var doors = [target, sameShape, sameColor, other].sort(function () { return Math.random() - 0.5; });
  function sign(d) { return '<span class="sign ' + d.c + '">' + d.sh.e + " " + d.c + " " + d.sh.s + "</span>"; }
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="clue" id="clue">Sınıfının kapısında şu işaret var:<br>' + sign(target) +
    '</div><div class="mgStatus" id="ds">Aklında tut…</div><div class="mgDoors" id="doors" style="display:none"></div>';
  later(function () {
    document.getElementById("clue").style.display = "none";
    document.getElementById("ds").textContent = "Hangi kapıydı?";
    var dEl = document.getElementById("doors"); dEl.style.display = "grid";
    var t0 = performance.now();
    dEl.innerHTML = doors.map(function (d, i) { return '<button class="mgDoor" data-i="' + i + '"><div class="door">🚪</div>' + sign(d) + "</button>"; }).join("");
    Array.prototype.forEach.call(dEl.querySelectorAll("button"), function (b) {
      b.onclick = function () {
        var d = doors[+b.getAttribute("data-i")], ms = performance.now() - t0;
        finishMini(d === target ? (ms < 2500 ? 0.95 : 0.82) : (d === sameShape || d === sameColor) ? 0.5 : 0.3);
      };
    });
  }, 1800 + a * 3000);
}

/* Ninni ritmi: ışık parladığı anda dokun */
function mgRhythm(st, a, m) {
  var beats = 8, gap = 780, win = 150 + a * 220, t0 = performance.now() + 1200, hits = [], used = [];
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><button class="mgPulse" id="pulse">🌙</button><div class="mgStatus" id="rs">Hazırlan…</div><div class="mgDots" id="dots">' +
    Array(beats + 1).join('<i></i>') + '</div>';
  var pulse = document.getElementById("pulse"), dots = document.querySelectorAll("#dots i");
  for (var k = 0; k < beats; k++) (function (k) {
    later(function () { pulse.classList.add("on"); document.getElementById("rs").textContent = "Dokun!"; later(function () { pulse.classList.remove("on"); }, 180); }, t0 + k * gap - performance.now());
  })(k);
  pulse.onpointerdown = function (ev) {
    ev.preventDefault();
    var t = performance.now(), k = Math.round((t - t0) / gap);
    if (k < 0 || k >= beats || used[k]) return;
    var err = Math.abs(t - (t0 + k * gap));
    used[k] = true;
    if (err <= win) { hits[k] = 1 - 0.5 * err / win; dots[k].className = "hit"; }
    else { hits[k] = 0; dots[k].className = "miss"; }
  };
  later(function () {
    var sum = 0; for (var k = 0; k < beats; k++) sum += hits[k] || 0;
    finishMini(sum / beats * 1.05);
  }, t0 + beats * gap + 400 - performance.now());
}

/* Kalabalıkta ilerle: şerit değiştirerek engellerden kaç */
function mgLanes(st, a, m) {
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgLanes" id="lf"><div class="mgMe" id="me">' + (S.gender === "kiz" ? "👧" : "👦") +
    '</div></div><div class="mgStatus" id="ls">Çarpma: 0</div><div class="row"><button class="mgBig" id="lb">◀</button><button class="mgBig" id="rb">▶</button></div>';
  var field = document.getElementById("lf"), me = document.getElementById("me");
  var lane = 1, obs = [], hits = 0, dur = 8000, t0 = performance.now(), last = t0, nextSpawn = t0 + 300;
  var speed = 0.055 - a * 0.04, spawnGap = 640 + a * 500, faces = (m.obstacles && m.obstacles.length) ? m.obstacles : ["🧒", "👧", "👦", "🧒🏽", "👶"];
  function place() { me.style.left = (lane * 33.33 + 16.66) + "%"; }
  function move(d) { lane = clamp(lane + d, 0, 2); place(); }
  place();
  document.getElementById("lb").onpointerdown = function (ev) { ev.preventDefault(); move(-1); };
  document.getElementById("rb").onpointerdown = function (ev) { ev.preventDefault(); move(1); };
  var sx = null;
  field.onpointerdown = function (ev) { sx = ev.clientX; };
  field.onpointerup = function (ev) { if (sx == null) return; var dx = ev.clientX - sx; if (Math.abs(dx) > 25) move(dx > 0 ? 1 : -1); sx = null; };
  function tick(now) {
    var dt = Math.min(40, now - last); last = now;
    if (now >= nextSpawn && now - t0 < dur - 900) {
      var ln = Math.floor(Math.random() * 3), el = document.createElement("div");
      el.className = "mgObs"; el.textContent = faces[Math.floor(Math.random() * faces.length)];
      el.style.left = (ln * 33.33 + 16.66) + "%"; field.appendChild(el);
      obs.push({ lane: ln, y: -8, el: el, hit: false });
      nextSpawn = now + spawnGap * (0.75 + Math.random() * 0.5);
    }
    obs.forEach(function (o) {
      o.y += dt * speed; o.el.style.top = o.y + "%";
      if (!o.hit && o.y > 72 && o.y < 90 && o.lane === lane) { o.hit = true; hits++; o.el.classList.add("bump"); me.classList.add("bump"); setTimeout(function () { me.classList.remove("bump"); }, 250); }
    });
    obs = obs.filter(function (o) { if (o.y > 110) { o.el.remove(); return false; } return true; });
    var ls = document.getElementById("ls"); if (ls) ls.textContent = "Çarpma: " + hits + " · " + (Math.max(0, dur - (now - t0)) / 1000).toFixed(1) + " sn";
    if (now - t0 >= dur) { finishMini(1 - hits * 0.24); return; }
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
}

/* Sırayı tekrarla */
function mgSimon(st, a, m) {
  var items = (m.items && m.items.length === 4) ? m.items : ["🥪", "🧃", "🍫", "🥯"], len = clamp(5 - Math.round(a * 3), 3, 6), show = 620 + a * 400;
  var seq = []; for (var i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 4));
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgSimon" id="sg">' +
    items.map(function (x, i) { return '<button class="mgTile" data-i="' + i + '" disabled>' + x + "</button>"; }).join("") +
    '</div><div class="mgStatus" id="ss">Dinle: ' + len + ' ürün</div>';
  var tiles = document.querySelectorAll("#sg .mgTile");
  seq.forEach(function (x, k) {
    later(function () { tiles[x].classList.add("lit"); later(function () { tiles[x].classList.remove("lit"); }, show * 0.7); }, 700 + k * show);
  });
  later(function () {
    document.getElementById("ss").textContent = "Şimdi sen söyle!";
    var pos = 0, t0 = performance.now();
    Array.prototype.forEach.call(tiles, function (b) {
      b.disabled = false;
      b.onclick = function () {
        var i = +b.getAttribute("data-i");
        b.classList.add("lit"); setTimeout(function () { b.classList.remove("lit"); }, 150);
        if (i !== seq[pos]) { finishMini(pos / len * 0.66); return; }
        pos++;
        document.getElementById("ss").textContent = pos + " / " + len;
        if (pos === len) finishMini(performance.now() - t0 < len * 900 ? 0.95 : 0.85);
      };
    });
  }, 700 + len * show + 200);
}

/* Poker yüzü: parmağı gezinen dairenin içinde tut */
function mgPoker(st, a, m) {
  var R = 44 + a * 44, dur = 5000, qs = (m.questions && m.questions.length) ? m.questions : ["Emin misin?", "Bana bak.", "Gözlerimin içine bak.", "Kulakların neden kızardı?", "Son kez soruyorum.", "Hımm…"];
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgPoker" id="pf"><div class="mgQ" id="pq">Parmağını daireye koy</div><div class="mgRing" id="ring" style="width:' + 2 * R + "px;height:" + 2 * R +
    'px">😐</div></div><div class="mgStatus" id="ps">Başlamak için daireye dokun</div>';
  var f = document.getElementById("pf"), ring = document.getElementById("ring"), W = f.clientWidth, H = f.clientHeight;
  var cx = W / 2, cy = H / 2 + 10, tx = cx, ty = cy, px = -999, py = -999, down = false, started = 0, inside = 0, last = 0, qT = 0, qi = 0;
  function pos(ev) { var r = f.getBoundingClientRect(); px = ev.clientX - r.left; py = ev.clientY - r.top; }
  f.style.touchAction = "none";
  f.onpointerdown = function (ev) { ev.preventDefault(); pos(ev); down = true; try { f.setPointerCapture(ev.pointerId); } catch (e) {} if (!started && Math.hypot(px - cx, py - cy) < R) { started = performance.now(); last = started; } };
  f.onpointermove = function (ev) { if (down) pos(ev); };
  f.onpointerup = f.onpointercancel = function () { down = false; };
  function tick(now) {
    if (started) {
      var dt = now - last; last = now;
      var el = now - started, hard = 0.6 + el / dur;
      if (Math.hypot(tx - cx, ty - cy) < 6) { tx = R + Math.random() * (W - 2 * R); ty = R + 30 + Math.random() * (H - 2 * R - 30); }
      cx += (tx - cx) * 0.035 * hard; cy += (ty - cy) * 0.035 * hard;
      var ok = down && Math.hypot(px - cx, py - cy) < R;
      if (ok) inside += dt;
      ring.classList.toggle("bad", !ok);
      ring.textContent = ok ? "😐" : "😳";
      if (now > qT) { document.getElementById("pq").textContent = qs[qi++ % qs.length]; qT = now + 900; }
      var ps = document.getElementById("ps"); if (ps) ps.textContent = "Soğukkanlılık %" + Math.round(100 * inside / Math.max(1, el)) + " · " + (Math.max(0, dur - el) / 1000).toFixed(1) + " sn";
      if (el >= dur) { finishMini(inside / dur * 1.04); return; }
    }
    ring.style.left = (cx - R) + "px"; ring.style.top = (cy - R) + "px";
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
}

/* Harfi çiz: kesikli çizgiyi tek hamlede takip et */
function mgTrace(st, a, m) {
  var P = m.shape === "imza" ? [[30, 150], [60, 60], [90, 150], [125, 70], [160, 145], [200, 75], [235, 140], [270, 95]] : [[40, 175], [40, 30], [150, 125], [260, 30], [260, 175]], tol = 20 + a * 26, N = 48, cps = [];
  for (var s = 0; s < P.length - 1; s++) for (var k = 0; k < N / 4; k++) {
    var u = k / (N / 4); cps.push([P[s][0] + (P[s + 1][0] - P[s][0]) * u, P[s][1] + (P[s + 1][1] - P[s][1]) * u]);
  }
  cps.push(P[P.length - 1]);
  var pts = P.map(function (p) { return p.join(","); }).join(" ");
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><svg class="mgTrace" id="tsvg" viewBox="0 0 300 200"><polyline points="' + pts +
    '" class="guide"/><circle cx="' + P[0][0] + '" cy="' + P[0][1] + '" r="9" class="startDot"/><polyline id="ink" points="" class="ink"/></svg><div class="mgStatus" id="ts">Yeşil noktadan başla</div>';
  var svg = document.getElementById("tsvg"), ink = document.getElementById("ink"), drawing = false, done = false, line = [], hit = [], off = 0, t0 = 0;
  svg.style.touchAction = "none";
  function toV(ev) { var r = svg.getBoundingClientRect(); return [(ev.clientX - r.left) * 300 / r.width, (ev.clientY - r.top) * 200 / r.height]; }
  function add(p) {
    line.push(p); ink.setAttribute("points", line.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "));
    var best = 1e9;
    cps.forEach(function (c, i) { var d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < tol) hit[i] = true; if (d < best) best = d; });
    if (best > tol * 1.6) off++;
    var cov = hit.filter(Boolean).length / cps.length;
    document.getElementById("ts").textContent = "Tamamlanan %" + Math.round(cov * 100);
  }
  function end() {
    if (done || !drawing) return; done = true; drawing = false;
    var cov = hit.filter(Boolean).length / cps.length, prec = line.length ? 1 - off / line.length : 0;
    var fast = performance.now() - t0 < 4000 ? 0.04 : 0;
    finishMini(cov * 0.8 + prec * 0.2 + fast - 0.02);
  }
  svg.onpointerdown = function (ev) { if (done) return; ev.preventDefault(); drawing = true; t0 = t0 || performance.now(); try { svg.setPointerCapture(ev.pointerId); } catch (e) {} add(toV(ev)); };
  svg.onpointermove = function (ev) { if (drawing) add(toV(ev)); };
  svg.onpointerup = svg.onpointercancel = end;
  later(function () { if (!done) { drawing = true; end(); } }, 9000);
}

/* Pazarlık: karşı tarafın sabrı biterken doğru fiyatı bul */
function mgBargain(st, a, m) {
  var buy = m.mode !== "sell", T = 35 + Math.floor(Math.random() * 40), patience = 100, cost = 26 - a * 20, offers = 0;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgPatience"><i id="pat" style="width:100%"></i></div><div class="muted">Karşı tarafın sabrı</div>' +
    '<div class="bgOffer" id="bo">50</div><input type="range" min="0" max="100" value="50" id="bs" class="bgSlider">' +
    '<div class="row muted"><span>' + (buy ? "ucuz" : "ucuz") + '</span><span style="text-align:right">pahalı</span></div>' +
    '<div class="mgStatus" id="bm">' + esc(buy ? "Ne kadar ödemeyi teklif ediyorsun? (" + (m.item || "") + ")" : "Kaça satmak istiyorsun? (" + (m.item || "") + ")") + '</div><button class="mgBig" id="bb">TEKLİF VER</button>';
  var sl = document.getElementById("bs"), bo = document.getElementById("bo");
  sl.oninput = function () { bo.textContent = sl.value; };
  document.getElementById("bb").onclick = function () {
    var v = +sl.value, ok = buy ? v >= T : v <= T, d = Math.abs(v - T); offers++;
    if (ok) { finishMini(Math.max(0.55, 1 - d / 35) + (offers === 1 ? 0.03 : 0)); return; }
    patience -= cost; document.getElementById("pat").style.width = Math.max(0, patience) + "%";
    var msg = buy ? (d > 20 ? "Güldü. Çok düşük." : d > 8 ? "Kaşlarını kaldırdı. Biraz daha çık." : "Tereddüt etti. Çok yakınsın.")
                  : (d > 20 ? "Güldü. Çok yüksek." : d > 8 ? "Yüzünü buruşturdu. Biraz in." : "Tereddüt etti. Çok yakınsın.");
    document.getElementById("bm").textContent = msg;
    if (patience <= 0) finishMini(0.28);
  };
}

/* Kartları hızla ayır */
function mgSwipe(st, a, m) {
  var items = (m.items || []).slice().sort(function () { return Math.random() - 0.5; }), i = 0, ok = 0, per = 2600 + a * 2200, t0 = 0;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="swCard" id="sc"></div><div class="mgTimerBar"><i id="stb"></i></div>' +
    '<div class="mgStatus" id="ss"></div><div class="row"><button class="mgBig sw" id="sl">◀ ' + esc(m.left || "Hayır") + '</button><button class="mgBig sw right" id="sr">' + esc(m.right || "Evet") + " ▶</button></div>";
  var card = document.getElementById("sc");
  function show() {
    if (i >= items.length) { finishMini(ok / items.length * 1.02); return; }
    card.className = "swCard in"; card.textContent = items[i].t; t0 = performance.now();
    document.getElementById("ss").textContent = (i + 1) + " / " + items.length + " · doğru " + ok;
  }
  function answer(right) {
    if (i >= items.length || MG.done) return;
    if (right === !!items[i].right) ok++;
    card.className = "swCard out " + (right ? "r" : "l"); i++;
    setTimeout(show, 160);
  }
  document.getElementById("sl").onclick = function () { answer(false); };
  document.getElementById("sr").onclick = function () { answer(true); };
  var sx = null;
  card.onpointerdown = function (ev) { sx = ev.clientX; };
  card.onpointerup = function (ev) { if (sx == null) return; var dx = ev.clientX - sx; sx = null; if (Math.abs(dx) > 30) answer(dx > 0); };
  function tick(now) {
    if (i < items.length) {
      var f = Math.min(1, (now - t0) / per), b = document.getElementById("stb"); if (b) b.style.width = (100 - f * 100) + "%";
      if (f >= 1) { card.className = "swCard out"; i++; setTimeout(show, 160); t0 = now + 1e9; }
    }
    MG.raf = requestAnimationFrame(tick);
  }
  show(); MG.raf = requestAnimationFrame(tick);
}

/* Nefes: daire büyürken basılı tut, küçülürken bırak */
function mgBreath(st, a, m) {
  var cyc = 2800 + a * 1400, cycles = 3, dur = cyc * cycles, good = 0, total = 0, holding = false, t0 = 0;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="brWrap"><div class="brCircle" id="bc"></div></div><div class="mgStatus" id="bs">Daire büyürken bas, küçülürken bırak</div>' +
    '<button class="mgBig" id="bb" style="touch-action:none">BASILI TUT</button>';
  var btn = document.getElementById("bb"), c = document.getElementById("bc");
  btn.oncontextmenu = function (ev) { ev.preventDefault(); };
  btn.onpointerdown = function (ev) { ev.preventDefault(); holding = true; if (!t0) t0 = performance.now(); try { btn.setPointerCapture(ev.pointerId); } catch (e) {} };
  btn.onpointerup = btn.onpointercancel = function () { holding = false; };
  var last = 0;
  function tick(now) {
    if (t0) {
      var el = now - t0, ph = (el % cyc) / cyc, grow = ph < 0.5, s = grow ? 0.55 + ph * 1.3 : 1.2 - (ph - 0.5) * 1.3;
      c.style.transform = "scale(" + s.toFixed(3) + ")"; c.classList.toggle("in", grow);
      if (now - last > 50) { last = now; total++; if (holding === grow) good++; }
      document.getElementById("bs").textContent = (grow ? "Nefes al…" : "Nefes ver…") + " %" + Math.round(100 * good / Math.max(1, total));
      if (el >= dur) { finishMini((good / total - 0.35) / 0.6); return; }
    }
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
}

/* Denge: kayan şeyin altında tepsiyi tut */
function mgBalance(st, a, m) {
  var dur = 6000, tol = 0.1 + a * 0.12, x = 0.5, tx = 0.5, tray = 0.5, inside = 0, last = 0, t0 = 0;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="blField" id="bf"><div class="blItem" id="bi">' + esc(m.item || "🍵") + '</div><div class="blTray" id="bt"></div></div>' +
    '<div class="mgStatus" id="bs">Parmağını sürükleyerek tepsiyi altında tut</div>';
  var f = document.getElementById("bf"), it = document.getElementById("bi"), tr = document.getElementById("bt");
  f.style.touchAction = "none";
  function pos(ev) { var r = f.getBoundingClientRect(); tray = clamp((ev.clientX - r.left) / r.width, 0, 1); if (!t0) { t0 = performance.now(); last = t0; } }
  f.onpointerdown = function (ev) { ev.preventDefault(); try { f.setPointerCapture(ev.pointerId); } catch (e) {} pos(ev); };
  f.onpointermove = function (ev) { if (ev.buttons || ev.pointerType === "touch") pos(ev); };
  function tick(now) {
    if (t0) {
      var dt = now - last; last = now;
      if (Math.abs(tx - x) < 0.02) tx = 0.1 + Math.random() * 0.8;
      x += (tx - x) * (0.018 + (now - t0) / dur * 0.02);
      var ok = Math.abs(tray - x) < tol; if (ok) inside += dt;
      it.classList.toggle("bad", !ok);
      var el = now - t0;
      document.getElementById("bs").textContent = "Denge %" + Math.round(100 * inside / Math.max(1, el)) + " · " + (Math.max(0, dur - el) / 1000).toFixed(1) + " sn";
      if (el >= dur) { finishMini(inside / dur * 1.05); return; }
    }
    it.style.left = (x * 100) + "%"; tr.style.left = (tray * 100) + "%"; tr.style.width = (tol * 200) + "%";
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
}

render();
