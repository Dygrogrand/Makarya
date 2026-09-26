/* Makarya — Hayat Zarı · oyun verisi
   Olay ekleme kuralı:
   - C(metin, stat, zorluk, [başarı, kritik başarı, başarısız, kritik hata, (mini oyun orta sonucu)], ekstra)
   - D(metin, {stat: değişim}, sonuç metni, ekstra)
   ekstra alanları: trait (başarıda kazanılan özellik), flag (seçilince hafızaya yazılır),
   flagWin (yalnızca başarıda yazılır), req (gereken özellik), reqFlag (gereken hafıza kaydı),
   mini (mini oyun tanımı).
   Görseller: img/sahne/<olay-id>.webp (erkek), img/kiz/sahne/<olay-id>.webp (kız).
   Dosya yoksa oyun otomatik olarak simgeli bir kapak gösterir. */

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

var CHAPTERS = {
  1: { name: "Ev", range: "Doğum → 3 yaş", expected: 25, step: 0, endImg: "kres-kapisi", endAge: "3 YAŞ", endText: "Ev güvenliydi. Şimdi başka çocuklar var.", next: "BÖLÜM II · DIŞ DÜNYA" },
  2: { name: "Dış Dünya", range: "3 → 6 yaş", expected: 30, step: 0, endImg: "ilkokul-kapisi", endAge: "6 YAŞ", endText: "Artık yalnızca aileyi değil, dış dünyanın kurallarını da okumaya başladın.", next: "BÖLÜM III · OKUL YILLARI" },
  3: { name: "Okul Yılları", range: "6 → 9 yaş", expected: 36, step: 0, endImg: "karne-gunu", endAge: "9 YAŞ", endText: "Karne elinde, karakter ortada.", next: null }
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

/* Kazanılabilir özellikler: bonus = ilgili stat kontrollerinde hedefi düşürür */
var TRAITS = {
  "Sessiz Gözlemci": { desc: "Konuşmadan önce ortamı okursun.", bonus: { "Sosyal Radar": 2, "Akıl": 1 } },
  "Ses Yükseltince Oluyor": { desc: "Ses seviyesini bir müzakere aracına çevirebilirsin.", bonus: { "Çene": 2 } },
  "Erken Ekonomi Bilinci": { desc: "Paranın yalnızca metal olmadığını erken fark ettin.", bonus: { "Kurnazlık": 2 } },
  "Teknoloji Merakı": { desc: "Ekranlar ve sistemler ilgini çeker.", bonus: { "Akıl": 1, "Kurnazlık": 1 } },
  "Yastık Altı Ekonomisti": { desc: "Küçük kaynakları saklama refleksin gelişti.", bonus: { "Kurnazlık": 1, "Dayanıklılık": 1 } },
  "Küçük Tüccar": { desc: "Takas ve pazarlık sana doğal geliyor.", bonus: { "Çene": 1, "Kurnazlık": 1 } },
  "Sahne Sever": { desc: "İlginin merkezine çıkmaktan çekinmezsin.", bonus: { "Pişkinlik": 2 } },
  "Para Üstü Radarı": { desc: "Küçük rakam farklarını yakalarsın.", bonus: { "Kurnazlık": 2 } },
  "Kendine Gülebilir": { desc: "Sosyal baskıyı mizahla azaltırsın.", bonus: { "Pişkinlik": 1, "Dayanıklılık": 1 } },
  "Organizatör": { desc: "Oyuna katılmak kadar kuralları koymak da ilgini çeker.", bonus: { "Çene": 1, "Sosyal Radar": 1 } },
  "İş Modeli Kurar": { desc: "Kaynak ile emek arasında bağlantı kurarsın.", bonus: { "Kurnazlık": 1, "Akıl": 1 } },
  "Seçim Makinesi": { desc: "Kalabalığı arkana almayı biliyorsun.", bonus: { "Çene": 1, "Cesaret": 1 } },
  "Asist Ustası": { desc: "Başkasının parlamasını sağlamak da bir yetenek.", bonus: { "Sosyal Radar": 2 } },
  "Limonata Baronu": { desc: "Küçük sermayeyle büyük işler.", bonus: { "Kurnazlık": 2 } },
  "Kilit Kırıcı": { desc: "Her sistemin bir açığı vardır.", bonus: { "Akıl": 2 } },
  /* Otomatik özellikler: zor kontrolü geçince ya da kritik başarıda açılır */
  "Analitik Zihin": { desc: "Sorunu parçalarına ayırırsın.", bonus: { "Akıl": 2 }, auto: "Akıl" },
  "Sözünü Geçirir": { desc: "Söylediğin şey genelde olur.", bonus: { "Çene": 2 }, auto: "Çene" },
  "Açık Bulur": { desc: "Kurallardaki boşlukları fark edersin.", bonus: { "Kurnazlık": 2 }, auto: "Kurnazlık" },
  "Geri Adım Atmaz": { desc: "Korkuyu hissedersin ama yine de yaparsın.", bonus: { "Cesaret": 2 }, auto: "Cesaret" },
  "Yüzü Kızarmaz": { desc: "Utanma duygusu seni yavaşlatmaz.", bonus: { "Pişkinlik": 2 }, auto: "Pişkinlik" },
  "İç Pusula": { desc: "Doğruyu bulmakta zorlanmazsın.", bonus: { "Vicdan": 2 }, auto: "Vicdan" },
  "Kolay Dağılmaz": { desc: "Baskı altında toparlanırsın.", bonus: { "Dayanıklılık": 2 }, auto: "Dayanıklılık" },
  "Odayı Okur": { desc: "Kimin ne hissettiğini herkesten önce anlarsın.", bonus: { "Sosyal Radar": 2 }, auto: "Sosyal Radar" }
};
var AUTO_TRAITS = {};
Object.keys(TRAITS).forEach(function (k) { if (TRAITS[k].auto) AUTO_TRAITS[TRAITS[k].auto] = k; });

/* Hafıza kayıtlarının final kartındaki karşılığı */
var FLAG_LABELS = {
  kediSuclu: "Vazo davasında kediyi suçladı.",
  ilkKelimePara: "İlk kelimesi 'Para' oldu.",
  yalanci: "Yaratıcı açıklamalar dosyası kabarık.",
  sirVerdi: "Kreşte bir sırrı dolaşıma soktu.",
  cesurPark: "Parktaki büyük çocuğa kafa tuttu.",
  yapiskan: "Kreş kapısında bacağa sarıldı.",
  baskan: "Sınıf başkanı seçildi.",
  kediGeldi: "Eve bir kedi getirtti.",
  camKirildi: "Komşunun camıyla tanıştı."
};

function C(t, stat, diff, r, x) { var o = { t: t, stat: stat, diff: diff, r: { win: r[0], crit: r[1], fail: r[2], bad: r[3], mid: r[4] } }; for (var k in (x || {})) o[k] = x[k]; return o; }
function D(t, direct, r, x) { var o = { t: t, direct: direct, r: r }; for (var k in (x || {})) o[k] = x[k]; return o; }

var EVENTS = [
/* ───────────── BÖLÜM I · EV ───────────── */
{ id: "dogum", ch: 1, age: "0 yaş", icon: "👶", title: "Ortam Fazla Aydınlık", text: "Makarya'ya geldin. Işıklar fazla parlak, herkes senden bir tepki bekliyor.", choices: [
  D("Ağla", { Çene: 2 }, "İlk basın açıklamanı yaptın."),
  D("Daha çok ağla", { Çene: 2, Pişkinlik: 1 }, "Ses seviyesinin bir müzakere aracı olabileceğini keşfettin.", { trait: "Ses Yükseltince Oluyor" }),
  D("Etrafı izle", { Akıl: 2, "Sosyal Radar": 2 }, "Konuşmadan önce ortamı okumayı seçtin.", { trait: "Sessiz Gözlemci" }),
  D("Sessiz kal", { "Sosyal Radar": 2 }, "Herkes endişelendi. Sen sadece veri topluyordun.")
]},
{ id: "gece-vardiyasi", ch: 1, age: "3 ay", icon: "🌙", fam: "home", title: "Gece Vardiyası", text: "Saat 03:00. Ev halkı uyumaya çalışıyor. Senin vardiyan yeni başladı.", choices: [
  C("Kendi kendine uyu", "Dayanıklılık", "veryEasy", ["Kısa süreliğine ev ekonomisine katkıda bulundun.", "Sabaha kadar deliksiz uyudun. Ailen seni 'Ayın Çalışanı' ilan etmeyi düşündü.", "Uyumaya çalıştın. Uyku seni reddetti.", "Kendi kendine uyumaya çalışırken kendi kendini uyandırdın. Vardiya uzadı."]),
  C("Ağlayarak yardım çağır", "Çene", "veryEasy", ["Gece ekibini başarıyla göreve çağırdın.", "Tek bir 'ıngaa' ile tüm ev halkı toplandı. Yönetim becerilerin not edildi.", "Ağladın ama ses kapıya ulaşmadı. Talebin sıraya alındı.", "Ağladın, yanlış kişi uyandı. Sonra komşu uyandı. Toplantı sabaha sarktı."]),
  D("Sessizce bekle", { "Sosyal Radar": 1 }, "Bir süre bekledin. Dünya dönmeye devam etti.")
]},
{ id: "yabanci-krizi", ch: 1, age: "8 ay", icon: "🤓", title: "Yabancı Krizi", text: "Tanımadığın biri sana fazla hızlı yaklaştı. Sosyal protokol henüz yayımlanmadı.", choices: [
  C("Anneni ara", "Sosyal Radar", "easy", ["Güvenli limanı doğru tespit ettin.", "Anneni tek bakışta buldun; yabancı, hiç yaklaşmamış gibi geri çekildi.", "Anneni aradın. Bulduğun kişi halanmış.", "Anne diye kucağına atladığın kişi yabancının ta kendisiydi."]),
  C("Gözlüğüne saldır", "Cesaret", "medium", ["Bir hamlede gözlüğü kaptın. Diplomatik ilişkiler kısa süreliğine askıya alındı.", "Gözlük elinde. Kadın ne olduğunu anlayana kadar sen çoktan zaferini ilan ettin.", "Kadın senden hızlı çıktı.", "Gözlüğe uzandın; onun yerine kendi burnunu yakaladın.", "Parmakların çerçeveye değdi ama gözlük sende kalmadı."],
    { mini: { type: "timing", title: "Gözlüğü Kap!", hint: "Kırmızı işareti yeşil alanda durdur." } }),
  D("Kabullen", { "Sosyal Radar": 1 }, "Krizi düşük profille atlattın."),
  D("Ağla", { Çene: 1 }, "Toplantı erken sona erdi.")
]},
{ id: "yasak-nesne", ch: 1, age: "10 ay", icon: "💎", fam: "home", title: "Yasak Nesne", text: "Masada dokunmaman gereken parlak bir şey var. Bu bilgi nesneyi daha çekici yaptı.", choices: [
  D("Dokunma", { Vicdan: 1 }, "İlk kez bir yasağı uyguladın."),
  C("Anne çıkana kadar bekle", "Kurnazlık", "easy", ["Zamanlama kavramını keşfettin.", "Anne çıktı, sen aldın, anne döndü, nesne yerindeydi. Kimse hiçbir şey anlamadı.", "Beklerken uyuyakaldın. Fırsat penceresi kapandı.", "Anne çıkmadı. Sadece çıkıyormuş gibi yaptı. Seni izliyordu."]),
  C("Direkt al", "Pişkinlik", "easy", ["Mülkiyet hukukuna farklı bir yorum getirdin.", "Aldın ve kimse itiraz edemedi. Yüz ifaden tüm soruları cevapladı.", "Uzandın. Masa senden uzunmuş.", "Aldın, düşürdün, kırıldı. Hukuk sisteminde yeni dosya açıldı."])
]},
{ id: "ilk-kelime", ch: 1, age: "1 yaş", icon: "💬", fam: "home", title: "İlk Kelime", text: "Salon sessizleşti. Herkes ağzından çıkacak ilk anlamlı kelimeyi bekliyor.", choices: [
  D("Anne", { Vicdan: 1 }, "Diplomatik olarak güvenli bir başlangıç."),
  D("Baba", { Çene: 1 }, "Salonda kısa süreli bir zafer havası oluştu."),
  D("Mama", { Dayanıklılık: 1 }, "Önceliklerini açıkça belirttin."),
  D("Para", { Kurnazlık: 2 }, "Aile bir an sessiz kaldı. Gelecek hakkında bazı sorular oluştu.", { trait: "Erken Ekonomi Bilinci", flag: "ilkKelimePara" })
]},
{ id: "ilk-adimlar", ch: 1, age: "15 ay", icon: "👣", title: "İlk Adımlar", text: "Ayaktasın. Bu, teoride ilerleme sayılıyor.", choices: [
  C("Koşmayı dene", "Cesaret", "easy", ["Yürümeden önce hızlanmayı tercih ettin. Adımlar sallantılı ama gerçek.", "İki ayağın da yerde, rüzgâr arkanda. Bir anlığına evren dengede.", "Denge seni henüz ikna etmedi.", "Bir adım attın. Yer senden daha hızlı davrandı.", "Bir adım, sonra güvenli bir oturuş."],
    { mini: { type: "hold", title: "İlk Adımlar", hint: "Basılı tut, gücü topla. Çubuk yeşil alana geldiğinde bırak." } }),
  C("Mobilyaya tutun", "Dayanıklılık", "veryEasy", ["Risk yönetimi bölümünü erken açtın.", "Koltuktan sehpaya, sehpadan kapıya: ilk lojistik hattını kurdun.", "Tuttuğun mobilya tekerlekliymiş.", "Tuttuğun şey masa örtüsüydü. Üstündekilerle birlikte indin."]),
  C("Önce diğerlerini izle", "Akıl", "easy", ["Rakip analizi yaptın. Yöntem not edildi.", "Kediyi izledin: dört ayak daha dengeli, iki ayak daha prestijli. Prestij kazandı.", "İzledin, izledin. O sırada herkes oturuyordu.", "Örnek aldığın kişi dedendi. Bastonsuz model henüz piyasada yok."])
]},
{ id: "masadaki-telefon", ch: 1, age: "17 ay", icon: "📱", title: "Masadaki Telefon", text: "Ekran parlıyor. Yetişkinler bu nesneye günün önemli bölümünü ayırıyor.", choices: [
  D("Dokunma", { Vicdan: 1 }, "Nadir görülen bir özdenetim anı."),
  C("Ekranı kurcala", "Kurnazlık", "easy", ["Teknoloji departmanına izinsiz giriş yaptın.", "Ekranı açtın ve babanın çalma listesini 'Ninniler' olarak güncelledin.", "Ekran kilitliydi. Sen de bir süre kilitlendin.", "Rastgele dokunuşlar babanın patronunu görüntülü aradı."]),
  C("Gizlice al", "Kurnazlık", "medium", ["Cihaz güvenliği kısa süreliğine çöktü.", "Telefonu aldın, bir oyun açtın, rekor kırdın. Kimse şifreyi nasıl bildiğini anlamadı.", "Telefon titreşti, sen irkildin, operasyon iptal.", "Telefonu aldın ve doğrudan su bardağına bıraktın. Pirinç torbası devreye girdi."], { trait: "Teknoloji Merakı" })
]},
{ id: "dogum-gunu-pastasi", ch: 1, age: "19 ay", icon: "🎂", fam: "social", title: "Doğum Günü Pastası", text: "Bir pasta, bir mum ve çok sayıda gereksiz sosyal kural.", choices: [
  C("Bekle", "Dayanıklılık", "easy", ["Pasta hâlâ orada. Sen de hâlâ buradasın.", "Sabrın ödüllendirildi: en büyük dilim, üstünde çilekle sana geldi.", "Bekledin, bekledin; sıra sana geldiğinde kremalı kısım bitmişti.", "Beklemekten sıkıldın ve pastanın yanında uyuyakaldın. Fotoğraflarda yüzün kremalı."]),
  C("Pastaya erken saldır", "Pişkinlik", "medium", ["Protokolü kremayla yeniden yazdın.", "Pastanın en güzel köşesi artık senin. Herkes alkışladı, çünkü başka seçenek yoktu.", "Uzandın, biri tabağı kaydırdı. Elin havayı kremaladı.", "Pastaya daldın. Pasta da sana daldı. Aile albümüne kalıcı kayıt."]),
  C("Mumları önce üfle", "Pişkinlik", "hard", ["Doğum günü sahibinin kim olduğu geçici olarak belirsizleşti.", "Mumları söndürdün, dilek tuttun, alkışları topladın. Hediyeler de yön değiştirmek üzere.", "Üfledin ama mumlar senden daha kararlıydı.", "Üfledin; mum yerine pastanın süsü uçtu. Doğum günü çocuğu ağlamaya başladı."], { trait: "Sahne Sever" })
]},
{ id: "vazo-kirildi", ch: 1, age: "2 yaş", icon: "🏺", fam: "home", title: "Vazo Kırıldı", text: "Vazo yerde. Sessizlik ağır. Kedi sana bakıyor.", choices: [
  D("Bekle", { Vicdan: 2 }, "Olay yeri incelemesine gönüllü oldun."),
  C("Kaç", "Kurnazlık", "medium", ["Şüpheli olay yerinden uzaklaştı.", "Kaçtın ve üç dakika sonra 'Ne oldu?' diye içeri girdin. Ödüllük performans.", "Kaçarken terlikler ses yaptı. Şüpheli tespit edildi.", "Kaçarken ikinci vazoyu da devirdin. Dosya kabardı."]),
  C("Kediyi suçla", "Pişkinlik", "veryHard", ["Savunma yaratıcıydı. Kedinin odada olmaması küçük bir ayrıntıydı.", "Kedi mahkûm edildi. Mama tayınları kısıldı. Sen o gece iki tatlı yedin.", "Kediye baktın. Kedi sana baktı. Ailen ikinize de baktı. Kimse ikna olmadı.", "Kediyi suçladın. Kedi o sırada annenin kucağındaydı."], { flag: "kediSuclu" }),
  C("Parçaları sakla", "Kurnazlık", "medium", ["Deliller toparlandı. Delil yönetimi departmanı kuruldu.", "Parçalar göz açıp kapayıncaya kadar kayboldu. Vazo hiç var olmamış gibi.", "Parçalar senden hızlı yayıldı.", "Parçaları toplarken daha fazla ses çıkardın. Ev halkı toplandı.", "Çoğunu sakladın ama bir parça hâlâ şüpheli biçimde ortada."],
    { mini: { type: "collect", title: "Delilleri Topla", hint: "Parçalar fark edilmeden önce hepsine dokun.", piece: "🧩" } })
]},
{ id: "ilk-harclik", ch: 1, age: "2 yaş 2 ay", icon: "🪙", fam: "money", title: "İlk Harçlık", text: "Avucuna birkaç bozuk para bırakıldı. Finansal sistemle ilk temas.",
  recall: [{ flag: "ilkKelimePara", text: "İlk kelimen 'Para' olduğundan beri bu konuda seni ciddiye alıyorlar." }], choices: [
  D("Annene ver", { Vicdan: 2 }, "Varlık yönetimini dışarıya devrettin."),
  D("Oyuncak iste", { Çene: 1 }, "Likidite anında tüketime döndü."),
  C("Parayı sakla", "Kurnazlık", "easy", ["Makarya Merkez Bankası seni henüz izlemiyor.", "Parayı sakladın, bir hafta sonra unuttuğun bir sürpriz olarak buldun. Faiz kavramına ilk adım.", "Sakladığın yeri unuttun. Para artık evin ortak mirası.", "Parayı ağzına sakladın. Acil müdahale ekibi ve babaanne devreye girdi."], { trait: "Yastık Altı Ekonomisti" }),
  C("Bir çocukla takas yap", "Çene", "medium", ["İlk mikro ticaret operasyonun gerçekleşti.", "İki bozuk parayı bir oyuncak arabaya çevirdin, sonra arabayı üç bozuk paraya. Kârdasın.", "Karşı taraf teklifini değerlendirmeye aldı. Hiç dönmedi.", "Takas ettin. Eline yarım bir kraker geçti. Kötü anlaşmaydı."], { trait: "Küçük Tüccar" })
]},
{ id: "oyuncak-krizi", ch: 1, age: "2 yaş 4 ay", icon: "🧸", fam: "social", title: "Oyuncak Krizi", text: "Başka bir çocuk senin oyuncağını aldı. Uluslararası kriz başladı.", choices: [
  D("Paylaş", { Vicdan: 2 }, "Gerilim düşürüldü."),
  C("Başka oyuncak teklif et", "Çene", "easy", ["Takas diplomasisi çalıştı.", "Eski oyuncağını teklif ettin, yenisini geri aldın ve karşı taraf teşekkür etti.", "Teklifini beğenmedi. Müzakere masası devrildi.", "Teklif ettiğin oyuncağı da aldı. Artık iki oyuncak eksiğin var."]),
  C("Elinden al", "Cesaret", "medium", ["Müzakere süreci fiziksel aşamaya geçti. Oyuncak sende.", "Tek hamlede aldın. Karşı taraf itiraz edecek kelimeyi bulamadı.", "Çektin, o da çekti. Oyuncak ikiye ayrılma eşiğinde bırakıldı.", "Çektin, o bıraktı. Sen popo üstü oturdun, herkes güldü."]),
  C("Sıkılmasını bekle", "Dayanıklılık", "easy", ["Zaman senin lehine çalıştı.", "O sıkıldı, oyuncağı bıraktı ve sana bir tane daha verdi.", "Sıkılmadı. Sen sıkıldın.", "Bekledin; oyuncak onun evine götürüldü."])
]},
{ id: "aile-toplantisi", ch: 1, age: "2 yaş 7 ay", icon: "🛋️", fam: "home", title: "Aile Toplantısı", text: "Yetişkinler konuşuyor. Konu senden daha sıkıcı ama sonuçları daha büyük olabilir.", choices: [
  C("Dinle", "Sosyal Radar", "easy", ["Yetişkinlerin söylediklerinden çok söylemediklerini duydun.", "Toplantının gerçek gündemini senden başka kimse anlamadı: yaz tatili iptal değil, ertelenmiş.", "Dinledin ama kelimeler çok uzundu.", "Dinlerken duyduğun bir kelimeyi misafirlerin önünde tekrar ettin."]),
  C("İlgi çek", "Pişkinlik", "medium", ["Gündem başarıyla değiştirildi.", "Tüm toplantı senin şovuna dönüştü. Gündem maddeleri bir sonraki yıla ertelendi.", "Dans ettin, kimse bakmadı. Bütçe konuşuluyordu.", "İlgi çekmek için çaydanlığa uzandın. Toplantı acil durum toplantısına dönüştü."]),
  D("Oyuncağınla ilgilen", { Dayanıklılık: 1 }, "Kriz yönetimini profesyonellere bıraktın.")
]},
{ id: "parkta-sira", ch: 1, age: "2 yaş 10 ay", icon: "🛝", title: "Parkta Sıra", text: "Kaydırakta sıra var. Sistem basit görünüyor. İnsanlar yüzünden değil.", choices: [
  D("Sıraya gir", { Vicdan: 1 }, "Kurallı toplum deneyine katıldın."),
  C("Öne geç", "Pişkinlik", "medium", ["Öne geçtin. Toplumsal tepki geldiğinde sen zaten aşağı kayıyordun.", "Öne geçtin ve kimse fark etmedi. Hatta biri sana yer verdi.", "Öne geçmeye çalıştın; sıradaki anneler komitesi seni geri gönderdi.", "Öne geçtin, kaydıraktan ters indin. Sıradakiler alkışladı."]),
  C("Konuşarak çöz", "Çene", "easy", ["İki dakikalık diplomasi, üç dakikalık kaydırak.", "Konuştun ve sıradaki herkes sana geçiş hakkı verdi. Nedeni belirsiz.", "Konuştun; herkes dinledi, kimse kıpırdamadı.", "Konuşurken sıradaki yerini de kaybettin."]),
  C("Sistemi izle", "Sosyal Radar", "easy", ["Kimin gerçekten sırada olduğunu anlamaya başladın.", "Sıranın aslında iki ayrı sıra olduğunu fark ettin ve boş olanına geçtin.", "İzledin; sistem çok karışıktı. Kaydırak kapandı.", "Sistemi izlerken salıncak kafana çarptı."])
]},
{ id: "kim-yapti", ch: 1, age: "2 yaş 11 ay", icon: "🔍", fam: "home", title: "Kim Yaptı?", text: "Bir şey oldu. Bir yetişkin tek soru soruyor. Oda sessiz.",
  recall: [{ flag: "kediSuclu", text: "Vazo olayından beri ev halkı ifadelerine daha dikkatli bakıyor." }], choices: [
  D("Doğruyu söyle", { Vicdan: 2 }, "Kısa vadede kötü, uzun vadede kullanışlı bir alışkanlık."),
  C("Bilmiyorum de", "Çene", "medium", ["Bilgi eksikliği stratejik olarak kullanıldı.", "'Bilmiyorum' dedin. O kadar ikna ediciydin ki soruşturma kapandı ve sana dondurma verildi.", "'Bilmiyorum' dedin. Yüzün 'biliyorum' dedi.", "'Bilmiyorum' dedin ve hemen ardından 'ama ben yapmadım' ekledin. Kimse sormamıştı."]),
  C("Başkasını suçla", "Pişkinlik", "veryHard", ["Dosya başka birinin masasına gönderildi.", "Dosya kuzenin masasına gönderildi. Kuzen hâlâ ne olduğunu anlamaya çalışıyor.", "Suçladığın kişi o gün evde değildi.", "Suçladığın kişi olayın videosunu çekmişti."], { flag: "yalanci" })
]},
{ id: "kres-kapisi", ch: 1, age: "3 yaş", icon: "🏫", fam: "education", title: "Kreş Kapısı", text: "Kapının arkasında başka çocuklar, kurallar ve oyuncaklar var. Ailen ilk kez birkaç saatliğine dışarıda kalacak.", choices: [
  D("Bacağına sarıl", { Vicdan: 1 }, "Ayrılık müzakeresi uzadı.", { flag: "yapiskan" }),
  C("İçeri gir", "Cesaret", "medium", ["Yeni harita açıldı.", "İçeri girdin, arkana bakmadın, öğle yemeğinde masa başkanıydın.", "Kapıya kadar gittin, geri döndün. Plan B: yarın.", "İçeri girdin; yanlış sınıfa. Bir saat bebek grubunda kaldın."]),
  C("Önce ortamı izle", "Sosyal Radar", "easy", ["Kim kimdir, kim neye sahip, hızlıca kaydettin.", "Beş dakikada sınıfın haritasını çıkardın: en iyi oyuncak, en iyi köşe, en tatlı öğretmen.", "İzlerken kapı kapandı. Ortam içeride kaldı, sen dışarıda.", "İzlerken biri seni yeni oyuncak sandı."])
]},

/* ───────────── BÖLÜM II · DIŞ DÜNYA ───────────── */
{ id: "ilk-arkadas", ch: 2, age: "3 yaş 1 ay", icon: "🤝", title: "İlk Arkadaş", text: "Yanında bir çocuk var. İkiniz de ne yapacağınızı tam bilmiyorsunuz.", choices: [
  D("İsmini söyle", { Çene: 1 }, "Diplomatik ilişki kuruldu."),
  C("Oyuncağını sor", "Çene", "veryEasy", ["Ortak ilgi alanı bulundu.", "Oyuncağını sordun; sana koleksiyonunun tam envanterini sundu. Dostluk tescillendi.", "Sordun, cevap vermedi. Oyuncak daha ilginçti.", "Sordun; oyuncağın kendisine ait olduğunu yüksek sesle ilan etti."]),
  C("Konuşmadan yanında dur", "Sosyal Radar", "easy", ["Sessizlik garip değildi. Bu iyi işaret.", "Hiç konuşmadınız. Ertesi gün aynı yerde buluştunuz. Gerçek dostluk.", "Sessizlik biraz garipti.", "Sessizce durdun; o da sessizce uzaklaştı."])
]},
{ id: "oyuncagimi-aldi", ch: 2, age: "3 yaş 2 ay", icon: "😤", fam: "social", title: "Oyuncağımı Aldı", text: "Bir çocuk oyuncağını aldı ve bunun tamamen normal olduğuna inanıyor.", choices: [
  C("Geri iste", "Çene", "easy", ["Mülkiyet hakkını sözlü savundun.", "Öyle bir savunma yaptın ki oyuncağı özür dileyerek geri verdi.", "İstedin. Duymamış gibi yaptı.", "İstedin; o da senin diğer oyuncağını istedi. Dava büyüdü."]),
  C("Elinden al", "Cesaret", "medium", ["Hızlı çözüm, uzun bakışmalar.", "Aldın. Karşı taraf bir daha bu konuyu açmadı.", "Aldın, geri aldı. Oyun berabere.", "Almaya çalışırken öğretmen tam o an döndü. Sadece seni gördü."]),
  C("Takas öner", "Kurnazlık", "easy", ["Piyasa mekanizması devreye girdi.", "Takas ettin ve üstüne bir de kurabiye aldın. Arbitraj.", "Teklifin reddedildi. Piyasa durgun.", "Takas ettin; eline geçen oyuncağın sahibi başka bir çocuk çıktı."]),
  D("Öğretmene söyle", { Vicdan: 1 }, "Uyuşmazlık kurumsal kanala taşındı.")
]},
{ id: "ogretmen-yanlis-anladi", ch: 2, age: "3 yaş 4 ay", icon: "👩‍🏫", fam: "education", title: "Öğretmen Seni Yanlış Anladı", text: "Öğretmen başka bir şey olduğunu sanıyor. İlk kez otorite de hata yapabiliyor.", choices: [
  C("Kendini anlat", "Çene", "easy", ["Dosyaya kendi ifaden eklendi.", "Öyle net anlattın ki öğretmen sana teşekkür edip seni sınıf sözcüsü yaptı.", "Anlattın ama ağlamaklı ses tonu mesajın önüne geçti.", "Anlatırken olayı daha da karıştırdın. Artık sen de ne olduğunu bilmiyorsun."]),
  C("Sakin kal", "Vicdan", "easy", ["Gerilim büyümeden geçti.", "Sakin kaldın; öğretmen gerçeği kendisi fark etti ve özür diledi. Bu nadir görülür.", "Sakin kaldın ama içinden kaynıyordun. Yüzüne yansıdı.", "Sakin kaldın; suskunluğun itiraf sayıldı."]),
  D("Boş ver", { Dayanıklılık: 1 }, "Her yanlış anlaşılma toplantı gerektirmiyor."),
  C("Gerçek suçluyu gösteren ayrıntıyı hatırla", "Sosyal Radar", "easy", ["Suçlunun elindeki boyayı hatırladın. Dosya yeniden açıldı.", "Ayrıntıları öyle sıraladın ki öğretmen seni sınıfın dedektifi ilan etti.", "Ayrıntıyı hatırladın ama kimse inanmadı.", "Yanlış ayrıntıyı hatırladın. Suçlu, masum bir boya kalemi oldu."], { req: "Sessiz Gözlemci" })
]},
{ id: "parkin-buyuk-cocugu", ch: 2, age: "3 yaş 6 ay", icon: "🧗", title: "Parkın Büyük Çocuğu", text: "Kaydırağın tepesinde senden büyük biri alanı sahiplenmiş görünüyor.", choices: [
  D("Başka yere git", { Dayanıklılık: 1 }, "Kaynakları yeniden dağıttın."),
  C("'Herkesin burası' de", "Cesaret", "hard", ["Kamusal alan savunması yaptın. Büyük çocuk kenara çekildi.", "Konuşmanı bitirdiğinde parktaki tüm küçük çocuklar arkandaydı. Kaydırak halka açıldı.", "Söyledin. Büyük çocuk güldü. Biraz daha büyüyünce tekrar denersin.", "Söyledin. Büyük çocuk kaydıraktan kaydı ve tam önüne indi. Sessizlik."], { flagWin: "cesurPark" }),
  C("Diğer çocukları ölç", "Sosyal Radar", "medium", ["Koalisyon ihtimalini değerlendirdin ve kurdun.", "Üç çocukla koalisyon kurdun. Büyük çocuk çoğunluğa boyun eğdi.", "Çocukları ölçtün; hepsi senden de küçüktü.", "Koalisyon kurdun; koalisyon büyük çocuğun tarafına geçti."])
]},
{ id: "market-kasasi", ch: 2, age: "3 yaş 8 ay", icon: "🍬", fam: "money", title: "Market Kasası", text: "Kasada göz hizanda şekerler var. Bu tesadüf olamayacak kadar iyi tasarlanmış.", choices: [
  D("Şekeri iste", { Çene: 1 }, "Talep açıkça iletildi."),
  C("Sepete gizlice koy", "Kurnazlık", "medium", ["Satın alma sürecine gölge operasyon eklendi.", "Şeker kasadan geçti, eve geldi, kimse fark etmedi. Kusursuz tedarik zinciri.", "Kasiyer şekeri gördü ve sana göz kırptı. Şeker rafa döndü.", "Sepete koyduğun şey şeker değil, pilmiş. Ailen çok şaşırdı."]),
  C("Dokunma", "Vicdan", "veryEasy", ["Perakende psikolojisine karşı ilk zafer.", "Dokunmadın; kasiyer ödül olarak sana bir şeker hediye etti. Sistem kendi silahıyla yenildi.", "Dokunmadın ama gözün şekerde kaldı. Kasiyer gördü, ailen gördü.", "Dokunmamaya çalışırken tüm şeker standını devirdin."])
]},
{ id: "baskasinin-dogum-gunu", ch: 2, age: "4 yaş", icon: "🎁", fam: "social", title: "Başkasının Doğum Günü", text: "Pasta onun. Hediyeler onun. İlgi de teoride onun.", choices: [
  D("Alkışla", { Vicdan: 1 }, "Sisteme uyum gösterdin."),
  C("İlgi çek", "Pişkinlik", "medium", ["Spot ışığı kısa süreliğine yön değiştirdi.", "Sahneye çıktın, şarkıyı sen söyledin, fotoğraflarda ortadasın.", "İlgi çekmeye çalıştın; palyaço daha iyiydi.", "İlgi çekerken bir hediyeyi açtın. Senin değildi."]),
  D("Pastaya odaklan", { Dayanıklılık: 1 }, "Stratejik öncelikler net.")
]},
{ id: "en-guzel-oyuncak", ch: 2, age: "4 yaş 1 ay", icon: "🤖", title: "En Güzel Oyuncak", text: "Odada herkesin baktığı tek oyuncak var.", choices: [
  C("İste", "Çene", "easy", ["Talebini medeni şekilde ilettin.", "İstedin; sahibi 'sen oyna' dedi ve bir de nasıl çalıştığını anlattı.", "İstedin; sıraya alındın. Sıra hiç gelmedi.", "İstedin, sahibi ağladı. Oyuncak dolaba kilitlendi."]),
  C("Takas öner", "Kurnazlık", "easy", ["Değer kavramı kişiden kişiye değişti.", "Sıradan bir kalemi 'nadir koleksiyon parçası' olarak sundun. Takas gerçekleşti.", "Teklifin kimseyi etkilemedi.", "Takas ettin; oyuncağın pili yokmuş."]),
  D("Kendi oyuncağınla devam et", { Dayanıklılık: 1 }, "Bir şeyi kaçırma korkusu henüz tam gelişmedi.")
]},
{ id: "ilk-gercek-yalan", ch: 2, age: "4 yaş 2 ay", icon: "🤥", fam: "home", title: "İlk Gerçek Yalan", text: "Bu kez ne olduğunu biliyorsun. Karşındaki yetişkin de bildiğini düşünüyor.",
  recall: [{ flag: "kediSuclu", text: "Ev halkı hâlâ o vazo meselesinde kediye inanmadı." }, { flag: "yalanci", text: "'Kim yaptı?' dosyası hâlâ açık." }], choices: [
  D("İtiraf et", { Vicdan: 2 }, "Dosya hızlı kapandı."),
  C("'Hayır' de", "Çene", "hard", ["Ses tonun gerçeğin yerine geçti.", "'Hayır' dedin; o kadar samimiydin ki karşındaki yetişkin kendisinden şüphelenmeye başladı.", "'Hayır' dedin, kulakların kızardı. Kulaklar yalan söylemiyor.", "'Hayır' dedin, sonra 'evet' dedin, sonra ağladın. Dosya kapanmadı, genişledi."], { flag: "yalanci" }),
  C("'O kendi oldu' de", "Pişkinlik", "veryHard", ["Nedensellik bilimine meydan okudun ve kazandın.", "Fizik kurallarını yeniden yazdın. Yetişkin bir an kendi kendine olabileceğine inandı.", "'Kendi oldu' dedin. Kimse gülmedi. Bir kişi gülmek üzereydi.", "'Kendi oldu' dedin; tam o sırada yine 'kendi oldu'. Elin hâlâ üstündeydi."], { flag: "yalanci" })
]},
{ id: "mahalle-bakkali", ch: 2, age: "4 yaş 4 ay", icon: "🏪", fam: "money", title: "Mahalle Bakkalı", text: "Liste elinde. Para cebinde. Bakkal her şeyi biliyor gibi bakıyor.", choices: [
  D("Listeyi ver", { Dayanıklılık: 1 }, "Operasyon standart prosedürle tamamlandı."),
  C("Fiyat sor", "Çene", "veryEasy", ["Piyasa araştırması başladı.", "Fiyat sordun, bakkal indirim yaptı. Nedenini kendisi de bilmiyor.", "Sordun, bakkal duymadı. Radyo açıktı.", "Fiyat sordun, bakkal 'Paran yetmez' dedi. Haklıydı."]),
  C("Para üstünü kontrol et", "Kurnazlık", "medium", ["İlk finansal denetimin başarıyla tamamlandı.", "Eksik para üstünü buldun. Bakkal seni gelecekteki muhasebecisi ilan etti.", "Saydın, bir daha saydın. Sonuç her seferinde farklı.", "Kontrol ederken paraları yere düşürdün. Bir tanesi rafın altına gitti."], { trait: "Para Üstü Radarı" }),
  C("Veresiye defterine yazdır", "Çene", "easy", ["Adın veresiye defterine girdi. Kredi notun oluştu.", "Bakkal defterine yazdı ve sana bir de sakız ikram etti. Seçkin müşteri.", "Bakkal defteri kapattı: 'Önce annen gelsin.'", "Defter açıldı; ailenin önceki borçları da yüksek sesle okundu. Ortam gerildi."], { req: "Küçük Tüccar" })
]},
{ id: "kaybolan-bozuk-para", ch: 2, age: "4 yaş 5 ay", icon: "🔎", fam: "money", title: "Kaybolan Bozuk Para", text: "Yerde bir bozuk para var. Sahibi görünmüyor. Vicdan departmanı toplantıya çağrıldı.", choices: [
  D("Yetişkine ver", { Vicdan: 2 }, "Kayıp eşya prosedürü uygulandı."),
  C("Cebe koy", "Kurnazlık", "easy", ["Bütçeye beklenmedik gelir yazıldı.", "Tek bakışta doğru yeri buldun. Bozuk para sende ve kimse görmedi.", "Yanlış yere uzandın. Para başkasının oldu.", "Yanlış kutu. Bozuk para hâlâ kayıp; senin cebindeki de düştü.", "Parayı buldun ama biri de gördü."],
    { mini: { type: "cups", title: "Bozuk Parayı Bul", hint: "Paranın hangi kutunun altına girdiğini izle. Kutular karışacak." } }),
  D("Olduğu yerde bırak", { Vicdan: 1 }, "Meseleyi evrene devrettin.")
]},
{ id: "takim-seciliyor", ch: 2, age: "4 yaş 7 ay", icon: "⚽", title: "Takım Seçiliyor", text: "İki takım kuruluyor. Herkes hızlıca değer biçiyor.", choices: [
  C("Bekle", "Dayanıklılık", "easy", ["Seçilme sırası karakter testi oldu; testi geçtin.", "Beklerken kaptanlardan biri seni ilk seçti. Sabır ödüllendi.", "Son seçilen oldun. Takıma kaleci olarak katıldın.", "Hiç seçilmedin. Top senindi. Oyun top olmadan başladı."]),
  C("'Beni al' de", "Çene", "easy", ["Kendi pazarlamanı yaptın.", "Öyle bir tanıtım yaptın ki iki kaptan seni almak için tartıştı.", "'Beni al' dedin. Kaptan 'bakarız' dedi.", "'Beni al' dedin, karşı takım kaptanı aldı. Kendi takımın bunu fark etmedi bile."]),
  C("İyi oynayan çocuğa git", "Sosyal Radar", "medium", ["Doğru kişiyi hatırladın. Network etkisini erken keşfettin.", "Bir bakışta en güçlü oyuncuyu seçtin.", "Yanlış oyuncuyu seçtin.", "En zayıf seçeneği takım yıldızı ilan ettin.", "Fena değildi ama en iyisi değildi."],
    { mini: { type: "memory", title: "Takımı Oku", hint: "Çocukları kısa süre göreceksin. En iyi top kontrolü olanı hatırla." } })
]},
{ id: "sana-guluyorlar", ch: 2, age: "4 yaş 9 ay", icon: "😅", fam: "social", title: "Sana Gülüyorlar", text: "Bir şey söyledin. Birkaç çocuk güldü. Neye güldükleri tam belli değil.", choices: [
  D("Sus", { Dayanıklılık: 1 }, "Olayın ömrünü kısalttın."),
  C("Kendine de gül", "Pişkinlik", "easy", ["Silahı ellerinden aldın.", "Kendine güldün, herkes seninle güldü; bir saat sonra aynı espriyi onlar tekrar ediyordu.", "Güldün ama biraz geç. Kahkahalar çoktan bitmişti.", "Güldün, burnundan süt geldi. İkinci bir gülme dalgası başladı."], { trait: "Kendine Gülebilir" }),
  C("Laf yetiştir", "Çene", "hard", ["Karşı ateş etkili oldu.", "Tek cümlelik cevabın okul bahçesinde efsaneye dönüştü.", "Cevabı buldun; eve gidince.", "Laf yetiştirdin, sonra kelimeleri karıştırdın. Gülme ikiye katlandı."]),
  C("Sahneyi devral", "Pişkinlik", "easy", ["Gülüşmeleri alkışa çevirdin. Artık gösterinin sahibisin.", "Doğaçlama bir şov yaptın. Ertesi gün tekrar istendi.", "Sahneyi devraldın; seyirci dağıldı.", "Sahneyi devraldın ve takıldın. Artık gerçekten gülüyorlar."], { req: "Sahne Sever" })
]},
{ id: "ilk-kucuk-sir", ch: 2, age: "5 yaş", icon: "🤫", fam: "social", title: "İlk Küçük Sır", text: "Bir arkadaşın sana bir şey söyledi ve kimseye söylememen gerektiğini ekledi.", choices: [
  C("Sırrı tut", "Vicdan", "easy", ["Güven puanı görünmeden arttı.", "Sırrı tuttun. Arkadaşın sana ikinci, daha büyük bir sır verdi. Terfi aldın.", "Sırrı tuttun ama ağzından yarım kelime kaçtı.", "Sırrı tutmaya o kadar odaklandın ki uykunda söyledin."]),
  C("Başkasına anlat", "Çene", "medium", ["Bilgi hızla dolaşıma girdi. Sen de bir anda popüler oldun.", "Sırrı öyle anlattın ki kimse kaynağın sen olduğunu bilmiyor. Profesyonel.", "Anlattın; dinleyen zaten biliyormuş.", "Anlattığın kişi, sırrın sahibinin en yakın arkadaşıydı."], { flag: "sirVerdi" }),
  C("Önemini değerlendir", "Sosyal Radar", "easy", ["Her sırrın aynı ağırlıkta olmadığını fark ettin.", "Sırrın aslında sır bile olmadığını fark ettin. Herkes biliyordu.", "Değerlendirmeye çalıştın; sır çok karışıktı.", "Değerlendirirken yüksek sesle düşündün."])
]},
{ id: "aileler-kiyasliyor", ch: 2, age: "5 yaş 2 ay", icon: "📏", fam: "education", title: "Aileler Kıyaslıyor", text: "Yetişkinler çocuklardan konuşuyor ama aslında birbirleriyle yarışıyorlar.", choices: [
  C("Görmezden gel", "Dayanıklılık", "easy", ["Yetişkin olimpiyatlarından çekildin.", "Görmezden geldin; yetişkinler senin olgunluğunu kıyaslamaya başladı. Kazandın.", "Görmezden gelmeye çalıştın; adın on kez geçti.", "Görmezden gelirken 'Bizimki okumayı söktü' cümlesini duydun. Sen sökmemiştin."]),
  C("Bildiğini göster", "Pişkinlik", "medium", ["Rekabetin ortasına gönüllü girdin ve puan aldın.", "Alfabeyi tersten okudun. Karşı aile çocuğunu hemen kursa yazdırdı.", "Göstermeye çalıştın; heyecandan unuttun.", "Bildiğini gösterdin. Yanlış biliyormuşsun."]),
  C("Yetişkinleri gözlemle", "Sosyal Radar", "medium", ["Bunun aslında çocuklarla ilgili olmadığını fark ettin.", "Kimin kiminle neden yarıştığını çözdün. Aile sosyolojisinde ilk makale.", "Gözlemledin. Sonuç: yetişkinler garip.", "Gözlemlerini yüksek sesle paylaştın. Misafirler erken kalktı."])
]},
{ id: "kirilan-oyuncak", ch: 2, age: "5 yaş 4 ay", icon: "🔧", title: "Kırılan Oyuncak", text: "Oyuncak kırıldı. Sen dokundun. Ama 'dokunmak' geniş bir kavram.",
  recall: [{ flag: "kediSuclu", text: "Bu evde bir şey kırılınca artık önce sana bakıyorlar. Kedi aklandı." }], choices: [
  D("Hemen söyle", { Vicdan: 2 }, "Hasar raporu gecikmeden teslim edildi."),
  C("Yerine koy, uzaklaş", "Kurnazlık", "hard", ["Olayın keşif saatini erteledin.", "Oyuncağı öyle yerleştirdin ki kırık, bir hafta sonra başkasının elinde ortaya çıktı.", "Yerine koydun; tam o sırada bir parça düştü.", "Uzaklaşırken çağrıldın: 'Bu ne?'"]),
  C("Tamir etmeye çalış", "Akıl", "medium", ["Mühendislik departmanı kuruldu.", "Tamir ettin; oyuncak eskisinden iyi çalışıyor. Üstelik artık ışığı da yanıyor.", "Tamir ettin; bir parça arttı.", "Tamir ederken ikinci oyuncağı da söktün."])
]},
{ id: "mahalle-turnuvasi", ch: 2, age: "5 yaş 5 ay", icon: "🏃", title: "Mahalle Turnuvası", text: "Çocuklar yarış hazırlığında. Kurallar henüz tam belli değil.", choices: [
  C("Yarış", "Dayanıklılık", "medium", ["Burun farkıyla öndesin. Zafer yine zaferdir.", "Bitiş çizgisine vardığında rakibin hâlâ yarı yoldaydı.", "Rakibin biraz daha hızlıydı.", "Başlangıçta ayakkabın çıktı. Yarış ayakkabısız devam etti.", "Neredeyse aynı anda vardınız."],
    { mini: { type: "race", title: "Mahalle Yarışı", hint: "5 saniye boyunca olabildiğince hızlı dokun." } }),
  C("Başlangıç avantajı bul", "Kurnazlık", "hard", ["Kurallarda küçük bir boşluk keşfettin.", "Boşluğu buldun, kullandın; kural kitabına senin adın eklendi.", "Boşluk bulamadın. Kurallar sıkıymış.", "Erken çıktın, diskalifiye edildin. Hakem mahalle bakkalıydı."]),
  C("Hakem olmaya çalış", "Çene", "hard", ["Yarışmadın. Yarışın kurallarına karar verdin.", "Hakem oldun, ödül töreni düzenledin, madalyaları kendin dağıttın.", "Hakemlik başvurun reddedildi. Yarışçı olarak kaydedildin.", "Hakem oldun ama iki taraf da sana itiraz etti. Turnuva iptal."], { trait: "Organizatör" })
]},
{ id: "harclik-pazarligi", ch: 2, age: "5 yaş 7 ay", icon: "💰", fam: "money", title: "İlk Harçlık Pazarlığı", text: "Sana bir miktar söylendi. Sen miktarların konuşulabilir olduğunu yeni öğrendin.",
  recall: [{ flag: "ilkKelimePara", text: "İlk kelimesi 'Para' olan birinden beklenen an nihayet geldi." }], choices: [
  D("Kabul et", { Vicdan: 1 }, "Sözleşme imzalandı."),
  C("Biraz daha iste", "Çene", "hard", ["Ücret pazarlığı başladı ve zam aldın.", "Yüzde elli zam aldın. Aile bütçesi yeniden düzenlendi.", "İstedin; 'büyüyünce' denildi.", "İstedin; harçlığın donduruldu ve denetime alındı."]),
  C("Ev işi karşılığı teklif et", "Kurnazlık", "medium", ["Hizmet karşılığı gelir modeli doğdu.", "Sofra kurmak için tarife açıkladın, bulaşık için ek paket. Ailen kabul etti.", "Teklifin kabul edildi; ücretsiz stajyer olarak.", "Ev işi teklif ettin; tüm ev işleri sana verildi, ücret konusu ertelendi."], { trait: "İş Modeli Kurar" }),
  C("Enflasyon farkı talep et", "Akıl", "medium", ["Enflasyon farkı talep ettin. Ailen şaşkınlıkla kabul etti.", "Farkı hesapladın, geriye dönük talep ettin, tahsil ettin.", "'Enflasyon' kelimesini doğru söyleyemedin. Dava düştü.", "Enflasyon farkı istedin; babanın maaş konuşması başladı. Kimse mutlu değil."], { req: "Erken Ekonomi Bilinci" })
]},
{ id: "okul-hazirligi", ch: 2, age: "5 yaş 9 ay", icon: "🎒", fam: "education", title: "Okul Hazırlığı", text: "Çanta, harfler, defterler. Sistem seni bekliyor.", choices: [
  C("Harflerle ilgilen", "Akıl", "easy", ["Sistemle ilk dostane temas.", "Harfleri öğrendin ve markette etiketleri okumaya başladın. Fiyatlar seni endişelendirdi.", "Harflerle ilgilendin; harfler seninle ilgilenmedi.", "B ile D'yi karıştırdın. Hâlâ karıştırıyorsun."]),
  C("Çantayı kendin hazırla", "Dayanıklılık", "easy", ["Operasyonel bağımsızlık arttı.", "Beslenme, kalem, yedek çorap. Ailen sana kendi çantasını da verdi.", "Çantayı hazırladın; içinde sadece oyuncak var.", "Çantayı öyle doldurdun ki kaldıramadın."]),
  D("Aileye bırak", { "Sosyal Radar": 1 }, "Görev dağılımı da bir yetkinliktir.")
]},
{ id: "ilkokul-kapisi", ch: 2, age: "6 yaş", icon: "🏫", fam: "education", title: "İlkokul Kapısı", text: "Büyük bina, küçük sıra, çok sayıda kural. Bölüm III kapıda.",
  recall: [{ flag: "yapiskan", text: "Kreş kapısındaki bacak olayı ailede hâlâ anlatılıyor." }], choices: [
  C("Cesurca gir", "Cesaret", "medium", ["Yeni sistem açıldı.", "İçeri girdin, öğretmene 'Günaydın' dedin, en öndeki sırayı aldın.", "Kapıda bir an durdun. Arkadaki kalabalık seni içeri itti.", "Cesurca girdin; tuvalete."]),
  C("Önce ortamı oku", "Sosyal Radar", "medium", ["Sınıfın görünmeyen haritasını çıkarmaya başladın.", "Kimin lider, kimin sessiz dahi, kimin kantincinin yeğeni olduğunu ilk gün öğrendin.", "Ortamı okudun; ortam seni okumadı.", "Ortamı okurken zil çaldı ve kapı kapandı."]),
  C("Sınıfı kendin bul", "Akıl", "easy", ["Kapıyı buldun ve içeri girdin.", "İpucunu tek bakışta çözdün. Doğru sınıf, ilk sıra.", "Yanlış sınıfa girdin, sonra doğrusunu buldun.", "Yanlış sınıfa girdin. Herkes sana baktı. Dördüncü sınıftı.", "Doğru koridor, yanlış kapı; ama öğretmen seni yönlendirdi."],
    { mini: { type: "doors", title: "Doğru Sınıfı Bul", hint: "Sınıfının işaretini aklında tut. Birazdan kaybolacak." } })
]},

/* ───────────── BÖLÜM III · OKUL YILLARI ───────────── */
{ id: "ilk-ders", ch: 3, age: "6 yaş 1 ay", icon: "✏️", fam: "education", title: "İlk Ders", text: "Öğretmen 'Kim okumayı biliyor?' diye sordu. Sınıfta 28 el ya havada ya cepte.", choices: [
  C("El kaldır", "Cesaret", "easy", ["Tahtaya kalktın, adını yazdın. İlk kamu görevin.", "Tahtaya çıktın ve koca bir cümle yazdın. Öğretmen defterine yıldız koydu.", "El kaldırdın; öğretmen başkasını seçti.", "Tahtaya kalktın, kalemi ters tuttun."]),
  C("Sessizce defterine yaz", "Akıl", "easy", ["Sessizce yaptın. Öğretmen defterini görünce kaşlarını kaldırdı.", "Defterin sınıfa örnek olarak gösterildi.", "Yazdın ama silgi de yazdı.", "Deftere değil sıraya yazdın."]),
  D("Yanındakine yardım et", { Vicdan: 1, "Sosyal Radar": 1 }, "İlk dayanışma ağın kuruldu."),
  C("Tabletten öğrendiklerini göster", "Akıl", "easy", ["Harfleri bir oyundan öğrendiğini anlattın. Öğretmen not aldı.", "Sınıfa harf oyunu tanıttın. Öğretmen dersin yarısını sana bıraktı.", "Anlatırken oyunun adını hatırlayamadın.", "Tabletten öğrendiğin şeyin reklam şarkısı olduğu anlaşıldı."], { req: "Teknoloji Merakı" })
]},
{ id: "sira-arkadasi", ch: 3, age: "6 yaş 2 ay", icon: "🪑", fam: "social", title: "Sıra Arkadaşı", text: "Yanına oturan çocuk kalemlerini sayıyor. Senin kalemlerini de.",
  recall: [{ flag: "sirVerdi", text: "Kreşteki sır hikâyesi okula senden önce gelmiş. Yeni sıra arkadaşın biraz temkinli." }], choices: [
  C("Kendini tanıt", "Çene", "easy", ["Adını söyledin, o da söyledi. Diplomatik ilişkiler kuruldu.", "Tanıştınız, güldünüz, ortak düşman olarak matematiği seçtiniz. Ömürlük dostluk.", "Tanıttın; o kalem saymaya devam etti.", "Kendini tanıtırken adını yanlış söyledin. Tüm yıl öyle çağrıldın."]),
  D("Kalemlerini paylaş", { Vicdan: 1 }, "Kalem ekonomisinde güven tesis edildi."),
  C("Sıraya sınır çiz", "Cesaret", "medium", ["Sıranın ortasına görünmez bir sınır çektin. İki taraf da saygı duydu.", "Sınırı çizdin, anlaşma imzaladınız, ek protokolle silgi ortak kullanıma açıldı.", "Sınırı çizdin; dirseği her gün sınırı ihlal etti.", "Sınırı kalemle sıraya çizdin. Müdür yardımcısı tanıştırıldı."]),
  C("Espriyle buzları kır", "Pişkinlik", "veryEasy", ["Bir espri yaptın, o güldü. Sıra artık ortak bölge.", "Espriyi o kadar beğendi ki teneffüste başkalarına anlattı. Kaynak olarak seni gösterdi.", "Espri havada kaldı. Kalem saymaya devam edildi.", "Espri yaparken sandalyeden düştün. Aslında bu daha komikti."], { req: "Kendine Gülebilir" })
]},
{ id: "teneffus-kantini", ch: 3, age: "6 yaş 4 ay", icon: "🥪", fam: "money", title: "Kantin Kuyruğu", text: "Teneffüs 10 dakika. Kuyruk 12 dakika. Matematik kantinde başlıyor.", choices: [
  D("Sırada bekle", { Dayanıklılık: 1, Vicdan: 1 }, "Tost soğuktu ama vicdanın sıcak."),
  C("Öndeki arkadaşına sipariş verdir", "Çene", "medium", ["Sipariş zincirini kurdun, tost sana ulaştı.", "Üç arkadaşının siparişini birleştirip toplu indirim aldın.", "Arkadaşın siparişi unuttu. Kendi tostunu yedi.", "Sipariş verdirdin; kantinci ikinizi de sıranın sonuna gönderdi."]),
  C("Kantinciye yardım et", "Dayanıklılık", "medium", ["Dökülen bozuklukları topladın. Kantinci seni sıranın önüne aldı.", "Kantinci sana ömür boyu 'ekstra kaşar' hakkı tanıdı.", "Topladın ama zil çaldı. Yardım ettin, aç kaldın.", "Yardım ederken peynir kasesini devirdin. Kantin geçici olarak kapandı.", "Çoğunu topladın; kantinci teşekkür etti ama sıra aynı."],
    { mini: { type: "collect", title: "Bozuklukları Topla", hint: "Yere saçılan paraları zil çalmadan topla.", piece: "🪙" } }),
  C("Kantincinin hesap hatasını düzelt", "Kurnazlık", "easy", ["Kantincinin hesabındaki hatayı buldun. Sana 'Muhasebeci' lakabı takıldı.", "Hatayı buldun, kantinci ödül olarak sana çikolata verdi. Hata aslında senin lehineydi.", "Hatayı söyledin; kantinci 'Sen önce toplama öğren' dedi.", "Hatayı söyledin; hata yokmuş. Kuyruk seni izledi."], { req: "Para Üstü Radarı" })
]},
{ id: "odev-nerede", ch: 3, age: "6 yaş 7 ay", icon: "📚", fam: "home", title: "Ödev Nerede?", text: "Sabah 07.40. Ödev defteri evde değil, çantada değil. Belki de hiç yapılmadı.",
  recall: [{ flag: "kediSuclu", text: "Bu evde hayvanlar sanık olarak sık kullanılır. Kedi, ödev defterinden uzak duruyor." }], choices: [
  D("Doğruyu söyle", { Vicdan: 2 }, "Öğretmen dürüstlüğünü not etti. Ödevi de not etti."),
  C("Teneffüste yetiştir", "Akıl", "medium", ["On dakikada iki sayfa. Kalite tartışılır, teslim kesin.", "Teneffüste bitirdin; öğretmen 'En temiz ödev bu' dedi. Kimse sormadı.", "Yetiştiremedin; yarım ödev teslim edildi.", "Yazarken kalemin bitti. Sonra zil çaldı. Sonra silgin kayboldu."]),
  C("'Köpek yedi' de", "Pişkinlik", "hard", ["Öğretmen güldü ve bir gün ek süre verdi.", "Öyle anlattın ki öğretmen köpeğin sağlığını sordu. Ek süre ve geçmiş olsun dileği.", "'Sizin köpeğiniz yok ki' dedi öğretmen.", "Veli toplantısında köpek konusu açıldı. Köpeğiniz yoktu."], { flag: "yalanci" })
]},
{ id: "sinif-baskani", ch: 3, age: "7 yaş", icon: "🗳️", fam: "social", title: "Sınıf Başkanlığı Seçimi", text: "Seçim var. Vaatler belli: daha uzun teneffüs, daha az ödev, sınıfa bir akvaryum.", choices: [
  C("Aday ol", "Cesaret", "hard", ["Seçildin. İlk icraatın: akvaryum için bağış kampanyası.", "Oyların çoğunu aldın. Rakibin tebrik etti, sonra yardımcın oldu.", "Aday oldun; iki oy aldın. Biri senin, biri sıra arkadaşının.", "Seçim konuşmasında 'Herkese dondurma' dedin. Öğretmen adaylığını iptal etti."], { flagWin: "baskan", trait: "Seçim Makinesi" }),
  C("Arkadaşının kampanyasını yönet", "Sosyal Radar", "medium", ["Adayın kazandı. Sen gölge başkansın.", "Adayın açık farkla kazandı. Tüm kararlar önce sana danışılıyor.", "Adayın kaybetti. Kampanya analizi yapılacak.", "Adayın kaybetti ve suçu sana attı."]),
  D("Oy ver, geç", { Vicdan: 1 }, "Demokrasiye katkıda bulundun. Akvaryum gelmedi."),
  C("Seçim kurulunu kur", "Çene", "easy", ["Seçim kurulu başkanı oldun. Aday olmadan kazanmanın yolu.", "Sandığı sen tasarladın, oyları sen saydın, sonucu sen açıkladın. Tam yetki.", "Kurul kuruldu; kimse seni dinlemedi.", "Oyları sayarken iki kez saydın. Seçim yenilendi."], { req: "Organizatör" }),
  C("Seçim konuşması yap", "Pişkinlik", "medium", ["Konuşmanı yaptın; sınıf ayakta alkışladı.", "Konuşman o kadar etkiliydi ki diğer adaylar çekildi.", "Konuşman uzun sürdü; teneffüs zili yarıda kesti.", "Konuşmanın ortasında ne diyeceğini unuttun. Sessizlik 40 saniye sürdü."], { req: "Sahne Sever", flagWin: "baskan" })
]},
{ id: "davetiyeler", ch: 3, age: "7 yaş 3 ay", icon: "💌", fam: "social", title: "Davetiyeler Dağıtıldı", text: "Sınıfta doğum günü davetiyeleri dağıtılıyor. Sende yok. Henüz.", choices: [
  D("Umursama", { Dayanıklılık: 2 }, "Davetiyesiz de hayat var. Hatta pastasız bile."),
  C("Nedenini sor", "Çene", "medium", ["Sordun; davetiyen çantada unutulmuş.", "Sordun; sen 'onur konuğu' listesindeymişsin. Ayrı davetiye basılıyormuş.", "Sordun; cevap 'yer kalmadı' oldu.", "Sorarken sesin titredi; tüm sınıf duydu."]),
  C("Aynı gün kendi partini planla", "Kurnazlık", "medium", ["Aynı gün kendi partini ilan ettin. Katılım oranı yüzde elli.", "Partinde havuz olduğunu duyurdun. Diğer parti ertelendi.", "Parti planladın; kimse gelmedi, çünkü herkes öbür partideydi.", "Parti planladın; ailen haberdar değildi."]),
  C("Kimin gerçekten gideceğini tahmin et", "Sosyal Radar", "easy", ["Partiye yarısının gitmeyeceğini tahmin ettin. Haklıydın.", "Tahminin o kadar isabetliydi ki parti sahibi davetiye listesini sana danıştı.", "Tahmin ettin; yanıldın. Herkes gitti.", "Tahminini yüksek sesle söyledin. Parti sahibi duydu."], { req: "Odayı Okur" })
]},
{ id: "bayram-harcligi", ch: 3, age: "7 yaş 6 ay", icon: "🧧", fam: "money", title: "Bayram Harçlığı", text: "Bayram. Eller öpüldü, zarflar toplandı. Toplam bütçe çocuk standartlarında rekor.",
  recall: [{ flag: "ilkKelimePara", text: "Akrabalar zarfı uzatırken 'Hani ilk kelimesi para olan' diye gülüştü." }], choices: [
  D("Ailene teslim et", { Vicdan: 2 }, "Varlıklar merkez bankasına aktarıldı. Faiz oranı belirsiz."),
  C("Hepsini harca", "Pişkinlik", "easy", ["Bir günde mahalle ekonomisini canlandırdın.", "Bakkal, oyuncakçı ve simitçi aynı gün rekor kırdı. Sana teşekkür kartı gönderildi.", "Harcadın; aldıklarının yarısı ertesi gün bozuldu.", "Hepsini tek bir oyuncağa harcadın. Oyuncak ilk gün kırıldı."]),
  C("Akrabalarla ikinci tur yap", "Çene", "medium", ["İkinci el öpme turuyla bütçeyi ikiye katladın.", "Uzak akrabaları bile ziyaret listesine ekledin. Bayram cirosu rekor.", "İkinci turda 'Sen gelmiştin ya' dediler.", "İkinci tur fark edildi. Zarflar geri çağrıldı."]),
  C("Kumbaraya at, kimseye söyleme", "Kurnazlık", "easy", ["Kumbara ağırlaştı. Kimse bilmiyor.", "Kumbara o kadar doldu ki ikinci kumbara açıldı. Yastık altı büyüyor.", "Kumbarayı açmak için çekiç gerekti.", "Kumbarayı sakladığın yeri kuzenin buldu."], { req: "Yastık Altı Ekonomisti" }),
  C("Harçlıkla limonata standı kur", "Kurnazlık", "medium", ["Sermayeyi limona çevirdin, limonu kâra.", "Stant o kadar tuttu ki mahallede ikinci şube açıldı.", "Limonata ekşi oldu. Tek müşteri annendi.", "Şekeri unuttun. Sağlık müfettişi (baban) standı kapattı."], { req: "İş Modeli Kurar", trait: "Limonata Baronu" })
]},
{ id: "mahalle-maci", ch: 3, age: "7 yaş 10 ay", icon: "🥅", title: "Mahalle Maçı", text: "Maç berabere. Son vuruş sende. Kalenin arkasında komşunun camı parlıyor.",
  recall: [{ flag: "cesurPark", text: "Parktaki büyük çocuk karşı takımda. Seni tanıdı, selam verdi." }], choices: [
  C("Şut çek", "Cesaret", "medium", ["Gol! Cam sağlam. Mahalle sallandı.", "Köşeye gol. Komşu bile balkondan alkışladı.", "Top kaleciye gitti. Maç berabere bitti.", "Top cama gitti. Komşu kapıya geldi. Maç ertelendi.", "Direk! Cam sağlam, skor aynı."],
    { mini: { type: "timing", title: "Şut Çek!", hint: "Kırmızı işareti yeşil alanda durdur." }, flagBad: "camKirildi" }),
  C("Pas ver", "Sosyal Radar", "easy", ["Pas verdin, arkadaşın attı. Asist de bir sanattır.", "Öyle bir pas verdin ki arkadaşın boş kaleye attı. Herkes seni kucakladı.", "Pas verdin; top karşı takıma gitti.", "Pas verdin; top komşunun camına gitti."], { trait: "Asist Ustası", flagBad: "camKirildi" }),
  D("Camı düşün, yavaş vur", { Vicdan: 1, Dayanıklılık: 1 }, "Top kaleye yavaşça yuvarlandı. Kaleci aldı. Cam teşekkür etti.")
]},
{ id: "kedi-istiyoruz", ch: 3, age: "8 yaş", icon: "🐱", fam: "home", title: "Evde Kedi Oylaması", text: "Eve kedi alınması gündemde. Karar oturumu akşam yemeğinde.",
  recall: [{ flag: "kediSuclu", text: "Vazo davasından beri ailede 'Kediye güven olmaz' diyen bir hizip var." }], choices: [
  C("Duygusal konuşma yap", "Çene", "medium", ["Gözlerin doldu, sesin titredi. Kedi onaylandı.", "Konuşma sırasında babaannen ağladı. Bir değil iki kedi onaylandı.", "Konuşman etkileyiciydi ama karar 'yazın bakarız'.", "Konuşurken 'Söz, her gün ben temizleyeceğim' dedin. Kayıt altına alındı. Kedi gelmedi."], { flagWin: "kediGeldi" }),
  C("Sorumluluk planı sun", "Akıl", "medium", ["Mama, kum, veteriner: üç maddelik plan sundun. Kedi onaylandı.", "Tablolu, bütçeli bir plan sundun. Ailen kedi yerine seni işe almayı düşündü.", "Plan iyiydi ama bütçe onaylanmadı.", "Planın ilk maddesi 'Kediye telefon alalım' idi. Oturum kapandı."], { flagWin: "kediGeldi" }),
  C("Büyükanneyi ikna et", "Sosyal Radar", "medium", ["Büyükanneyi yanına çektin. Oturum bitmeden karar çıktı.", "Büyükanne kediyi kendisi getirdi. Tartışma bile olmadı.", "Büyükanne kuş istiyormuş.", "Büyükanne ikna oldu; kendi evine kedi aldı."], { flagWin: "kediGeldi" }),
  D("Vazo için kediden resmen özür dile", { Vicdan: 3 }, "Yıllar sonra gelen itiraf. Aile duygulandı, oturum oybirliğiyle sonuçlandı. Kedi geliyor.", { reqFlag: "kediSuclu", flag: "kediGeldi" })
]},
{ id: "tablet-saati", ch: 3, age: "8 yaş 4 ay", icon: "🎮", fam: "home", title: "Tablet Saati", text: "Ekran süresi günde bir saat. Oyunun bölüm sonu canavarı ise 61. dakikada.", choices: [
  D("Süreye uy", { Vicdan: 1, Dayanıklılık: 1 }, "Canavar yarına kaldı. İrade bugün kazandı."),
  C("Beş dakika daha iste", "Çene", "easy", ["Beş dakika aldın, canavarı yendin.", "Beş dakika istedin, on beş aldın. Pazarlık dersi.", "Beş dakika istedin; 'Yarın' dendi.", "Beş dakika istedin; ertesi günün süresi de kesildi."]),
  C("Saati gizlice geri al", "Kurnazlık", "hard", ["Tabletin saati bir saat geri gitti. Canavar yenildi.", "Saati geri aldın, canavarı yendin, iz bırakmadın. Kusursuz operasyon.", "Saati geri aldın; alarm çaldı.", "Saati geri aldın; ertesi sabah ailen işe bir saat geç kaldı."]),
  C("Ebeveyn kilidini çöz", "Akıl", "medium", ["Kilidi çözdün. Sınırsız ekran, sınırsız sorumluluk.", "Kilidi çözdün ve ailenin telefonuna ekran süresi koydun.", "Kilit çözülmedi; tablet 10 dakika kilitlendi.", "Kilidi çözmeye çalışırken tableti fabrika ayarlarına döndürdün."], { req: "Teknoloji Merakı", trait: "Kilit Kırıcı" })
]},
{ id: "veli-toplantisi", ch: 3, age: "8 yaş 8 ay", icon: "🚪", fam: "education", title: "Veli Toplantısı", text: "Ailen okulda. Sen kapının önündesin. İçeriden arada bir adın duyuluyor.",
  recall: [{ flag: "yalanci", text: "Öğretmenin elinde 'yaratıcı açıklamalar' başlıklı bir dosya var." }, { flag: "camKirildi", text: "Komşunun camı konusu da gündemde." }, { flag: "baskan", text: "Sınıf başkanlığın hanene artı olarak yazıldı." }], choices: [
  C("Kapıyı dinle", "Sosyal Radar", "medium", ["Kilit cümleleri duydun: 'zeki' ve 'biraz konuşkan'. Hazırlıklısın.", "Her şeyi duydun ve ailen çıkmadan savunmanı hazırladın.", "Hiçbir şey duyamadın. Kapı çok kalınmış.", "Kapıya yaslandın, kapı açıldı. İçeri düştün."]),
  C("Öğretmene önceden çiçek götür", "Pişkinlik", "medium", ["Çiçek kabul edildi. Toplantının tonu yumuşadı.", "Öğretmen çiçeği vazoya koydu ve toplantıyı 'Ne kadar kibar bir çocuk' diye açtı.", "Çiçeği verdin; öğretmen alerjikmiş.", "Çiçeği okul bahçesinden kopardığın anlaşıldı."]),
  D("Sonucu bekle", { Dayanıklılık: 1 }, "Kontrol edemediğin şeyleri beklemeyi öğrendin."),
  C("Ailenin yüzünden sonucu oku", "Sosyal Radar", "easy", ["Kapıdan çıkarken yüzlerine baktın. Sonuç iyi. Rahatladın.", "Yüz ifadesinden sadece sonucu değil, akşam yemeğini de tahmin ettin.", "Yüzleri hiçbir şey söylemiyordu.", "'İyi geçti' diye sevinçle koştun. İyi geçmemişti."], { req: "Odayı Okur" })
]},
{ id: "karne-gunu", ch: 3, age: "9 yaş", icon: "📜", fam: "education", title: "Karne Günü", text: "Yılın son günü. Karne elinde. Eve kadar 800 metre, düşünmek için bolca zaman.", choices: [
  C("Karneyi gururla göster", "Pişkinlik", "easy", ["Karneyi kapıda açtın. Alkış geldi.", "Karneyi gösterdin; ailen fotoğrafını çekip aile grubuna gönderdi.", "Karneyi gösterdin; tek zayıf not da görüldü.", "Karneyi gösterirken yere düşürdün. Kedi üstüne oturdu."]),
  C("Önce iyi haberleri anlat", "Çene", "medium", ["İyi haberlerle başladın; kötü haber gölgede kaldı.", "Sunumun o kadar iyiydi ki karneyi açmalarına gerek kalmadı.", "İyi haberleri anlattın; karne yine de açıldı.", "İyi haber bulamadın. Sessizlik uzadı."]),
  C("İmzayı yarına ertele", "Kurnazlık", "hard", ["İmza bir gün ertelendi. Bu bir günü iyi kullandın.", "Karne tatil boyunca 'kayıp' kaldı ve ilk gün imzalı bulundu. Kimse nasıl olduğunu sormadı.", "Ertelemeye çalıştın; öğretmen aradı.", "Ertelemeye çalıştın; karne çantadan çıktı ve herkesin önünde açıldı."]),
  D("Olduğu gibi ver", { Vicdan: 1 }, "Karne teslim edildi. Değerlendirme aile meclisinde.")
]}
];
