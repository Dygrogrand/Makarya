# Makarya — Hayat Zarı

Doğumdan son söze, seçimlerinle ve 20 yüzlü zarla şekillenen kara mizahlı bir hayat. 10 bölüm, 328 olay.

**Oyna:** https://dygrogrand.github.io/Makarya/

## Dosyalar
| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa iskeleti |
| `style.css` | Tüm görünüm |
| `Makarya_Icerik.xlsx` | **Bütün içeriğin ana kaynağı**: olaylar, seçimler, iç sesler, özellikler, ölüm sebepleri, bölüm ayarları |
| `content.js` | Excel'den otomatik üretilir, elle düzenlenmez |
| `data.js` | Statlar, zorluk tablosu, aileler |
| `rules.js` | Zar, hedef hesabı, hayat planı (havuzdan seçim), ölüm, final kartı |
| `game.js` | Ekranlar, mini oyunlar, kayıt, paylaşım kartı |
| `img/` | Görseller (`sahne/`, `aile/`, `kiz/sahne/`, `kiz/aile/`) |
| `TASARIM.md` | Oyun tasarım belgesi: 10 perdelik hayat, iç sesler, ton rehberi, mini oyun kataloğu, mağaza yolu |
| `CHATGPT_PAKETLERI.md` | Şu anki görsel turu için ChatGPT'ye yapıştırılacak mesajlar |
| `GORSEL_ISTEMLERI.md` | Arşiv: kız karakter görselleri için sonraki aşama istemleri |

## İçerik nasıl düzenlenir?
1. `Makarya_Icerik.xlsx` dosyasını indir, düzenle.
2. GitHub'da **Add file → Upload files** ile aynı adla yükle.
3. "Excel'den oyun içeriği üret" işlemi dosyayı doğrular, `content.js`'i üretir ve oyunu günceller. Hata varsa Actions sekmesinde kırmızı görünür.

Elle: `python3 tools/icerik.py xlsx2js` · Denge testi: `node tools/simulasyon.js 3000`

## Denge
Zorluk tablosu `data.js` içindeki `DIFF`; bölüm başına olay sayısı ve beklenen stat Excel'in Bölümler sayfasında. 3.000 tam hayatlık simülasyonla ayarlandı; bölüm başına başarı oranları:
çok kolay %84 · kolay %77 · orta %63 · zor %50 · çok zor %29 başarı; kritik hata yalnızca 1'de (%5).
