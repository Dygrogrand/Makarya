/* Makarya — Hayat Zarı · sabit oyun verisi
   Olaylar, bölümler, hafıza etiketleri ve ölüm sebepleri content.js dosyasındadır.
   content.js elle düzenlenmez: Makarya_Icerik.xlsx'ten tools/excel_to_js.py ile üretilir. */
var STATS = ["Akıl", "Çene", "Kurnazlık", "Cesaret", "Pişkinlik", "Vicdan", "Dayanıklılık", "Sosyal Radar"];
var STAT_ICONS = { "Akıl": "🧠", "Çene": "🗣️", "Kurnazlık": "🦊", "Cesaret": "🔥", "Pişkinlik": "😏", "Vicdan": "🤍", "Dayanıklılık": "🧱", "Sosyal Radar": "👀" };
var BASE_STAT = 22;

/* Zorluk tablosu: base = hedef zar, succ/crit = kazanç, loss = kritik hatada kayıp */
var DIFF = {
  veryEasy: { label: "Çok Kolay", base: 5, succ: 1, crit: 2, loss: 0 },
  easy:     { label: "Kolay",     base: 7, succ: 2, crit: 3, loss: 1 },
  medium:   { label: "Orta",      base: 10, succ: 3, crit: 5, loss: 1 },
  hard:     { label: "Zor",       base: 13, succ: 5, crit: 7, loss: 2 },
  veryHard: { label: "Çok Zor",   base: 16, succ: 8, crit: 11, loss: 3 }
};

var FAMILIES = {
  "Yalçın": {
    slug: "yalcin", subtitle: "Tek gelirli, dayanışmacı alt-orta sınıf ev",
    mods: { "Akıl": 1, "Çene": 1, "Kurnazlık": 4, "Cesaret": 1, "Pişkinlik": -4, "Vicdan": 7, "Dayanıklılık": 9, "Sosyal Radar": 3 },
    traits: [
      { name: "Omuz Omuza", good: true, desc: "Zor durumda dayanışma refleksi.", stats: { "Vicdan": 1, "Dayanıklılık": 1 } },
      { name: "Yoktan Var Et", good: true, desc: "Kıt kaynakta pratik çözüm üretir.", stats: { "Kurnazlık": 1 } },
      { name: "Kendini Geri Atar", good: false, desc: "Bazı ortamlarda fazla geri planda kalır.", stats: { "Pişkinlik": -2 } }
    ],
    eff: { home: { "Dayanıklılık": 2, "Vicdan": 1 }, money: { "Dayanıklılık": 2, "Kurnazlık": 2 }, social: { "Vicdan": 2 }, education: { "Dayanıklılık": 2 } },
    lines: { home: "Bu evde dayanışma önemlidir.", money: "Paranın kıymeti erken öğrenilir.", social: "İdare etmek ve paylaşmak sık duyduğun kelimeler.", education: "Ailen senden elinden geleni yapmanı bekler." }
  },
  "Erdem": {
    slug: "erdem", subtitle: "İki kamu çalışanı; düzen ve eğitim odaklı",
    mods: { "Akıl": 9, "Çene": 1, "Kurnazlık": 0, "Cesaret": -3, "Pişkinlik": -5, "Vicdan": 7, "Dayanıklılık": 4, "Sosyal Radar": 2 },
    traits: [
      { name: "Düzenli Zihin", good: true, desc: "Plan, okul ve kurallı işlerde güçlü.", stats: { "Akıl": 1 } },
      { name: "Kural Hafızası", good: true, desc: "Doğru prosedürü hızla hatırlar.", stats: { "Vicdan": 1 } },
      { name: "Otoriteyi Fazla Ciddiye Alır", good: false, desc: "Otorite karşısında çekingenleşebilir.", stats: { "Cesaret": -2 } }
    ],
    eff: { home: { "Vicdan": 2, "Akıl": 1 }, money: { "Akıl": 2, "Vicdan": 1 }, social: { "Vicdan": 1 }, education: { "Akıl": 3, "Vicdan": 2 } },
    lines: { home: "Bu evde kurallar açıklanır ve takip edilir.", money: "Harcamadan önce düşünmek aile alışkanlığıdır.", social: "Doğru davranış sıkça konuşulur.", education: "Okul ve öğretmen bu evde önemli konudur." }
  },
  "Keskin": {
    slug: "keskin", subtitle: "Mahalle esnafı; bağlantı ve pratik zekâ güçlü",
    mods: { "Akıl": 0, "Çene": 9, "Kurnazlık": 8, "Cesaret": 3, "Pişkinlik": 4, "Vicdan": 0, "Dayanıklılık": -3, "Sosyal Radar": 7 },
    traits: [
      { name: "Esnaf Radarı", good: true, desc: "Fiyat, pazarlık ve niyet okumada keskin.", stats: { "Çene": 1, "Kurnazlık": 1 } },
      { name: "Mahalle Networkü", good: true, desc: "İnsan ilişkilerinde kapı açar.", stats: { "Sosyal Radar": 1 } },
      { name: "Hemen Çöz", good: false, desc: "Sabır isteyen işlerde çabuk sıkılır.", stats: { "Dayanıklılık": -2 } }
    ],
    eff: { home: { "Sosyal Radar": 2 }, money: { "Çene": 3, "Kurnazlık": 3 }, social: { "Çene": 2, "Sosyal Radar": 2 }, education: { "Kurnazlık": 1 } },
    lines: { home: "Evde insanları okumak günlük pratiktir.", money: "Fiyat, para üstü ve pazarlık sana yabancı değil.", social: "İnsanlarla konuşup işi çözmek aile refleksi.", education: "Pratik çözüm de en az doğru cevap kadar değerlidir." }
  },
  "Tan": {
    slug: "tan", subtitle: "Beyaz yakalı üst-orta sınıf; fırsat ve beklenti yüksek",
    mods: { "Akıl": 9, "Çene": 6, "Kurnazlık": 1, "Cesaret": 1, "Pişkinlik": -2, "Vicdan": 3, "Dayanıklılık": 0, "Sosyal Radar": 5 },
    traits: [
      { name: "Kaynak Erişimi", good: true, desc: "Eğitim ve hazırlıkta daha iyi araçlara ulaşır.", stats: { "Akıl": 1 } },
      { name: "Sunum Yeteneği", good: true, desc: "Kendini düzgün ifade etmeye alışkındır.", stats: { "Çene": 1 } },
      { name: "Mükemmeliyet Baskısı", good: false, desc: "Zor işlerde hata korkusu yorabilir.", stats: { "Dayanıklılık": -2 } }
    ],
    eff: { home: { "Çene": 2, "Akıl": 1 }, money: { "Akıl": 1 }, social: { "Sosyal Radar": 2, "Çene": 1 }, education: { "Akıl": 3, "Çene": 2 } },
    lines: { home: "Kendini doğru ifade etmek beklenir.", money: "Para konuşulmasa da seçimler izlenir.", social: "Nasıl göründüğün de fark edilir.", education: "Başarı beklentisi odadadır." }
  },
  "Varlı": {
    slug: "varli", subtitle: "Yeni zengin; özgüven ve statü baskısı birlikte",
    mods: { "Akıl": 1, "Çene": 5, "Kurnazlık": 3, "Cesaret": 8, "Pişkinlik": 9, "Vicdan": -5, "Dayanıklılık": -3, "Sosyal Radar": 6 },
    traits: [
      { name: "Statü Rahatlığı", good: true, desc: "Kalabalık ve iddialı ortamlarda çekinmez.", stats: { "Pişkinlik": 1, "Cesaret": 1 } },
      { name: "Kapı Açan Network", good: true, desc: "Sosyal temaslarda doğal avantaj yaratır.", stats: { "Sosyal Radar": 1 } },
      { name: "Hayır Duymaya Alışık Değil", good: false, desc: "Reddedilince çabuk bozulabilir.", stats: { "Dayanıklılık": -2 } }
    ],
    eff: { home: { "Pişkinlik": 2, "Cesaret": 1 }, money: { "Pişkinlik": 2, "Çene": 1 }, social: { "Pişkinlik": 3, "Cesaret": 2 }, education: { "Çene": 2 } },
    lines: { home: "Özgüven eksikliği pek teşvik edilmez.", money: "Para kıt değildir; statü görünürdür.", social: "Çekingenlik aile stiline pek uymaz.", education: "Başarı kadar kendinden emin görünmek de önemlidir." }
  },
  "Şen": {
    slug: "sen", subtitle: "Kalabalık aile; sosyal destek ve mahremiyet azlığı",
    mods: { "Akıl": -3, "Çene": 8, "Kurnazlık": 2, "Cesaret": 4, "Pişkinlik": 3, "Vicdan": 7, "Dayanıklılık": 3, "Sosyal Radar": 9 },
    traits: [
      { name: "Kalabalıkta Büyüdü", good: true, desc: "İnsanların duygusunu ve ortamı hızla okur.", stats: { "Sosyal Radar": 1 } },
      { name: "Herkes Birini Tanır", good: true, desc: "Sosyal bağ kurmakta hızlıdır.", stats: { "Çene": 1 } },
      { name: "Dikkat Dağınıklığı", good: false, desc: "Sessizlik isteyen işlerde zorlanabilir.", stats: { "Akıl": -2 } }
    ],
    eff: { home: { "Sosyal Radar": 3, "Vicdan": 2 }, money: { "Çene": 1 }, social: { "Sosyal Radar": 3, "Çene": 2 }, education: { "Sosyal Radar": 2 } },
    lines: { home: "Kalabalık evde tepki okumaya alışkınsın.", money: "Paranın kimden gelip kime gittiğini herkes bilir.", social: "Kalabalıkta yer açmak günlük hayattır.", education: "Her konuda fikri olan birkaç akraba mutlaka vardır." }
  }
};
