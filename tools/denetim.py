#!/usr/bin/env python3
"""Makarya içerik denetimi: python3 -I tools/denetim.py [content.js]
Hata (HATA) çıkış kodu 1 verir; uyarılar (UYARI) bilgidir.
Kontroller: yetim hafıza, hiç yazılmayan koşul, tamamen kilitli olay, kavşak/hat sızıntısı, yol-* kurtarma kapısı,
yinelenen başlık, ölçek kelimeleri (yazlık, holding...) için maddi durum kapısı eksikliği, ölü bağlantılar."""
import json, re, subprocess, sys, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
js = sys.argv[1] if len(sys.argv) > 1 else os.path.join(root, "content.js")
code = ('const fs=require("fs"),vm=require("vm");const c={console};vm.createContext(c);'
        'for(const f of ["%s","%s"])vm.runInContext(fs.readFileSync(f,"utf8"),c);'
        'console.log(JSON.stringify({E:vm.runInContext("EVENTS",c),L:vm.runInContext("FLAG_LABELS",c)}))'
        % (os.path.join(root, "data.js"), js))
D = json.loads(subprocess.check_output(["node", "-e", code]))
EV, LAB = D["E"], D["L"]
errs, warns = [], []
def split(v): return [x.strip().lstrip("-") for x in re.split(r"[,;]", v) if x.strip()] if isinstance(v, str) else list(v or [])
SET_KEYS = ["flag", "flagWin", "flagCrit", "flagBad", "flagFail"]
set_f, read_f = {}, {}
def mark(d, f, where): d.setdefault(f, []).append(where)
for e in EV:
    for c in e.get("choices", []):
        for k in SET_KEYS:
            for f in split(c.get(k)): mark(set_f, f, e["id"])
        for f in split(c.get("unflag")): mark(read_f, f, e["id"])
        for k in ("reqFlag", "reqNotFlag"):
            for f in split(c.get(k)): mark(read_f, f, e["id"])
    w = e.get("when") or {}
    for k in ("flags", "anyFlags", "notFlags"):
        for f in split(w.get(k)): mark(read_f, f, e["id"])
    for k in ("flag", "notFlag"):
        if w.get(k): mark(read_f, w[k], e["id"])
    for v in e.get("variants") or []:
        for f in split(v.get("flags")): mark(read_f, f, e["id"])
for f in LAB:
    mark(read_f, f, "etiket")
BUILTIN = {"hapis"}  # motorun kendi yazdığı hafızalar
# 1) okunan ama hiç yazılmayan hafıza: olay asla açılmaz
ENGINE = {"universitesiz", "hapis", "eski-hukumlu"}
for f, who in read_f.items():
    if f not in set_f and f not in ENGINE and who != ["etiket"] and not f.startswith("hat-") or (f.startswith("hat-") and f not in set_f and who != ["etiket"]):
        real = [w for w in who if w != "etiket"]
        if real: errs.append(f"hiç yazılmayan hafıza okunuyor: {f} ← {', '.join(sorted(set(real))[:4])}")
# 2) yazılan ama hiçbir yerde okunmayan/etiketsiz hafıza
for f in sorted(set_f):
    if f not in read_f and not f.startswith("hat-") and not f.startswith("meslek-"):
        warns.append(f"yetim hafıza (okunmuyor, etiketi yok): {f} ← {', '.join(sorted(set(set_f[f]))[:3])}")
# 3) tamamen kilitli olay
for e in EV:
    ch = e.get("choices", [])
    if ch and all(c.get("reqFlag") or c.get("reqStat") or c.get("reqVarlik") is not None and c.get("reqVarlik") > 0 or c.get("reqDestek") for c in ch):
        warns.append(f"her seçeneği kapılı olay (kilitlenebilir): {e['id']}")
# 4) kavşak sızıntısı: k10-* hat sütunu olmalı; yol-* olayın açık kapısı olmalı
for e in EV:
    w = e.get("when") or {}
    if e["id"].startswith("k10-") and not w.get("hat") and not w.get("flags") and not w.get("anyFlags"):
        errs.append(f"kavşak herkese açık: {e['id']}")
    if e["id"].startswith("yol-"):
        if not any(not (c.get("reqFlag") or c.get("reqStat") or c.get("reqVarlik") or c.get("reqDestek")) for c in e["choices"]):
            errs.append(f"yol olayında herkese açık seçenek yok: {e['id']}")
        if w.get("cashMax") is None: warns.append(f"yol olayı maddi durum sınırı koymamış: {e['id']}")
# 5) yinelenen başlık
seen = {}
for e in EV: seen.setdefault(e["title"], []).append(e["id"])
for t, ids in seen.items():
    if len(ids) > 1: warns.append(f"aynı başlık: {t} ← {', '.join(ids)}")
# 6) ölçek kelimesi var ama maddi durum kapısı yok
SCALE = re.compile(r"yazlık|holding|villa|otel|klinik kur|şirket satın|motosiklet al|arsa", re.I)
for e in EV:
    for c in e.get("choices", []):
        if SCALE.search(c["t"]) and not c.get("reqVarlik") and not c.get("reqFlag") and not c.get("reqStat"):
            warns.append(f"ölçek kelimesi, kapı yok: {e['id']} / {c['t'][:40]}")
# 7) ölü bağlantı: aynı bölümde kendi seçimlerinden ulaşılamayan kapı
for e in EV:
    if not e.get("choices"): errs.append(f"seçeneksiz olay: {e['id']}")
    for c in e.get("choices", []):
        if c.get("stat") and not isinstance(c.get("r"), dict): errs.append(f"zar seçimi sonuç sözlüğü eksik: {e['id']} / {c['t'][:30]}")
for m in errs: print("HATA  ", m)
for m in warns: print("UYARI ", m)
print(f"{len(EV)} olay, {len(errs)} hata, {len(warns)} uyarı")
sys.exit(1 if errs else 0)
