# Makarya — Hayat Zarı

Seçimlerinle ve 20 yüzlü zarla şekillenen, doğumdan 9 yaşına uzanan bir çocukluk hikâyesi.

**Oyna:** https://dygrogrand.github.io/Makarya/

## Dosyalar
| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa iskeleti |
| `style.css` | Tüm görünüm |
| `data.js` | Aileler, özellikler, 46 olay ve tüm metinler (yeni olay buraya eklenir) |
| `rules.js` | Zar, hedef hesabı, sonuçlar, final kartı |
| `game.js` | Ekranlar, mini oyunlar, kayıt, paylaşım kartı |
| `img/` | Görseller (`sahne/`, `aile/`, `kiz/sahne/`, `kiz/aile/`) |
| `TASARIM.md` | Oyun tasarım belgesi: 10 perdelik hayat, iç sesler, ton rehberi, mini oyun kataloğu, mağaza yolu |
| `CHATGPT_PAKETLERI.md` | Şu anki görsel turu için ChatGPT'ye yapıştırılacak mesajlar |
| `GORSEL_ISTEMLERI.md` | Arşiv: kız karakter görselleri için sonraki aşama istemleri |

## Denge
Zorluk tablosu `data.js` içindeki `DIFF`, bölüm beklentileri `CHAPTERS` altında. 20.000 oyunluk simülasyonla ayarlandı:
çok kolay %84 · kolay %77 · orta %63 · zor %50 · çok zor %29 başarı; kritik hata yalnızca 1'de (%5).
