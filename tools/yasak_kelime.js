#!/usr/bin/env node
/* Yasak kelime taraması: çocukluk bölümlerinde (1–4) kurumsal/ofis jargonu HATA, Bölüm 5'te UYARI.
   Kullanım: node tools/yasak_kelime.js [--uyari-da]   (çıkış kodu: hata varsa 1) */
const fs = require("fs"), vm = require("vm"), path = require("path");
const R = path.join(__dirname, ".."); const c = {}; vm.createContext(c);
for (const f of ["data.js", "content.js"]) vm.runInContext(fs.readFileSync(path.join(R, f), "utf8"), c);
vm.runInContext("this.X={E:EVENTS}", c);
const HATA = [1, 2, 3, 4], UYARI = [5];
const KELIMELER = ["dosya", "departman", "operasyon", "prosedür", "protokol", "toplantı", "basın", "gündem", "müzakere", "diplomatik", "diplomasi", "koalisyon",
  "network", "likidite", "arbitraj", "piyasa", "portföy", "portfolyo", "paydaş", "stratejik", "strateji", "mekanizma", "kurumsal", "tedarik", "lojistik",
  "veri", "analiz", "performans", "yetkinlik", "KPI", "terfi", "stajyer", "sistem"];
const POLISIYE = ["dosya", "şüpheli", "olay yeri", "dava", "sorgu", "mahkûm"];
const POLISIYE_IZIN = { 1: ["vazo-kirildi", "kim-yapti"], 2: ["ilk-gercek-yalan"] };
/* Türkçe ekler: kelime + ekler + sınır (ör. toplantıya, dosyanın); "veriyor", "sistematik" gibi başka kelimeler yakalanmaz */
const SUF = "ler|lar|si|sı|su|sü|i|ı|u|ü|e|a|ye|ya|yi|yı|yu|yü|de|da|te|ta|den|dan|ten|tan|nin|nın|nun|nün|in|ın|un|ün|n|m|miz|mız|muz|müz|niz|nız|nuz|nüz|yle|yla|le|la|ki|dir|dır|dur|dür|tir|tır|tur|tür|lik|lık|luk|lük|sel|sal|ce|ca|çe|ça";
const lower = s => String(s).toLocaleLowerCase("tr");
function bul(metin) {
  const t = lower(metin), out = [];
  for (const k of KELIMELER) { const re = new RegExp("(^|[^a-zçğıöşü])" + lower(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:" + SUF + ")*(?![a-zçğıöşü])"); if (re.test(t)) out.push(k); }
  return out;
}
const rows = [];
for (const e of c.X.E) {
  const seviye = HATA.includes(e.ch) ? "HATA" : UYARI.includes(e.ch) ? "UYARI" : null; if (!seviye) continue;
  const izin = (POLISIYE_IZIN[e.ch] || []).includes(e.id);
  const alanlar = [["metin", e.text], ["kavşak girişi", e.kavsakGiris]];
  (e.voices || []).forEach(v => alanlar.push(["iç ses " + v.stat, v.text], ["iç ses " + v.stat + " (başarısız)", v.fail]));
  (e.recall || []).forEach(r => alanlar.push(["geçmişten " + r.flag, r.text]));
  e.choices.forEach((x, i) => { const L = String.fromCharCode(65 + i); alanlar.push([L + " seçenek adı", x.t]);
    if (typeof x.r === "string") alanlar.push([L + " sonuç", x.r]); else for (const k in (x.r || {})) alanlar.push([L + " " + k, x.r[k]]); });
  for (const [alan, metin] of alanlar) {
    if (!metin) continue;
    let hits = bul(metin);
    if (izin) hits = hits.filter(k => !POLISIYE.includes(k));
    if (hits.length) rows.push({ seviye, ch: e.ch, id: e.id, alan, kelimeler: hits, metin: String(metin).slice(0, 110) });
  }
}
const hata = rows.filter(r => r.seviye === "HATA"), uyari = rows.filter(r => r.seviye === "UYARI");
for (const r of hata) console.log(`HATA  B${r.ch} ${r.id} · ${r.alan} · [${r.kelimeler.join(", ")}] ${r.metin}`);
if (process.argv.includes("--uyari-da")) for (const r of uyari) console.log(`UYARI B${r.ch} ${r.id} · ${r.alan} · [${r.kelimeler.join(", ")}] ${r.metin}`);
console.log(`\n${hata.length} hata (Bölüm 1–4), ${uyari.length} uyarı (Bölüm 5)`);
process.exit(hata.length ? 1 : 0);
