#!/usr/bin/env python3
"""Makarya içerik doğrulayıcı.
Kullanım: python3 tools/validate_content.py content/bolum-4.json [diğer dosyalar...]
Tüm içerik dosyaları birlikte verilirse bölümler arası kontroller de yapılır (özellik ve hafıza tutarlılığı)."""
import json, re, sys

STATS = ["Akıl", "Çene", "Kurnazlık", "Cesaret", "Pişkinlik", "Vicdan", "Dayanıklılık", "Sosyal Radar"]
DIFFS = ["veryEasy", "easy", "medium", "hard", "veryHard"]
VOICE_DIFFS = ["easy", "medium", "hard", "veryHard"]
FAMS = ["home", "money", "social", "education"]
PLACES = ["ev", "mutfak", "cocuk-odasi", "okul", "sinif", "okul-bahcesi", "sokak", "park", "bakkal", "market", "carsi",
          "ofis", "dukkan", "devlet-dairesi", "hastane", "dugun-salonu", "kafe", "toplu-tasima", "trafik", "universite",
          "kisla", "banka", "apartman", "sahil", "huzurevi", "mezarlik", "yazlik", "stadyum", "sahne", "mahkeme"]
MINIS = {
    "timing": [], "hold": [], "collect": ["piece"], "race": [], "memory": ["items"], "cups": [], "doors": [],
    "rhythm": [], "lanes": ["obstacles"], "simon": ["items"], "poker": ["questions"], "trace": ["shape"],
    "bargain": ["item", "mode"], "swipe": ["left", "right", "items"], "breath": [], "balance": ["item"],
}
BASE_TRAITS = ["Sessiz Gözlemci", "Ses Yükseltince Oluyor", "Erken Ekonomi Bilinci", "Teknoloji Merakı", "Yastık Altı Ekonomisti",
    "Küçük Tüccar", "Sahne Sever", "Para Üstü Radarı", "Kendine Gülebilir", "Organizatör", "İş Modeli Kurar", "Seçim Makinesi",
    "Asist Ustası", "Limonata Baronu", "Kilit Kırıcı", "Analitik Zihin", "Sözünü Geçirir", "Açık Bulur", "Geri Adım Atmaz",
    "Yüzü Kızarmaz", "İç Pusula", "Kolay Dağılmaz", "Odayı Okur"]
CH_AGES = {1: (0, 3), 2: (3, 6), 3: (6, 9), 4: (10, 14), 5: (15, 18), 6: (18, 26), 7: (26, 40), 8: (40, 55), 9: (55, 70), 10: (70, 105)}

FORBIDDEN = [
    # markalar ve platformlar
    "instagram", "tiktok", "youtube", "whatsapp", "twitter", "facebook", "netflix", "google", "apple", "iphone", "samsung",
    "coca", "pepsi", "playstation", "xbox", "nintendo", "marvel", "disney", "spotify", "uber", "getir", "trendyol",
    "hepsiburada", "amazon", "starbucks", "mcdonald", "burger king", "turkcell", "vodafone", "türk telekom", "migros",
    "a101", "bim", "şok market", "chatgpt", "tesla", "bitcoin", "lego", "barbie", "pokemon", "minecraft", "fortnite",
    # kulüpler
    "galatasaray", "fenerbahçe", "beşiktaş", "trabzonspor", "real madrid", "barcelona",
    # gerçek yerler
    "istanbul", "ankara", "izmir", "türkiye", "türk ", "boğaz", "galata", "kapalıçarşı", "taksim", "kadıköy", "anadolu",
    # siyaset
    "akp", "chp", "mhp", "hdp", "dem parti", "iyi parti", "erdoğan", "atatürk", "kılıçdaroğlu", "cumhurbaşkan", "başbakan",
    "sağcı", "solcu", "darbe",
    # din
    "allah", "peygamber", "cami", "namaz", "oruç", "kuran", "kur'an", "imam", "kilise", "papaz", "hacı", "cennet", "cehennem",
    "ramazan", "kurban",
    # gerçek sınav ve kurum kısaltmaları
    "yks", "lgs", "kpss", "ösym", "tyt", "ayt", "e-devlet", "sgk", "eyt", "meb", "yök",
    # para birimi
    " tl", "₺",
]
SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
FLAG = re.compile(r"^[a-zA-Z0-9çğıöşüÇĞİÖŞÜ:\-]+$")

def tr_lower(s):
    return s.replace("İ", "i").replace("I", "ı").lower()

def age_years(a):
    y = re.search(r"(\d+)\s*yaş", a); m = re.search(r"(\d+)\s*ay", a)
    if not y and not m: return None
    return (int(y.group(1)) if y else 0) + (int(m.group(1)) / 12 if m else 0)

def strings(o):
    if isinstance(o, str): yield o
    elif isinstance(o, dict):
        for v in o.values(): yield from strings(v)
    elif isinstance(o, list):
        for v in o: yield from strings(v)

def main(paths):
    errs, warns = [], []
    all_events, traits, flags_set, flags_used, reqs, death = [], set(BASE_TRAITS), set(), set(), [], []
    for p in paths:
        d = json.load(open(p, encoding="utf-8"))
        for t in d.get("traits", []):
            if not t.get("name") or not t.get("desc") or not isinstance(t.get("bonus"), dict): errs.append(f"{p}: özellik eksik: {t}")
            for k, v in t.get("bonus", {}).items():
                if k not in STATS or not (1 <= v <= 2): errs.append(f"{p}: özellik bonusu hatalı: {t.get('name')} {k}={v}")
            traits.add(t.get("name"))
        for f in d.get("flags", []):
            if not FLAG.match(f.get("flag", "")) or not f.get("label"): errs.append(f"{p}: hafıza tanımı hatalı: {f}")
        for dc in d.get("deathCauses", []):
            if not (18 <= dc.get("min", 0) <= dc.get("max", 0) <= 110) or not dc.get("text"): errs.append(f"{p}: ölüm sebebi hatalı: {dc}")
            death.append(dc)
        for e in d.get("events", []):
            e["_file"] = p; all_events.append(e)
        for s in strings(d):
            low = " " + tr_lower(s) + " "
            for w in FORBIDDEN:
                ww = w.strip()
                if re.search(r"(?<![a-zçğıöşü])" + re.escape(ww) + r"(?![a-zçğıöşü])", low) if w == ww else (w in low):
                    errs.append(f"{p}: yasaklı ifade '{ww}': {s[:90]}")
    ids = {}
    for e in all_events:
        where = f"{e['_file']}:{e.get('id')}"
        if not SLUG.match(e.get("id", "")): errs.append(f"{where}: id küçük harf ve tire olmalı")
        if e.get("id") in ids: errs.append(f"{where}: id tekrar ediyor")
        ids[e.get("id")] = e
        ch = e.get("ch")
        if ch not in CH_AGES: errs.append(f"{where}: ch 1-10 olmalı"); continue
        ay = age_years(e.get("age", ""))
        lo, hi = CH_AGES[ch]
        if ay is None or not (lo <= ay <= hi): errs.append(f"{where}: yaş '{e.get('age')}' bölüm {ch} aralığı {lo}-{hi} dışında")
        for k in ["icon", "title", "text"]:
            if not e.get(k): errs.append(f"{where}: {k} eksik")
        if len(e.get("title", "")) > 42: warns.append(f"{where}: başlık uzun")
        if len(e.get("text", "")) > 260: warns.append(f"{where}: metin uzun ({len(e['text'])})")
        if e.get("fam") and e["fam"] not in FAMS: errs.append(f"{where}: fam geçersiz")
        if e.get("place") and e["place"] not in PLACES: errs.append(f"{where}: place geçersiz: {e['place']}")
        w = e.get("when") or {}
        for k in w:
            if k not in ["flags", "notFlags", "trait", "gender", "fam", "minStat"]: errs.append(f"{where}: when anahtarı geçersiz: {k}")
        for f in w.get("flags", []) + w.get("notFlags", []): reqs.append((where, f))
        if w.get("trait"): reqs.append((where, "trait:" + w["trait"]))
        if w.get("gender") and w["gender"] not in ["erkek", "kiz"]: errs.append(f"{where}: gender erkek/kiz")
        for k in (w.get("minStat") or {}):
            if k not in STATS: errs.append(f"{where}: minStat stat geçersiz")
        voice_open = set()
        for v in e.get("voices", []):
            if v.get("stat") not in STATS or v.get("diff") not in VOICE_DIFFS or not v.get("text"): errs.append(f"{where}: iç ses hatalı {v}")
            if v.get("opens"): voice_open.add(v.get("stat"))
        for r in e.get("recall", []):
            if not r.get("flag") or not r.get("text"): errs.append(f"{where}: recall hatalı")
            reqs.append((where, r.get("flag")))
        chs = e.get("choices", [])
        if not (2 <= len(chs) <= 5): errs.append(f"{where}: 2-5 seçim olmalı")
        for c in chs:
            cw = f"{where} / '{c.get('t')}'"
            if not c.get("t"): errs.append(f"{cw}: t eksik")
            if "direct" in c:
                if not isinstance(c["direct"], dict) or not c["direct"]: errs.append(f"{cw}: direct boş")
                for k, v in c.get("direct", {}).items():
                    if k not in STATS or not isinstance(v, int) or abs(v) > 3: errs.append(f"{cw}: direct hatalı {k}={v}")
                if not isinstance(c.get("r"), str) or not c["r"]: errs.append(f"{cw}: kesin sonuç metni (r) eksik")
            else:
                if c.get("stat") not in STATS: errs.append(f"{cw}: stat geçersiz")
                if c.get("diff") not in DIFFS: errs.append(f"{cw}: diff geçersiz")
                r = c.get("r") or {}
                need = ["win", "crit", "fail", "bad"] + (["mid"] if c.get("mini") else [])
                for k in need:
                    if not r.get(k): errs.append(f"{cw}: sonuç metni eksik: {k}")
                if len(set(r.get(k, "") for k in need)) != len(need): errs.append(f"{cw}: sonuç metinleri aynı olmamalı")
                for k in need:
                    if len(r.get(k, "")) > 230: warns.append(f"{cw}: {k} metni uzun")
            m = c.get("mini")
            if m:
                if m.get("type") not in MINIS: errs.append(f"{cw}: mini tür geçersiz {m.get('type')}")
                if not m.get("title") or not m.get("hint"): errs.append(f"{cw}: mini title/hint eksik")
                if m.get("type") == "swipe":
                    its = m.get("items", [])
                    if not (6 <= len(its) <= 12) or any(not isinstance(i, dict) or "t" not in i or "right" not in i for i in its): errs.append(f"{cw}: swipe items 6-12 adet {{t,right}} olmalı")
                if m.get("type") == "bargain" and m.get("mode") not in ["sell", "buy"]: errs.append(f"{cw}: bargain mode sell/buy")
                if m.get("type") in ["simon"] and len(m.get("items", [])) not in (0, 4): errs.append(f"{cw}: simon items 4 emoji olmalı")
            if c.get("req"): reqs.append((cw, "trait:" + c["req"]))
            if c.get("reqFlag"): reqs.append((cw, c["reqFlag"]))
            if c.get("reqVoice") and c["reqVoice"] not in voice_open: errs.append(f"{cw}: reqVoice için 'opens: true' iç ses yok")
            if c.get("trait"): flags_set.add("trait:" + c["trait"])
            for k in ["flag", "flagWin", "flagBad", "unflag"]:
                if c.get(k):
                    if not FLAG.match(c[k]): errs.append(f"{cw}: {k} biçimi hatalı")
                    if k != "unflag": flags_set.add(c[k])
            if c.get("risk"):
                rk = c["risk"]
                if ch < 6: errs.append(f"{cw}: ölüm riski yalnızca 18 yaş ve sonrası (bölüm 6+)")
                if not rk.get("cause"): errs.append(f"{cw}: risk.cause eksik")
                p_ = rk.get("p", 0)
                if not (0 < p_ <= 0.08 or (p_ == 1 and e.get("id") == "son-soz")): errs.append(f"{cw}: risk.p 0-0.08 arası olmalı")
            if c.get("trait") and c["trait"] not in traits and c["trait"] not in BASE_TRAITS: pass
    # özellik tanımları
    for e in all_events:
        for c in e.get("choices", []):
            for k in ["trait", "req"]:
                if c.get(k) and c[k] not in traits: errs.append(f"{e['_file']}:{e['id']}: tanımsız özellik '{c[k]}' (dosyanın traits listesine ekle)")
        t = (e.get("when") or {}).get("trait")
        if t and t not in traits: errs.append(f"{e['_file']}:{e['id']}: tanımsız özellik '{t}'")
    if len(paths) > 1:
        for where, f in reqs:
            if f.startswith("trait:"): continue
            if f not in flags_set: warns.append(f"{where}: '{f}' hafızasını hiçbir seçim yazmıyor")
    for w in warns: print("UYARI", w)
    for x in errs: print("HATA ", x)
    print(f"\n{len(all_events)} olay, {len(errs)} hata, {len(warns)} uyarı")
    return 1 if errs else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
