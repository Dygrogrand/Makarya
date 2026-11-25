#!/bin/bash
# Oyunun statik dosyalarını mobil/www içine kopyalar (Capacitor webDir).
set -e
cd "$(dirname "$0")/.."
SRC=".."
rm -rf www && mkdir -p www
for f in index.html style.css data.js content.js i18n.js rules.js kavsak-yol.js game.js mini.js; do cp "$SRC/$f" www/; done
mkdir -p www/lang && cp "$SRC"/lang/*.js www/lang/
cp -r "$SRC/img" www/img
# Yalnızca oyunun kullandığı görseller; geliştirme dosyaları gitmez
echo "www hazır: $(du -sh www | cut -f1)"
