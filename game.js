/* Makarya — arayüz ve akış */
var S = newState();
var CUR = null;          // o anki seçim: {e, c, idx, b, res, roll, mini}
var MG = { timers: [], raf: null, done: false };
var SAVE_KEY = "makarya-kayit-v3";
var ROMAN = { 1: "I", 2: "II", 3: "III" };
var app = document.getElementById("app");

/* ── yardımcılar ── */
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
function cloneStats() { return Object.assign({}, S.stats); }
function signed(v) { return v > 0 ? "+" + v : String(v); }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function loadSave() { try { var s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v === 3 && s.family && s.screen !== "final") return s; } catch (e) {} return null; }
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

function withExt(base) { return [base + ".webp", base + ".png", base + ".jpg"]; }
function sceneSrcs(id) { return withExt((S.gender === "kiz" ? "img/kiz/sahne/" : "img/sahne/") + id); }
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
    '<div class="progress"><i style="width:' + Math.round(100 * S.i / EVENTS.length) + '%"></i></div>';
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
  if (["familyResult", "event", "chapterEnd", "final"].indexOf(S.screen) >= 0) save();
}

/* ── başlangıç ── */
function renderStart() {
  var sv = loadSave(), saveHtml = "";
  if (sv) {
    var e = EVENTS[Math.min(sv.i, EVENTS.length - 1)];
    saveHtml = '<div class="saveCard"><div><b>Kaldığın yer</b><small>' + esc(sv.family) + " ailesi · " + esc(e.age) + " · " + esc(e.title) +
      '</small></div><button onclick="resume()">DEVAM ET</button></div>';
  }
  shell("Makarya", art(["img/baslangic.webp"], "🌇", "HAYAT ZARI", "Makarya", "Aynı şehir, birbirinden çok farklı hayatlar.", true),
    '<div class="sectionTitle">Bir hayat başlıyor.</div>' +
    '<div class="sectionSub">Hayatındaki pek çok şeyi seçemeyeceksin. Ama bu kez bazı cevapları sen vereceksin.</div>' + saveHtml +
    '<div class="genderRow"><button class="genderBtn kiz" onclick="startGame(\'kiz\')"><span>👧</span> Kız</button>' +
    '<button class="genderBtn erkek" onclick="startGame(\'erkek\')"><span>👦</span> Erkek</button></div>' +
    '<button class="secondary" onclick="showRules()">Nasıl oynanır?</button>' +
    '<div class="muted">Yeni sahnelerin görselleri hazırlanıyor; görseli olmayan sahnelerde simgeli kapak görünür.</div>');
}
function resume() { var sv = loadSave(); if (!sv) return; S = sv; render(); }
function startGame(g) { clearSave(); S = newState(); S.gender = g; S.screen = "family"; render(); }

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
function beginGame() { S.i = 0; S.chStart[1] = cloneStats(); S.chTraits[1] = S.traits.slice(); S.screen = "event"; render(); }

/* ── olay ── */
function directSummary(c) {
  return Object.keys(c.direct).map(function (k) { return STAT_ICONS[k] + " " + k + " " + signed(c.direct[k]); }).join(" · ");
}
function renderEvent() {
  var e = EVENTS[S.i];
  var recall = (e.recall || []).filter(function (r) { return S.flags.indexOf(r.flag) >= 0; })
    .map(function (r) { return '<div class="recall"><b>GEÇMİŞTEN</b>' + esc(r.text) + "</div>"; }).join("");
  var famLine = e.fam && S.family ? '<div class="famLine"><span>🏠</span><span>' + esc(FAMILIES[S.family].lines[e.fam]) + "</span></div>" : "";
  var choices = e.choices.map(function (c, idx) {
    if (!hasReq(S, c)) {
      if (c.reqFlag) return "";
      return '<div class="choice locked"><div class="choiceIcon">🔒</div><div class="choiceMain"><b>' + esc(c.t) +
        "</b><small>Bu seçenek için özellik gerekir: " + esc(c.req) + "</small></div></div>";
    }
    var tags = [], sub, chance;
    if (c.req) tags.push('<span class="tag trait">⭐ ' + esc(c.req) + "</span>");
    if (c.reqFlag) tags.push('<span class="tag trait">📜 Geçmişten gelen seçenek</span>');
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
  shell(chTitle(e.ch), art(sceneSrcs(e.id), e.icon, "Bölüm " + ROMAN[e.ch] + " · " + e.age, e.title, e.text), recall + famLine + choices);
}
function choose(idx) {
  var e = EVENTS[S.i], c = e.choices[idx];
  if (!hasReq(S, c)) return;
  CUR = { e: e, c: c, idx: idx };
  if (c.direct) { CUR.res = applyOutcome(S, e, c, "direct"); S.screen = "result"; }
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
    '<div class="row"><button class="secondary" id="backBtn" onclick="S.screen=\'event\';render()">Vazgeç</button><button class="primary" id="rollBtn" onclick="rollDie()">ZAR AT</button></div>');
}
function rollDie() {
  var btn = document.getElementById("rollBtn"); if (!btn || btn.disabled) return;
  btn.disabled = true; document.getElementById("backBtn").disabled = true;
  var d = document.getElementById("die"); d.classList.add("spin");
  var n = 0;
  (function spin() {
    d.textContent = 1 + Math.floor(Math.random() * 20);
    if (++n < 14) { setTimeout(spin, 45 + n * 6); return; }
    var r = 1 + Math.floor(Math.random() * 20);
    d.textContent = r; d.classList.remove("spin");
    var o = rollOutcome(r, CUR.b.need);
    CUR.roll = r; CUR.res = applyOutcome(S, CUR.e, CUR.c, o, { roll: r });
    setTimeout(function () { S.screen = "result"; render(); }, 550);
  })();
}

/* ── sonuç ── */
var OUT_LABEL = { crit: "Kritik başarı", win: "Başarılı", mid: "Yarım başarı", fail: "Başarısız", bad: "Kritik hata", direct: "Seçimin" };
var OUT_TITLE = { crit: "Mükemmel!", win: "Başarılı!", mid: "Fena Değil", fail: "Olmadı", bad: "Berbat!" };
function renderResult() {
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
    rollCard + gains + traits + '<button class="primary" onclick="advance()">DEVAM ET</button></div></div>';
}
function advance() {
  var prev = EVENTS[S.i]; S.i++; CUR = null;
  if (S.i >= EVENTS.length) { S.endedCh = prev.ch; S.screen = "final"; }
  else if (EVENTS[S.i].ch !== prev.ch) { S.endedCh = prev.ch; S.screen = "chapterEnd"; }
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
  var ch = S.endedCh, C = CHAPTERS[ch], ev = EVENTS.filter(function (x) { return x.id === C.endImg; })[0];
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
function nextChapter() { var ch = S.endedCh + 1; S.chStart[ch] = cloneStats(); S.chTraits[ch] = S.traits.slice(); S.screen = "event"; render(); }

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
function renderFinal() {
  var a = archetype(S), gender = S.gender === "kiz" ? "Kız" : "Erkek";
  var C = CHAPTERS[3], before = S.chTraits[3] || [];
  var gained = S.traits.filter(function (t) { return before.indexOf(t) < 0; });
  shell("Hayat Kartı", art(sceneSrcs(C.endImg), "📜", "BÖLÜM III TAMAMLANDI", C.endAge, C.endText),
    '<div class="finalCard"><div class="k">MAKARYA · HAYAT KARTI</div><h2>' + esc(a.title) + "</h2><p><b>" + esc(S.family) + " ailesi · " + gender + " · 9 yaş</b></p><p>" + esc(a.prophecy) + "</p></div>" +
    '<button class="primary" onclick="shareCard()">📤 KARTI PAYLAŞ</button>' +
    '<h3 class="sectionTitle" style="font-size:18px">Karakterin</h3>' + barsHtml() +
    '<h3 class="sectionTitle" style="font-size:18px">Özellikler</h3>' +
    (S.traits.length ? '<div class="chips">' + S.traits.map(function (t) { return '<span class="chip">' + (gained.indexOf(t) >= 0 ? "🆕 " : "🏅 ") + esc(t) + "</span>"; }).join("") + "</div>" : '<div class="muted">Hiç özellik açılmadı. Bu da bir tarz.</div>') +
    '<h3 class="sectionTitle" style="font-size:18px">Hayat kaydı</h3><div class="logList">' + (lifeLog() || '<div class="muted">Sakin bir çocukluk.</div>') + "</div>" +
    '<h3 class="sectionTitle" style="font-size:18px">Bölüm III gelişimi</h3>' + compareHtml(S.chStart[3] || cloneStats(), cloneStats()) +
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
    ctx.fillStyle = "#d8b16a"; ctx.font = "900 30px sans-serif"; ctx.fillText("MAKARYA · HAYAT KARTI", W / 2, 620);
    ctx.fillStyle = "#fff"; ctx.font = "900 84px Georgia, serif";
    var y = wrapText(ctx, a.title, W / 2, 715, 960, 90);
    ctx.fillStyle = "#e7dbc4"; ctx.font = "700 34px sans-serif";
    ctx.fillText(S.family + " ailesi · " + (S.gender === "kiz" ? "Kız" : "Erkek") + " · 9 yaş", W / 2, y + 10);
    ctx.font = "italic 32px Georgia, serif";
    y = wrapText(ctx, a.prophecy, W / 2, y + 70, 900, 42);
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
function showRules() {
  modal("<h2>Nasıl oynanır?</h2>" +
    "<p><b>Seçimler.</b> Her olayda bir seçim yaparsın. Bazıları kesin sonuç verir, bazıları zar ya da mini oyun ister.</p>" +
    "<p><b>Zar.</b> 20 yüzlü zar atılır. Hedef sayıya ya da üstüne atarsan başarırsın. 20 her zaman kritik başarı, 1 her zaman kritik hatadır.</p>" +
    "<p><b>Hedef nasıl belirlenir?</b> Zorluk, ilgili statın, ailenin etkisi ve kazandığın özellikler hedefi yukarı ya da aşağı çeker. Zar ekranında her kalemi tek tek görürsün.</p>" +
    "<p><b>Risk ve ödül.</b> Zor seçimler daha fazla stat kazandırır, başarılırsa özellik de açar. Zor bir kontrolde kaybetmek bile Dayanıklılık +1 getirir.</p>" +
    "<p><b>Özellikler.</b> Kazandığın özellikler hedefleri düşürür ve ileride yeni seçeneklerin kilidini açar (🔒).</p>" +
    "<p><b>Hafıza.</b> Bazı seçimler unutulmaz; yıllar sonra karşına çıkar.</p>" +
    "<p><b>Kayıt.</b> Oyun her olayda otomatik kaydedilir.</p>");
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
  CUR.res = applyOutcome(S, CUR.e, CUR.c, miniOutcome(score));
  later(function () { S.screen = "result"; render(); }, 350);
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
    '<button class="secondary" onclick="S.screen=\'event\';render()">Vazgeç</button>');
}
function startMini() {
  var m = CUR.c.mini, st = document.getElementById("mg");
  var back = st.parentNode.querySelector(".secondary"); if (back) back.remove();
  ({ timing: mgTiming, hold: mgHold, collect: mgCollect, race: mgRace, memory: mgMemory, cups: mgCups, doors: mgDoors })[m.type](st, MG.assist, m);
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
  var pool = [{ f: "🧒🏻", r: 5 }, { f: "👧🏽", r: 4 }, { f: "🧒🏿", r: 3 }, { f: "👦🏼", r: 2 }, { f: "👧🏻", r: 1 }, { f: "🧒🏽", r: 2 }]
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

render();
