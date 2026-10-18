#!/usr/bin/env python3
"""img/kavsak/ klasöründe hazır olan kavşak görsellerini ve başlık/altyazılarını kavsak-yol.js dosyasına yazar."""
import json, os, re, sys
meta = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "/tmp/g/kvmeta.json", encoding="utf8"))
have = set(f[:-5] for f in os.listdir("img/kavsak") if f.endswith(".webp"))
out = {}
for k, v in meta.items():
    if k + "-l" in have and k + "-r" in have:
        out[k] = {"l": v["l"], "r": v["r"]}
open("kavsak-yol.js", "w", encoding="utf8").write("/* tools/kavsak_yol.py ile üretilir: iki yönlü kavşak görseli hazır olan olaylar */\nvar KAVSAK_YOL = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "kavşak hazır")
