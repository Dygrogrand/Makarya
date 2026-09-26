# Makarya · Oyun tasarım belgesi

*Sürüm 2 · 26 Eylül 2026 · kararlar işlendi*

## 1. Vizyon

**Makarya, bir Türk hayatının doğumdan ölüme kara mizahlı simülasyonu.**

- **Biçim:** Eski "kendi maceranı seç" kitaplarının kurgusu ve Disco Elysium'un konuşan iç sesleri bir araya geliyor. Görsellik 2 boyutlu resimler; oyun metin ağırlıklı, dikey tutulan telefon için tasarlanıyor.
- **İmza:** Hayatın büyük anlarını, bürokratik ve kurumsal bir dille anlatan soğukkanlı anlatıcı ("İlk basın açıklamanı yaptın").
- **Süre:** Tam bir hayat 50–60 dakika. Erken ölümlerle birlikte ortalama hayat yaklaşık **45 dakika**. Oyun her an kaydedildiği için telefonda 5–10 dakikalık oturumlarla bölünerek oynanır.
- **Seçimler geri alınamaz.** Zar atıldığı ya da mini oyun başladığı an karar kaydedilir; sayfayı yenilemek sonucu değiştirmez.
- **Tekrar oynanabilirlik:** Aile kurası, olay havuzları, kilitli seçenekler ve farklı sonlar sayesinde her hayat başka türlü geçer.
- **Teknik sınır:** 3 boyut yok. Mevcut HTML ve JavaScript altyapısı, uygulama mağazası paketine kadar taşıyabilir (bkz. bölüm 8).

## 2. Hayatın yapısı: 10 perde

| Perde | Yaş | Ana gerilim | Durum |
|---|---|---|---|
| I · Ev | 0–3 | Dünyanın kuralları | ✅ Var |
| II · Dış Dünya | 3–6 | Başka çocuklar, ilk yalan | ✅ Var |
| III · Okul Yılları | 6–9 | Sistem, sınıf, karne | ✅ Var (görseller yolda) |
| IV · Ergenlik | 10–14 | Telefon, ilk aşk, ortaöğretime geçiş sınavı | Yazılacak |
| V · Sınav Çağı | 15–18 | Üniversite sınavı, dershane, arkadaş grubu | Yazılacak |
| VI · Genç Yetişkin | 18–26 | Üniversite ya da iş, askerlik, ilk maaş, ilk ev | Yazılacak |
| VII · Kariyer ve Aile | 26–40 | Düğün, kredi, çocuk, patron, trafik | Yazılacak |
| VIII · Orta Yaş | 40–55 | Kriz, anne-babanın bakımı, bayram sofraları | Yazılacak |
| IX · Olgunluk | 55–70 | Emeklilik, torunlar, doktor randevuları | Yazılacak |
| X · Son Perde | 70+ | Miras, vasiyet, cenazede kim ne diyecek | Yazılacak |

**Olay sayısı:** Bir hayatta yaklaşık 120–130 olay görülür (olay başına ortalama 20 saniye). İki hayatın aynı olmaması için havuz bunun 3–4 katı olmalı: **400–500 olay**. Yayın için ilk hedef 250 olay; sonrası güncellemelerle gelir.

**Nasıl seçilir (motor hazır):** Her perdenin başında sabit dönüm noktaları (doğum, kreş kapısı, ilkokul kapısı, karne günü…) ve koşullara uyan havuz olaylarından rastgele bir seçki yapılır, yaşa göre sıralanır. Bugünkü çocukluk perdelerinde bir hayatta 32 olay görülüyor; havuzda 48 olay var. 5.000 hayatlık simülasyonda ardışık iki hayatın aynı olduğu hiç görülmedi.

**Havuz koşulları:** Aile, statlar, özellikler, hafıza kayıtları ve cinsiyet. Örneğin yalnızca Keskin ailesinde "Dükkânda kasaya geç" olayı çıkar; yalnızca vazo için kediyi suçlamış oyuncuda "Kedinin intikamı" olayı gelir.

**Cinsiyete özel olaylar** (VI. perdeden itibaren belirginleşir):
- erkekte askerlik yoklaması
- kızda "Kız isteme"de karşı tarafta oturmak
- kızda iş görüşmesinde "Evlenmeyi düşünüyor musunuz?" sorusu

Bu olaylar sonradan yapıştırılmaz, kurgu aşamasında iki yol için birlikte yazılır.

## 3. Disco Elysium'dan uyarlanacak mekanikler

### 3.1 İç sesler (öncelik 1, prototip bu sürümde)
Sekiz stat birer karakterdir ve kendi kişilikleriyle konuşurlar. Olay açılınca, stat yeterince yüksekse ilgili ses araya girer. Buna **pasif kontrol** denir; zar atılmaz.

> 🏺 **Vazo Kırıldı**
> **SOSYAL RADAR** [Orta · Başarılı]: Kedi seni izlemiyor. Annenin ayak seslerini izliyor. Dört saniyen var.
> **PİŞKİNLİK** [Zor · Başarılı]: Kedinin avukatı yok. Sadece söylüyorum.
> **VİCDAN** [Kolay · Başarısız]: …(Vicdan bu sırada başka bir şeyle meşguldü.)

Seslerin kişilikleri:

| Ses | Karakter |
|---|---|
| Akıl | Ukala öğretmen |
| Çene | Pazarcı |
| Kurnazlık | Mahallenin eski tüfeği |
| Cesaret | Asker emeklisi dayı |
| Pişkinlik | Televizyon sunucusu |
| Vicdan | Yorgun babaanne |
| Dayanıklılık | Maratoncu komşu |
| Sosyal Radar | Dedikoducu teyze |

İki ses birbiriyle de tartışabilir: "VİCDAN: Yapma. KURNAZLIK: Yap ama yakalanma."

### 3.2 Beyaz ve kırmızı kontroller (öncelik 2)
- **Beyaz kontrol:** Başarısız olursa kapanır ama ilgili stat yükselince yeniden açılır. "Harçlık pazarlığı 6 ay sonra tekrar masada."
- **Kırmızı kontrol:** Tek şans. Düğün, sınav, ilk iş görüşmesi. Kırmızı kontroller ekranda farklı renkte görünür, oyuncu riski bilerek girer.

### 3.3 Kafa takıntıları (Disco Elysium'daki "Düşünce Dolabı"nın karşılığı, öncelik 3)
Bazı olaylar bir "takıntı" bırakır: "Herkes bana mı bakıyor?", "Babam aslında haklı mıydı?", "Emeklilikte bir kafe açsam". Oyuncu bunu kafasına yerleştirir, takıntı birkaç olay boyunca "demlenir" ve sonra kalıcı bir özelliğe dönüşür. Bu özellik bir artı bir eksi getirir; örneğin "Kafe Hayali: Çene +2, Akıl −1, her para olayında 'kafe' seçeneği."

### 3.4 Hayat hatları: meslek, ilişki, aile
Hatlar ayrı ağaçlar olarak değil, **etiketli olay havuzları** olarak yazılır. Oyuncunun durumu bir etiket kümesidir ("memur", "evli", "çocuklu", "Keskin ailesi", "askerliğini yaptı"); o etiketleri taşıyan olaylar havuza girer. Böylece meslek × medeni durum × cinsiyet × aile birleşimleri içeriği katlamadan çeşitlenir.

- **Meslek seçimi** VI. perdede yapılır ve kendi olay hattını açar. İlk sürümde 4 meslek, her birine yaklaşık 15 olay ve 2 mesleğe özel mini oyun:
  - **esnaf:** pazarlık kaydırıcısı, veresiye defteri
  - **memur:** evrak labirenti, imza sırası
  - **beyaz yaka:** toplantıda uyanık kalma, e-posta yağmuru
  - **serbest çalışan ya da sanatçı:** müşteri kovalamaca, fatura tahsilatı
- **Evli ve bekâr hatları** ayrışır: kayınvalide, düğün, çocuk, boşanma ya da "Neden hâlâ evlenmedin?" soruları, yalnız tatiller, bekâr evi ekonomisi.
- **Özellikler olay örgüsünü değiştirir:** Bir olay yalnızca belirli bir özelliği, hafıza kaydını ya da stat eşiğini taşıyan oyuncuya çıkabilir (motor hazır: `when` koşulu).

### 3.5 Ölüm
- **Her yaşta mümkün, ama hak edilmiş olmalı.** Ölüm riski yalnızca riskli seçimlerde vardır ve **yüzdesi seçenek üstünde görünür** (☠️ %5). Oyuncu riski bilerek alır; ölünce kızmaz, güler.
- **18 yaşından sonra** her olayda küçük bir arka plan riski eklenir; yaşla artar. Sağlık seçimleri, Dayanıklılık ve bazı özellikler bu riski düşürür, kötü alışkanlıklar yükseltir.
- **Çocuklukta ve gençlikte ölümler absürttür** (uçurtma, tepsiyle kayak, düğün kurşunu). Gerçekçi şiddetle ölüm yoktur. Haraççılar, zorbalar ve kavgalar kalıcı sonuç bırakır: borç, sakatlık, lakap, bir sokağa bir daha girememek.
- **Ölüm içeriktir:** Her ölüm "Mezar Taşı" kartı olarak paylaşılabilir ve cihazdaki koleksiyona girer. Koleksiyon, açılan karakter unvanlarını da tutar. Sonraki adım: koleksiyon ilerledikçe yeni aileler, özellikler ve olaylar açılır.

### 3.6 Başarısızlık da hikâyedir (mevcut, korunacak)
Başarısız zarlar en komik metinleri taşır. Kritik hata, hikâyeye kalıcı bir iz bırakır.

## 4. Ton rehberi: kara mizahın sınırları

**Hedef alınan:** sistemler, bürokrasi, aile dinamikleri, toplumsal beklentiler, zamanın acımasızlığı ve oyuncunun kendisi.

**Hedef alınmayan:** zayıf olan. Yoksulluk, hastalık ve engellilik alay konusu olmaz. Din, siyaset ve etnik köken espri malzemesi olmaz. Bu kural hem geniş kitle hem de uygulama mağazası onayı için gerekli.

**Kara mizahın yeri:**
- ölüm
- yaşlanma
- başarısızlık
- absürt kader
- "hayat böyle işte" anları

Anlatıcı acımasız değil, soğukkanlı. Oyuncu gülerken biraz da içi sızlamalı.

Örnek cümleler:
- "Cenazende en çok ağlayan kişi sana borcu olandı. Duygusaldı ama tutarlıydı."
- "Emeklilik ikramiyen bir arabaya, arabanın taksitleri de torununa kaldı."
- "Doktor 'Stres yapmayın' dedi. Randevu için 3 ay beklediğini söylemedin."

**Yaş derecesi hedefi: 12+.** Alkol ve sigara yalnızca metinde ima edilir, görselde yer almaz. Romantik sahneler "el ele tutuşma" düzeyinde kalır. Şiddet sahne dışında kalır; ölümler absürt ve soğukkanlı anlatılır.

## 5. Olay yazım şablonu

Her olay şu parçalardan oluşur:
1. **Başlık, yaş ve 1–2 cümlelik durum.** Tek bir gerilim anı olmalı.
2. **1–2 iç ses.** Biri bilgi versin, biri espri yapsın.
3. **3–4 seçim:**
   - bir kesin sonuçlu, güvenli seçim
   - bir ya da iki zar ya da mini oyun
   - bir kilitli seçim (özellik ya da geçmişten gelen)
4. **Her zar seçimi için dört sonuç metni:** başarı, kritik başarı, başarısızlık, kritik hata.
5. **Bir hafıza kaydı ve ileride bir geri dönüş.** Seçimler unutulmaz.

### Örnek: VII. perde · Düğün Takıları (28 yaş)

> Düğün bitti. Takılar masada. Kaynanan bir deftere yazıyor; kimin ne taktığını, daha önemlisi kimin ne takmadığını.
>
> **KURNAZLIK** [Orta · Başarılı]: Defterin iki nüshası var. Birini sen görmüyorsun.
> **SOSYAL RADAR** [Zor · Başarılı]: Enişte çeyrek altın taktı ama sahte. Enişte de biliyor.

| Seçim | Tür | Sonuç örneği |
|---|---|---|
| Deftere karışma | Kesin · Vicdan +2 | "Aile hukukunun bu alanına saygı gösterdin." |
| Takıları hemen bozdur | Kurnazlık · Zor | Kritik hata: "Kuyumcu kaynananın kuzeniymiş. Haber senden önce eve vardı." |
| Sahte altını masada teşhir et | Pişkinlik · Çok zor, kırmızı | Kritik başarı: "Enişte o bayramdan sonra hiç gelmedi. Kimse de sormadı." |
| 🔒 Küçük Tüccar: Takıları faize yatır | Çene · Orta | Başarı: "Kaynanan seni ilk kez takdirle süzdü." |

## 6. Mini oyun kataloğu (telefon için)

Kurallar:
- Her mini oyun en fazla 20 saniye sürer ve tek elle oynanır.
- Beş sonuç kademesi vardır. Karakterin statları oyunu kolaylaştırır ya da zorlaştırır.
- Telefonu eğme gibi hareket sensörü gerektiren oyunlar yok. iPhone'da ayrıca izin istiyor, oyuncu kaybettiriyor.

| # | Oyun | Hareket | Uygun anlar | Durum |
|---|---|---|---|---|
| 1 | Zamanlama çubuğu | Dokun | Gözlük kapma, şut, düğünde halay başı | ✅ |
| 2 | Güç topla | Basılı tut | İlk adımlar, ilk araba kalkışı | ✅ |
| 3 | Topla | Çoklu dokunma | Vazo parçaları, kantin bozuklukları | ✅ |
| 4 | Hızlı dokun yarışı | Seri dokunma | Mahalle yarışı, otobüse yetişme | ✅ |
| 5 | Kim en iyisiydi? | Hafıza | Takım seçimi, düğünde akrabaları hatırlama | ✅ |
| 6 | Kutular karışıyor | Takip | Bozuk para, kaybolan anahtar | ✅ |
| 7 | İşareti hatırla | Hafıza | Sınıf kapısı, otoparkta araba | ✅ |
| 8 | Ninni ritmi | Ritimle dokun | Bebek uyutma, askerde tören adımı | 🆕 Bu sürümde |
| 9 | Kalabalıkta ilerle | Şerit değiştirmek için sağa sola kaydır | Parkta sıra, metrobüs, pazar | 🆕 Bu sürümde |
| 10 | Sırayı tekrarla | Hafıza dizisi | Öğretmenin hareketleri, ehliyet sınavı | 🆕 Bu sürümde |
| 11 | Poker yüzü | Parmağı titreyen daire içinde sabit tut | Yalan söylemek, iş görüşmesi, kız isteme | 🆕 Bu sürümde |
| 12 | Harfi çiz | Çizgiyi takip et | Okul hazırlığı, ilk imza, noter | 🆕 Bu sürümde |
| 13 | Pazarlık kaydırıcısı | Karşı tarafın sabrı biterken fiyat kaydır | Harçlık, ev kirası, maaş zammı | Sonraki |
| 14 | Sağa sola kaydırarak seç | Hızlı evet/hayır | Akraba soruları, kariyer teklifleri | Sonraki |
| 15 | Sürükle-bırak sırala | Sürükle | Bütçe, düğün masası oturma planı | Sonraki |
| 16 | Kazı | Parmakla kazı | Karne, sınav sonucu, piyango | Sonraki |
| 17 | Trafikte şerit | Kaydırarak kaç | İşe yetişme, bayram dönüşü | Sonraki |
| 18 | Nefes | Ritimle bas-bırak | Doğum, sınav stresi, doktor | Sonraki |
| 19 | Çatal-bıçak dengesi | Sürükleyerek dengede tut | Tepsiyle çay taşıma, bebek taşıma | Sonraki |
| 20 | Kelime yakala | Doğru kelimeye dokun | Kavgada laf yetiştirme | Sonraki |

## 7. Rakip: BitLife ve fark

Meslek, evlilik, erken ölüm ve kısa hayatlar içeren **BitLife**, uygulama mağazalarının en başarılı hayat simülasyonlarından biri. Pazar kanıtlanmış; ama "Türkçe BitLife" olarak algılanan bir oyun kaybeder. BitLife menülerle ve rakamlarla ilerler. Makarya'nın farkı şunlar ve her tasarım kararında korunur:
- el yazımı mizah ve soğukkanlı anlatıcı
- konuşan iç sesler
- resimli sahneler
- Türkiye'ye özgü deneyim

**Kural:** Menüden mekanik eylem seçilmez ("spor yap", "sevgili bul"). Her şey yazılmış bir sahne olarak gelir. Kara mizahlı ölümü koleksiyona çeviren bir başka örnek olarak **Reigns** incelenmeli.

## 8. Görsel strateji

- Her olaya görsel koymak 300'ü aşkın resim demek. Bunun yerine **perde başına 8–10 ana sahne** üretilir; havuz olayları simgeli kapak ya da ortak mekân görselleri kullanır. Ortak mekânlar: ev, okul, sokak, iş yeri, hastane.
- Kız versiyonu, erkek hikâyesi bitince bitmiş erkek görsellerinden "çocuğu değiştir" yöntemiyle türetilir.
- **Satış öncesi yapılacak temizlik:** Bazı mevcut görsellerde gerçek marka logoları var; örneğin Keskin ailesinin bakkal rafında cips markaları görünüyor. Uygulama mağazasında satıştan önce bu görseller yazısız ve markasız yeniden üretilmeli.

## 9. Uygulama mağazasına giden yol

- **Paketleme:** Mevcut kod, Capacitor adlı araçla iPhone ve Android uygulamasına dönüştürülür. 3 boyut ya da oyun motoru gerekmez.
- **Gerekenler:**
  - Apple Geliştirici Programı üyeliği (yıllık 99 dolar)
  - Xcode için bir Mac ya da Mac gerektirmeyen bulut derleme servisi (Codemagic, Ionic Appflow)
  - uygulama ikonu, ekran görüntüleri
  - gizlilik politikası sayfası
  - yaş derecelendirmesi formu
- **Hissi yükseltecek eklemeler:**
  - titreşim (zar atarken, kritik anlarda)
  - ses efektleri
  - perde başına bir müzik teması
  - kaydın cihaza kalıcı yazılması
- **Gelir modeli seçenekleri:**
  - **Önerilen:** İlk üç perde ücretsiz, tamamı tek seferlik satın almayla açılır (yaklaşık 3–5 dolar). Oyuncu ne aldığını görerek karar verir.
  - Doğrudan ücretli uygulama: daha basit, ama indirme sayısı düşük olur.
  - Reklam önerilmez; kara mizahın ritmini bozar.
- **Dil:** Önce Türkçe. İngilizce çeviri pazarı büyütür ama mizahın uyarlanması ayrı bir yazım işi.

## 10. Yol haritası

| Faz | İçerik |
|---|---|
| 1 · Tamamlandı | İç sesler, 12 mini oyun, havuz motoru, görünür ölüm riski, mezar taşı ve koleksiyon, geri alınamaz kayıt |
| 2 · Sıradaki | IV. ve V. perdeler (ergenlik, sınav çağı), haraççılar ve zorbalar, beyaz/kırmızı kontroller, kafa takıntıları |
| 3 | Ses, müzik, titreşim; Capacitor paketi; TestFlight ile kapalı test (Apple'ın deneme dağıtımı) |
| 4 | VI.–X. perdeler, kız yolu, mağaza yayını |

## 11. Alınan kararlar

| Konu | Karar |
|---|---|
| Erken ölüm | Var; her yaşta mümkün, 18'den sonra yaşla artan arka plan riski |
| Şiddet | Sahne dışında; gençlikte ölümler absürt, haraççılar kalıcı sonuç bırakır |
| Seçimler | Geri alınamaz |
| Süre | Ortalama hayat yaklaşık 45 dakika, kayıtla bölünerek |
| Havuz | Yayında 250, hedef 400–500 olay |
| Hatlar | Meslek, medeni durum, cinsiyet ve özelliklere göre etiketli havuzlar; ilk sürümde 4 meslek |
| Kız karakter | Erkek hikâyesi tamamlanınca görselleri türetilecek; kurgu şimdiden iki cinsiyet düşünülerek yazılıyor |
| Hedef kitle | Henüz karar verilmedi: "bunu ben de yaşadım" diyecek 25–45 yaş mı, daha genç oyuncular mı? |
