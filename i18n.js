/* Makarya — dil altyapısı. Oyun Türkçe yazılır; İngilizce, "Türkçe metin → İngilizce karşılık" sözlüğüyle (lang/en.js) üstüne giydirilir.
   Çevrilmemiş metin Türkçe kalır; böylece dil adım adım tamamlanabilir. Mantıkta kullanılan adlar (özellik, rozet, aile, hafıza kodları) hiç çevrilmez. */
var LANG = (function () { try { return localStorage.getItem("makarya-dil") === "en" ? "en" : "tr"; } catch (e) { return "tr"; } })();
var EN_DICT = {}, EN_UI = {};
/* Çevrilecek (görünen) alanlar */
var I18N_KEYS = { title: 1, text: 1, t: 1, r: 1, win: 1, crit: 1, fail: 1, bad: 1, kavsakGiris: 1, kavsakKazan: 1, kavsakKaybet: 1,
  desc: 1, subtitle: 1, range: 1, endAge: 1, endText: 1, next: 1, name: 0 };
var I18N_MAPKEYS = { lines: 1, tagLine: 1 };  /* değerleri metin olan sözlükler */
function i18nWalk(o, fn, key) {
  if (Array.isArray(o)) { for (var i = 0; i < o.length; i++) { if (typeof o[i] === "string") { if (I18N_KEYS[key] || I18N_MAPKEYS[key]) o[i] = fn(o[i]); } else if (o[i] && typeof o[i] === "object") i18nWalk(o[i], fn, key); } return; }
  for (var k in o) {
    var v = o[k];
    if (typeof v === "string") { if (I18N_KEYS[k] || (I18N_MAPKEYS[key] && !I18N_KEYS.hasOwnProperty(k))) o[k] = fn(v); }
    else if (v && typeof v === "object") i18nWalk(v, fn, k);
  }
}
/* Anahtarı kod olan, değeri metin olan sözlükler */
function i18nValues(map, fn) { for (var k in map) if (typeof map[k] === "string") map[k] = fn(map[k]); }
function i18nEach(fn) {
  i18nWalk(EVENTS, fn); i18nWalk(TRAITS, fn); i18nWalk(FAMILIES, fn);
  Object.keys(CHAPTERS).forEach(function (n) { var c = CHAPTERS[n]; if (c) { ["name", "range", "endAge", "endText", "next"].forEach(function (k) { if (typeof c[k] === "string" && c[k]) c[k] = fn(c[k]); }); } });
  i18nValues(FLAG_LABELS, fn); i18nValues(FLAG_NEXT, fn); i18nValues(FLAG_NINE, fn);
  DEATH_CAUSES.forEach(function (d) { d.text = fn(d.text); });
}
function i18nApply() { if (LANG !== "en") return; i18nEach(function (s) { return EN_DICT[s] || s; }); }
function i18nCollect() { var out = {}; i18nEach(function (s) { if (/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(s)) out[s] = 1; return s; }); return Object.keys(out); }
/* Arayüz metni: T("Türkçe") → İngilizce (yoksa Türkçe) */
function T(s) { return LANG === "en" && EN_UI[s] ? EN_UI[s] : s; }
/* Yaş yazıları: "20 yaş 11 ay" → "20 yrs 11 mo" */
function ageDisp(s) { return LANG === "en" && s ? String(s).replace(/yaş/g, "yrs").replace(/YAŞ/g, "YRS").replace(/\bay\b/g, "mo") : s; }
function setLang(l) { try { localStorage.setItem("makarya-dil", l); } catch (e) {} location.reload(); }
