/* Makarya — oyun kuralları (arayüzden bağımsız, simülasyonla test edilebilir) */
var AUTO_TRAITS = {};
Object.keys(TRAITS).forEach(function (k) { if (TRAITS[k].auto) AUTO_TRAITS[TRAITS[k].auto] = k; });

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function newState() {
  var stats = {};
  STATS.forEach(function (k) { stats[k] = BASE_STAT; });
  return { v: 5, screen: "start", gender: "erkek", family: null, ch: 1, plan: [], pi: 0, stats: stats, famStats: null,
    traits: [], flags: [], log: [], chStart: {}, chTraits: {}, last: null, lock: null, dead: null, kavsak: [], kavsakLog: [], chFlags: {}, gateFor: null, destek: 2, cash: null };
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
  /* Aynı bölümde aynı numaralı kavşak bir kez yaşanır (hat değiştiren, yeni hattının büyük sınavını aynı yıl tekrar yaşamaz) */
  if (e.kavsak && (S.kavsakLog || []).some(function (k) { return k.n === e.kavsak && k.ch === e.ch; })) return false;
  var w = e.when; if (!w) return true;
  if (w.flags && w.flags.some(function (f) { return S.flags.indexOf(f) < 0; })) return false;
  if (w.hat && w.hat.indexOf(primaryHat(S)) < 0) return false;
  if (w.anyFlags && !w.anyFlags.some(function (f) { return S.flags.indexOf(f) >= 0; })) return false;
  if (w.notFlags && w.notFlags.some(function (f) { return S.flags.indexOf(f) >= 0; })) return false;
  if (w.fam && w.fam.indexOf(S.family) < 0) return false;
  if (w.gender && w.gender !== S.gender) return false;
  if (w.trait && S.traits.indexOf(w.trait) < 0) return false;
  if (w.flag && S.flags.indexOf(w.flag) < 0) return false;
  if (w.notFlag && S.flags.indexOf(w.notFlag) >= 0) return false;
  for (var k in (w.minStat || {})) if (S.stats[k] < w.minStat[k]) return false;
  if (w.cashMin != null && varlikOf(S) < w.cashMin) return false;
  if (w.cashMax != null && varlikOf(S) > w.cashMax) return false;
  return true;
}
function pickEvents(S, ch, n, exclude, minM, rnd) {
  rnd = rnd || Math.random;
  var pool = EVENTS.filter(function (e) { return e.ch === ch && e.id.indexOf("kriz-") !== 0 && e.id.indexOf("yol-") !== 0 && eligible(S, e) && exclude.indexOf(e.id) < 0 && e._m >= minM; });
  var fixed = pool.filter(function (e) { return e.fixed; });
  var rest = pool.filter(function (e) { return !e.fixed; })
    .map(function (e) { return { e: e, k: Math.pow(rnd(), 1 / (e.weight || 1)) }; })
    .sort(function (a, b) { return b.k - a.k; }).map(function (x) { return x.e; });
  return fixed.concat(rest.slice(0, Math.max(0, n - fixed.length))).sort(function (a, b) { return a._m - b._m || a._i - b._i; }).map(function (e) { return e.id; });
}
function buildPlan(S, ch, rnd) {
  /* Bölüm VI: üniversiteye gitmeyen (ve ikinci sınavı ya da yurt dışını beklemeyen) herkes çalışma hayatına başlar */
  if (ch === 6 && !["universiteli", "yurtdisi-universite", "mezuna-kaldi"].some(function (f) { return S.flags.indexOf(f) >= 0; })) addFlag(S, "universitesiz");
  if (ch === 6 && !S.indep) { S.indep = true; if (destekOf(S) < 2) cashChange(S, -1); }
  var plan = pickEvents(S, ch, CHAPTERS[ch].pick, [], 0, rnd);
  S._sig = stateSig(S);
  if (ch === 10) setEndAge(S, plan);
  return plan;
}
/* Hafıza ya da özellik değişince bölümün kalanı yeniden seçilir (ör. meslek seçilince meslek olayları, evlenince evli hattı) */
function stateSig(S) { return S.flags.join(",") + "|" + S.traits.join(","); }
function replanRest(S, rnd) {
  if (S._sig !== stateSig(S)) {
    S._sig = stateSig(S);
    var played = S.plan.slice(0, S.pi + 1), cur = EV_BY_ID[S.plan[S.pi]];
    var rest = pickEvents(S, S.ch, CHAPTERS[S.ch].pick - played.length, played, cur ? evM(S, cur) : 0, rnd);
    S.plan = played.concat(rest);
    if (S.ch === 10) setEndAge(S, S.plan);
  }
  maybeCrisis(S);
  maybeYol(S);
}
/* Kriz: hattında üst üste 3 başarısızlık bir kriz olayı açar (bölüm başına en fazla bir, hayat boyu en fazla iki) */
function maybeCrisis(S) {
  if ((S.failStreak || 0) < 3 || S.ch < 7 || S.ch > 9 || S.flags.indexOf("hapis") >= 0 || !primaryHat(S)) return;
  S.krizCh = S.krizCh || {};
  if (S.krizCh[S.ch] || Object.keys(S.krizCh).length >= 2 || S.pi >= S.plan.length - 1) return;
  var cur = EV_BY_ID[S.plan[S.pi]];
  var k = EVENTS.filter(function (e) { return e.ch === S.ch && e.id.indexOf("kriz-") === 0 && eligible(S, e); })[0];
  if (!k) return;
  S.krizCh[S.ch] = k.id; S.failStreak = 0;
  S.krizAt = { id: k.id, age: eventAge(S, cur), m: evM(S, cur) };
  S.plan.splice(S.pi + 1, 0, k.id);
}
/* Zorunlu yol değişimi: maddi durum dibe vurup üst üste başarısızlık varken (ya da tamamen sıfırlanınca) hayat başka bir yola sokulur.
   Bölüm başına en fazla bir, hayat boyu en fazla üç; olayın kendi koşulları (hat, hafıza, maddi durum) `when` ile süzülür. */
function maybeYol(S) {
  if (S.ch < 7 || S.ch > 9 || S.flags.indexOf("hapis") >= 0 || S.pi >= S.plan.length - 1) return;
  S.yolCh = S.yolCh || {};
  if (S.yolCh[S.ch] || Object.keys(S.yolCh).length >= 3 || S.krizCh && S.krizCh[S.ch]) return;
  var cash = varlikOf(S), fs = S.failStreak || 0;
  if (!((cash <= 1 && fs >= 2) || (cash === 0 && S.ch >= 8))) return;
  var cur = EV_BY_ID[S.plan[S.pi]];
  var pool = EVENTS.filter(function (e) { return e.ch === S.ch && e.id.indexOf("yol-") === 0 && eligible(S, e) && S.plan.indexOf(e.id) < 0; });
  if (!pool.length) return;
  var k = pool[Math.floor(Math.random() * pool.length)];
  S.yolCh[S.ch] = k.id; S.failStreak = 0;
  S.krizAt = { id: k.id, age: eventAge(S, cur), m: evM(S, cur) };
  S.plan.splice(S.pi + 1, 0, k.id);
}
function evM(S, e) { return S.krizAt && S.krizAt.id === e.id ? S.krizAt.m : e._m; }
function setEndAge(S, plan) {
  var last = 0;
  plan.forEach(function (id) { if (id !== "son-soz") last = Math.max(last, EV_BY_ID[id]._m); });
  S.endAge = Math.floor(last / 12) + 1 + Math.floor(Math.random() * 5);
}
function eventAge(S, e) { return (typeof ageDisp === "function" ? ageDisp : String)(e.id === "son-soz" && S.endAge ? S.endAge + " yaş" : S.krizAt && S.krizAt.id === e.id ? S.krizAt.age : e.age); }
function ageYears(S, e) { return e.id === "son-soz" && S.endAge ? S.endAge : evM(S, e) / 12; }
function hasChapter(ch) { return !!CHAPTERS[ch] && EVENTS.some(function (e) { return e.ch === ch; }); }
function curEvent(S) { var e = EV_BY_ID[S.plan[S.pi]]; return e && e.variants ? withVariant(S, e) : e; }
/* Aynı olay, oyuncunun geçmişine göre farklı başlık/metin/seçim ifadesiyle gösterilir (ilk eşleşen varyant). Zar, bayrak ve zincirler aynı kalır. */
function withVariant(S, e) {
  var v = null;
  for (var i = 0; i < e.variants.length; i++) if (e.variants[i].flags.every(function (f) { return S.flags.indexOf(f) >= 0; })) { v = e.variants[i]; break; }
  if (!v) return e;
  if (!v._e) {
    var o = Object.assign({}, e); delete o.variants;
    if (v.title) o.title = v.title;
    if (v.text) o.text = v.text;
    o.choices = e.choices.map(function (c, i) {
      var cv = v.ch && v.ch[i + 1]; if (!cv) return c;
      var n = Object.assign({}, c);
      if (cv.t) n.t = cv.t;
      if (cv.r != null) n.r = typeof cv.r === "string" ? cv.r : Object.assign({}, c.r, cv.r);
      return n;
    });
    v._e = o;
  }
  return v._e;
}

/* Kavşağın sonucu tek bir yol adıyla: "İyi bir lise", "Okulu bıraktı", "Esnaf oldu" */
var PATH_LABEL = { "k10-esnaf|Markete “koruma” ortaklığı sat": ["Mahallenin “koruyucusu” oldu", "Koruma pazarlığı tutmadı"] };
function kavsakPath(e, c, outcome) {
  var po = PATH_LABEL[e.id + "|" + c.t];
  if (po) return outcome === "crit" || outcome === "win" ? po[0] : po[1];
  var lbl = function (f) { f = flagList(f).filter(function (x) { return x.charAt(0) !== "-"; })[0]; return f && FLAG_LABELS[f] ? FLAG_LABELS[f].replace(/\.$/, "") : ""; };
  var win = outcome === "crit" || outcome === "win";
  if (outcome === "direct") return lbl(c.flag) || c.t;
  if (e.kavsakKazan) return win ? e.kavsakKazan : (e.kavsakKaybet || c.t);
  if (!win && c.flagWin && !c.flagFail && !c.flag) return "Olmadı: " + c.t;
  return (win ? lbl(c.flagWin) : lbl(c.flagFail)) || lbl(c.flag) || c.t;
}
/* Kendi kazancın: büyük olaylarda (meslek, göç, miras…) varlık kademesi yükselir; aile desteğinden bağımsızdır */
function gainVarlik(S, c, res) {
  if (c.varlik == null && !c.varlikKayip) return;
  res = res || {};
  var v0 = varlikOf(S);
  if (c.varlik != null && c.varlik > v0) cashChange(S, c.varlik - v0, res);
  if (c.varlikKayip) cashChange(S, -c.varlikKayip, res);
}
/* İtibar: bölümün beklenen stat değerine göre yüksek (+1), normal (0) ya da düşük (-1) */
var ITIBAR_HIGH = 3, ITIBAR_LOW = -10;
/* Gönül: aileyle bağ. Beklenenin belirgin üstü desteği artırır, belirgin altı aşındırır */
function gonulLevel(S, ch) {
  var d = S.stats["Gönül"] - statNorm("Gönül", ch || S.ch);
  return d >= 6 ? 1 : d <= -6 ? -1 : 0;
}
function itibarLevel(S, ch) {
  var d = S.stats["İtibar"] - CHAPTERS[ch || S.ch].expected;
  return d >= ITIBAR_HIGH ? 1 : d <= ITIBAR_LOW ? -1 : 0;
}
/* Bölüm sonu: yüksek itibar küs aileyle barıştırır, düşük itibar aile desteğini aşındırır (Bölüm III'ten itibaren) */
function closeChapter(S) {
  S.itibarNote = S.itibarNote || {};
  if (S.itibarNote[S.ch] !== undefined || S.ch < 3 || !S.family) return S.itibarNote[S.ch];
  var lv = itibarLevel(S), gl = gonulLevel(S), d0 = destekOf(S), note = 0, sum = lv + gl;
  /* Aile desteği yalnızca ailenin hoşuna gitmeyen bir seçim yapıldıysa düşer; yalnızca düşük değerler yetmez */
  var disliked = ((S.destekNeg || {})[S.ch] || 0) > 0;
  if (sum > 0 && d0 < 2) { S.destek = d0 + 1; note = 1; }
  else if (sum < 0 && d0 > 0 && disliked) { S.destek = d0 - 1; note = -1; }
  S.itibarNote[S.ch] = note;
  S.destekWhy = S.destekWhy || {}; S.destekWhy[S.ch] = lv && gl ? "ikisi" : gl ? "gonul" : "itibar";
  /* Borç faizi: ödenmemiş borç maddi durumu aşındırır (en çok iki kez) */
  S.faizN = S.faizN || 0; S.faizNote = S.faizNote || {};
  if ((S.flags.indexOf("borclu") >= 0 || S.flags.indexOf("kart-borclu") >= 0) && S.faizN < 2 && varlikOf(S) >= 2) { cashChange(S, -1); S.faizN++; S.faizNote[S.ch] = 1; }
  return note;
}
function destekOf(S) { return S.destek == null ? 2 : S.destek; }
/* Aile desteği azaldıkça ailenin İYİ yönleri zayıflar (Tam %100, Mesafeli %60, Küs %25); kötü yönler aynen sürer */
var DESTEK_ETKI = [0.25, 0.6, 1];
function sgn(v) { return v > 0 ? "+" + v : String(v); }
function famScale(S, v) { return v > 0 ? Math.round(v * DESTEK_ETKI[destekOf(S)]) : v; }
function destekDelta(S, c) {
  if (!c.destek || !S.family) return 0;
  var d = c.destek[S.family]; if (d == null) d = c.destek["*"];
  return d || 0;
}
/* Görünen varlık: ailenin kademesi desteğe göre (tam = aynı, mesafeli = bir aşağı, küs = hiçbir şey) */
function varlikOf(S) {
  if (S.cash == null) { /* eski kayıt: eski kurala göre bir kez hesapla */
    var t = S.family ? FAMILIES[S.family].tier : 1, d = destekOf(S);
    S.cash = Math.max(S.own || 0, d === 2 ? t : d === 1 ? t - 1 : 0);
  }
  return S.cash;
}
/* Maddi durum tek bir kademedir (0–4). Artış ve düşüş oyuncuya gösterilir. */
function cashChange(S, d, res) {
  var v0 = varlikOf(S); S.cash = clamp(v0 + d, 0, TIERS.length - 1);
  if (res && S.cash !== v0) res.varlik = (res.varlik || 0) + (S.cash - v0);
}
function applyFamily(S, name) {
  S.family = name;
  var m = FAMILIES[name].mods;
  STATS.forEach(function (k) { S.stats[k] = clamp(S.stats[k] + (m[k] || 0), 0, 100); });
  S.famStats = Object.assign({}, S.stats);
  S.cash = FAMILIES[name].tier;
}

function hasReq(S, c, e) {
  if (c.req && S.traits.indexOf(c.req) < 0) return false;
  if (c.reqGender && c.reqGender !== S.gender) return false;
  if (c.reqFlag && S.flags.indexOf(c.reqFlag) < 0) return false;
  if (c.reqVarlik != null && varlikOf(S) < c.reqVarlik) return false;
  if (c.reqDestek != null && destekOf(S) < c.reqDestek) return false;
  for (var rs in (c.reqStat || {})) if (S.stats[rs] < c.reqStat[rs]) return false;
  if (c.reqNotFlag && flagList(c.reqNotFlag).some(function (f) { return S.flags.indexOf(f) >= 0; })) return false;
  if (c.reqVoice) {
    var ok = e && eventVoices(S, e).some(function (v) { return v.stat === c.reqVoice && v.pass; });
    if (!ok) return false;
  }
  return true;
}

/* İç sesler: zar atılmadan, stat yeterliyse araya giren pasif kontroller */
var PASSIVE = { easy: -3, medium: 1, hard: 5, veryHard: 9 };
/* İç seslerin karakteri: kart üstünde özellik adının yanında küçük etiket */
var VOICE_CHAR = { "Akıl": "ukala öğretmen", "Çene": "pazarcı", "Kurnazlık": "eski tüfek", "Cesaret": "asker dayı", "Pişkinlik": "sunucu", "İtibar": "mahalle muhtarı", "Gönül": "âşık", "Dayanıklılık": "maratoncu komşu", "Sosyal Radar": "dedikoducu teyze" };
/* Aile desteği ve varlık kademelerinin tek satırlık hali */
var DESTEK_ALT = { "Küs": "Bayramda aranmadın.", "Mesafeli": "Sadece aile grubunda görüşüyorsunuz; ilgi azaldı, kapı kapanmadı.", "Tam": "Pazar yemeği sende." };
var TIER_ALT = { "Borç içinde": "Ay sonu zor.", "Fakir": "İdare eder, ama güç bela.", "Orta": "Ne eksik ne fazla.", "Rahat": "Hali vakti yerinde.", "Zengin": "Köşeyi dönmüş." };
/* Bölüm sonu: babaannenin ağzından, bu bölümde açılan hafızalara göre */
var NINE_SABLON = { kediSuclu: "“İki yaşında kediyi mahkûm ettirdi.”", ilkKelimePara: "“İlk kelimesi ‘para’ oldu; deden cüzdanını o gün çıkardı.”", yalanci: "“Duvara güneş çizdi, suçu kuzenine attı.”", yapiskan: "“Kreş kapısında bacak bırakmadı; bizde de öyleydi.”", kardesli: "“Kardeşi geldi; ilk gün hediyeleri saydı.”", sirVerdi: "“Kreşte bir sır duydu, akşama bütün kreş duydu.”", cesurPark: "“Parktaki koca çocuğa ‘Burası herkesin!’ dedi.”", "mahalle-cocugu": "“Sokaktan eve girmedi.”", "ekran-cocugu": "“Tableti benden iyi kullanır.”", "alcili-kol": "“Dut ağacına çıktı, kolu alçıyla döndü; alçıyı bütün sınıf imzaladı.”", tepsiTekeli: "“Mahallenin bütün tepsileri bir kış onda kaldı.”", baskan: "“Sınıf başkanı oldu; evde de seçim yaptırdı.”", kediGeldi: "“Eve kedi getirdi; kedi hâlâ burada, kendisi gitti.”", camKirildi: "“Komşunun camını kırdı; cam değişti, komşu değişmedi.”", "iyi-lise": "“Sınavı kazandı; mahallede üç gün baklava dağıttık.”", lakapli: "“Ortaokulda taktıkları ad liseye kadar gitti.”", evli: "“Evlendi; takı defterini ben tuttum.”", cocuklu: "“Çocuğu oldu; ilk gece ben uyumadım.”", hapis: "“Bir süre uzaktaydı. Sormayın.”", "askerlik-yapti": "“Askere gitti; mektupları hâlâ bende.”", "ev-sahibi": "“Ev aldı; ilk pazar yemeğini orada yedik.”" };
var NINE_VARSAYILAN = "“Uslu çocuktu, ne diyeyim. Biraz da sessiz.”";
/* Mezar taşı: İtibar farkına göre taziye cümlesi */
var TAZIYE = [[-10, "Cenazeye dört kişi geldi; ikisi yanlış cenazedeydi, kaldılar."], [-3, "Taziye evinde çay bir gün yetti. İkinci gün kimse gelmedi; çay da."], [4, "Taziye evinde üç gün çay bitmedi. Herkes bir anını anlattı; yarısı doğruydu."], [11, "Mahalle kahvesi o gün kepenk indirdi. Bakkal adını veresiye defterinden sildi; borç yoktu, saygıdan."], [999, "Kalabalık sokağa sığmadı; trafik yarım saat durdu. Kimse kornaya basmadı."]];
function taziyeText(S) { var d = S.stats["İtibar"] - statNorm("İtibar", S.ch); for (var i = 0; i < TAZIYE.length; i++) if (d <= TAZIYE[i][0]) return TAZIYE[i][1]; return TAZIYE[TAZIYE.length - 1][1]; }
/* Bölüm sonu cümleleri Excel'deki Hafıza sayfasından gelir (FLAG_NINE); eski şablonlar yedek */
function nineOf(f) { return (typeof FLAG_NINE !== "undefined" && FLAG_NINE[f]) || NINE_SABLON[f]; }
/* Anlatıcı yaşa göre değişir: çocuklukta babaanne, gençlikte anne, ileri yaşta mahallenin en yaşlısı */
function nineTeller(ch) { return ch <= 4 ? "👵 Babaannen" : ch <= 7 ? "👩 Annen" : "🧓 Mahallenin en yaşlısı"; }
var NINE_VARS = { 1: NINE_VARSAYILAN, 2: NINE_VARSAYILAN, 3: "“Okula gitti geldi; çantası hep ağırdı.”", 4: "“Sesi değişti, kapısı kapandı. Bu yaşta hepsi öyle.”", 5: "“Sınavdı, dersaneydi derken bir baktık büyümüş.”", 6: "“Kendi ayakları üstünde durmaya çalıştı; arada bir de bize uğradı.”", 7: "“Koşturdu durdu; pazar günleri bile telefonu elindeydi.”", 8: "“Saçına ak düştü, inadı aynı.”", 9: "“Emekli oldu ama mahallenin işi bitmedi.”", 10: "“Hâlâ her sabah balkonda; kim geçti, ne dedi, hepsini bilir.”" };
function nineText(S, ch) { var start = (S.chFlags || {})[ch] || [], got = S.flags.filter(function (f) { return start.indexOf(f) < 0 && nineOf(f); }).slice(-2); return got.length ? got.map(nineOf).join(" ") : (NINE_VARS[ch] || NINE_VARSAYILAN); }
var VOICE_NAMES = { "Akıl": "AKIL", "Çene": "ÇENE", "Kurnazlık": "KURNAZLIK", "Cesaret": "CESARET", "Pişkinlik": "PİŞKİNLİK", "İtibar": "İTİBAR", "Gönül": "GÖNÜL", "Dayanıklılık": "DAYANIKLILIK", "Sosyal Radar": "SOSYAL RADAR" };
function voicePower(S, stat) {
  var p = S.stats[stat];
  S.traits.forEach(function (t) { p += 2 * (((TRAITS[t] || {}).bonus || {})[stat] || 0); });
  if (S.family) FAMILIES[S.family].traits.forEach(function (t) { p += 2 * famScale(S, (t.stats || {})[stat] || 0); });
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
/* Her özellik kendi olağan seviyesiyle kıyaslanır: az sınanan özellikler (Cesaret, Pişkinlik, Gönül) doğal olarak daha yavaş büyür.
   Değerler simülasyonla ölçülen tipik oyuncunun bölüm ortancalarından gelir (tools/simulasyon.js). */
var STAT_OFFSET = { "Akıl": -7, "Çene": 3, "Kurnazlık": -2, "Cesaret": -9, "Pişkinlik": -9, "İtibar": -4, "Gönül": -13, "Dayanıklılık": -4, "Sosyal Radar": -3 };
function statNorm(stat, ch) { return CHAPTERS[ch].expected + (STAT_OFFSET[stat] || 0); }
function needBreakdown(S, e, c) {
  var d = DIFF[c.diff], ch = CHAPTERS[e.ch], rows = [];
  var base = d.base + (ch.step || 0);
  rows.push({ icon: "🎯", label: d.label + " zorluk", val: base, kind: "base" });
  var st = S.stats[c.stat];
  var statAdj = -Math.round((st - statNorm(c.stat, e.ch)) / 4);
  if (statAdj) rows.push({ icon: STAT_ICONS[c.stat], label: c.stat + " " + st + (statAdj < 0 ? " (beklenenin üstünde)" : " (beklenenin altında)"), val: statAdj, kind: "stat" });
  /* Cesaret: hattı değiştiren zarlarda cesur olana kapı biraz daha açılır (beklenenin her 3 puan üstü −1, en fazla −5) */
  if (/(^|,\s*)-(meslek|hat)-/.test(c.flagWin || "")) {
    var cb = clamp(Math.round((S.stats["Cesaret"] - statNorm("Cesaret", e.ch)) / 3), 0, 5);
    if (cb) rows.push({ icon: "🔥", label: "Cesaret: yol değiştirme cesareti", val: -cb, kind: "cesaret" });
  }
  if (e.id === "karne-gunu" && S.karne && S.karne.g !== "orta") rows.push({ icon: "📜", label: S.karne.g === "iyi" ? "Karne iyi" : "Karne kötü", val: S.karne.g === "iyi" ? -3 : 3, kind: "karne" });
  var fb = famScale(S, familyEventBonus(S, e, c.stat));
  if (fb) rows.push({ icon: "🏠", label: S.family + " ailesi etkisi", val: -fb, kind: "family" });
  if (S.family) FAMILIES[S.family].traits.forEach(function (t) {
    var v0 = (t.stats || {})[c.stat] || 0, v = famScale(S, v0);
    if (v0) rows.push({ icon: t.good ? "🏠" : "⚠️", label: t.name + (v !== v0 ? " (aile desteği " + DESTEK[destekOf(S)].toLowerCase() + ": " + sgn(-v0) + " → " + sgn(-v) + ")" : ""), val: -v, kind: "famtrait" });
  });
  var tsum = 0, trows = [];
  S.traits.forEach(function (t) {
    var v = ((TRAITS[t] || {}).bonus || {})[c.stat] || 0;
    if (v) { trows.push({ icon: "🏅", label: "“" + t + "” rozeti", val: -v, kind: "trait" }); tsum += v; }
  });
  if (tsum > 3) { trows.push({ icon: "🏅", label: "Rozet tavanı (en fazla −3)", val: tsum - 3, kind: "cap" }); }
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
/* Bir seçim birden fazla hafıza yazabilir: "hat-polis, meslek-memur" */
function flagList(f) { return f ? String(f).split(/\s*,\s*/).filter(Boolean) : []; }
/* "-evli" gibi eksiyle başlayan hafıza silinir: "-meslek-memur, hat-koy" hattı değiştirir */
function addFlag(S, f) {
  flagList(f).forEach(function (x) {
    if (x.charAt(0) === "-") { x = x.slice(1); S.flags = S.flags.filter(function (y) { return y !== x; }); }
    else if (S.flags.indexOf(x) < 0) S.flags.push(x);
  });
}
/* Hat: hat-* hafızası varsa o, yoksa meslek-* (memur, beyazyaka, esnaf, serbest) */
function primaryHat(S) {
  for (var i = 0; i < S.flags.length; i++) if (S.flags[i].indexOf("hat-") === 0) return S.flags[i].slice(4);
  for (i = 0; i < S.flags.length; i++) if (S.flags[i].indexOf("meslek-") === 0 && S.flags[i] !== "meslek-lisesi") return S.flags[i].slice(7);
  return "";
}
function addStat(S, k, v, res) {
  if (!v) return;
  S.stats[k] = clamp(S.stats[k] + v, 0, 100);
  res.deltas.push([k, v]);
}

/* Seçimin sonucunu uygula. outcome: direct | crit | win | mid | fail | bad */
/* Para kazandıran iş olayları: bunlardan biri yaşanmadan ilk maaş/zarf olayı gelmez */
var WORK_EV = ["b5-yaz-isi-garson", "b5-kurye-isi", "b5-ozel-ders", "b5-cay-ocagi", "b5-sanayi-ciragi", "b5-atolye-staji"];
function applyOutcome(S, e, c, outcome, extra) {
  var res = { outcome: outcome, deltas: [], traits: [], note: "", text: "" };
  extra = extra || {};
  if (e.kavsak) { S.kavsak = S.kavsak || []; if (S.kavsak.indexOf(e.kavsak) < 0) S.kavsak.push(e.kavsak); }
  var wasHapis = S.flags.indexOf("hapis") >= 0, v00 = varlikOf(S), d00 = destekOf(S);
  addFlag(S, c.flag);
  if (WORK_EV.indexOf(e.id) >= 0) addFlag(S, "yaz-calisti");
  if (c.unflag) { var un = flagList(c.unflag); S.flags = S.flags.filter(function (f) { return un.indexOf(f) < 0; }); }
  /* Aile desteği: seçimin kendisi aileyi etkiler (her seçim bir vazgeçiş) */
  var dd = destekDelta(S, c);
  if (dd < 0) { S.destekNeg = S.destekNeg || {}; S.destekNeg[S.ch] = (S.destekNeg[S.ch] || 0) + 1; }
  if (dd) { var d0 = destekOf(S); S.destek = clamp(d0 + dd, 0, 2); if (S.destek !== d0) res.destek = S.destek - d0; }
  if (outcome === "direct") {
    for (var k in (c.direct || {})) addStat(S, k, c.direct[k], res);
    gainTrait(S, c.trait, res);
    gainVarlik(S, c, res);
    res.text = c.r;
  } else {
    var d = DIFF[c.diff];
    var success = outcome === "crit" || outcome === "win";
    if (outcome === "crit") addStat(S, c.stat, d.crit, res);
    else if (outcome === "win") addStat(S, c.stat, d.succ, res);
    else if (outcome === "bad") addStat(S, c.stat, -d.loss, res);
    if (success) {
      addFlag(S, c.flagWin);
      if (outcome === "crit") addFlag(S, c.flagCrit);
      gainTrait(S, c.trait, res);
      gainVarlik(S, c, res);
      if (!c.trait && (outcome === "crit" || c.diff === "hard" || c.diff === "veryHard")) gainTrait(S, AUTO_TRAITS[c.stat], res);
    }
    if (outcome === "bad") addFlag(S, c.flagBad);
    /* Kritik hata lakabı: mahalle bir ad takar; bölüm sonunda ve mezar taşında görünür */
    if (outcome === "bad" && c.lakap) { S.lakaplar = S.lakaplar || []; if (!S.lakaplar.some(function (l) { return l.n === c.lakap; })) { S.lakaplar.push({ n: c.lakap, ch: e.ch }); res.lakap = c.lakap; } }
    if (!success) { addFlag(S, c.flagFail); if (c.paraFail) cashChange(S, -(c.paraFail + (outcome === "bad" ? 1 : 0)), res); }
    if (!c.mini || outcome !== "mid") S.failStreak = success ? 0 : (S.failStreak || 0) + 1;
    var r = c.r || {};
    res.text = r[outcome] || (outcome === "crit" ? r.win : null) || (outcome === "mid" ? r.fail : null) || DEFAULT_TEXT[outcome];
  }
  /* Hapse düşmek: birikim sıfırlanır, aile desteği bir kademe düşer.
     İtibarı yüksek olana mahalle kefil olur: ceza hafifler, aile küsmez, birikimin bir kısmı kalır, tahliye erken gelir. */
  if (!wasHapis && S.flags.indexOf("hapis") >= 0) {
    S.failStreak = 0;
    if (itibarLevel(S, e.ch) > 0) { cashChange(S, -2); addFlag(S, "ceza-indirimi"); res.note = "Mahallen sana kefil oldu: cezan hafifletildi, ailen arkanda."; }
    else { S.cash = 0; S.destek = Math.max(0, destekOf(S) - 1); }
    if (varlikOf(S) !== v00) res.varlik = varlikOf(S) - v00;
    if (destekOf(S) !== d00) res.destek = destekOf(S) - d00;
  }
  if (c.risk && (extra.deathRoll != null ? extra.deathRoll : Math.random()) < c.risk.p) {
    res.death = c.risk.cause;
    S.dead = { cause: c.risk.cause, age: eventAge(S, e), title: e.title };
  } else if (e.ch >= 6) {
    var bg = backgroundDeath(S, e, extra.bgRoll);
    if (bg) { res.death = bg; res.natural = true; res.deathP = hazard(S, e); S.dead = { cause: bg, age: eventAge(S, e), title: e.title }; }
  }
  var unlock = c.reqFlag && /^(hat|meslek)-|^evli$/.test(c.reqFlag) ? null : c.reqFlag ? { type: "flag", key: c.reqFlag } : c.reqVoice ? { type: "voice", key: c.reqVoice } : c.req ? { type: "trait", key: c.req } :
    c.reqVarlik != null ? { type: "varlik", key: TIERS[c.reqVarlik] } : c.reqDestek != null ? { type: "destek", key: DESTEK[c.reqDestek] } : null;
  if (e.kavsak) {
    S.kavsakLog = S.kavsakLog || [];
    S.kavsakLog.push({ n: e.kavsak, ch: e.ch, title: e.title, path: kavsakPath(e, c, outcome), win: outcome === "crit" || outcome === "win" || outcome === "direct" });
  }
  S.log.push({ id: e.id, ch: e.ch, age: eventAge(S, e), title: e.title, choice: c.t, outcome: outcome, roll: extra.roll || null, unlock: unlock });
  return res;
}

/* 18 yaş sonrası yaşla artan arka plan riski (olay başına) */
var HAZARD_REF = { 6: 14, 7: 14, 8: 13, 9: 13, 10: 11 };
function hazard(S, e) {
  var y = ageYears(S, e);
  if (y < 18) return 0;
  var h = y < 26 ? 0.0012 : y < 40 ? 0.0018 : y < 55 ? 0.0035 : y < 70 ? 0.009 : y < 80 ? 0.022 : 0.04;
  if (S.flags.indexOf("sigara") >= 0) h *= 1.6;
  if (S.flags.indexOf("sporcu") >= 0) h *= 0.7;
  h *= clamp(1 - (S.stats["Dayanıklılık"] - CHAPTERS[e.ch].expected) / 60, 0.6, 1.4);
  /* Risk olay başına uygulanır; bölümdeki olay sayısı azalınca ölüm dağılımı değişmesin diye ölçeklenir (ilk ayar 14/14/13/13/11 olaya göre yapılmıştı) */
  h *= (HAZARD_REF[e.ch] || CHAPTERS[e.ch].pick) / CHAPTERS[e.ch].pick;
  return h;
}
/* Arka plan ölümünün nedeni olayın geçtiği yere uymalı: mekân → neden grubu */
var PLACE_GRP = { ev: "ev", mutfak: "ev", "cocuk-odasi": "ev", apartman: "ev", yazlik: "ev",
  sokak: "yol", trafik: "yol", park: "yol", "toplu-tasima": "yol", sahil: "yol", havalimani: "yol",
  ofis: "is", dukkan: "is", banka: "is", carsi: "is", market: "is", bakkal: "is", "devlet-dairesi": "is", studyo: "is",
  hastane: "saglik",
  kafe: "sosyal", "dugun-salonu": "sosyal", sahne: "sosyal", stadyum: "sosyal",
  okul: "kurum", sinif: "kurum", "okul-bahcesi": "kurum", universite: "kurum", kisla: "kurum", karakol: "kurum", cezaevi: "kurum", mahkeme: "kurum", meclis: "kurum", koy: "kurum", huzurevi: "kurum", mezarlik: "kurum" };
function backgroundDeath(S, e, roll) {
  if (e.id === "son-soz") return null;
  if (e.kavsak) return null; /* kavşakta ölüm yalnızca seçimin kendi riskinden gelir */
  if ((roll != null ? roll : Math.random()) >= hazard(S, e)) return null;
  var y = ageYears(S, e);
  var grp = PLACE_GRP[e.place] || "ev";
  var all = DEATH_CAUSES.filter(function (d) { return y >= d.min && y <= d.max && (!d.flag || S.flags.indexOf(d.flag) >= 0); });
  var pool = all.filter(function (d) { return d.grp === grp; });
  if (!pool.length) pool = all.filter(function (d) { return !d.grp || d.grp === "ev"; });
  if (!pool.length) return "Bir salı öğleden sonrası, hiç beklenmedik bir anda. Salılar zaten hep tuhaftır.";
  var wsum = 0; pool.forEach(function (d) { wsum += d.flag ? 3 : 1; });
  var r = Math.random() * wsum;
  for (var i = 0; i < pool.length; i++) { r -= pool[i].flag ? 3 : 1; if (r <= 0) return pool[i].text; }
  return pool[pool.length - 1].text;
}

/* Final kartı: en güçlü iki stat (mevcut değer + gelişimin iki katı) */
var ARCH_ADJ = { "Akıl": "Hesaplı", "Çene": "Dili Güçlü", "Kurnazlık": "Kurnaz", "Cesaret": "Gözü Kara", "Pişkinlik": "Pişkin", "İtibar": "Saygın", "Gönül": "Sevecen", "Dayanıklılık": "Sabırlı", "Sosyal Radar": "Sezgili" };
/* Meslek adı değil, karakter adı: hangi yolu seçersen seç çelişmesin (polis yolunda "Mühendis" çıkmasın) */
var ARCH_NOUN = { "Akıl": "Bilge", "Çene": "Hatip", "Kurnazlık": "Tilki", "Cesaret": "Yiğit", "Pişkinlik": "Şovmen", "İtibar": "Mahalle Büyüğü", "Gönül": "Âşık", "Dayanıklılık": "Maratoncu", "Sosyal Radar": "Gözlemci" };
var PROPHECY = {
  "Akıl": "Makarya'da bir gün bir köprü, bir yazılım ya da en azından bir tablo dosyası senin adını taşıyacak.",
  "Çene": "Ya büyükelçi olacaksın ya da çarşının en iyi pazarlığını yapan kişi.",
  "Kurnazlık": "Makarya Merkez Bankası seni artık izliyor.",
  "Cesaret": "Makarya'da 'Bunu kim yapar?' sorusunun cevabı genelde sen olacaksın.",
  "Pişkinlik": "Sahneler, kameralar ve aile düğünleri seni bekliyor.",
  "İtibar": "Mahallede adın geçince herkes bir an susar; sonra hep iyi şeyler söyler.",
  "Gönül": "Bir gün biri senin için bir şarkı yazacak. Muhtemelen kötü, ama içten.",
  "Dayanıklılık": "Makarya trafiğine bile sabredebilecek nadir insanlardan biri olacaksın.",
  "Sosyal Radar": "Bir odaya girdiğinde, kimin kime kızgın olduğunu herkesten önce bileceksin."
};
/* Bazı statlar oyunda daha sık geçtiği için simülasyonla dengelenir (tools/simulasyon.js, 3.000 tam hayat) */
var ARCH_NORM = {"Akıl":-5,"Çene":2,"Kurnazlık":-1,"Cesaret":-19,"Pişkinlik":-11,"İtibar":-9,"Gönül":-46,"Dayanıklılık":12,"Sosyal Radar":-17};
function archetype(S) {
  var base = S.famStats || S.stats;
  var scored = STATS.map(function (k) { return { k: k, s: S.stats[k] + 2 * (S.stats[k] - base[k]) - (ARCH_NORM[k] || 0) }; })
    .sort(function (a, b) { return b.s - a.s; });
  var top = scored[0].k, second = scored[1].k;
  return { title: ARCH_ADJ[second] + " " + ARCH_NOUN[top], top: top, second: second, prophecy: PROPHECY[top] };
}

if (typeof module !== "undefined") module.exports = {};

/* Karne Günü: şimdiye kadarki seçimler (Akıl, Dayanıklılık, hafızalar) + bir zar. Sonuç olayın zorluğunu ve metnini belirler. */
var KARNE_FLAGS = { baskan: 1, "teneffus-tuccari": 0, "ekran-cocugu": -1, "mahalle-cocugu": 0, yalanci: -1, tepsiTekeli: -1, "alcili-kol": -1, sirVerdi: 0, kardesli: -1 };
function karneOf(S) {
  if (S.karne) return S.karne;
  var pts = Math.round(((S.stats["Akıl"] - statNorm("Akıl", 3)) * 0.6 + (S.stats["Dayanıklılık"] - statNorm("Dayanıklılık", 3)) * 0.4) / 2);
  var fl = 0; S.flags.forEach(function (f) { fl += KARNE_FLAGS[f] || 0; });
  var roll = 1 + Math.floor(Math.random() * 20), t = roll + pts + fl;
  var g = t >= 14 ? "iyi" : t <= 7 ? "kotu" : "orta";
  S.karne = { g: g, roll: roll, pts: pts + fl };
  addFlag(S, "karne-" + g);
  return S.karne;
}
