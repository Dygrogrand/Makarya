/* Mini oyunlar v2: konuşma düellosu, yalan ağı, bul farkı, refleks düellosu, gizli nesne, tartışma kulesi.
   game.js içindeki MG, esc, clamp, later, mgHit, mgMiss, mgFlash, finishMini yardımcılarını kullanır. */
function mxShuf(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }
function mxDots(res, n) {
  var o = "";
  for (var i = 0; i < n; i++) o += i < res.length ? '<i class="' + (res[i] >= 0.68 ? "hit" : "miss") + '"></i>' : i === res.length ? '<i class="cur"></i>' : "<i></i>";
  return '<div class="mgDots">' + o + "</div>";
}
/* sayaç çubuğu: ms içinde dolar, bitince cb */
function mxClock(ms, cb) {
  var t0 = performance.now(), dead = false;
  function tick(now) {
    if (dead) return;
    var p = clamp((now - t0) / ms, 0, 1), el = document.getElementById("mxClock");
    if (el) el.style.width = (100 - p * 100) + "%";
    if (p >= 1) { dead = true; cb(); return; }
    MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
  return { stop: function () { dead = true; }, elapsed: function () { return performance.now() - t0; } };
}
var MX_CLOCK = '<div class="mgTimerBar"><i id="mxClock" style="width:100%"></i></div>';

/* ── 1. Konuşma düellosu ── */
function duelRounds(m) {
  if (m.rounds && m.rounds.length) return m.rounds;
  var it = m.item || "bu";
  if (m.mode === "sell") return [
    { q: "Bu fiyata " + it + "? Çok pahalı.", o: [{ t: "Kalitesine bakın, fiyatını hak ediyor.", s: 1 }, { t: "Peki, siz ne kadar verirsiniz?", s: 0.6 }, { t: "Tamam, hemen indiririm.", s: 0.15 }] },
    { q: "Başka yerde daha ucuzunu gördüm.", o: [{ t: "Gösterin, aynı şey mi bakalım.", s: 1 }, { t: "O zaman oradan alın.", s: 0.5 }, { t: "Peki iki katı kadar indiririm.", s: 0.1 }] },
    { q: "Son fiyatınız ne?", o: [{ t: "Rakamı söyledim; esneklik küçük.", s: 1 }, { t: "Yarı yarıya anlaşalım.", s: 0.55 }, { t: "Siz söyleyin.", s: 0.25 }] }
  ];
  return [
    { q: "Bu fiyat sabit, değişmez.", o: [{ t: "Peşin ödersem?", s: 1 }, { t: "Başka yere bakıyorum.", s: 0.55 }, { t: "Peki, alıyorum.", s: 0.15 }] },
    { q: "Zaten çok indirdik.", o: [{ t: "Küçük bir ikram eklerseniz bitiririz.", s: 1 }, { t: "O zaman bırakın.", s: 0.4 }, { t: "Daha da indirin, yoksa giderim.", s: 0.3 }] },
    { q: "Pes ettim, siz kaç dersiniz?", o: [{ t: "Makul bir rakam, ortada buluşalım.", s: 1 }, { t: "Bedavaya yakın olsun.", s: 0.1 }, { t: "Ne derseniz.", s: 0.3 }] }
  ];
}
function mgDuel(st, a, m) {
  var R = duelRounds(m), i = 0, res = [], per = 9500 + a * 5000, clk = null;
  function round() {
    var r = R[i], opts = mxShuf(r.o);
    st.innerHTML = '<div class="mgTitle">' + esc(m.title) + "</div>" + mxDots(res, R.length) +
      '<div class="dlQ"><small>' + esc(m.who || "Karşındaki") + '</small>“' + esc(r.q) + '”</div>' + MX_CLOCK +
      '<div class="dlOpts">' + opts.map(function (o, k) { return '<button class="dlOpt" data-k="' + k + '">' + esc(o.t) + "</button>"; }).join("") + '</div><div class="mgStatus" id="dst"> </div>';
    var locked = false;
    function pick(o) {
      if (locked) return; locked = true; if (clk) clk.stop();
      var s = o ? o.s : 0.1; res.push(s);
      if (s >= 0.9) mgHit(1); else if (s >= 0.5) mgHit(0); else mgMiss();
      mgFlash(st, s >= 0.5);
      var d = document.getElementById("dst"); if (d) d.textContent = o ? (s >= 0.9 ? "😏 Tam yerine oturdu." : s >= 0.5 ? "😐 İdare eder." : "😠 Ters tepti.") : "⏳ Süre doldu, sustun.";
      Array.prototype.forEach.call(st.querySelectorAll(".dlOpt"), function (b) { b.disabled = true; });
      later(function () { i++; if (i < R.length) round(); else finishMini(res.reduce(function (x, y) { return x + y; }, 0) / R.length); }, 800);
    }
    Array.prototype.forEach.call(st.querySelectorAll(".dlOpt"), function (b) { b.onclick = function () { pick(opts[+b.getAttribute("data-k")]); }; });
    clk = mxClock(per, function () { pick(null); });
  }
  round();
}

/* ── 2. Yalan ağı ── */
function mgLie(st, a, m) {
  var facts = m.facts || [], qs = m.qs || [], ok = 0, i = 0, show = 5200 + facts.length * 1300 + a * 3500;
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="mgStatus">Şu ana kadar söylediklerin:</div><div class="lieFacts">' +
    facts.map(function (f) { return "<div>🗣️ " + esc(f) + "</div>"; }).join("") + "</div>" + MX_CLOCK + '<div class="mgHint">Ezberle. Birazdan çelişkini yakalamaya çalışacaklar.</div>';
  mxClock(show, ask);
  function ask() {
    if (i >= qs.length) { finishMini(ok / qs.length); return; }
    var q = qs[i], opts = mxShuf(q.o.map(function (t, k) { return { t: t, c: k === 0 }; }));
    st.innerHTML = '<div class="mgTitle">' + esc(m.title) + "</div>" +
      '<div class="dlQ"><small>' + esc(m.who || "Soruyu soran") + "</small>“" + esc(q.q) + '”</div><div class="dlOpts">' +
      opts.map(function (o, k) { return '<button class="dlOpt" data-k="' + k + '">' + esc(o.t) + "</button>"; }).join("") + "</div>";
    Array.prototype.forEach.call(st.querySelectorAll(".dlOpt"), function (b) {
      b.onclick = function () {
        var o = opts[+b.getAttribute("data-k")];
        Array.prototype.forEach.call(st.querySelectorAll(".dlOpt"), function (x) { x.disabled = true; });
        if (o.c) { ok++; mgHit(ok); b.classList.add("good"); } else { mgMiss(); b.classList.add("bad"); }
        mgFlash(st, o.c);
        later(function () { i++; ask(); }, 750);
      };
    });
  }
}

/* ── 3. Bul farkı ── */
function mgDiff(st, a, m) {
  var set = (m.set && m.set.length >= 4) ? m.set : ["🍎", "🍌", "🍇", "🍒", "🍋"], N = m.n || 3, T = 18000 + a * 12000, cells = 16;
  var L = [], Rr, diffs = [], found = {}, nf = 0, wrong = 0, done = false;
  for (var k = 0; k < cells; k++) L.push(set[Math.floor(Math.random() * set.length)]);
  Rr = L.slice();
  while (diffs.length < N) { var p = Math.floor(Math.random() * cells); if (diffs.indexOf(p) < 0) diffs.push(p); }
  /* Farklı olan hücre başka bir simge değil, AYNI simgenin hafif değişmiş hâli (eğik, küçük, soluk, koyu): göze çarpmaz, dikkatle bakmak gerekir */
  var VARS = ["dfTilt", "dfSmall", "dfFade", "dfDark"], vmap = {};
  diffs.forEach(function (p) { vmap[p] = VARS[Math.floor(Math.random() * VARS.length)]; });
  function grid(arr, side) { return '<div class="dfGrid">' + arr.map(function (x, k) { return '<button class="dfCell" data-s="' + side + '" data-k="' + k + '"><span class="' + (side === "r" && vmap[k] ? vmap[k] : "") + '">' + x + "</span></button>"; }).join("") + "</div>"; }
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="dfWrap">' + grid(L, "l") + grid(Rr, "r") + "</div>" + MX_CLOCK +
    '<div class="mgStatus" id="dfs">0 / ' + N + " fark</div>";
  var clk = mxClock(T, function () { fin(); });
  function fin() { if (done) return; done = true; clk.stop(); finishMini(found_all() ? (wrong ? clamp(1 - wrong * 0.12, 0, 0.92) : 1) : clamp(nf / N - wrong * 0.12, 0, 0.85)); }
  function found_all() { return nf === N; }
  Array.prototype.forEach.call(st.querySelectorAll(".dfCell"), function (b) {
    b.onclick = function () {
      if (done) return; var k = +b.getAttribute("data-k");
      if (diffs.indexOf(k) >= 0) {
        if (!found[k]) {
          found[k] = 1; nf++; mgHit(nf);
          Array.prototype.forEach.call(st.querySelectorAll('.dfCell[data-k="' + k + '"]'), function (x) { x.classList.add("found"); });
          document.getElementById("dfs").textContent = nf + " / " + N + " fark";
          if (nf === N) later(fin, 350);
        }
      } else { wrong++; mgMiss(); b.classList.add("wrong"); setTimeout(function () { b.classList.remove("wrong"); }, 350); mgFlash(st, false); }
    };
  });
}

/* ── 4. Refleks düellosu: dodge (boş şeride geç) / parry (saldırıyı karşıla) ── */
function mgFight(st, a, m) {
  var parry = m.mode === "parry", R = 6, i = 0, res = [], obs = (m.obstacles && m.obstacles.length) ? m.obstacles : ["🚧", "🛒", "🐕", "🗑️"], opp = m.opp || "🥊";
  var names = ["SOL", "ORTA", "SAĞ"];
  function round() {
    st.innerHTML = '<div class="mgTitle">' + esc(m.title) + "</div>" + mxDots(res, R) + '<div class="fgLanes" id="fl">' +
      [0, 1, 2].map(function () { return '<div class="fgLane"><span></span></div>'; }).join("") + "</div>" + MX_CLOCK +
      '<div class="fgBtns">' + names.map(function (n, k) { return '<button class="mgBig fgBtn" data-k="' + k + '" disabled>' + (parry ? "KARŞILA" : "GEÇ") + "<br><small>" + n + "</small></button>"; }).join("") + '</div><div class="mgStatus" id="fs">Hazırlan…</div>';
    var lane = Math.floor(Math.random() * 3), occ = [lane];
    if (!parry && i >= 3) { var l2; do { l2 = Math.floor(Math.random() * 3); } while (l2 === lane); occ.push(l2); }
    var win = clamp(1500 - i * 110 + a * 700, 650, 2400), locked = false, clk = null;
    later(function () {
      var lanes = st.querySelectorAll(".fgLane span");
      occ.forEach(function (o) { lanes[o].textContent = parry ? opp : obs[Math.floor(Math.random() * obs.length)]; lanes[o].className = "on"; });
      document.getElementById("fs").textContent = parry ? "Saldırı geliyor!" : "Boş şeridi seç!";
      Array.prototype.forEach.call(st.querySelectorAll(".fgBtn"), function (b) { b.disabled = false; });
      mgGo();
      clk = mxClock(win, function () { resolve(-1); });
    }, 350 + Math.random() * 450);
    function resolve(k) {
      if (locked) return; locked = true; if (clk) clk.stop();
      var good = k >= 0 && (parry ? k === lane : occ.indexOf(k) < 0);
      res.push(good ? 1 : 0); if (good) mgHit(i + 1); else mgMiss(); mgFlash(st, good);
      Array.prototype.forEach.call(st.querySelectorAll(".fgBtn"), function (b) { b.disabled = true; });
      document.getElementById("fs").textContent = good ? "✓" : (k < 0 ? "Geç kaldın" : "✗");
      later(function () { i++; if (i < R) round(); else finishMini(res.reduce(function (x, y) { return x + y; }, 0) / R); }, 550);
    }
    Array.prototype.forEach.call(st.querySelectorAll(".fgBtn"), function (b) { b.onpointerdown = function (ev) { ev.preventDefault(); resolve(+b.getAttribute("data-k")); }; });
  }
  round();
}

/* ── 5. Gizli nesne ── */
function mgHidden(st, a, m) {
  var target = m.target || "🔍", decoys = (m.decoys && m.decoys.length) ? m.decoys : ["🙂", "😀", "😐"], R = 3, i = 0, res = [], T = 9500 + a * 5500;
  function round() {
    var n = 30, ti = Math.floor(Math.random() * n), wrong = 0, cells = [];
    for (var k = 0; k < n; k++) cells.push(k === ti ? target : decoys[Math.floor(Math.random() * decoys.length)]);
    st.innerHTML = '<div class="mgTitle">' + esc(m.title) + "</div>" + mxDots(res, R) + '<div class="mgStatus">Bul: <span class="hdT">' + target + "</span></div>" +
      '<div class="hdGrid">' + cells.map(function (x, k) { return '<button class="hdCell" data-k="' + k + '">' + x + "</button>"; }).join("") + "</div>" + MX_CLOCK;
    var locked = false, clk = mxClock(T, function () { end(false); });
    function end(found) {
      if (locked) return; locked = true; var el = clk.elapsed(); clk.stop();
      var f = el / T, s = found ? clamp((f < 0.5 ? 1 : 1 - (f - 0.5) * 1.1) - wrong * 0.15, 0.35, 1) : 0.1;
      res.push(s); if (found) mgHit(i + 1); else mgMiss(); mgFlash(st, found);
      later(function () { i++; if (i < R) round(); else finishMini(res.reduce(function (x, y) { return x + y; }, 0) / R); }, 600);
    }
    Array.prototype.forEach.call(st.querySelectorAll(".hdCell"), function (b) {
      b.onclick = function () {
        if (locked) return;
        if (+b.getAttribute("data-k") === ti) { b.classList.add("found"); end(true); }
        else { wrong++; mgMiss(); b.classList.add("wrong"); b.disabled = true; }
      };
    });
  }
  round();
}

/* ── 6. Tartışma kulesi ── */
function mgTower(st, a, m) {
  var N = 6, item = m.item || "📦", H = 30, stack = [{ l: 22, w: 56 }], placed = 0, perfect = 0, k = 0, x = 0, dir = 1, over = false, w = 56, last = performance.now();
  st.innerHTML = '<div class="mgTitle">' + esc(m.title) + '</div><div class="twField" id="tf"></div><div class="mgStatus" id="ts">0 / ' + N + '</div><button class="mgBig" id="twBtn">BIRAK</button>';
  var tf = document.getElementById("tf");
  function blk(b, lv, cls) {
    var d = document.createElement("div"); d.className = "twBlk " + (cls || "");
    d.style.cssText = "left:" + b.l + "%;width:" + b.w + "%;bottom:" + (lv * H) + "px;height:" + (H - 2) + "px"; d.textContent = item; tf.appendChild(d); return d;
  }
  blk(stack[0], 0, "base");
  var cur = blk({ l: 0, w: w }, 1, "cur");
  var v = (0.085 - a * 0.035);
  function tick(now) {
    if (over) return; var dt = Math.min(32, now - last); last = now;
    var sp = v * (1 + k * 0.15), lim = 100 - w; x += dir * dt * sp * 1; if (x >= lim) { x = lim; dir = -1; } if (x <= 0) { x = 0; dir = 1; }
    cur.style.left = x + "%"; MG.raf = requestAnimationFrame(tick);
  }
  MG.raf = requestAnimationFrame(tick);
  function drop() {
    if (over) return; var top = stack[stack.length - 1], d = x - top.l, nb;
    if (Math.abs(d) <= 3) { nb = { l: top.l, w: top.w }; perfect++; mgHit(perfect + 2); cur.classList.add("perfect"); }
    else {
      var nw = top.w - Math.abs(d);
      if (nw <= 5) { over = true; cur.classList.add("fall"); mgMiss(); mgFlash(st, false); stopMini(); later(function () { finishMini(placed / N * 0.62); }, 650); return; }
      nb = { l: d > 0 ? x : top.l, w: nw }; mgHit(1);
    }
    stack.push(nb); placed++; k++; w = nb.w;
    cur.style.left = nb.l + "%"; cur.style.width = nb.w + "%"; cur.classList.remove("cur");
    document.getElementById("ts").textContent = placed + " / " + N + (perfect ? " · ✨ " + perfect : "");
    if (placed >= N) { over = true; stopMini(); later(function () { finishMini(Math.min(1, 0.8 + 0.4 * perfect / N)); }, 500); return; }
    x = 0; dir = 1; cur = blk({ l: 0, w: w }, stack.length, "cur");
  }
  document.getElementById("twBtn").onpointerdown = function (ev) { ev.preventDefault(); drop(); };
}

/* oyunu başlat */
render();
