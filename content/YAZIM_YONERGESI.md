# Makarya · Olay yazım yönergesi

Bu belge, oyunun bütün olaylarını yazan herkes için (insan ya da yapay zekâ) bağlayıcıdır.

## 1. Oyun

Makarya, bir insanın doğumdan ölüme hayatını anlatan, kara mizahlı, metin ağırlıklı bir telefon oyunudur. Kurgu, eski "kendi maceranı seç" kitaplarından; mekanikler Disco Elysium'dan beslenir: statlar konuşan "iç seslerdir". Oyuncu her olayda bir seçim yapar. Bazı seçimler kesin sonuçludur, bazıları 20 yüzlü zar ya da mini oyunla sonuçlanır. Seçimler geri alınamaz. Bir hayat yaklaşık 45 dakika sürer, bir hayatta yaklaşık 125 olay görülür; olaylar geniş bir havuzdan rastgele seçilir, bu yüzden iki hayat birbirinin aynısı olmaz.

## 2. Dünya: Makarya

- **Makarya, Türkiye'ye çok benzeyen ama kurgusal bir ülkedir.** Günümüzde geçer: akıllı telefonlar, mesaj grupları, kısa video uygulamaları, yapay zekâ, kira artışları, uzaktan çalışma, site aidatları, kripto parayı andıran "dijital para", kargo takibi, yemek siparişi uygulamaları.
- **Gerçek şehir, semt, anıt, kurum, sınav adı kullanılmaz.** "Şehir", "mahalle", "sahil yolu", "büyük sınav", "üniversite sınavı", "lise sınavı", "devlet sınavı", "vergi dairesi", "sosyal güvenlik kurumu", "belediye" gibi genel isimler kullanılır. Uydurma isim gerekiyorsa açıkça uydurma ve komik olsun: "Makarya Merkez Bankası", "Büyük Makarya Sınavı".
- **Marka, uygulama, kulüp, dizi, şarkı, film, ünlü adı yoktur.** "Kısa video uygulaması", "mesajlaşma uygulaması", "şehrin büyük takımı", "akşam dizisi", "popüler şarkı".
- **Gerçek kişi yoktur.** Siyasetçiler ancak genel olarak ve isimsiz geçebilir ("bir belediye başkan adayı", "seçim otobüsü", "vaat"); parti, ideoloji, yönetim biçimi, gerçek olaylara gönderme yoktur.
- **Din ve siyaset espri konusu değildir.** Bayram, düğün, cenaze gibi kültürel anlar olabilir; inanç, ibadet ve din adamları üzerinden espri yapılmaz.
- **Para birimi adı verilmez.** "Maaş", "kira", "birkaç maaş", "bir servet", "üç aylık kira" gibi göreli ifadeler kullanılır.

## 3. Ton

- **İmza anlatıcı:** Soğukkanlı, bürokratik, kurumsal bir dil hayatın büyük anlarını anlatır. "İlk basın açıklamanı yaptın." "Varlık yönetimini dışarıya devrettin." "Dosya başka birinin masasına gönderildi."
- **Kara mizah:** Hedef sistemler, bürokrasi, aile dinamikleri, toplumsal beklentiler, zaman ve oyuncunun kendisidir. Zayıf olan (yoksul, hasta, engelli, yaşlı, çocuk) asla alay konusu olmaz. Anlatıcı acımasız değil, soğukkanlıdır; oyuncu gülerken biraz da içi sızlar.
- **Hedef kitle 20–50 yaş.** Gönderme yaptığın her şey bugünün hayatından olsun; "bunu ben de yaşadım" dedirtmeli.
- **Kısa yaz.** Olay metni 1–2 cümle (en fazla ~200 karakter). Sonuç metinleri tek bir vuruş: 1–2 cümle (en fazla ~180 karakter). Espri son kelimede patlasın.
- **Başarısızlıklar en komik metinlerdir.** Kritik hata metni, kalıcı ve gülünç bir iz bırakmalı.
- **Hitap:** Oyuncuya "sen" diye hitap edilir (ikinci tekil şahıs).
- **Cinsiyet:** Metinler cinsiyetten bağımsız yazılır. Türkçede zaten kolaydır; "oğlum/kızım", "delikanlı", "kız isteme" gibi ifadeler yalnızca `when.gender` koşullu olaylarda kullanılır. Şimdilik oyuncu erkek karakterle oynuyor, ama havuzun genel olayları iki cinsiyete de uymalı.

## 4. Sınırlar (yaş derecesi 12+)

- **Ölüm yalnızca 18 yaşından sonra.** 18 yaş öncesinde (bölüm 1–5) hiçbir seçimde `risk` olmaz. Çocuk ve gençlerde tehlike kalıcı sonuç bırakır: alçılı kol, lakap, borç, bir sokağa bir daha girememek.
- **Şiddet sahne dışında kalır.** Haraççılar, zorbalar, kavgalar olabilir; kan, silah ayrıntısı, dayak betimlemesi olmaz. Sonuç anlatılır, eylem anlatılmaz.
- **Ölümler absürt ve soğukkanlıdır:** balkondan uçurtma kurtarma, düğünde havaya ateş edilen kurşun değil (silah yok), "kombi tamircisini beklerken", "indirim kuyruğunda", "emekli ikramiyesiyle aldığı motosikletle ilk virajda". Hastalık adı verilmez, hastalık alay konusu olmaz.
- **Kesinlikle yok:** intihar ve kendine zarar, uyuşturucu, cinsellik, alkolün özendirilmesi (ima edilebilir), kumar markaları, nefret söylemi.
- **Romantizm:** El ele tutuşma, ilk mesaj, ilk buluşma, evlilik teklifi düzeyinde.

## 5. Mekanik sözlüğü

### Statlar ve iç sesler
Statlar (tam yazımıyla): `Akıl`, `Çene`, `Kurnazlık`, `Cesaret`, `Pişkinlik`, `Vicdan`, `Dayanıklılık`, `Sosyal Radar`.

İç ses kişilikleri:
- Akıl: ukala öğretmen
- Çene: pazarcı
- Kurnazlık: mahallenin eski tüfeği
- Cesaret: asker emeklisi dayı
- Pişkinlik: televizyon sunucusu
- Vicdan: yorgun babaanne
- Dayanıklılık: maratoncu komşu
- Sosyal Radar: dedikoducu teyze

İç ses, olayın başında araya giren 1–2 cümlelik yorumdur. Bilgi verir ya da espri yapar.

### Zorluklar
`veryEasy`, `easy`, `medium`, `hard`, `veryHard`.
- Zor seçimler daha çok kazandırır ve başarılırsa özellik açar.
- Bir olayda genelde 1 kesin sonuçlu, 1–2 zarlı seçim olur. Varsa 1 kilitli seçim eklenir (özellik ya da hafıza gerektiren).

### Aile etkisi (`fam`)
Olayın türü: `home` (ev içi), `money` (para), `social` (sosyal ortam), `education` (okul ve iş hayatı). Aile etkisi yetişkinlikte azalır; bölüm 6'dan sonra `fam` seyrek kullanılır.

### Mekân (`place`)
Olayın geçtiği yer. Görseli olmayan olaylarda mekânın ortak arka planı gösterilir. Seçenekler:
`ev, mutfak, cocuk-odasi, okul, sinif, okul-bahcesi, sokak, park, bakkal, market, carsi, ofis, dukkan, devlet-dairesi, hastane, dugun-salonu, kafe, toplu-tasima, trafik, universite, kisla, banka, apartman, sahil, huzurevi, mezarlik, yazlik, stadyum, sahne, mahkeme`

### Hafıza kayıtları (flag)
Seçimler hafızaya kayıt yazar; ileride olaylar ve seçenekler bu kayıtlara göre açılır ya da değişir. **Ortak sözlük** (bölümler arası tutarlılık için bunları kullan):

| Kayıt | Anlamı | Kim yazar |
|---|---|---|
| `universiteli` | Üniversiteye girdi | Bölüm 5, üniversite sınavı |
| `universitesiz` | Üniversiteye girmedi | Bölüm 5 |
| `askerlik-yapti` | Askerliğini yaptı (erkek) | Bölüm 6 |
| `meslek-esnaf`, `meslek-memur`, `meslek-beyazyaka`, `meslek-serbest` | Mesleği | Bölüm 6, meslek seçimi |
| `evli` | Evli | Bölüm 7, evlilik kararı |
| `bosandi` | Boşandı (`unflag: "evli"` ile birlikte) | Bölüm 7–9 |
| `cocuklu` | Çocuğu var | Bölüm 7 |
| `torunlu` | Torunu var | Bölüm 9 |
| `ev-sahibi` | Ev sahibi oldu | Bölüm 7–8 |
| `borclu` | Borç batağında | Her yerde |
| `sigara` | Sigara içiyor (ölüm riskini artırır) | Bölüm 5–7 |
| `sporcu` | Düzenli spor yapıyor (ölüm riskini azaltır) | Bölüm 6–8 |
| `emekli` | Emekli | Bölüm 9 |
| `fenomen` | Sosyal medyada biraz ünlü oldu | Bölüm 4–7 |
| `haracci-dusmani` | Mahalle haraççılarıyla arası bozuk | Bölüm 4–5 |

Bölüme özel yeni kayıtlar da yazılabilir; dosyanın `flags` listesinde `label` ile tanımlanmalıdır. Bu açıklama, final kartındaki "Hayat kaydı"nda görünür ("Bir kış boyunca mahallenin tepsi tekelini elinde tuttu.").

Mevcut çocukluk kayıtları (geri dönüş için kullanılabilir): `kediSuclu` (vazo için kediyi suçladı), `ilkKelimePara`, `yalanci`, `sirVerdi`, `cesurPark`, `yapiskan`, `baskan` (sınıf başkanı oldu), `kediGeldi`, `camKirildi`, `tepsiTekeli`, `alcili-kol`.

### Özellikler (trait)
Kazanılan özellikler zar hedefini düşürür ve kilitli seçenekleri açar. Mevcut özellikler:
`Sessiz Gözlemci, Ses Yükseltince Oluyor, Erken Ekonomi Bilinci, Teknoloji Merakı, Yastık Altı Ekonomisti, Küçük Tüccar, Sahne Sever, Para Üstü Radarı, Kendine Gülebilir, Organizatör, İş Modeli Kurar, Seçim Makinesi, Asist Ustası, Limonata Baronu, Kilit Kırıcı`

Zor kontrolle açılan otomatik özellikler:
`Analitik Zihin (Akıl), Sözünü Geçirir (Çene), Açık Bulur (Kurnazlık), Geri Adım Atmaz (Cesaret), Yüzü Kızarmaz (Pişkinlik), İç Pusula (Vicdan), Kolay Dağılmaz (Dayanıklılık), Odayı Okur (Sosyal Radar)`

Yeni özellik gerekiyorsa dosyanın `traits` listesinde tanımla: `{"name": "...", "desc": "...", "bonus": {"Çene": 1, "Kurnazlık": 1}}` (her bonus 1 ya da 2).

### Mini oyunlar
Bir hayatta 8–12 mini oyun hedeflenir, yani olayların yaklaşık %8'inde. Bir seçime `mini` eklenirse sonuç metinlerine `mid` (yarım başarı) da yazılır.

| Tür | Ne yapılır | Parametreler |
|---|---|---|
| `timing` | Kayan işareti yeşil alanda durdur | — |
| `hold` | Basılı tut, doğru anda bırak | — |
| `collect` | Ekrana saçılanlara hızla dokun | `piece`: emoji |
| `race` | 5 saniye hızlı dokun | — |
| `memory` | Kısa gösterilen en iyiyi hatırla | `items`: 6 emoji (ilki en iyisi) |
| `cups` | Kutuların altındaki parayı takip et | — |
| `doors` | Gösterilen işareti hatırla, doğru kapıyı seç | — |
| `rhythm` | Işık parladığında dokun | — |
| `lanes` | Sağa sola kayarak engellerden kaç | `obstacles`: emoji listesi |
| `simon` | Gösterilen sırayı tekrarla | `items`: tam 4 emoji |
| `poker` | Parmağı kaçan dairede tut; sorular üstüne gelir | `questions`: 4–6 kısa soru |
| `trace` | Çizgiyi tek hamlede takip et | `shape`: `"M"` ya da `"imza"` |
| `bargain` | Karşı tarafın sabrı biterken fiyatı kaydır | `item`: ne pazarlanıyor, `mode`: `"sell"` ya da `"buy"` |
| `swipe` | Kartları hızla sağa/sola ayır | `left`, `right`: etiketler; `items`: 6–12 adet `{"t": "kısa metin", "right": true/false}` |
| `breath` | Daire büyürken bas, küçülürken bırak | — |
| `balance` | Sallanan şeyi parmakla dengede tut | `item`: emoji |

Her mini oyuna `title` ve `hint` yazılır. Mesleklerde mini oyunlar mesleğe özel kurgulanmalı; örneğin memurda `swipe` ile "İmzala / İade et", esnafta `bargain`.

### Ölüm riski
Yalnızca bölüm 6 ve sonrası. `"risk": {"p": 0.03, "cause": "..."}`
- `p` en fazla 0.08. Oyuncu bu yüzdeyi seçenek üzerinde görür.
- `cause` mezar taşına yazılacak cümledir: soğukkanlı, absürt, kısa. Yaş cümlede geçmez, oyun ekler. Örnek: "Site yönetimine itiraz dilekçesini teslim ederken. Dilekçe hâlâ değerlendiriliyor."

Arka planda yaşla artan doğal risk oyun motorunca eklenir; olaylara yazılmaz.

## 6. Dosya biçimi

Her yazar bir JSON dosyası üretir: `content/bolum-N.json` (ya da `content/meslek-X.json`).

```json
{
  "traits": [ {"name": "Evrak Ustası", "desc": "Hangi formun hangi masaya gideceğini bilirsin.", "bonus": {"Akıl": 1, "Dayanıklılık": 1}} ],
  "flags": [ {"flag": "ehliyetli", "label": "Ehliyetini üçüncü denemede aldı."} ],
  "deathCauses": [ {"min": 18, "max": 40, "text": "…", "flag": ""} ],
  "events": [
    {
      "id": "kira-artisi",
      "ch": 7,
      "age": "29 yaş",
      "icon": "🏠",
      "place": "apartman",
      "fam": "money",
      "title": "Kira Artışı",
      "text": "Ev sahibi mesaj attı: 'Müsaitsen bir konuşalım.' Bu cümle tarih boyunca hiç iyi bir şeyle bitmedi.",
      "weight": 1,
      "fixed": false,
      "when": { "flags": [], "notFlags": ["ev-sahibi"] },
      "voices": [
        {"stat": "Sosyal Radar", "diff": "medium", "text": "Ev sahibinin kızı yurt dışından dönüyor. Bu ev, onun ev.", "fail": "", "opens": true}
      ],
      "recall": [ {"flag": "borclu", "text": "Kredi kartı ekstresi zaten masada duruyor. Yanına bir zarf daha eklendi."} ],
      "choices": [
        {"t": "Kabul et", "direct": {"Dayanıklılık": 1}, "r": "Artışı kabul ettin. Bütçe tablosuna yeni bir kırmızı satır eklendi."},
        {"t": "Pazarlık et", "stat": "Çene", "diff": "medium",
          "r": {"win": "…", "crit": "…", "fail": "…", "bad": "…", "mid": "…"},
          "mini": {"type": "bargain", "title": "Kira Pazarlığı", "hint": "Ev sahibinin sabrı bitmeden makul bir rakamda anlaş.", "item": "kira", "mode": "buy"}},
        {"t": "'Kızınız dönüyor, değil mi?' de", "stat": "Sosyal Radar", "diff": "easy", "reqVoice": "Sosyal Radar", "r": {"win": "…", "crit": "…", "fail": "…", "bad": "…"}},
        {"t": "Yeni ev ara", "stat": "Dayanıklılık", "diff": "hard", "flagWin": "tasindi", "r": {"win": "…", "crit": "…", "fail": "…", "bad": "…"}}
      ]
    }
  ]
}
```

Alan kuralları:
- `id`: küçük harf, tire; bütün oyunda benzersiz (bölüme özgü bir ön ek kullan, örneğin `b4-ilk-telefon`).
- `age`: "12 yaş", "12 yaş 6 ay", "34 yaş" gibi; bölümün yaş aralığında. Olaylar yaşa göre dizilir, yaşları bölüm boyunca yay.
- `fixed: true`: Her hayatta mutlaka görülen dönüm noktası. Bölüm başına 1–3 tane.
- `weight`: Olayın havuzdan çıkma olasılığı (varsayılan 1; nadir olaylar 0.5, çok tipik olaylar 1.5).
- `when`: Havuza girme koşulları. `flags` (hepsi gerekir), `notFlags` (hiçbiri olmamalı), `trait`, `gender` (`erkek`/`kiz`), `fam` (aile adları listesi: Yalçın, Erdem, Keskin, Tan, Varlı, Şen), `minStat` (`{"Akıl": 40}`).
- Seçim alanları:
  - `direct` + `r` (metin): kesin sonuç.
  - `stat` + `diff` + `r` (win/crit/fail/bad[/mid]): zar ya da mini oyun.
  - `req`: gereken özellik; `reqFlag`: gereken hafıza; `reqVoice`: bu olaydaki `opens: true` iç ses geçerse görünür.
  - `trait`: başarıda kazanılan özellik.
  - `flag`: seçilince yazılır; `flagWin`: başarıda; `flagBad`: kritik hatada; `unflag`: seçilince silinir.
  - `risk`: ölüm riski (bölüm 6+).

Doğrulama: `python3 tools/validate_content.py content/bolum-1-3.json content/<dosyan>.json`

Sıfır hata olmadan teslim edilmez.
