# Makarya · ChatGPT görsel istemleri (arşiv)

> **Şu an kullanılacak dosya: `CHATGPT_PAKETLERI.md`.** Bu dosyadaki kız karakter bölümleri (1–3) erkek hikâyesi bitince kullanılacak: bitmiş erkek görseli yüklenip "çocuğu kızla değiştir" yöntemiyle.

Bu dosya, oyunda eksik olan görselleri ChatGPT'ye ürettirmek için hazırlandı. İstemler İngilizce, çünkü görsel modelleri İngilizce talimatlara daha tutarlı cevap veriyor. Açıklamalar Türkçe.

## Nasıl kullanılır?

1. **Hep aynı ChatGPT sohbetinde çalış.** Karakterin yüzü sohbet boyunca daha tutarlı kalır.
2. **Önce stil referansı ver.** Sohbetin başında depodaki 2–3 mevcut görseli yükle, ardından aşağıdaki "Stil kilidi" metnini gönder. Önerilen dosyalar: `img/sahne/ilk-harclik.webp`, `img/sahne/mahalle-turnuvasi.webp`, `img/sahne/kres-kapisi.webp`.
3. **Her görsel için tek istem gönder.** Beğenmediğin görseli "Aynı sahne, ama …" diyerek düzelttir.
4. **Dosyayı tam olarak tablodaki adla kaydet.** Oyun `.webp`, `.png` ya da `.jpg` uzantılarının üçünü de tanır.
5. **Doğru klasöre yükle.** GitHub'da ilgili klasöre gir, **Add file → Upload files** ile dosyaları sürükle ve **Commit changes** de. Birkaç dakika içinde oyunda görünür. İstersen dosyaları bana da gönderebilirsin; sıkıştırıp (yaklaşık 150 KB) doğru yere koyarım.

> Görsel olmayan sahnelerde oyun simgeli bir kapak gösterir, yani görselleri parça parça ekleyebilirsin.

---

## Stil kilidi (sohbetin başında bir kez gönder)

```
I'm making illustrations for a mobile story game called "Makarya", set in a warm, slightly idealized Istanbul.
Match the style of the reference images I attached exactly:
- Painterly, highly detailed cartoon illustration, like concept art for a modern animated feature film
- Warm golden-hour light, soft glow, rich warm palette (amber, terracotta, cream, deep teal accents)
- Expressive characters with big eyes and clear emotions; the child is always the visual focus
- Cozy Turkish details: kilim rugs, lace doilies, tea glasses, plants, mosque domes and the Bosphorus in the distance
- Landscape format, 3:2 ratio (about 1536x1024)
- The main character's face must be clearly visible and placed in the upper two-thirds of the frame, because the bottom 25% will be covered by a dark text caption
- ABSOLUTELY NO text, letters, numbers, signs with writing, logos or speech bubbles anywhere in the image
Reply "OK" and wait for my scene prompts.
```

---

## 1. Kız karakter kartı (önce bunu yap)

Sonraki tüm kız görsellerinde bu kartı referans olarak kullanacaksın.

```
Create a character reference sheet for the game's girl protagonist, in the same style.
She is the same kind of child as the boy in the references: dark, messy curly hair (tied in a small half-ponytail with a red hair clip), warm olive skin, big dark brown eyes, rosy cheeks, a small mischievous smile.
Show her at three ages side by side on a plain warm cream background: 1 year old (in a light onesie), 4 years old (striped long-sleeve shirt and denim overalls, like the boy), 7 years old (navy Turkish primary school uniform with a white collar and a red backpack).
Full body, front view, consistent face across all three ages. No text.
```

Kaydet: `img/kiz/karakter-karti.png`. Oyunda kullanılmıyor; bu senin referansın.

---

## 2. Kız karakter · aile portreleri (6 görsel)

**Yöntem:** Mevcut erkek aile görselini yükle ve şu istemi gönder:

```
Recreate this exact image — same family, same room, same lighting, same composition and same adults — but replace the boy with the girl from my character sheet (4 years old version). Keep her pose and expression similar to the boy's. Remove every piece of text, sign lettering and logo from the scene. 3:2 landscape.
```

| Yüklenecek dosya | Kaydedilecek ad |
|---|---|
| `img/aile/yalcin.webp` | `img/kiz/aile/yalcin.png` |
| `img/aile/erdem.webp` | `img/kiz/aile/erdem.png` |
| `img/aile/keskin.webp` | `img/kiz/aile/keskin.png` |
| `img/aile/tan.webp` | `img/kiz/aile/tan.png` |
| `img/aile/varli.webp` | `img/kiz/aile/varli.png` |
| `img/aile/sen.webp` | `img/kiz/aile/sen.png` |

---

## 3. Kız karakter · Bölüm I ve II sahneleri (34 görsel)

**Yöntem:** Erkek sahnesini yükle ve aynı istemi kullan. Yaş bilgisini tablodan al.

```
Recreate this exact scene — same setting, same other characters, same lighting and composition — but replace the boy with the girl from my character sheet, at age [YAŞ]. Keep the same action and emotion. No text anywhere. 3:2 landscape.
```

Yükleyeceğin dosya `img/sahne/<ad>.webp`, kaydedeceğin dosya `img/kiz/sahne/<ad>.png`.

| # | Ad | Yaş | Sahne |
|---|---|---|---|
| 1 | `dogum` | newborn | Hastanede doğum anı |
| 2 | `gece-vardiyasi` | 3 months | Gece 3'te ağlayan bebek |
| 3 | `yabanci-krizi` | 8 months | Gözlüklü teyze yaklaşıyor |
| 4 | `yasak-nesne` | 10 months | Masadaki parlak nesne |
| 5 | `ilk-kelime` | 1 year | Salonda ilk kelime |
| 6 | `ilk-adimlar` | 15 months | İlk adımlar |
| 7 | `masadaki-telefon` | 17 months | Telefona uzanma |
| 8 | `dogum-gunu-pastasi` | 19 months | Doğum günü pastası |
| 9 | `vazo-kirildi` | 2 years | Kırık vazo ve kedi (bkz. Bölüm 5, önce temiz sürümü yap) |
| 10 | `ilk-harclik` | 2 years | Avuçta bozuk para |
| 11 | `oyuncak-krizi` | 2 years | Oyuncak kavgası |
| 12 | `aile-toplantisi` | 2 years | Yetişkinler konuşuyor |
| 13 | `parkta-sira` | 3 years | Kaydırak sırası |
| 14 | `kim-yapti` | 3 years | "Kim yaptı?" sorgusu |
| 15 | `kres-kapisi` | 3 years | Kreş kapısı |
| 16 | `ilk-arkadas` | 3 years | İlk arkadaş |
| 17 | `oyuncagimi-aldi` | 3 years | Oyuncağı alınıyor |
| 18 | `ogretmen-yanlis-anladi` | 3 years | Öğretmen yanlış anlıyor |
| 19 | `parkin-buyuk-cocugu` | 3 years | Kaydıraktaki büyük çocuk |
| 20 | `market-kasasi` | 3 years | Kasadaki şekerler |
| 21 | `baskasinin-dogum-gunu` | 4 years | Başkasının doğum günü |
| 22 | `en-guzel-oyuncak` | 4 years | Herkesin baktığı oyuncak |
| 23 | `ilk-gercek-yalan` | 4 years | İlk yalan |
| 24 | `mahalle-bakkali` | 4 years | Bakkalda liste |
| 25 | `kaybolan-bozuk-para` | 4 years | Yerde bozuk para |
| 26 | `takim-seciliyor` | 4 years | Takım seçimi |
| 27 | `sana-guluyorlar` | 4 years | Çocuklar gülüyor |
| 28 | `ilk-kucuk-sir` | 5 years | Kulağa fısıldanan sır |
| 29 | `aileler-kiyasliyor` | 5 years | Veliler kıyaslıyor |
| 30 | `kirilan-oyuncak` | 5 years | Kırık oyuncak |
| 31 | `mahalle-turnuvasi` | 5 years | Mahalle yarışı |
| 32 | `harclik-pazarligi` | 5 years | Harçlık pazarlığı |
| 33 | `okul-hazirligi` | 5 years | Okul çantası hazırlığı |
| 34 | `ilkokul-kapisi` | 6 years | İlkokulun ilk günü |

**Öncelik sırası:** Önce 1, 3, 9, 15, 31 ve 34 numaralı sahneleri yap. Bunlar bölüm geçişlerinde ve mini oyunlarda görünüyor.

---

## 4. Bölüm III · Okul Yılları (12 sahne × 2 karakter)

Önce **erkek** sürümünü üret, `img/sahne/<ad>.png` olarak kaydet. Sonra onu yükleyip Bölüm 3'teki "replace the boy with the girl" istemiyle **kız** sürümünü al, `img/kiz/sahne/<ad>.png` olarak kaydet.

Erkek çocuk için ortak tarif (her istemin başına ekle):

```
The main character is the same curly-haired boy from the reference images, now [YAŞ] years old, wearing a navy Turkish primary school uniform with a white collar (unless the scene says otherwise).
```

**ilk-ders** (6 yaş)
```
First lesson in a sunny, old-fashioned Istanbul primary school classroom. A kind teacher asks "Who can read?". Around 20 children in navy uniforms: some hands shoot up eagerly, some hide their hands in pockets. Our boy sits in the second row, hand half-raised, torn between courage and fear. Chalkboard with only colorful drawings (no letters), plants on the windowsill, Bosphorus visible through the window. No text.
```

**sira-arkadasi** (6 yaş)
```
Close-up of a shared wooden school desk. Our boy sits next to a very serious classmate who is carefully counting a neat row of colored pencils — including the boy's pencils. The boy looks at him with a mix of amusement and suspicion. Pencil cases, erasers, a lunch box. Warm morning light. No text.
```

**teneffus-kantini** (6 yaş)
```
A crowded school canteen window during break time. A long, chaotic queue of children in uniforms, the canteen owner (a cheerful mustached man) handing out toasted sandwiches, some coins have spilled on the floor. Our boy stands in the middle of the queue holding a coin, calculating whether he'll make it before the bell. No text, no price signs.
```

**odev-nerede** (6 yaş)
```
Early morning in a Turkish apartment hallway, 7:40 a.m. light. Our boy, half-dressed in his school uniform, frantically searches his open backpack; notebooks and toys are scattered on the floor. A parent stands at the door with car keys, eyebrows raised. The family cat sits innocently next to a chewed notebook corner. No text, no visible clock numbers.
```

**sinif-baskani** (7 yaş)
```
Class president election day. Our boy stands on a small wooden platform in front of the class, giving an overly passionate speech with one hand raised. A cardboard ballot box and a small empty fish tank (a campaign promise) sit on the teacher's desk. Classmates react with cheers, doubt and boredom. No text, no posters with writing.
```

**davetiyeler** (7 yaş)
```
In the classroom, a girl hands out colorful birthday invitation envelopes to classmates, who open them excitedly. Our boy sits at his desk with empty hands, looking around with a brave but slightly sad face, pretending not to care. Balloons drawn on the envelopes, no text.
```

**bayram-harcligi** (7 yaş)
```
A festive Bayram morning in a crowded, cozy Turkish living room. Our boy, in a new little shirt and vest, kisses the hand of his smiling grandmother, who is handing him an envelope. More relatives on sofas, bowls of candy and Turkish delight, tea glasses. His other hand already holds several envelopes. Warm golden light. No text.
```

**mahalle-maci** (7 yaş, üzerinde forma olabilir)
```
A narrow Istanbul neighborhood street turned into a football pitch, two small goals made of stones. Our boy (in a red football shirt) is about to take the decisive shot. Behind the goal, a neighbor's shiny ground-floor window; the neighbor watches nervously from the balcony above. Other children freeze in suspense. Evening golden light. No text, no numbers on shirts.
```

**kedi-istiyoruz** (8 yaş, ev kıyafeti)
```
Family dinner table in a warm Turkish home. Our boy, in casual home clothes, stands on his chair presenting his case with both hands, like a lawyer. Parents and grandmother listen with mixed expressions; the grandmother is secretly on his side. A small sketch of a cat on paper lies by his plate (a drawing, no writing). Food, tea glasses, lamp light. No text.
```

**tablet-saati** (8 yaş, ev kıyafeti)
```
Evening in the living room. Our boy sits cross-legged on the sofa, fully absorbed in a tablet (screen glow on his face, screen content not visible). A parent stands in the doorway pointing at an imaginary watch on their wrist. A kitchen timer on the coffee table. Cozy lamp light. No text, no readable clock.
```

**veli-toplantisi** (8 yaş)
```
A school corridor in the afternoon. Our boy sits alone on a bench outside a classroom door, swinging his legs nervously. Through the door's small window we see his parents talking with the teacher, who is holding a thick folder. Children's drawings on the corridor walls (no writing). No text.
```

**karne-gunu** (9 yaş)
```
Last day of school, early summer. Our boy walks home down a sunny, tree-lined Istanbul street holding his closed report card folder against his chest, lost in thought. Friends run past with school bags in the air, a simit seller on the corner, the Bosphorus sparkling at the end of the street. Hopeful, reflective mood. No text on the folder.
```

---

## 5. Temiz sürümler (yazıları kırpılmış 3 görsel)

Bu üç görselde arayüz yazısı görselin içine gömülüydü. Ben kırptım, ama yeniden üretmek daha iyi sonuç verir.

**vazo-kirildi** · orijinali yükle ve şu istemi gönder, kaydet: `img/sahne/vazo-kirildi.png`
```
Recreate this scene as a complete 3:2 landscape illustration with no text panel: a 2-year-old curly-haired boy stands barefoot next to a shattered blue-and-white porcelain vase on a kilim rug, scattered lilies and soil. A tabby cat watches him from the side with judging eyes. The boy's face and guilty expression must be clearly visible. No text.
```

**baslangic** · kaydet: `img/baslangic.png` (dikey, 2:3)
```
Portrait 2:3 illustration in the same style: a curly-haired child (seen from behind, gender ambiguous) sits on a terracotta rooftop with a backpack, next to a cat, watching the sun set over the Istanbul skyline, Galata Tower and the Bosphorus with ferries. Seagulls in the sky. Contemplative, full-of-possibility mood. Keep the upper 70% visually rich; the bottom 30% can be quieter rooftops. No text, no signs.
```

**aile-secimi** · kaydet: `img/aile-secimi.png` (dikey, 2:3)
```
Portrait 2:3 illustration in the same style: a vintage wooden wall in a cozy Istanbul home covered with six framed family portraits — a working-class family, two civil servants, a shopkeeper couple in front of their grocery, a white-collar couple, a flashy newly-rich family, and a huge crowded family. Below the frames, a large colorful die in mid-air as if just thrown. Warm light. No names or text on the frames.
```

---

## Kontrol listesi

- [ ] Stil kilidi gönderildi, referans görseller yüklendi
- [ ] Kız karakter kartı
- [ ] 6 kız aile portresi
- [ ] Öncelikli 6 kız sahnesi, sonra kalan 28 sahne
- [ ] Bölüm III: 12 erkek + 12 kız sahnesi
- [ ] 3 temiz sürüm

Toplam 68 görsel (karakter kartı dahil). Hepsini beklemeye gerek yok; eklenen her görsel oyunda anında yerini alır.
